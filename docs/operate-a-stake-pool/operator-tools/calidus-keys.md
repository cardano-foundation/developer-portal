---
id: calidus-keys
title: Calidus Pool Keys
sidebar_label: Calidus Keys (SPO identity)
description: Hot key pairs that allow SPOs to authenticate with governance tools, explorers, and dApps without exposing their cold key.
keywords: [Calidus, SPO, pool key, identity, governance, CIP-88, CIP-151, hot key]
---

Calidus keys (from Latin *calidus*, "hot") are Ed25519 key pairs that stake pool operators register on-chain to act on behalf of their pool. Once registered with a one-time cold-key signature, the Calidus key can be used for authentication, governance tool interaction, and dApp signing — **without ever touching the cold key again**.

They are defined in [CIP-88 v2](https://cips.cardano.org/cip/CIP-0088) and [CIP-151](https://cips.cardano.org/cip/CIP-0151).

## Why they matter

Before Calidus keys, SPOs had two bad options when a governance platform or service needed to verify their identity:

1. Sign something with the cold key — dangerous, defeats the purpose of keeping it offline
2. Hope the service had some other way to verify them — unreliable

Calidus keys solve this cleanly. Register once with a cold-key signature, then use the Calidus key freely as a hot key. It is already supported by Koios, Blockfrost, CN-Tools, Cardanoscan, AdaStat, and Cexplorer.

For governance specifically: when a voting platform or governance tool needs to confirm you are who you say you are as an SPO, it will look for a registered Calidus key rather than asking you to sign with your cold key.

## Generating the key pair

Calidus key operations use [cardano-signer](https://github.com/gitmachtl/cardano-signer) (v1.34.0+):

```shell
cardano-signer keygen \
  --out-skey calidus.skey \
  --out-vkey calidus.vkey
```

## Registering on-chain

Registration requires a one-time signature from your cold key — do this on your air-gapped machine:

```shell
cardano-signer sign \
  --cip88 \
  --calidus-public-key calidus.vkey \
  --secret-key cold.skey \
  --out-file calidus-registration.json
```

Then submit the registration metadata in a transaction from your online machine. The registration can be updated (higher nonce supersedes the previous) or revoked (submit an all-zeroes key).

## After registration

The Calidus key acts as a hot key for:

- **Governance tool authentication** — prove your SPO identity on governance platforms and voting interfaces
- **Explorer profiles** — update pool metadata and interact with Cardanoscan, Cexplorer, AdaStat
- **API authentication** — authenticate with Koios, Blockfrost, and other SPO-aware APIs
- **dApp signing** — compatible with CIP-30 light wallets and CIP-8 message signing, so hardware wallets and browser wallets can be used

Keep `calidus.skey` secure — it represents your pool's online identity. Unlike your cold key, it can be kept on a relatively secured hot machine, but it should still be treated as sensitive. If compromised, rotate it by submitting a new registration with a higher nonce.

## Further reading

- [CIP-88: SPO On-Chain Registration](https://cips.cardano.org/cip/CIP-0088)
- [CIP-151: On-Chain Registration — Stake Pools](https://cips.cardano.org/cip/CIP-0151)
- [cardano-signer on GitHub](https://github.com/gitmachtl/cardano-signer)
- [Calidus Pool Keys announcement (Blockfrost blog)](https://blog.blockfrost.io/calidus-pool-keys/)
- [SPO Governance — voting with your cold key](../../governance/spo-governance)
