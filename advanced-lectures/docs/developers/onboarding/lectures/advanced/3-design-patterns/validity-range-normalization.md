# Validity range normalization

> An optional way to simplify interval handling: preserve equivalent encodings, compare full normalization with endpoint helpers, and measure the overhead.

A validator reads the transaction's **validity range** rather than a clock. [Handling time](/docs/developers/onboarding/lectures/intermediate/handling-time) used that range to check a deadline. Some contracts need more: a numeric bound for interest, vesting, or a limit on the window's width.

**Normalization converts an interval to one canonical representation of the same set of integer times.** It resolves inclusive and exclusive bounds once, so later code works with included endpoints and explicit cases for unbounded or empty intervals.

This is an **optional code-organization pattern with modest, situational benefits**. It adds execution and script bytes. Its value grows when several operations share an interval, or when a contract accepts different encodings from an external schema. For one endpoint, a small flag-aware helper is often enough. The important security decisions remain which bound to use, how to round amounts, and which states the protocol permits.

## Choose the amount of interval handling you need

- **One deadline check:** use the stdlib's `interval.is_entirely_after` or `interval.is_entirely_before` for a strict comparison. Choose the predicate that matches the intended equality behavior.
- **One numeric endpoint:** require that bound to be finite and honor its inclusive flag. [The endpoint version](#a-smaller-alternative-read-one-endpoint) below does this.
- **Several operations on an interval:** consider normalization so they share one interpretation of bounds, emptiness, and infinities.
- **Your own datum format:** prefer a type that expresses the actual protocol. `Linear { start, end }` and `Cliff { at }` are clearer vesting schedules than a general interval unless you need compatibility with an interval-based schema.

For today's ledger-produced transaction range, all four implementations below enforce the same vesting rules. Normalization makes the interval interpretation reusable; it does not fix an exploitable bug in the direct-reading version on that ledger.

## The example: a linear vesting grant

A grantor locks ADA for a beneficiary. Nothing has vested at `start`, everything has vested at `end`, and the amount grows linearly between them. Two actions need a time as a number:

- **Claim:** the beneficiary takes what has vested and returns the unvested rest under the same datum.
- **Clawback:** the grantor takes back the unvested amount and pays the remaining vested amount to the beneficiary.

Whoever builds the transaction chooses its window. Each action must use the endpoint that protects the other party:

- **Price a claim at the earliest permitted time.** At inclusion, at least that much has vested. Using the latest time would permit early claims.
- **Price a clawback at the latest permitted time.** At inclusion, at most that much has vested. Using the earliest time could underpay the beneficiary.

These are conservative bounds, not a way to discover the actual inclusion time. A wide window can reduce what the builder receives. [Time handling](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/time-handling) explains the underlying attacks.

```mermaid
flowchart LR
    G["Grant: 10 ADA"] --> TX["Claim from halfway through the period"]
    TX --> R["Rest: 5 ADA, same address and datum"]
    TX --> B["Beneficiary: 5 ADA, less any fee paid from it"]
```

### Design

1. **Requirements:** the beneficiary may claim only vested funds; a clawback must preserve their vested entitlement.
2. **Actions:** `Claim` and `Clawback`, both in the `spend` handler.
3. **Checks:** the right party signs, the needed time bound exists, and the rest or beneficiary payment covers the appropriate amount. Each linear-grant transaction spends one grant from that validator.
4. **State:** beneficiary address, grantor key, start, end, and total. The UTxO holds the remaining balance.

```aiken title="lib/vesting.ak"
/// What a grant remembers. Times are POSIX milliseconds, amounts are lovelace.
pub type Grant {
  /// Who the grant vests to: their whole address, stake credential included.
  beneficiary: Address,
  /// Who may take back what has not vested yet.
  grantor: VerificationKeyHash,
  /// Nothing has vested before this moment.
  start: Int,
  /// Everything has vested from this moment on.
  end: Int,
  /// How much the grant held when it was made.
  total: Int,
}

/// What the transaction does with the grant.
pub type Action {
  /// The beneficiary takes what has vested so far.
  Claim
  /// The grantor takes back what has not vested yet.
  Clawback
}
```

All versions share the same amount checks. They keep the unvested amount as a fraction and compare by cross-multiplication:

```aiken title="lib/vesting.ak"
/// How much of the grant is still unvested at moment `at`, as the fraction
/// `numerator / denominator` of a lovelace. Kept as a fraction so that no
/// check ever rounds in anybody's favor.
fn unvested(grant: Grant, at: Int) -> (Int, Int) {
  let Grant { start, end, total, .. } = grant
  if at >= end {
    (0, 1)
  } else if at <= start {
    (total, 1)
  } else {
    (total * ( end - at ), end - start)
  }
}

/// Whether `amount` is at least what is still unvested at `at`.
pub fn covers_unvested(grant: Grant, at: Int, amount: Int) -> Bool {
  let (numerator, denominator) = unvested(grant, at)
  amount * denominator >= numerator
}

/// Whether `amount` is at most what is still unvested at `at`.
pub fn within_unvested(grant: Grant, at: Int, amount: Int) -> Bool {
  let (numerator, denominator) = unvested(grant, at)
  amount * denominator <= numerator
}
```

<details>
<summary>The shared claim, clawback, and authorization checks</summary>

```aiken title="lib/vesting.ak"
/// A claim at `earliest`, the first moment the transaction can happen. The
/// beneficiary signs and takes what has vested by then. Whatever is still
/// unvested goes back to the grant's own address, under the datum the grant
/// was spent with.
pub fn claim_ok(
  self: Transaction,
  own_ref: OutputReference,
  grant: Grant,
  earliest: Int,
) -> Bool {
  expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
  let own_address = own_input.output.address
  and {
    signed_by(self, grant.beneficiary.payment_credential),
    only_grant(self.inputs, own_address.payment_credential),
    when
      list.find(self.outputs, fn(output) { output.address == own_address })
    is {
      // Locate the rest by its address, then check everything about it.
      Some(rest) -> and {
          rest.datum == own_input.output.datum,
          rest.reference_script == None,
          covers_unvested(grant, earliest, assets.lovelace_of(rest.value)),
        }
      // Nothing goes back: only fine once everything has vested.
      None -> covers_unvested(grant, earliest, 0)
    },
  }
}
```

```aiken title="lib/vesting.ak"
/// A clawback at `latest`, the last moment the transaction can happen. The
/// grantor signs and takes at most what is still unvested by then. The rest
/// goes to the beneficiary, in one payment tagged with the grant's output
/// reference.
pub fn clawback_ok(
  self: Transaction,
  own_ref: OutputReference,
  grant: Grant,
  latest: Int,
) -> Bool {
  expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
  let held = assets.lovelace_of(own_input.output.value)
  let tag: Data = own_ref
  let paid = when
    list.find(
      self.outputs,
      fn(output) {
        output.address == grant.beneficiary && output.datum == InlineDatum(tag)
      },
    )
  is {
    Some(payment) -> assets.lovelace_of(payment.value)
    None -> 0
  }
  and {
    signed_by(self, VerificationKey(grant.grantor)),
    only_grant(self.inputs, own_input.output.address.payment_credential),
    within_unvested(grant, latest, held - paid),
  }
}
```

```aiken title="lib/vesting.ak"
/// Whether the key behind `credential` signed the transaction. A script
/// credential cannot sign, so it never passes.
pub fn signed_by(self: Transaction, credential: Credential) -> Bool {
  when credential is {
    VerificationKey(key) -> list.has(self.extra_signatories, key)
    Script(_) -> False
  }
}

/// Whether the transaction spends exactly one input from this contract. Two
/// grants with the same datum could otherwise share one output: one claim's
/// rest, or one clawback's payment, would count for both.
pub fn only_grant(inputs: List<Input>, own: Credential) -> Bool {
  list.count(
    inputs,
    fn(input) { input.output.address.payment_credential == own },
  ) == 1
}
```

`only_grant` prevents two inputs from sharing one continuing output. The clawback payment carries the spent grant's output reference as its tag. This binds the payment to this input; an unrelated validator must also check payment tags to prevent cross-contract sharing. A tag cannot control what another validator counts. See [double satisfaction](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/double-satisfaction).

The beneficiary's full on-chain address is checked, including the stake credential.

</details>

## Direct reading: correct for today's ledger

An `Interval` has a lower and an upper bound. Each bound combines `NegativeInfinity`, `Finite(t)`, or `PositiveInfinity` with an `is_inclusive` flag. For POSIX times, `t` is an integer number of milliseconds. These give 36 combinations of bound types and flags, with arbitrary integers in the finite cases.

Different combinations can describe the same set. For example, `(5,000,000, 6,000,000)` and `[5,000,001, 5,999,999]` contain exactly the same integer times. Flags on infinite bounds do not change which finite times are included.

The ledger produces a much narrower set of shapes for a Plutus V3 transaction:

| Transaction bounds | Validator's range |
|---|---|
| Both | Finite lower included; finite upper excluded |
| Lower only | Finite lower included; upper at +∞ |
| Upper only | Lower at −∞; finite upper excluded |
| Neither | −∞ to +∞ |

See the [Conway translation](https://github.com/IntersectMBO/cardano-ledger/blob/56ddee12ec768b85d14c62da049a33fc05114323/eras/conway/impl/src/Cardano/Ledger/Conway/TxInfo.hs#L799-L811). Finite bounds are converted from slot numbers to the POSIX times at which those slots start.

`naive.ak` is the ledger-specific baseline. It reads a finite lower bound directly and subtracts one millisecond from a finite upper bound. Its `expect` statements deliberately reject a missing required endpoint:

```aiken title="validators/naive.ak"
validator linear_vesting {
  spend(
    datum: Option<Grant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(grant) = datum
    when action is {
      Claim ->
        vesting.claim_ok(self, own_ref, grant, earliest(self.validity_range))
      Clawback ->
        vesting.clawback_ok(self, own_ref, grant, latest(self.validity_range))
    }
  }

  else(_) {
    fail
  }
}

/// The first moment the transaction can happen. Today the ledger always
/// includes a finite lower bound in the window, so the bound is that moment.
pub fn earliest(range: ValidityRange) -> Int {
  expect Finite(lower) = range.lower_bound.bound_type
  lower
}

/// The last moment the transaction can happen. Today the ledger always
/// excludes a finite upper bound from the window, so the last moment is one
/// millisecond before it.
pub fn latest(range: ValidityRange) -> Int {
  expect Finite(upper) = range.upper_bound.bound_type
  upper - 1
}
```

This is correct for the transaction shapes above. It is not a general interval interpreter: ignoring flags gives different answers for equivalent encodings in synthetic contexts or datum intervals.

### A smaller alternative: read one endpoint

Honor the flag at the bound the action uses:

```aiken title="validators/with_endpoints.ak"
/// Read only the endpoint the action needs, honoring its flag. These helpers
/// are for the ledger's nonempty transaction window. They do not validate an
/// arbitrary datum interval or inspect the other bound.
pub fn earliest(range: ValidityRange) -> Int {
  let bound = range.lower_bound
  expect Finite(lower) = bound.bound_type
  if bound.is_inclusive {
    lower
  } else {
    lower + 1
  }
}

pub fn latest(range: ValidityRange) -> Int {
  let bound = range.upper_bound
  expect Finite(upper) = bound.bound_type
  if bound.is_inclusive {
    upper
  } else {
    upper - 1
  }
}
```

```aiken title="validators/with_endpoints.ak"
validator linear_vesting {
  spend(
    datum: Option<Grant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(grant) = datum
    when action is {
      Claim ->
        vesting.claim_ok(self, own_ref, grant, earliest(self.validity_range))
      Clawback ->
        vesting.clawback_ok(self, own_ref, grant, latest(self.validity_range))
    }
  }

  else(_) {
    fail
  }
}
```

This handles equivalent endpoint encodings without constructing a normalized range or inspecting the other bound. It is sufficient for this grant's transaction window: the ledger already ensures an admitted transaction has a nonempty validity window.

For an arbitrary interval in a datum, these helpers alone do not establish that the other bound is sensible or that the interval is nonempty. Validate those conditions separately or normalize the whole interval.

### What the historical encoding change demonstrates

Before Conway, an upper-only window was translated to an **inclusive** upper endpoint in the [Alonzo translation](https://github.com/IntersectMBO/cardano-ledger/blob/56ddee12ec768b85d14c62da049a33fc05114323/eras/alonzo/impl/src/Cardano/Ledger/Alonzo/Plutus/TxInfo.hs#L327-L337). Conway uses an exclusive one, including for V1 and V2 contexts.

The ledger's admission rule still required `slot < invalidHereafter`; see [`inInterval`](https://github.com/IntersectMBO/cardano-ledger/blob/56ddee12ec768b85d14c62da049a33fc05114323/eras/allegra/impl/src/Cardano/Ledger/Allegra/Scripts.hs). The old context's extra endpoint did not allow inclusion in that excluded slot.

The Aiken tests supply inclusive upper bounds as **synthetic interval cases**, not evidence of an exploitable historical clawback. They show why a general interpreter must read the flag. Flag-aware helpers and normalization both do that. Neither guarantees unchanged behavior across a hard fork: changing `(-∞, t]` to `(-∞, t)` changes the represented set, so their interpreted endpoints should differ.

## The pattern: normalize the whole interval

Resolve each excluded finite bound to the nearest included integer: add one for the lower bound, subtract one for the upper. Then classify the result:

| Interval shape | Canonical representation |
|---|---|
| Finite, nonempty | `ClosedRange { lower, upper }`, both included |
| No lower bound | `FromNegInf { upper }` |
| No upper bound | `ToPosInf { lower }` |
| No bounds | `Always` |
| Empty | `InvalidRange` |

Equivalent encodings now produce the same value. Consumers can match on those five cases without reading flags again. This is useful when several checks share the interval; it also centralizes empty-interval handling.

### Write it by hand

```aiken title="validators/by_hand.ak"
/// A validity range reduced to what it means. Every bound is a moment the
/// transaction may happen at, included in the window, so no flag is needed.
pub type NormalizedTimeRange {
  /// From `lower` to `upper`, both included.
  ClosedRange { lower: Int, upper: Int }
  /// Any moment up to `upper`, included.
  FromNegInf { upper: Int }
  /// Any moment from `lower`, included.
  ToPosInf { lower: Int }
  /// Any moment at all.
  Always
  /// No moment at all: no transaction can be valid in this window.
  InvalidRange
}
```

```aiken title="validators/by_hand.ak"
/// Reduce a validity range to its normalized form. Equivalent ranges, however
/// they are encoded, come out the same.
pub fn normalize(range: ValidityRange) -> NormalizedTimeRange {
  let Interval { lower_bound, upper_bound } = range
  when (lower_bound.bound_type, upper_bound.bound_type) is {
    (NegativeInfinity, PositiveInfinity) -> Always
    (NegativeInfinity, Finite(upper)) ->
      FromNegInf { upper: last_moment(upper, upper_bound.is_inclusive) }
    (Finite(lower), PositiveInfinity) ->
      ToPosInf { lower: first_moment(lower, lower_bound.is_inclusive) }
    (Finite(lower), Finite(upper)) -> {
      let lower = first_moment(lower, lower_bound.is_inclusive)
      let upper = last_moment(upper, upper_bound.is_inclusive)
      if lower > upper {
        InvalidRange
      } else {
        ClosedRange { lower, upper }
      }
    }
    // A lower bound at +∞, or an upper bound at -∞: nothing fits.
    _ -> InvalidRange
  }
}

/// The first moment a lower bound lets in. Moments are whole milliseconds, so
/// a bound that excludes `bound` lets in `bound + 1` first.
fn first_moment(bound: Int, is_inclusive: Bool) -> Int {
  if is_inclusive {
    bound
  } else {
    bound + 1
  }
}

/// The last moment an upper bound lets in.
fn last_moment(bound: Int, is_inclusive: Bool) -> Int {
  if is_inclusive {
    bound
  } else {
    bound - 1
  }
}
```

Two details matter:

- After adjusting finite endpoints, **`lower > upper` means empty**. Equality is a valid singleton: `(9, 11)` contains the integer `10`.
- A lower bound at +∞ or an upper bound at −∞ contains no finite time.

The grant normalizes once per spend. A claim accepts `ClosedRange` or `ToPosInf`; a clawback accepts `ClosedRange` or `FromNegInf`:

```aiken title="validators/by_hand.ak"
validator linear_vesting {
  spend(
    datum: Option<Grant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(grant) = datum
    let window = normalize(self.validity_range)
    when action is {
      // Paid by what has vested at the first moment the transaction can
      // happen, so the window must have one.
      Claim -> {
        let earliest = when window is {
          ClosedRange { lower, .. } -> lower
          ToPosInf { lower } -> lower
          FromNegInf { .. } | Always | InvalidRange -> fail
        }
        vesting.claim_ok(self, own_ref, grant, earliest)
      }
      // Limited by what is unvested at the last moment the transaction can
      // happen, so the window must have one.
      Clawback -> {
        let latest = when window is {
          ClosedRange { upper, .. } -> upper
          FromNegInf { upper } -> upper
          ToPosInf { .. } | Always | InvalidRange -> fail
        }
        vesting.clawback_ok(self, own_ref, grant, latest)
      }
    }
  }

  else(_) {
    fail
  }
}
```

This makes all range cases visible together. The endpoint version expresses the same required-bound rejection with `expect`. Both are deliberate policies.

### The library version and its limitation

[`aiken-design-patterns` v1.9.0](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/v1.9.0/lib/aiken-design-patterns/validity-range-normalization.ak) exports `NormalizedTimeRange` and `normalize_time_range` from `aiken_design_patterns/validity_range_normalization`.

```aiken title="validators/with_library.ak"
validator linear_vesting {
  spend(
    datum: Option<Grant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(grant) = datum
    let window = normalize_time_range(self.validity_range)
    when action is {
      Claim -> {
        let earliest = when window is {
          ClosedRange { lower, .. } -> lower
          ToPosInf { lower } -> lower
          FromNegInf { .. } | Always | InvalidRange -> fail
        }
        vesting.claim_ok(self, own_ref, grant, earliest)
      }
      Clawback -> {
        let latest = when window is {
          ClosedRange { upper, .. } -> upper
          FromNegInf { upper } -> upper
          ToPosInf { .. } | Always | InvalidRange -> fail
        }
        vesting.clawback_ok(self, own_ref, grant, latest)
      }
    }
  }

  else(_) {
    fail
  }
}
```

**v1.9.0 incorrectly classifies singleton integer intervals as empty.** It checks `lower >= upper` after resolving the flags. `[10, 10]` contains `10`, so returning `InvalidRange` loses a member of the original set. This is a semantic limitation, not an equally valid normalization convention.

Current one-second slot boundaries cannot produce a one-millisecond transaction window, so the difference does not affect these transaction-range examples. For general datum intervals, use the hand-written conversion here or a library version whose singleton behavior you have verified. The tests pin all four singleton encodings so a dependency change requires review.

## Build the transaction

The Mesh builders use Preview's slot configuration. The off-chain grant and its datum are:

```ts title="src/lib/blueprint.ts"
/// A grant, as the off-chain code holds it. Times are POSIX milliseconds,
/// amounts are lovelace, the same units the validator reads.
export type Grant = {
  /// Who the grant vests to.
  beneficiaryAddress: string;
  /// The address of whoever may claw it back. Only its key goes in the datum.
  grantorAddress: string;
  start: number;
  end: number;
  total: bigint;
};

/// The grant as the datum the validator reads: `Grant` in `lib/vesting.ak`,
/// field for field.
export function grantDatum(grant: Grant) {
  return mConStr0([
    beneficiaryDatum(grant.beneficiaryAddress),
    paymentKey(grant.grantorAddress),
    grant.start,
    grant.end,
    grant.total,
  ]);
}
```

`beneficiaryDatum` preserves key **and script** stake credentials. The builders support base and enterprise beneficiary addresses with a key payment credential; unsupported forms are rejected rather than partially encoded. The grantor also needs a key payment credential.

Every spend declares its validity window in slots:

```ts title="src/lib/vesting.ts"
/// Spend the grant with `action`, inside the declared window.
function spendGrant(spend: Spend, action: object): MeshTxBuilder {
  const { grantUtxo, window } = spend;
  const txBuilder = new MeshTxBuilder({ fetcher: spend.provider, evaluator: spend.evaluator });
  txBuilder
    .spendingPlutusScriptV3()
    .txIn(grantUtxo.input.txHash, grantUtxo.input.outputIndex, grantUtxo.output.amount, grantUtxo.output.address)
    .txInScript(grantScriptCbor(spend.version))
    .txInInlineDatumPresent()
    .txInRedeemerValue(action);
  // The window, in slots. The ledger turns each bound into the POSIX time its
  // slot starts at before the validator sees it.
  if (window.from !== undefined) txBuilder.invalidBefore(window.from);
  if (window.until !== undefined) txBuilder.invalidHereafter(window.until);
  return txBuilder;
}
```

**Rounding depends on the action.** If the exact unvested amount is `U`:

- A claim must return at least `ceil(U)`.
- A clawback may retain at most `floor(U)`, so it pays at least `held − floor(U)` to the beneficiary.

Using `held − ceil(U)` would underpay by one lovelace whenever `U` is non-integral, and the validator would reject it.

```ts title="src/lib/vesting.ts"
/// Round the unvested fraction up for a claim's rest, down for a clawback's
/// retention. Each direction protects the party who did not build the tx.
export function unvested(grant: Grant, at: number, rounding: "up" | "down"): bigint {
  if (at >= grant.end) return 0n;
  if (at <= grant.start) return grant.total;
  const numerator = grant.total * BigInt(grant.end - at);
  const denominator = BigInt(grant.end - grant.start);
  return rounding === "up" ? (numerator + denominator - 1n) / denominator : numerator / denominator;
}
```

The claim uses the start of its `from` slot:

```ts title="src/lib/vesting.ts"
/// The beneficiary claims what has vested by the first moment of the window,
/// the start of its `from` slot. The rest goes back to the contract, under
/// the same datum.
export async function buildClaimTx(spend: Spend): Promise<string> {
  const { from } = spend.window;
  if (from === undefined) throw new Error("a claim needs a lower bound");
  const earliest = slotTime(from);
  const owed = unvested(spend.grant, earliest, "up");
  const txBuilder = spendGrant(spend, CLAIM);
  if (owed > 0n) {
    // Near the end, what is unvested can be less than the ledger accepts in
    // an output. Send back the minimum instead: the validator accepts more.
    const rest = await withMinimumLovelace(
      spend.provider, spend.grantUtxo.output.address, owed, datumOf(spend.grantUtxo),
    );
    txBuilder
      .txOut(spend.grantUtxo.output.address, [{ unit: "lovelace", quantity: rest.toString() }])
      // The same datum the grant was spent with, byte for byte.
      .txOutInlineDatumValue(datumOf(spend.grantUtxo), "CBOR");
  }
  // The signature the validator looks for.
  txBuilder.requiredSignerHash(paymentKey(spend.grant.beneficiaryAddress));
  return await finish(txBuilder, spend);
}
```

The clawback uses one millisecond before its `until` slot starts:

```ts title="src/lib/vesting.ts"
/// The grantor takes back what is unvested at the last moment of the window,
/// one millisecond before its `until` slot starts. Everything else goes to
/// the beneficiary, tagged with the grant's output reference.
export async function buildClawbackTx(spend: Spend): Promise<string> {
  const { until } = spend.window;
  if (until === undefined) throw new Error("a clawback needs an upper bound");
  // The ledger excludes the upper bound: the transaction is valid in slots
  // before `until`, so its last moment is just before `until` starts.
  const latest = slotTime(until) - 1;
  const held = lovelaceOf(spend.grantUtxo);
  const owed = held - unvested(spend.grant, latest, "down");
  const txBuilder = spendGrant(spend, CLAWBACK);
  if (owed > 0n) {
    const { txHash, outputIndex } = spend.grantUtxo.input;
    const tag = serializeData(mOutputReference(txHash, outputIndex));
    // A small tagged payment still has to meet the output minimum. The
    // grantor funds any top-up through balancing; paying more is permitted.
    const payment = await withMinimumLovelace(spend.provider, spend.grant.beneficiaryAddress, owed, tag);
    txBuilder
      .txOut(spend.grant.beneficiaryAddress, [{ unit: "lovelace", quantity: payment.toString() }])
      .txOutInlineDatumValue(tag, "CBOR");
  }
  txBuilder.requiredSignerHash(paymentKey(spend.grant.grantorAddress));
  return await finish(txBuilder, spend);
}
```

**Both output kinds must meet minimum ADA:** the claim's continuing output and the clawback's tagged beneficiary payment. The builders calculate the minimum for the actual address and datum, rechecking if the amount's encoding grows. A claim may leave more than the exact unvested amount for a later claim. A clawback may pay more than the vested amount, funded by the grantor through transaction balancing.

`buildLockTx` writes a linear `Grant` and accepts only the linear-validator versions. It rejects amounts below the output minimum instead of silently changing the grant total. The scheduled grant has a separate locking API below.

## The numbers

`npm run bench` recompiles the validators, builds four scenarios per version with fixed wallets and a 10 ADA grant, evaluates the scripts, and writes `costs.json`. `npm test` also recompiles before evaluating, then checks the recorded costs. These measurements use Mesh's default protocol parameters and carry the script in the transaction.

For a **claim halfway through the grant, with a 100-slot window**:

| Implementation | Memory units | CPU steps | Script bytes | Fee, ADA |
|---|---:|---:|---:|---:|
| Ledger-specific direct reading | {costFigure(Costs, "versions.naive.claimBetween.mem")} | {costFigure(Costs, "versions.naive.claimBetween.cpu")} | {costFigure(Costs, "versions.naive.claimBetween.scriptSize")} | {costFigure(Costs, "versions.naive.claimBetween.fee", "ada")} |
| Flag-aware endpoint helpers | {costFigure(Costs, "versions.withEndpoints.claimBetween.mem")} | {costFigure(Costs, "versions.withEndpoints.claimBetween.cpu")} | {costFigure(Costs, "versions.withEndpoints.claimBetween.scriptSize")} | {costFigure(Costs, "versions.withEndpoints.claimBetween.fee", "ada")} |
| Hand-written normalization | {costFigure(Costs, "versions.byHand.claimBetween.mem")} | {costFigure(Costs, "versions.byHand.claimBetween.cpu")} | {costFigure(Costs, "versions.byHand.claimBetween.scriptSize")} | {costFigure(Costs, "versions.byHand.claimBetween.fee", "ada")} |
| Library normalization | {costFigure(Costs, "versions.withLibrary.claimBetween.mem")} | {costFigure(Costs, "versions.withLibrary.claimBetween.cpu")} | {costFigure(Costs, "versions.withLibrary.claimBetween.scriptSize")} | {costFigure(Costs, "versions.withLibrary.claimBetween.fee", "ada")} |

The endpoint helpers are the useful middle baseline: they handle the flags while reading only what the action needs. Full normalization resolves both bounds and constructs the range shape. For this grant, that extra work buys organization rather than additional protection for a real transaction window.

The full results in `costs.json` also cover lower-only claims, upper-only clawbacks, and clawbacks with both bounds. The scripts remain well below the fixture's {costFigure(Costs, "limits.mem")} memory-unit transaction limit. Fees here include script bytes; a [reference script](/docs/developers/onboarding/lectures/intermediate/reference-inputs-and-scripts) changes that fee comparison.

## An interval in a datum

An external schema may represent a vesting period as an interval. Unlike a transaction window, its writer can choose arbitrary bounds and flags:

```aiken title="lib/schedule.ak"
/// A grant whose vesting period is an interval: when it starts vesting, and
/// when it has fully vested. Times are POSIX milliseconds, amounts lovelace.
pub type ScheduledGrant {
  beneficiary: Address,
  grantor: VerificationKeyHash,
  /// Written by whoever locks the grant, in any encoding.
  period: Interval,
  total: Int,
}

/// The grant the shared checks read: the same parties and total, with the
/// period resolved to a first and a last moment.
pub fn vesting_between(self: ScheduledGrant, start: Int, end: Int) -> Grant {
  Grant {
    beneficiary: self.beneficiary,
    grantor: self.grantor,
    start,
    end,
    total: self.total,
  }
}
```

Here normalization has a direct correctness benefit: **equivalent period encodings should produce the same vesting amounts**. Four encodings of the same finite period leave the same rest in both Aiken and Mesh tests. The tests also reject a rest one lovelace below the required amount.

The baseline `scheduled_naive.ak` reads two finite bounds and ignores the flags:

```aiken title="validators/scheduled_naive.ak"
validator scheduled_vesting {
  spend(
    datum: Option<ScheduledGrant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(scheduled) = datum
    expect Finite(start) = scheduled.period.lower_bound.bound_type
    expect Finite(end) = scheduled.period.upper_bound.bound_type
    let grant = schedule.vesting_between(scheduled, start, end)
    when action is {
      Claim ->
        vesting.claim_ok(self, own_ref, grant, earliest(self.validity_range))
      Clawback ->
        vesting.clawback_ok(self, own_ref, grant, latest(self.validity_range))
    }
  }

  else(_) {
    fail
  }
}
```

Its finite-bound assumptions also mean a datum with an infinite endpoint cannot be spent. This illustrates a **state-design problem**: locking is a plain payment and runs no validator. Normalizing the period alone would not solve it if the contract still rejected the resulting shape.

### Choose schedule semantics and a recovery policy separately

The scheduled example makes these explicit choices:

- **`ClosedRange`:** linear vesting from its first to its last moment. A singleton is a cliff that vests at that moment.
- **`FromNegInf`:** a cliff at its last moment. This is this protocol's interpretation of a period with no start.
- **`ToPosInf`, `Always`, `InvalidRange`:** nothing vests, claims fail, and the grantor may refund the whole balance.

```aiken title="validators/scheduled.ak"
validator scheduled_vesting {
  spend(
    datum: Option<ScheduledGrant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(scheduled) = datum
    // The period, in whatever encoding the grantor wrote it.
    let vests = when normalize(scheduled.period) is {
      // Linear, from the first moment to the last.
      ClosedRange { lower, upper } ->
        Some(schedule.vesting_between(scheduled, lower, upper))
      // No start: a cliff. Nothing vests before the last moment, all of it
      // vests then.
      FromNegInf { upper } ->
        Some(schedule.vesting_between(scheduled, upper, upper))
      // Protocol policy: these periods vest nothing and allow a refund.
      // This policy is separate from interval normalization.
      ToPosInf { .. } |
      Always |
      InvalidRange -> None
    }
    let window = normalize(self.validity_range)
    when action is {
      Claim -> {
        // A grant that never vests has nothing to claim.
        expect Some(grant) = vests
        let earliest = when window is {
          ClosedRange { lower, .. } -> lower
          ToPosInf { lower } -> lower
          FromNegInf { .. } | Always | InvalidRange -> fail
        }
        vesting.claim_ok(self, own_ref, grant, earliest)
      }
      Clawback ->
        when vests is {
          Some(grant) -> {
            let latest = when window is {
              ClosedRange { upper, .. } -> upper
              FromNegInf { upper } -> upper
              ToPosInf { .. } | Always | InvalidRange -> fail
            }
            vesting.clawback_ok(self, own_ref, grant, latest)
          }
          // The refund policy needs only authorization, not a time bound or
          // one-grant restriction. There is no beneficiary payment to share.
          None -> vesting.signed_by(self, VerificationKey(scheduled.grantor))
        }
    }
  }

  else(_) {
    fail
  }
}
```

The refund branch checks only the grantor signature. It needs no time bound or one-grant restriction because there is no beneficiary payment or continuing output to share. Normal linear/cliff spends still use the shared checks.

These are **additional protocol rules**, not consequences of normalization. Another design could reject unsupported schedules during authenticated initialization, or use a dedicated schedule type. Arbitrary malformed deposits, unusable party credentials, and wrong datum types still need consideration: normalization does not guarantee that every deposit can be recovered.

The library's singleton defect matters here. Substituting v1.9.0's normalizer would classify a one-moment cliff as `InvalidRange` and route it to the refund policy, even after it vested. This example therefore uses the hand-written normalizer for the datum period.

### Lock a scheduled grant

The off-chain period type supports finite bounds and the usual unbounded ends:

```ts title="src/lib/schedule.ts"
/// One end of a period. `at` left out is infinite: −∞ for a lower bound, +∞
/// for an upper one.
export type Bound = { at?: number; included: boolean };

/// Finite bounds and the usual infinities, as `Interval` in the stdlib.
/// Inverted infinities (+∞ below or −∞ above) require raw data in a test.
export type Period = { lower: Bound; upper: Bound };

/// The period as on-chain data. Bound types are `NegativeInfinity`,
/// `Finite(at)` and `PositiveInfinity`, in that order.
export function periodData({ lower, upper }: Period) {
  const bound = (end: Bound, infinity: Data) =>
    mConStr0([end.at === undefined ? infinity : mConStr1([end.at]), mBool(end.included)]);
  return mConStr0([bound(lower, mConStr0([])), bound(upper, mConStr2([]))]);
}

/// The datum: `ScheduledGrant` in `lib/schedule.ak`, field for field.
export function scheduledDatum(grant: Grant, period: Period) {
  return mConStr0([
    beneficiaryDatum(grant.beneficiaryAddress),
    paymentKey(grant.grantorAddress),
    periodData(period),
    grant.total,
  ]);
}
```

Use the dedicated locking function so the validator receives `ScheduledGrant`, not `Grant`:

```ts title="src/lib/vesting.ts"
/// A scheduled validator needs ScheduledGrant, not the linear Grant datum.
export async function buildScheduledLockTx(
  wallet: IWallet,
  provider: IFetcher,
  version: ScheduledVersion,
  grant: Grant,
  period: Period,
  networkId: number,
): Promise<string> {
  if (!isScheduled(version)) throw new Error("use buildLockTx for a linear grant");
  return lockWithDatum(wallet, provider, version, grant, scheduledDatum(grant, period), networkId);
}
```

For subsequent spends, `vestingOf(grant, period)` supplies the resolved schedule to the shared claim/clawback builders. Continuing outputs copy the input's datum byte for byte. Builder tests spend actual lock outputs, including closed periods, cliffs, singletons, empty periods, and periods with no end.

`scheduledNaive` is an intentionally restricted comparison. Do not lock an unbounded period there: both actions reject it. The locking API encodes the right datum type; it does not run the spending validator or establish that an arbitrary schedule is supported.

### Interpret the scheduled costs carefully

For the same finite-period claim with both transaction bounds:

| Implementation | Memory units | Script bytes | Fee, ADA |
|---|---:|---:|---:|
| Scheduled baseline | {costFigure(Costs, "versions.scheduledNaive.claimBetween.mem")} | {costFigure(Costs, "versions.scheduledNaive.claimBetween.scriptSize")} | {costFigure(Costs, "versions.scheduledNaive.claimBetween.fee", "ada")} |
| Scheduled with normalization and refund policy | {costFigure(Costs, "versions.scheduled.claimBetween.mem")} | {costFigure(Costs, "versions.scheduled.claimBetween.scriptSize")} | {costFigure(Costs, "versions.scheduled.claimBetween.fee", "ada")} |

This comparison includes two interval conversions **and** broader schedule handling. It does not isolate normalization's cost, and it is not the price of a general recovery guarantee.

## What the tests establish

- **Interval semantics:** property tests compare normalized membership with `interval.contains` and check equivalent finite encodings. Unit tests cover empty ranges, infinities, all singleton encodings, and the library's limitation.
- **Time and amounts:** claims use the lower endpoint, clawbacks the upper; missing required endpoints fail. Fractional grants test both rounding directions, including rejection one lovelace below the required rest or payment.
- **State and authorization:** actual locking outputs can be spent; continuing datums are preserved; wrong datum types fail. Wrong signers, shared claim rests, and missing or incorrect payment tags are rejected.
- **Addresses and output minima:** key-staked, script-staked, and enterprise beneficiaries receive the correct payment. Changed addresses fail. Tests check the ledger minimum against actual serialized outputs, including small clawback payments.
- **Recovery policy:** cliffs and singletons vest at the chosen moment. Empty and unbounded schedules allow only the authorized refund. Aiken tests also cover refunds with no transaction time bound and multiple refundable grants.

The offline evaluator runs the compiled scripts; it is not full ledger admission. It does not establish that the current slot is inside the window or perform every phase-one check. Minimum-output tests are separate for that reason.

Grants track **ADA only**; tokens accidentally sent to them are not protected by the amount checks. The grantor may claw back at any time under this protocol. An irrevocable grant needs different action rules.

## Run it

The example is a self-contained project; see [the playground](./introduction.md#the-playground). Use Aiken v1.1.24 and Node 22 with native TypeScript support (22.18 or newer):

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/design-patterns/validity-range validity-range
cd validity-range/on-chain/aiken
aiken check
cd ../../off-chain/mesh
npm install
npm run typecheck
npm test             # recompiles and copies the blueprint, then runs regressions and cost checks
npm run bench        # recompiles, measures all versions, and rewrites costs.json
```

**Use normalization when a shared canonical interval makes the code easier to reason about.** For this grant's transaction range, the endpoint helpers are sufficient. For user-supplied intervals, preserving equivalent representations is valuable, while schedule validation and fund recovery remain separate design work.

## Go deeper

- [Handling time: vesting](/docs/developers/onboarding/lectures/intermediate/handling-time): a deadline checked with stdlib predicates.
- [Time handling](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/time-handling): choosing a conservative endpoint.
- [Transactions: validity intervals and time](/docs/developers/curriculum/fundamentals/core-concepts/transactions#validity-intervals-and-time): conversion from slots to POSIX time.
- [`aiken-design-patterns` v1.9.0 source](https://github.com/Anastasia-Labs/aiken-design-patterns/tree/v1.9.0): the pinned library implementation, including its singleton limitation.
