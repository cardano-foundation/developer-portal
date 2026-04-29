---
title: Query UTxOs
description: Query unspent transaction outputs by address, credential, or asset
---

# Query UTxOs

UTxOs (Unspent Transaction Outputs) represent available funds on the blockchain. Evolution SDK provides several methods to query UTxOs based on different criteria.

## By Address

```typescript
import { Address, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const address = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
const utxos = await client.getUtxos(address)

for (const utxo of utxos) {
  console.log("UTxO:", utxo.transactionId, "#", utxo.index)
  console.log("  Lovelace:", utxo.assets.lovelace)
}
```

## Wallet UTxOs

Query all UTxOs belonging to your connected wallet:

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const utxos = await client.getWalletUtxos()
const totalLovelace = utxos.reduce((sum, u) => sum + u.assets.lovelace, 0n)
console.log("Total balance:", totalLovelace, "lovelace")
```

## By Asset

Find UTxOs containing a specific native token:

```typescript
import { Address, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const address = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
const unit = "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1b0c9d8e7f6"

const utxos = await client.getUtxosWithUnit(address, unit)
const nftUtxo = await client.getUtxoByUnit(unit)
```

## By Output Reference

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const refs: any[]

const utxos = await client.getUtxosByOutRef(refs)
```

## Next Steps

- [Datums](./datums.md) — Query datum values
- [Delegation](./delegation.md) — Check delegation status
- [Transaction Status](./transaction-status.md) — Wait for confirmations
