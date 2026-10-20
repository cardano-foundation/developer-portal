# On-chain: the swap rules

> The smart contract that enforces the atomic swap, plus a rule for creating the demo tokens.

# On-chain: the swap rules

"On-chain" means the part of your app that lives **on the blockchain**: the **smart contract**. It's the rulebook. When someone tries to take the locked GOLD, the network runs this contract, and the trade only goes through if the rules say yes. Nobody, not even you, can get around it.

The contract is written in a smart-contract language (pick one in the tabs below). Either way, it's really two small rules that work together:

- **minting policy** the rule that controls creating and destroying tokens (making a new token is called _minting_, destroying the token is called _burning_). It decides who and how is allowed to create and destroy GOLD and SILVER tokens, so nobody can create tokens they shouldn't.
- **swap validator** the rule that guards a locked token. Whenever someone tries to take the GOLD out of the contract, this rule runs and lets the trade go through only if it's fair, meaning the seller is paid exactly what they asked for.

Both rules are just **yes/no functions**. The network hands each one the whole transaction, and it returns exactly one thing: **`true`** (allow) or **`false`** (reject). A contract never moves tokens or does anything on its own, the transaction is already fully built before the rule runs. All the rule does is _judge_ it: return `true` and the transaction goes through as written, return `false` and the whole thing is rejected, so nothing happens.

:::info When does each rule actually run?
The contract has its own **address** on the blockchain, derived from its code. "Locking tokens in the contract" just means **sending them to that address**, exactly like paying any wallet. So the moment tokens go _in_, nothing special happens, **putting tokens into the contract runs nothing**:

- **Locking** (Bob makes his offer) is an ordinary transaction that just _sends_ GOLD to the contract's address, with the offer note attached. No code runs, nothing is checked yet.
- **Taking tokens back out** is the different part. To spend a token sitting at the contract's address, the transaction has to **carry the contract's code with it**, and the network runs that code to decide yes or no. This is where the **swap validator** runs, on the accept (`Swap`) or the owner's `Cancel`, rejecting the transaction if it isn't fair. Think of it like this: once something is sent to the contract's address, the contract is the owner and won't let you take it unless you follow the rules.
- **Minting** runs the **minting policy** at the moment tokens are created, rejecting the transaction if the wrong person tries to make them.

So the two transactions are very different: the first just _moves_ the GOLD to the contract's address; the second _spends_ it, running the contract's code embedded in that second transaction. The rule of thumb: a contract guards value **leaving** it, not arriving. It springs to life only when a transaction spends what it's protecting.
:::

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

## The offer note (datum) and the two actions (redeemer)

When Bob locks his GOLD, he attaches a small note to it called a **datum**. It records the terms of his offer: **who to pay** (`owner`, the seller's full wallet address, so the payment lands where their wallet can see it) and **what they want in return** (`price`).

Later, when someone spends that locked GOLD, they say which of two things they're doing, this choice is called the **redeemer**: `Swap` (a buyer is taking the offer) or `Cancel` (the owner is reclaiming it).

```aiken title="swap.ak: the offer note and actions"
// One asset the maker wants in return, with the exact quantity.
pub type PricedAsset {
  policy_id: PolicyId,
  asset_name: AssetName,
  quantity: Int,
}

// The offer, attached to the locked UTxO as an inline datum.
pub type SwapDatum {
  // The maker's full wallet address: where the payment must go, and (through its
  // payment key) who may cancel. Storing the whole address, not just a key hash,
  // means the payment lands where the maker's wallet can actually see it.
  owner: Address,
  // What the maker wants in return for the locked asset.
  price: List<PricedAsset>,
}

// What the spender wants to do with the locked UTxO.
pub type SwapAction {
  // A taker fulfills the offer by paying the price to the owner.
  Swap
  // The owner reclaims the locked asset.
  Cancel
}
```

## The rule that makes it fair

Here's the actual rule. On a **`Swap`**, the contract checks that the transaction pays the `owner` at least the `price` they asked for, if it doesn't, the transaction is rejected and no one gets anything. On a **`Cancel`**, it simply checks that the owner signed (proving it's really them).

There's one extra safety check that's worth understanding. Every locked offer has its own **unique id** on the blockchain, a permanent reference that's never reused (think of it like a receipt number for that specific offer). The rule demands that the buyer **label the payment with that id**: the payment going to the owner must carry the exact offer's reference attached to it, or the transaction is rejected.

Why bother? Imagine two separate offers that both say _"pay 5 SILVER to Bob."_ Without the label, a buyer could take **both** locked GOLD tokens in a single transaction while paying Bob just **once** (5 SILVER, not the 10 the two offers total), and that single payment would appear to satisfy both offers at once (a known trick called a _double-satisfaction_ attack). Forcing every payment to be labeled with one specific offer's id closes the hole: a payment can carry only one id, so it settles exactly one offer. Want two offers? You have to pay for each one separately.

:::note No need to master this now
Double-satisfaction is a subtle attack, you don't have to fully understand it to follow along. When you're ready to go deeper, the [Double satisfaction](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/double-satisfaction) page covers it in detail.
:::

```aiken title="swap.ak — the rule"
validator swap {
  // `spend` defines the rules for spending (taking) a UTxO locked at this contract.
  spend(
    datum: Option<SwapDatum>,
    redeemer: SwapAction,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    // Extract the offer terms, the `owner` to pay and the `price`, from the datum.
    expect Some(SwapDatum { owner, price }) = datum
    when redeemer is {
      // The owner reclaims the offer: prove it's them by signing with the
      // payment key of their address.
      Cancel -> {
        // A wallet address's payment credential is a `VerificationKey` (a public
        // key hash). Pull that key hash out.
        expect VerificationKey(owner_key) = owner.payment_credential
        // `tx.extra_signatories` is the list of key hashes that signed this
        // transaction; require the owner's to be among them.
        list.has(tx.extra_signatories, owner_key)
      }
      // A taker fulfills the offer.
      Swap -> {
        // Exactly one output must be "marked" with this UTxO's own reference as
        // its inline datum. Matching the filtered list as a singleton `[payment]`
        // fails unless there's exactly one such output, so a single payment can
        // settle exactly one swap (no double satisfaction).
        expect [payment] = list.filter(
          tx.outputs,
          fn(output) { marked_with(output, own_ref) },
        )
        // ...and that payment must go to the owner and cover the full price.
        pays_to_owner(payment, owner) && covers_price(payment.value, price)
      }
    }
  }

  else(_) {
    fail
  }
}
```

The small helper functions it uses:

```aiken title="swap.ak — helpers"
// Is this output tagged with `expected` (the spent UTxO's reference) as its
// inline datum? `expected` is typed as `Data` so the `OutputReference` passed
// at the call site is upcast and compared against the raw inline datum.
fn marked_with(output: Output, expected: Data) -> Bool {
  when output.datum is {
    InlineDatum(data) -> data == expected
    _ -> False
  }
}

// Does this output pay to the owner's exact wallet address? Comparing the whole
// address (payment key AND stake key) makes the funds land where the owner's
// wallet can see them, not at a bare payment-key address it would overlook.
fn pays_to_owner(output: Output, owner: Address) -> Bool {
  output.address == owner
}

// Does `value` contain at least each asset in `price`?
fn covers_price(value: Assets, price: List<PricedAsset>) -> Bool {
  list.all(
    price,
    fn(asset) {
      quantity_of(value, asset.policy_id, asset.asset_name) >= asset.quantity
    },
  )
}
```

## Creating the tokens (minting policy)

Alice and Bob each need a token to trade, so they each create ("mint") one. This rule says a token can only be minted by its owner. Because the rule is tied to each person's key, Alice's SILVER and Bob's GOLD are automatically two different tokens.

```aiken title="mint.ak — who can create tokens"
// A minting policy for the demo tokens (GOLD, SILVER).
//
// Parameterized by an owner key: only the owner can mint or burn under this
// policy. Because the policy is parameterized, Alice and Bob each get their own
// distinct policy id by applying their own key, so GOLD and SILVER are different assets.
validator token(owner: VerificationKeyHash) {
  mint(_redeemer: Data, _policy_id: PolicyId, self: Transaction) {
    list.has(self.extra_signatories, owner)
  }

  else(_) {
    fail
  }
}
```

## Compile it

Turn the contract into something the blockchain can run (this step needs [Aiken](https://aiken-lang.org/) installed; the example already ships the compiled `plutus.json`, so you can skip it if you're just running the demo):

```bash
cd on-chain/aiken
aiken check   # run the contract's tests
aiken build   # compile it — writes plutus.json
```

:::tip What just happened
`aiken build` produced **`plutus.json`** from your contract. Inside that file, there's a compiled contract, and everything the off-chain code needs to find the contract's address and enforce these rules; it doesn't need Aiken. You now have a working rulebook.
:::

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org) version of the same contract is coming soon, for teams who prefer Scala. The rest of the walkthrough is unchanged, the off-chain code reads the compiled `plutus.json` either way.

</TabItem>
</Tabs>

**Go deeper:** want to understand validators, datums, and minting properly? The [Smart Contracts](/docs/developers/curriculum/smart-contracts/overview) and [Minting policies](/docs/developers/curriculum/native-tokens/minting-policies) curriculum cover the full detail.

Next: the [off-chain code](/docs/developers/onboarding/tutorial/off-chain) that builds the transactions.
