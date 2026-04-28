---
title: Query Datums
description: Query datum values by hash from the blockchain
---

# Query Datums

When a UTxO uses a datum hash (instead of an inline datum), the full datum must be looked up separately. Use `getDatum` to fetch datum data by its hash.

## Fetch Datum by Hash

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const datumHash: any

const datum = await client.getDatum(datumHash)
console.log("Datum:", datum)
```

## Inline Datums vs Datum Hashes

| Type             | Lookup Required? | Access                                       |
| ---------------- | ---------------- | -------------------------------------------- |
| **Inline datum** | No               | Available directly on the UTxO object        |
| **Datum hash**   | Yes              | Must call `getDatum(hash)` to fetch the data |

For Plutus V2+ contracts, inline datums are recommended as they don't require a separate lookup step.

## Next Steps

- [UTxOs](./utxos) — Query UTxOs that may contain datums
- [Datums](../smart-contracts/datums) — Working with datums in transactions
