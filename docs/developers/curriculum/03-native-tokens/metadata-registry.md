---
id: metadata-registry
title: Token Metadata & Registry
sidebar_label: Token metadata & registry
description: Cardano token metadata standards, CIP-25 and CIP-68 for NFTs, CIP-26 off-chain registry, and CIP-27 royalties.
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Metadata is what makes a token usable: a name, image, ticker, decimals, or royalty terms that wallets, explorers, and marketplaces read to display it. Cardano organizes this through community standards (CIPs), and which one you use depends on whether the data is static or needs to be updatable and on-chain.

## Metadata labels at a glance

| Label | CIP | Purpose |
|---|---|---|
| `674` | CIP-20 | Transaction messages / comments |
| `721` | CIP-25 | NFT metadata (name, image, attributes) |
| `777` | CIP-27 | Royalty information |

CIP-20 transaction messages are covered under [Transactions](/docs/developers/curriculum/fundamentals/core-concepts/transactions); this page focuses on token metadata.

## CIP-25: NFT metadata in the minting transaction

CIP-25 stores metadata in the minting transaction under label `721`. It is the simplest standard and the most widely used for NFTs. The metadata is recorded permanently in the transaction, but it is **not** readable by smart contracts.

```json
{ "721": { "<policy_id>": { "<asset_name>": {
  "name": "My NFT",
  "image": "ipfs://Qm...",
  "mediaType": "image/png",
  "description": "A unique digital artwork",
  "attributes": { "rarity": "legendary" }
} } } }
```

Required fields are `name` and `image`; `mediaType`, `description`, and `files` are optional.

## CIP-68: datum metadata (updatable, on-chain)

CIP-68 stores metadata in an inline datum on a **reference NFT**, which means it can be updated (by consuming and recreating the reference UTXO) and read on-chain by smart contracts via reference inputs. It splits into two tokens: a reference token (at a script address, holding the metadata) and a user token (in the holder's wallet).

## CIP-25 or CIP-68?

| Choose CIP-25 when | Choose CIP-68 when |
|---|---|
| Metadata is static | Metadata must be updatable |
| Simplicity matters | A contract must read the metadata on-chain |
| Standard collectibles or art | Dynamic NFTs, evolving game assets |

## CIP-26: the off-chain registry (fungible tokens)

CIP-26 is an off-chain registry where projects register human-readable info for a token, name, ticker, **decimals**, and logo, that wallets and explorers use to display it correctly. Because on-chain quantities are always integers, decimals are purely a display convention registered here (for example, an on-chain `1000000` shown as `1.000000`).

See the [Token Registry](/docs/developers/curriculum/native-tokens/token-registry/overview) for how to prepare and submit an entry, and how CIP-26 compares to on-chain CIP-68.

## CIP-27: royalties

CIP-27 (label `777`) records a royalty rate and recipient address for an NFT policy, so marketplaces can honor creator royalties.

## Attaching metadata in code

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
const tx = await client
  .newTx()
  .payToAddress({ address, assets })
  .attachMetadata({ label: 721n, metadata: nftMetadata })   // bigint label
  .build()
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```javascript
txBuilder.metadataValue(721, metadata)   // CIP-25
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

```bash
cardano-cli conway transaction build ... --metadata-json-file metadata.json
```

</TabItem>
</Tabs>

The Evolution metadata label is a `bigint` (`721n`), not `721`.

## Next steps

- [Mint an NFT](/docs/developers/curriculum/native-tokens/mint-nft): attach CIP-25 metadata while minting
- [What are native tokens](/docs/developers/curriculum/native-tokens/overview): fungibility, policy IDs, min-ADA
