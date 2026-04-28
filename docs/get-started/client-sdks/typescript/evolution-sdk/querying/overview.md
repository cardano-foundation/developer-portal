---
title: Querying
description: Query blockchain data through providers
---

import DocCardList from '@theme/DocCardList';

# Querying

Evolution SDK provides a unified query interface across all providers (Blockfrost, Maestro, Koios, Kupo/Ogmios). Query UTxOs, delegation status, protocol parameters, datums, and transaction confirmations through your client.

<DocCardList />

## Available Queries

| Method                            | Returns              | Description                       |
| --------------------------------- | -------------------- | --------------------------------- |
| `getUtxos(address)`               | `UTxO[]`             | UTxOs at an address               |
| `getWalletUtxos()`                | `UTxO[]`             | Your wallet's UTxOs               |
| `getUtxosWithUnit(address, unit)` | `UTxO[]`             | UTxOs containing a specific asset |
| `getUtxoByUnit(unit)`             | `UTxO`               | Single UTxO holding an asset      |
| `getUtxosByOutRef(refs)`          | `UTxO[]`             | UTxOs by output reference         |
| `getDelegation(rewardAddress)`    | `Delegation`         | Stake delegation and rewards      |
| `getDatum(hash)`                  | `Data`               | Datum by hash                     |
| `getProtocolParameters()`         | `ProtocolParameters` | Current protocol parameters       |
| `awaitTx(hash)`                   | `boolean`            | Wait for transaction confirmation |

## Quick Example

```typescript
import { Address, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

// Query wallet UTxOs
const utxos = await client.getWalletUtxos()
console.log("Wallet has", utxos.length, "UTxOs")

// Query specific address
const addr = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
const addrUtxos = await client.getUtxos(addr)
```

## Next Steps

- [UTxOs](./utxos) — Query unspent transaction outputs
- [Protocol Parameters](./protocol-parameters) — Fetch current network parameters
- [Datums](./datums) — Query datum values by hash
- [Delegation](./delegation) — Check stake delegation and rewards
- [Transaction Status](./transaction-status) — Wait for transaction confirmation
