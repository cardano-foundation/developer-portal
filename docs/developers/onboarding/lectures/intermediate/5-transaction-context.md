---
title: "The transaction context"
sidebar_label: "Transaction context"
description: "The third thing a validator is given: the whole transaction it is being asked to approve, and every part of it the contract may look at."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import extractRegion from "@site/src/utils/extractRegion";
import VaultSimple from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/on-chain/aiken/validators/vault_simple.ak";

# The transaction context

[The last lecture](/docs/developers/onboarding/lectures/intermediate/datum-and-redeemer) covered two of the three things a validator is given: the **datum** and the **redeemer**. This one covers the third, and it is much bigger than the other two together.

The **context** is the **transaction itself**. When someone tries to spend your locked funds, the network hands your contract the entire transaction that is trying to do it, and lets the contract look at any part of it before answering.

The context is **everything else the contract can see about the transaction it is judging**: which UTxOs are being spent and all their properties, which tokens are being minted and burned, who signed the transaction, the time window the transaction declared, etc.

A validator that only compares the datum with the redeemer protects nothing. Both are data, and data cannot show who signed, what moved, or when it happened. Only the transaction shows that, which is why nearly every check you write is a question about the transaction, measured against what the datum says. Your vault is about to ask exactly one: is the owner named in the datum among the keys that signed?

## What is inside

The context holds one transaction, described in full. Here is everything in it:

| Group | Fields | What it tells you |
|---|---|---|
| **What comes in** | `inputs`, `reference_inputs` | the UTxOs being spent, and the ones only being read |
| **What goes out** | `outputs`, `mint`, `fee` | the new UTxOs created, tokens made or destroyed, the fee paid |
| **Who and when** | `extra_signatories`, `validity_range` | the keys the transaction requires a signature from, and the time window it declared |
| **The rest** | `certificates`, `withdrawals`, `redeemers`, `datums`, `id`, and the governance and treasury fields | staking, voting, the transaction's own id, and the datums and redeemers it carries |

:::note These names come from the ledger, not from a language
The names above are spelled the way this track's examples spell them, and another language will write some of them a little differently. What the list holds is decided by **Cardano**, not by the tool you write your contract in.

The list also grows. Each version of the on-chain language has added fields: `reference_inputs` arrived with v2, and the governance and treasury fields with v3. A contract sees the shape of the version it was compiled against (the `v3` recorded in its blueprint, from **[what a validator is](/docs/developers/onboarding/lectures/intermediate/what-is-a-validator)**), and it keeps that view for as long as it exists. A later upgrade cannot change what an already deployed contract is shown.
:::

## One transaction context for all validators

A single transaction can trigger more than one script/validator: two contracts being spent at once, or a mint and a spend under the same hash. **They all receive the same transaction context.** Only the purpose-specific part differs, so each one knows which UTxO it is guarding, or which policy is minting.

That is what makes contracts work together on Cardano. They never call each other because they don't have to: one script can require something of a transaction that can only happen if another script accepts the transaction, and vice versa.

## One field is the whole vault

These are the spend validator's rules, which decide whether the transaction is accepted:

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

<CodeBlock language="aiken" title="vault.ak">
  {extractRegion(VaultSimple, "validator", "traces")}
</CodeBlock>

`self` **is** the context. It is the transaction, handed straight to the handler, and `self.extra_signatories` is the field that contains the keys that this transaction requires a signature. The transaction lists those keys itself, and you can trust the list, because the node verifies the matching signatures in phase 1, before any validator runs. The validator check is one question about that list: _is the owner named in the datum among the signers?_ `list.has` asks whether something is in a list.

:::note Coming from Ethereum?
There is no `msg.sender` here, and nothing plays that role. A transaction has no single caller, because it can carry many signatures at once. So you never ask "who called me", you ask whether the key you care about is among the signers. **[Cardano for Ethereum developers](/docs/developers/cardano-for-ethereum-developers)** covers the rest of that shift.
:::

`_own_ref` says which UTxO is being spent, and `self` is the transaction itself.

A `mint` handler is handed a different set, because nothing is being unlocked: no datum, no `_own_ref`, and the policy id instead. What you are given depends on the **purpose**, which has its own lecture in **[validator purposes](/docs/developers/onboarding/lectures/intermediate/validator-purposes)**.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

The signature alone tells you what this contract ignores. `_redeemer` and `_own_ref` are handed over and never used: the vault reads its datum, reads the transaction, and looks at nothing else.

A rule built from the datum and the redeemer alone can only ask the spender to repeat what the datum already says: your vault could demand a redeemer equal to its `owner`, and every passer-by who read the UTxO could supply it. Signatures, tokens and time live in the context, which is where a contract's protection has to come from.

## What is not in it

The context is generous, but it stops at the edge of one transaction. A contract **cannot** see:

- **the time**, only the window the transaction declared. [Time on Cardano](/docs/developers/onboarding/lectures/beginner/time-on-cardano) explained why.
- **other addresses**, or what anyone's balance is.
- **the past**: no earlier transaction, and no history of this contract.
- **the rest of the block**: other transactions being confirmed at the same moment are invisible.
- **the metadata**. You attached metadata to a transaction back in [Native scripts & metadata](/docs/developers/onboarding/lectures/beginner/native-scripts-and-metadata). It is stored on the chain and anyone can read it, but scripts are not shown it. So a contract can never enforce a rule about metadata.

:::tip The transaction is the whole world
A validator runs **inside** a single transaction, and that transaction is everything it can see: its inputs and their datums and values, the UTxOs it references, its outputs, its signatures, its window, etc.

A contract judges the facts already in front of it, and **whoever builds the transaction has to put them there**. That is what the datum, the redeemer and the reference inputs are for. The question is never "how does the contract fetch this", it is "who puts it in, and why should the contract believe them". **Modifying state** builds an oracle, which is that question answered.
:::

## Try it

**Write the rule.** Your vault knows who the owner is, and still says yes to everybody.

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

Everything below runs from `on-chain/vault/`, where lecture 2 left you.

What we check: **allow the spend only if the owner named in the datum is among the keys the transaction requires a signature from.** `owner` came out of the datum last lecture, and `list.has` answers whether something is in a list.

In `validators/vault.ak`, make three changes:

1. Add `use aiken/collection/list` to the imports at the top of the file.
2. In the `spend` handler's arguments, drop the underscore from `_self` so the transaction has a name you can use.
3. Replace the bare `True` at the end of the handler with the rule below: it says yes only if the owner signed.

<CodeBlock language="aiken" title="validators/vault.ak">
  {extractRegion(VaultSimple, "rule")}
</CodeBlock>

```bash
aiken check
```

Green, and you have written a working validator.

**Check you wrote the same contract.** Build it and compare the hash, as you did last lecture:

```bash
aiken build
```

```
ec431d8627829d7e21119161d909e8a9a15d648a67bff82ccafc3570
```

If the `hash` in `plutus.json` matches, your vault is ours byte for byte. Notice it is not the hash you compared in **[datum & redeemer](/docs/developers/onboarding/lectures/intermediate/datum-and-redeemer)**. One line of rule changed the script, so it changed its identity and its address, exactly as **[what a validator is](/docs/developers/onboarding/lectures/intermediate/what-is-a-validator)** said it would.

At least, that is what it is supposed to do. **[Testing](/docs/developers/onboarding/lectures/intermediate/testing)** is next, and it is where you find out.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

Stuck? The finished code is in the playground. See the **[introduction](/docs/developers/onboarding/lectures/intermediate/introduction#the-playground)**.

## Go deeper

- [Datum, Redeemer, and ScriptContext](/docs/developers/curriculum/smart-contracts/datum-redeemer-context): the full field list, with the checks contracts most often write.
- [The Extended UTXO Model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo): why a transaction is a complete, self-contained thing to check.
- [Smart contract security](/docs/developers/curriculum/smart-contracts/security): most real bugs are a context check that was missing.

Next: **[Testing](/docs/developers/onboarding/lectures/intermediate/testing)**.
