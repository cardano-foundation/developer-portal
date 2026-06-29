---
id: minting-policies
title: Minting Policies
sidebar_label: Minting policies
description: How minting policies control who can create and burn native tokens, from simple signature scripts to programmable smart contract policies.
image: /img/og/og-developer-portal.png
---

A minting policy is the rule set that controls who can mint or burn a token, when, and how many. The policy is a script; its hash becomes the token's [Policy ID](/docs/developers/curriculum/native-tokens/overview#how-tokens-are-identified), so the rules are permanently bound to the token's identity.

## How a policy runs

Whenever a transaction's `mint` field includes tokens under a policy, that policy script runs and must return true. Unlike a spending validator, a minting policy receives two arguments and no datum:

```
minting_policy(redeemer, scriptContext) -> Bool
```

Positive quantities mint, negative quantities burn. The policy can allow one and forbid the other, or apply different rules to each.

## Native script policies (no smart contract needed)

The simplest policies use Cardano's native script language, just signatures and time:

- **Signature-based**: only the holder of key X can mint.

  ```json
  { "type": "sig", "keyHash": "<issuer key hash>" }
  ```

- **Time-locked**: minting only allowed before (or after) a slot.

  ```json
  { "type": "all", "scripts": [
    { "type": "before", "slot": 1000000 },
    { "type": "sig", "keyHash": "<issuer key hash>" }
  ] }
  ```

Time-locks matter because once the window closes, **no one** can ever mint more under that policy, a provably fixed supply. This is the standard way to lock an NFT or a capped collection.

## Smart contract policies

When you need logic beyond signatures and time, the policy is a smart contract (a validator written in Plutus or Aiken):

- **One-shot**: requires a specific UTXO as input. Since a UTXO can be spent only once, the policy can succeed only once in history, the canonical way to guarantee true NFT uniqueness.
- **Parameterized**: compile-time parameters bake into the script, producing a distinct policy ID per configuration.
- **Multi-action**: the redeemer selects an action (mint / burn / init) and the script validates each differently.

Writing smart contract minting policies, including the [one-shot pattern](/docs/developers/curriculum/smart-contracts/write-a-validator#one-shot-policies) for provable uniqueness, is covered in [Write a validator](/docs/developers/curriculum/smart-contracts/write-a-validator).

## Native script or smart contract?

| Use a native script when | Use a smart contract when |
|---|---|
| Fixed issuer and/or fixed supply by deadline | Uniqueness must be guaranteed by protocol (one-shot) |
| Simple multisig issuance | Minting depends on on-chain state (oracles, other UTXOs) |
| You want zero script-execution cost | You need multiple actions or parameterized families |

## Key takeaways

- The policy script's hash is the policy ID; rules are bound to the token forever.
- Native scripts cover signatures and time-locks, including provably fixed supply.
- Smart contract policies add one-shot uniqueness, parameterization, and multi-action logic.

## Next steps

- [Mint a fungible token](/docs/developers/curriculum/native-tokens/mint-fungible): a native signature policy in practice
- [Mint an NFT](/docs/developers/curriculum/native-tokens/mint-nft): a time-locked policy plus CIP-25 metadata
