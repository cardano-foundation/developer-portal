---
title: "Metadata & native scripts"
sidebar_label: "4. Metadata & native scripts"
description: "Attaching notes to transactions with metadata, and enforcing simple rules with native scripts."
---

# Metadata & native scripts

Two more building blocks, and neither needs a smart contract.

## Metadata: a note on the transaction

**Metadata** is like the **memo field on a bank transfer**: extra information (text, or any structured data) you attach to a transaction. It isn't money, but it travels with the transaction and is stored on-chain forever. Teams use it for order numbers, messages, proof a document existed, or an NFT's name and image.

## Native scripts: simple rules, no code

Sometimes you want a rule but not a full program. A **native script** expresses a **simple condition** as JSON, no smart-contract language required, like the **rules on a shared bank account** ("any two of us must sign", "not before this date").

Here's one that says _"both keys must sign"_:

```json
{
  "type": "all",
  "scripts": [
    { "type": "sig", "keyHash": "KEY_HASH_1" },
    { "type": "sig", "keyHash": "KEY_HASH_2" }
  ]
}
```

`sig` = this key must sign, `all` = every condition must hold (there's also `any` and `atLeast`), plus time conditions like `before`/`after`. Combine them for multisig wallets, shared treasuries, or time-locked funds. A token's **minting policy** is often just a native script deciding who may mint.

## Try it

- **Read metadata:** on the **[Cardano explorer for Preview](https://explorer.cardano.org/preview)**, open a transaction that mints an NFT (or any tx with metadata) and find its metadata, that's the note attached to the payment.
- **Read a rule:** in the JSON above, change `"all"` to `"any"`, now _either_ key can sign instead of both.

## Go deeper

- [Transactions](/docs/developers/curriculum/fundamentals/core-concepts/transactions) — metadata is part of a transaction's anatomy.
- [Minting policies](/docs/developers/curriculum/native-tokens/minting-policies) — the "Native script policies" section shows these scripts in full.

Next: **[Providers & explorers](/docs/developers/onboarding/lectures/beginner/providers-and-explorers)**.
