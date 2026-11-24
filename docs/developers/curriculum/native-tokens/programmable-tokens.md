---
id: programmable-tokens
title: Programmable Tokens
sidebar_label: Programmable tokens
description: Native tokens that run validation logic on every transfer, mint, and burn, enabling compliance rules like freeze, seize, and KYC-gating without a hard fork.
---

A plain [native token](/docs/developers/curriculum/native-tokens/overview) has no built-in transfer logic. Once minted, it moves through ordinary transactions with no script execution, which is exactly what makes it cheap and safe, but it also means you cannot enforce rules on who holds it or how it moves. **Programmable tokens** ([CIP-113](https://cips.cardano.org/cip/CIP-0113)) add that missing layer: validation logic that runs on every transfer, mint, and burn.

## The idea

A [minting policy](/docs/developers/curriculum/native-tokens/minting-policies) gives you control at mint and burn, but nothing in between. Programmable tokens extend that control to circulation: every movement passes through a validator, so an issuer can encode rules the ledger then enforces on their behalf.

The model works without changing the protocol:

- **Shared script custody.** All programmable tokens of a given standard are locked at a shared smart-contract address rather than sitting free in user wallets. Every transfer is a spend from that script, so the validation logic always runs.
- **Ownership by stake credential.** Even though the tokens live at a script address, ownership is tracked by stake credential, so standard wallets still control them and the normal send and receive experience is preserved.
- **An on-chain registry.** A registry records which tokens are programmable and which rules apply, so wallets, indexers, and dApps can discover and respect the logic.
- **Modules.** Specific behaviors, such as freeze and seize for a regulated asset, are defined as modules, which the CIP calls substandards, on top of the shared base framework, so issuers pick the policy they need instead of re-implementing the plumbing.

## Why it matters

Transfer-time validation is what regulated assets need and what plain native tokens cannot offer on their own:

- **Stablecoins and tokenized securities** that must support freeze, seize, or allowlist controls.
- **Real-world assets (RWAs)** that carry compliance obligations like sanctions screening or KYC/AML gating.
- **Any asset** whose issuer must be able to enforce rules after issuance, not just at mint.

Because it builds on Cardano's existing native-asset and scripting machinery, none of this requires a hard fork.

## The trade-off

Programmability has a cost, and it is the exact thing plain native tokens avoid. Once transfers run through a validator, you are back to script execution on every movement, with the fees and validation surface that come with it. That is the point of the design, not a flaw, but it means programmable tokens are for assets that genuinely need enforced rules, not a default for every token. For a token that only needs control at mint and burn, a plain [minting policy](/docs/developers/curriculum/native-tokens/minting-policies) is still the right tool.

## How custody and ownership work

Every programmable token sits at one shared script address, `programmableLogicBase`. Moving it is a spend from that script, so the checks always run.

Ownership comes from the other half of the address. A holder's smart wallet address uses `programmableLogicBase` as the payment credential and a credential of the holder in the stake part. Whether that is the holder's payment key or stake key is the token's convention. Given the convention, anyone can compute the address from a wallet address, so tokens can be sent to someone who has never used the standard, and the holder still signs with their own key.

The custody check that runs for each input does very little. The shared checks run once per transaction through a zero-amount withdrawal from a stake script (withdraw-zero), not once per input.

## Three layers

Two layers are shared infrastructure, deployed once for every programmable token. The third is what an issuer writes.

| Layer | Deployed | What it holds |
|---|---|---|
| Registry | Once, shared | A sorted on-chain list of registered policies. Each entry is a UTxO marked by an NFT, with the token's configuration in its datum. |
| Standard | Once, shared | The custody address every token lives at, the dispatcher behind it, one delegate per action, and the protocol parameters that wire them together. |
| Module | Per token | The issuer's rules: who can move the token, who can act on it without the holder, and who can mint and burn it. |

A new token deploys none of the shared scripts. The wiring is read from the protocol parameters when a transaction is validated.

## Actions

Tokens enter through a mint. After that, every spend from the shared address declares one of three actions, each with its own delegate.

| Operation | Started by | Authorized by | What is checked |
|---|---|---|---|
| Mint (issuance) | The issuer | The token's minting logic | Minted tokens land at `programmableLogicBase` addresses. The minting logic runs in the same transaction. The issuance policy is permanent, so the policy ID never changes. |
| Transfer | The holder | The holder's stake credential: a signature, or the holder's script runs | One registry proof per policy spent or minted. Every registered policy's transfer logic runs. Programmable value stays at `programmableLogicBase` addresses. |
| Third party | Whoever the module allows, for example an issuer admin | The token's third-party logic, with no holder signature | Each input pairs with an output at the same address. Only the acted-on policy may change. Its total in custody never drops, except by a burn in the same transaction. This covers seizure, partial seizure and wipe. |
| Unfracking | The holder | The holder, and the token's unfracking logic. It is off unless the issuer opts in | One policy is moved out of a shared UTxO into its own, so a frozen token no longer blocks the others. Ownership does not change. The reference platform's deployment parameters disable it. |

Before you integrate a token, read its third-party script. It decides what can happen to a holder's balance without their signature, and who can trigger it.

## Upgrades

- **The protocol.** The dispatcher and the protocol-level issuance logic are read from the protocol parameters at validation time, so re-pointing them upgrades every token at once. The right to upgrade is a credential recorded there, and handing it over takes two transactions: a nomination, then the nominee accepting.
- **Each token.** In the reference implementation, a token's issuer can re-point its transfer, third-party and unfracking logic and its global state in place. The issuer's authority is the token's minting logic credential.
- **What never moves.** The `programmableLogicBase` credential, so every holder's address stays where it is, and each token's minting policy, so its policy ID survives every upgrade.

For a trust assessment, the upgrade authority recorded in the protocol parameters is the subject to look at. Integrators should read current wiring from the protocol parameters UTxO and the token's registry node, never from a cached script hash.

## The registry node

A token is one registry node. Write the module, then register its scripts.

```aiken
// One registry entry per token
type RegistryNode {
  key: ByteArray,  // policy ID
  next: ByteArray, // next key
  minting_logic_script: Credential,
  transfer_logic_script: Credential,
  third_party_logic_script: Credential,
  unfracking_logic_script: Credential,
  global_state_cs: ByteArray,
}
```

Registration binds the node to the token. The registry rebuilds the issuance policy from the node's minting logic credential and requires it to hash to `key`, and that minting logic must run in the same transaction.

## Integrating as a wallet or dApp

From the ledger's side, programmable tokens are ordinary native assets at a script address. What changes is how you find them and how you build the transactions that move them.

Wallets:

- Show balances by querying the holder's smart wallet address.
- Identify programmable tokens by looking up their policy in the registry.
- Build history from balance changes at the smart wallet address.
- Optionally, build transfer transactions for native sends.

dApps and DEXes, for each transaction:

1. Reference the protocol parameters UTxO and point each spend's redeemer at it.
2. Reference a registry node per policy, or its covering node.
3. Withdraw 0 from `programmableLogicGlobal` and point each spend's redeemer at it.
4. Withdraw 0 from the action's delegate, with its own redeemer.
5. Withdraw 0 from each token's transfer logic.
6. Send tokens only to derived smart wallet addresses.

If a dApp script owns the tokens, add a zero withdrawal from that script as the owner's consent. Steps 1 and 3 are the easy ones to miss, because neither shows up in a token's own configuration. The [integration guides](https://github.com/cardano-foundation/cip113-programmable-tokens/blob/main/documentation/08-INTEGRATION-GUIDES.md) and the [DeFi section of the CIP](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0113#implementing-programmable-tokens-in-defi-protocols) have the detail.

:::info Status
CIP-113 is merged into the [CIPs repository](https://cips.cardano.org/cip/CIP-0113). The Cardano Foundation's reference implementation has been professionally audited, and its [audit reports](https://github.com/cardano-foundation/cip113-programmable-tokens/tree/main/documentation/audit) are public; read the architecture and integration guides and follow the contracts at the [cip113-programmable-tokens repository](https://github.com/cardano-foundation/cip113-programmable-tokens). For an audited module that CMTA has recognized for tokenized shares, see the [CMTA reference](https://github.com/cardano-foundation/cpt-rwa-ch-cmta-reference). Example modules such as freeze and seize live in the [cip113-programmable-tokens-platform repository](https://github.com/cardano-foundation/cip113-programmable-tokens-platform). For an interactive walkthrough of a transfer and the four actions, see [Programmable Tokens](/programmable-tokens/).
:::

## Next steps

- [Staking & Governance](/docs/developers/curriculum/staking-governance/overview): the next module, how delegation, rewards, and on-chain governance work, and how to build against them
- [Minting policies](/docs/developers/curriculum/native-tokens/minting-policies): the control layer plain native tokens do have, at mint and burn
