---
id: programmable-tokens
title: Programmable Tokens
sidebar_label: Programmable tokens
description: Native tokens that run validation logic on every transfer, mint, and burn, enabling compliance rules like freeze, seize, and KYC-gating without a hard fork.
image: /img/og/og-developer-portal.png
---

A plain [native token](/docs/developers/curriculum/native-tokens/overview) has no built-in transfer logic. Once minted, it moves through ordinary transactions with no script execution, which is exactly what makes it cheap and safe, but it also means you cannot enforce rules on who holds it or how it moves. **Programmable tokens** ([CIP-113](https://github.com/cardano-foundation/CIPs/pull/444)) add that missing layer: validation logic that runs on every transfer, mint, and burn.

## The idea

A [minting policy](/docs/developers/curriculum/native-tokens/minting-policies) gives you control at mint and burn, but nothing in between. Programmable tokens extend that control to circulation: every movement passes through a validator, so an issuer can encode rules the ledger then enforces on their behalf.

The model works without changing the protocol:

- **Shared script custody.** All programmable tokens of a given standard are locked at a shared smart-contract address rather than sitting free in user wallets. Every transfer is a spend from that script, so the validation logic always runs.
- **Ownership by stake credential.** Even though the tokens live at a script address, ownership is tracked by stake credential, so standard wallets still control them and the normal send and receive experience is preserved.
- **An on-chain registry.** A registry records which tokens are programmable and which rules apply, so wallets, indexers, and dApps can discover and respect the logic.
- **Substandards.** Specific behaviors, such as freeze and seize for a regulated asset, are defined as substandards on top of the shared base framework, so issuers pick the policy they need instead of re-implementing the plumbing.

## Why it matters

Transfer-time validation is what regulated assets need and what plain native tokens cannot offer on their own:

- **Stablecoins and tokenized securities** that must support freeze, seize, or allowlist controls.
- **Real-world assets (RWAs)** that carry compliance obligations like sanctions screening or KYC/AML gating.
- **Any asset** whose issuer must be able to enforce rules after issuance, not just at mint.

Because it builds on Cardano's existing native-asset and scripting machinery, none of this requires a hard fork.

## The trade-off

Programmability has a cost, and it is the exact thing plain native tokens avoid. Once transfers run through a validator, you are back to script execution on every movement, with the fees and validation surface that come with it. That is the point of the design, not a flaw, but it means programmable tokens are for assets that genuinely need enforced rules, not a default for every token. For a token that only needs control at mint and burn, a plain [minting policy](/docs/developers/curriculum/native-tokens/minting-policies) is still the right tool.

:::info In active development
CIP-113 is still a draft ([PR #444](https://github.com/cardano-foundation/CIPs/pull/444)) and the specification may change. The Cardano Foundation's reference implementation has **not been professionally audited** and has only been briefly tested on the Preview testnet, so it is **not production-ready**. Track progress, read the architecture and integration guides, and follow the contracts at the [cip113-programmable-tokens repository](https://github.com/cardano-foundation/cip113-programmable-tokens). This page will be expanded as the standard matures.
:::
