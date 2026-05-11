---
title: Asset Fingerprints
description: CIP-14 asset fingerprints for human-readable asset identification
---

# Asset Fingerprints

Asset fingerprints (CIP-14) provide a shorter, human-readable identifier for native assets. Instead of the full policy ID + asset name hex string, a fingerprint looks like `asset1...`.

## How Fingerprints Work

A fingerprint is derived by hashing the policy ID and asset name together, then encoding the result as Bech32 with the `asset` prefix. This produces a consistent, checksummed identifier that's easier to display and compare.

| Format | Example |
|--------|---------|
| **Full unit** | `7edb7a2d9fbc4d2a68e4c9e9...4d79546f6b656e` |
| **Fingerprint** | `asset1rjklcrnsdzqp65wjgrg55sy9723kw09mlgvlc3` |

Fingerprints are for display purposes — the canonical identifier for on-chain operations remains the policy ID + asset name pair.

## Next Steps

- [Asset Units](./units.md) — Understanding policy IDs and asset names
- [Metadata](./metadata.md) — Attach metadata to assets
