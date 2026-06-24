---
id: contracts-library
title: Contract Library
sidebar_label: Contract library
description: Open-source Cardano smart contracts organized by use case, with reference implementations across on-chain and off-chain languages.
image: /img/og/og-developer-portal.png
---

Open-source Cardano smart contracts you can read, fork, or build on, organized by what you are building. Pick a use case, then a source that fits your stack.

Starting a frontend instead? The [templates gallery](https://developers.cardano.org/templates) has runnable dApp starters.

## Reference implementations across languages

[cardano-template-and-ecosystem-monitoring](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring) implements common use cases (escrow, vesting, auction, payment splitter, HTLC, vault, crowdfund, lottery, and more) with both the on-chain validator (Aiken, sometimes Scalus) and off-chain code in several languages (MeshJS, Evolution, PyCardano, CCL). It is the best place to compare how the same contract looks across stacks.

## By use case

| Use case | What it does | Sources |
| --- | --- | --- |
| Hello World | Lock and unlock assets, a hands-on intro to validation and transaction building | [MeshJS](https://meshjs.dev/smart-contracts/hello-world) |
| Escrow | Holds assets until two parties meet the agreed conditions | [Multi-language](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main/escrow), [MeshJS](https://meshjs.dev/smart-contracts/escrow) |
| Vesting | Locks tokens for a period, then releases them | [Multi-language](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main/vesting), [MeshJS](https://meshjs.dev/smart-contracts/vesting) |
| Payment Splitter | Splits incoming payments among a group of accounts | [Multi-language](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main/payment-splitter), [MeshJS](https://meshjs.dev/smart-contracts/payment-splitter) |
| Swap | Exchanges assets between two parties | [MeshJS](https://meshjs.dev/smart-contracts/swap) |
| Marketplace | Buy and sell native assets such as NFTs | [MeshJS](https://meshjs.dev/smart-contracts/marketplace) |
| Giftcard | Locks assets into a card that anyone can redeem | [MeshJS](https://meshjs.dev/smart-contracts/giftcard) |
| NFT Minting Machine | Mints NFTs with an automatically incremented index | [MeshJS](https://meshjs.dev/smart-contracts/plutus-nft) |
| Content Ownership | A registry where users create and own content | [MeshJS](https://meshjs.dev/smart-contracts/content-ownership) |
| Auction | Runs an on-chain auction | [Multi-language](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main/auction) |
| Crowdfund | Pools contributions toward a funding goal | [Multi-language](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main/crowdfund) |
| HTLC | Hashed timelock contract for conditional, time-bound transfers | [Multi-language](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main/htlc) |
| Vault | Holds and controls assets under a spending policy | [Multi-language](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main/vault) |
| Lottery | An on-chain lottery and random draw | [Multi-language](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main/lottery) |
| Upgradable Multi-Signature | Collective fund management requiring multiple approvals | [On-chain](https://github.com/Anastasia-Labs/aiken-upgradable-multisig), [Off-chain](https://github.com/Anastasia-Labs/aiken-multisig-offchain) |
| Payment Subscription | Automated recurring payments between subscribers and merchants | [On-chain](https://github.com/Anastasia-Labs/payment-subscription), [Off-chain](https://github.com/Anastasia-Labs/payment-subscription-offchain) |
