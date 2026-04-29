---
title: Asset Metadata
description: Attach metadata to transactions using CIP standards
---

# Asset Metadata

Transaction metadata lets you attach arbitrary data to transactions without affecting their execution. Evolution SDK supports attaching metadata through the `attachMetadata` operation, following Cardano CIP standards.

## Common Metadata Labels

| Label  | CIP    | Purpose                       |
| ------ | ------ | ----------------------------- |
| `674n` | CIP-20 | Transaction messages/comments |
| `721n` | CIP-25 | NFT metadata                  |
| `777n` | CIP-27 | Royalty information           |

## Attach a Message (CIP-20)

```typescript
import { Address, Assets, TransactionMetadatum, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const messageMetadata: TransactionMetadatum.TransactionMetadatum

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .attachMetadata({
    label: 674n,
    metadata: messageMetadata
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Multiple Metadata Entries

Chain multiple `attachMetadata` calls for different labels:

```typescript
import { Address, Assets, TransactionMetadatum, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const messageMetadata: TransactionMetadatum.TransactionMetadatum
declare const nftMetadata: TransactionMetadatum.TransactionMetadatum

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .attachMetadata({ label: 674n, metadata: messageMetadata })
  .attachMetadata({ label: 721n, metadata: nftMetadata })
  .build()
```

## Next Steps

- [Assets Overview](./overview.md) — Working with native assets
- [Encoding](../encoding/overview.md) — Data encoding formats
