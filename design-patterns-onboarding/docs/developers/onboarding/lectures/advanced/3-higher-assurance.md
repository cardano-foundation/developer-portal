# Higher assurance

> From one test per attack to a guarantee checked against generated transactions, and the two levels beyond tests: an audit and a formal proof.

# Higher assurance

In **[detecting vulnerabilities](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities)** you found each attack by imagining it, wrote it down as one test, and closed the door until that test failed. The vault's test moves the vault to an address with one stake key, the attacker's. It proves the fix works for that key. It says nothing about the next one.

This lecture is about the transactions nobody thought of. You write down what a contract must always guarantee, check that guarantee against transactions generated for you, and then look at the two levels beyond tests: an audit and a formal proof.

## From a case to a guarantee

A unit test checks one transaction you chose. A property test checks a rule against many transactions a generator chose. **[Testing](/docs/developers/onboarding/lectures/intermediate/testing#property-tests)** used one to cover every owner key instead of the one you happened to pick.

The rule in a property test can be the guarantee itself. Every guarantee has two directions, and a contract can break either one:

- **Every transaction that breaks the guarantee is refused.** The attacks in detecting vulnerabilities were all on this side: a donation that should have been refused was accepted.
- **Every transaction that keeps the guarantee is accepted.** A contract that refuses an honest user is broken too. It blocks people from their funds or from the protocol, two of the [five goals](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities#think-as-an-attacker) an attacker has, and nobody had to attack it.

A test that marks a refusal with `fail` is the first direction. A test that expects a yes is the second. Formal proofs use names for the two: the first is **soundness**, and the second is **completeness**.

## Write the guarantees down

The [first design question](/docs/developers/onboarding/lectures/intermediate/handling-time#from-idea-to-architecture) already asked what a contract must guarantee. Turn each answer into a sentence that holds for every transaction, with no example in it. For the splitter:

- A donation never adds a token to the pot. Only ADA.
- A split pays every benefactor at least their share.
- The beacon never leaves the pot.

A sentence like these is an **invariant**: a fact about the contract's state that every accepted transaction keeps. The five attacker goals help you find them. Turn each goal around: "steal tokens" becomes "no transaction takes out more than the rules allow", and "halt the protocol" becomes "some action stays possible for the benefactors".

Write the property from the guarantee, not from the validator. A property copied from the validator's code proves that the code agrees with itself. The guarantee and the check are two descriptions of the same thing, written separately, and a property test is where they meet.

## What a generator can reach

A generator only makes the values you describe. One that never builds a stake part never finds the stake attack. A generator describes what the attacker controls, so give it as much freedom as the attacker has: any policy, any token name, any amount, any address.

A property test also inherits two limits from unit tests:

- **One transaction per run.** The dust attack was a sequence of donations. A property that every donation of a token is refused closes it, because the sequence never gets past its first step. A guarantee about the sequence itself, such as "the pot can always be split", needs tests that build a sequence. The `aiken/fuzz/scenario` module in the [fuzz library](https://github.com/aiken-lang/fuzz) generates whole sequences of transactions against a validator.
- **The transaction is built by hand.** The ledger's own rules and your off-chain code are outside the test. That is the gap **[testing](/docs/developers/onboarding/lectures/intermediate/testing#the-level-these-two-cannot-reach)** left to integration tests.

## Audits

Tests find the problems you know how to look for. An audit puts people whose job is to break contracts in front of yours, to look for the ones you did not.

An auditor has to understand what the contract is meant to do before they can find where it does something else. You have already written what they need:

- **The guarantees**, from the first design question, written apart from the code. Without them an auditor cannot tell a decision from a bug.
- **The tests**: one per attack you closed, and a property for every guarantee.
- **A build anyone can repeat.** Every example project pins its compiler in `aiken.toml` and its libraries in `aiken.lock`. The same source, compiler and libraries produce the same compiled script, byte for byte, so the same hash and the same address. That is how anyone can check that the script on the chain is the script that was audited.

Get the audit before the contract holds value that others depend on, and before it is deployed, because [the hash is the address](/docs/developers/onboarding/lectures/intermediate/parameters#why-a-parameter-changes-the-address). A fix after the audit is new code, which is why the last phase of an audit reviews the fixes. The handbook's **[audits](/docs/developers/curriculum/smart-contracts/security#audits)** section has the four phases and how to prepare for each. [CIP-52](https://cips.cardano.org/cip/CIP-52) is the community's standard for how audits are run, with three levels of assurance a project can aim for.

## Formal verification

A property test tries a hundred transactions. A **formal proof** shows the guarantee holds for every transaction it describes. You state the guarantee as a theorem about the compiled validator, and a proof checker accepts the theorem only if it holds. If it does not, you get a counterexample, as a property test would give you.

The [contracts library](https://github.com/input-output-hk/contracts-library) proves its linear vesting contract this way, in [Lean 4](https://lean-lang.org/) with [Blaster](https://github.com/input-output-hk/Lean-blaster), against the compiled validator. Its **[proofs](https://github.com/input-output-hk/contracts-library/tree/main/formal)** come in three groups: completeness ("what the specification allows is accepted"), soundness ("what is accepted is allowed"), and a set of rejections, double satisfaction among them.

They also show where a proof stops. The fully general versions of several theorems, over any datum, any amount and any address, are written down and left unproved, because the solver does not finish on a transaction with nothing fixed in it. The library proves them for one fixed schedule and amount instead, and says so. A proof covers exactly what its statement covers, so read the statement before you trust the proof.

Proofs cost expertise and time, and the tooling is still in active development. They are worth it where an error costs more than the proof does.

## Choosing the level

Each level adds to the one above it, and none of them replaces another.

| level | what it shows | when |
| --- | --- | --- |
| unit tests | the transactions you wrote down behave | always |
| property tests | each guarantee holds for every transaction the generator made | always, one per guarantee |
| audit | people paid to break the contract found nothing more, or what they found is fixed | before the contract holds value others depend on |
| formal proof | a guarantee holds for every transaction its statement covers | when an error would cost more than the proof |

## Try it

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

In each exercise you write a property for one of the contracts you closed in **[detecting vulnerabilities](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities)**, watch it pass, and then try a weaker fix: one that passes every unit test you have. The property catches it.

### The splitter's tokens

#### Write the property

Go back to the splitter project. Property tests need the generators library, as they did in **[testing](/docs/developers/onboarding/lectures/intermediate/testing)**. From the project's folder:

```bash
aiken add aiken-lang/fuzz --version v2.2.0
```

Add its import below `use aiken/collection/list`:

```aiken title="validators/splitter.ak"
use aiken/fuzz
```

Then two generators and the property, below the other tests:

```aiken title="validators/splitter.ak"
// One token a donor might add: any policy, any name, any positive quantity.
fn any_token() -> Fuzzer<(PolicyId, ByteArray, Int)> {
  fuzz.tuple3(
    fuzz.bytearray_fixed(28),
    fuzz.bytearray_between(0, 32),
    fuzz.int_between(1, 1_000_000),
  )
}

// A donation that adds at least one token: some ADA, from none to 50 ADA, and
// one to three tokens.
fn any_donation_with_tokens() -> Fuzzer<Assets> {
  fuzz.map2(
    fuzz.int_between(0, 50_000_000),
    fuzz.list_between(any_token(), 1, 3),
    fn(lovelace, tokens) {
      list.foldl(
        tokens,
        assets.from_lovelace(lovelace),
        fn(token, value) {
          let (policy_id, name, quantity) = token
          assets.add(value, policy_id, name, quantity)
        },
      )
    },
  )
}

test any_donation_with_tokens_is_refused(
  donation via any_donation_with_tokens(),
) fail {
  let before = pot_holding(100_000_000)
  let tx = spend_pot(
    before,
    [output_at(pot_address, assets.merge(before, donation))],
  )
  splitter.spend(beacon, benefactors, None, Donate, pot_ref, tx)
}
```

- `Fuzzer` is the type of a generator of `a` values, and it is built into the language. `any_token` combines three generators into one with `fuzz.tuple3`: 28 bytes for the policy, up to 32 for the name, and a quantity.
- `any_donation_with_tokens` combines two more with `fuzz.map2`: an amount of ADA and a list of one to three tokens, folded into one value. Every donation it makes holds at least one token, and that is all that is wrong with it.
- The test is the dust attack from **[donate dust](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities#donate-dust)** with the donation left open. `fail` on a property means every run has to be refused. A single accepted donation fails the test, and the runner prints that donation.

Run `aiken check`. Seven passes, and the property reports `PASS [after 100 tests]`.

#### Try a weaker fix

Here is a fix that sounds reasonable: a donation has to donate. The dust donation in `donate_dust_ok` adds no ADA, so a rule that asks the ADA to grow refuses it. Replace the `Donate` branch:

```aiken title="validators/splitter.ak"
      Donate -> and {
          value_geq(new_pot.value, pot.value)?,
          (assets.lovelace_of(new_pot.value) > assets.lovelace_of(pot.value))?,
        }
```

Run `aiken check`. `donate_dust_ok` still passes: the one attack you wrote down is refused. The property fails, and prints its counterexample: a donation of some ADA and one token under a policy ID of all zeros. The attacker adds one lovelace to every donation, and the dust goes in.

The token in the counterexample can differ from one run to the next, because each run starts from a new random seed. The runner prints the seed under its results, and `aiken check --seed` with that number repeats the same run.

Put `assets.match(new_pot.value, pot.value, >=)?` back and run `aiken check` again. Seven passes.

### The vault's address

#### Refuse every other address

Go back to the vault project and add the library there too, from its folder:

```bash
aiken add aiken-lang/fuzz --version v2.2.0
```

Add its import below `use aiken/crypto.{VerificationKeyHash}`:

```aiken title="validators/vault.ak"
use aiken/fuzz
```

Then a generator and the first property, below the other tests:

```aiken title="validators/vault.ak"
// A stake part: a key or a script, either one with any 28-byte hash.
fn any_stake_part() -> Fuzzer<address.StakeCredential> {
  fuzz.either(
    fuzz.map(
      fuzz.bytearray_fixed(28),
      fn(hash) { address.Inline(address.VerificationKey(hash)) },
    ),
    fuzz.map(
      fuzz.bytearray_fixed(28),
      fn(hash) { address.Inline(Script(hash)) },
    ),
  )
}

test any_other_stake_part_is_refused(stake via any_stake_part()) fail {
  let elsewhere = Address {
    payment_credential: Script(script_hash),
    stake_credential: Some(stake),
  }
  let tx = spend_vault([vault_at(elsewhere, 100_000_000)], [attacker])
  vault.spend(beacon, Some(owner), Donate, vault_ref, tx)
}
```

`fuzz.either` makes a value from one generator or the other, so a stake part is a key one time and a script the next. The test is **[move the stake part](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities#move-the-stake-part)** with the stake part left open, and `fail` asks for every one of those donations to be refused. Run `aiken check`. Seven passes.

#### Accept every honest donation

That property is the first direction. The second is that a vault still takes an honest donation, wherever it is:

```aiken title="validators/vault.ak"
// A vault at `home`, holding 100 ADA, put back at `home` with `extra` more.
fn donate_at(home: Address, extra: Int) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    inputs: [
      Input { output_reference: vault_ref, output: vault_at(home, 100_000_000) },
    ],
    outputs: [vault_at(home, 100_000_000 + extra)],
  }
}

test any_vault_accepts_an_honest_donation(
  donation via fuzz.both(
    fuzz.option(any_stake_part()),
    fuzz.int_between(0, 50_000_000),
  ),
) {
  let (stake, extra) = donation
  let home = Address {
    payment_credential: Script(script_hash),
    stake_credential: stake,
  }
  vault.spend(beacon, Some(owner), Donate, vault_ref, donate_at(home, extra))
}
```

- A vault can sit at an address with a stake part. The owner may lock it at their own stake key, to collect the rewards on their own funds.
- A property takes one generated value, so `fuzz.both` pairs two generators into one, and `let (stake, extra) = donation` takes the pair apart. `fuzz.option` makes `None` or `Some` of a stake part, so the vault's address has no stake part in some runs and one in others.
- There is no `fail` this time: every run has to be accepted.

Run `aiken check`. Eight passes.

#### Try a weaker fix

Here is a fix that closes the stake attack without comparing the whole address: the vault goes back to an address with no stake part at all. Replace the search for the vault's output:

```aiken title="validators/vault.ak"
        expect Some(new_vault) = list.find(
          self.outputs,
          fn(o) {
            and {
              o.address.payment_credential == locked.address.payment_credential,
              o.address.stake_credential == None,
            }
          },
        )
```

Run `aiken check`. Every test from detecting vulnerabilities passes, because the vault in them has no stake part. `any_other_stake_part_is_refused` passes too: no attacker can add a stake part. `any_vault_accepts_an_honest_donation` fails, with this counterexample:

```
(
  Some(
    Inline(
      VerificationKey(
        #"00000000000000000000000000000000000000000000000000000000",
      ),
    ),
  ),
  0,
)
```

A vault whose address has a stake part, and a donation of nothing extra. Nobody can donate to that vault, because no output can ever match it. The weaker fix closed the door the attacker used, and locked out everybody else in the same move.

Put `fn(o) { o.address == locked.address }` back and run `aiken check`. Eight passes.

Stuck? Both properties are in the example project, in `splitter.ak` and `vault.ak`. See the **[introduction](/docs/developers/onboarding/lectures/advanced/introduction#the-example-project)**.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

## Go deeper

- [Testing](/docs/developers/curriculum/smart-contracts/testing#property-based-testing): property-based testing in depth, and mock transactions with mocktail.
- [Aiken tests](https://aiken-lang.org/language-tour/tests): the test runner, including `fail` and `fail once` on property tests.
- [aiken-lang/fuzz](https://github.com/aiken-lang/fuzz): every generator, and the `scenario` module for sequences of transactions.
- [Audits](/docs/developers/curriculum/smart-contracts/security#audits): what an audit checks, how to prepare, and the four phases.
- [Formal verification](/docs/developers/curriculum/smart-contracts/security#formal-verification): Blaster, and where formal proofs fit.
- [CIP-52](https://cips.cardano.org/cip/CIP-52): the Cardano audit best practice guidelines.
- [Contracts library](https://github.com/input-output-hk/contracts-library): reusable contracts, each with a specification and Lean 4 proofs about it.

Next: **[Going to production](/docs/developers/onboarding/lectures/advanced/going-to-production)**.
