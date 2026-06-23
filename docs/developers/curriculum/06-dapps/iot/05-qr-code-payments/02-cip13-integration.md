---
id: 02-cip13-integration
title: CIP-13 Integration
sidebar_label: 02 - CIP-13 Integration
description: What CIPs are, the web+cardano URI scheme, and how amounts and addresses encode into a Cardano payment URI.
---

A short detour into Cardano Improvement Proposals - specifically CIP-13, the URI scheme for payments and other wallet actions.

## What are CIPs?

Cardano Improvement Proposals (CIPs) are formalised design documents that propose new features, standards, and processes for the Cardano ecosystem. Like Bitcoin's BIPs or Ethereum's EIPs, they ensure interoperability, document design decisions, and enable decentralised governance.

The process is open and community-driven. Anyone can propose a CIP; it then goes through discussion, review, and approval stages before implementation. The full repository and process is at the [official CIP repository](https://cips.cardano.org/).

:::info
Not every wallet supports every CIP. Wallet teams pick which CIPs to implement based on their priorities. Always check wallet docs to verify support before depending on a specific CIP.
:::

## CIP-13: Cardano URI scheme

[CIP-13](https://cips.cardano.org/cip/CIP-0013) defines a standard URI scheme for Cardano, with specific protocols for ADA transfers and other on-chain interactions. It's inspired by Bitcoin's BIP-21 - applications create URIs (links or QR codes) that initiate wallet actions when clicked or scanned.

For payments, this means clickable / scannable links that open a compatible wallet pre-filled with the recipient address and amount - much better UX for donations, payments, and dApp interactions.

The URI scheme uses the `web+cardano:` prefix (the prefix depends on context and browser requirements). For payment URIs, the address comes directly after the colon - that's the default protocol when no authority is specified.

CIP-13 also supports other authorities beyond payments. The standard defines a **stake pool authority** (`//stake`) for delegation URIs (single pools or weighted lists). New authorities can be added in separate CIPs without modifying the core spec.

**Upcoming enhancements.** Additional authorities are in development:

- A **browse authority** that opens websites directly in the wallet's in-app browser (helpful for mobile dApp connections).
- An **enhanced payment authority** with native asset and metadata support.

These are tracked in the [CIP-0013 spec](https://cips.cardano.org/cip/CIP-0013).

## Cardano payment URIs

A payment URI lets you create a link that pre-populates a wallet with a recipient and optional amount.

Format:

```
web+cardano:{address}?amount={amount}
```

Where:

- **`web+cardano:`** - the protocol prefix.
- **`{address}`** - a valid Cardano address (Bech32).
- **`amount`** - optional, decimal ADA (period as decimal separator, no commas).

Example:

```
web+cardano:addr1qy...xyz?amount=10.5
```

When a user clicks or scans, a compatible wallet opens with the recipient and amount pre-filled. The user still has to confirm and sign - security is preserved, no accidental payments.

:::note
Amount is in **ADA**, not lovelace. The wallet handles the lovelace conversion (1 ADA = 1,000,000 lovelace) and adds the transaction fee.
:::

## CIP-13 support

This workshop uses Yoroi Mobile, which supports CIP-13 payment URIs. Install Yoroi Mobile on your phone with the same mnemonic from the previous workshop.

:::info Testing payment URIs
Wallet support varies. Test with the wallets your users actually use. Check the wallet's docs for the latest CIP support status.
:::

## Next steps
Now that you can construct payment URIs, the next lesson renders one as a QR code on the TFT - scannable by a mobile wallet to send tADA.

## Further Resources

- [CIP Repository](https://cips.cardano.org/) - all CIPs and the process.
- [CIP-13 Specification](https://cips.cardano.org/cip/CIP-0013) - the full spec including grammar and security notes.
- [CIP-13 microsite](https://cip13.cardanothings.io/) - examples, `web+cardano:` usage, wallet integration tracker from CardanoThings.
- [CIP-1: CIP Process](https://cips.cardano.org/cips/cip1/) - how CIPs are proposed and structured.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/05-qr-code-payments/cip13-integration) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-05](https://github.com/CardanoThings/Workshops/tree/main/Workshop-05).*
