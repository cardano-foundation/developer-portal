---
title: Protocol Parameters
description: Query current Cardano protocol parameters
---

# Protocol Parameters

Protocol parameters define the network's rules — fee calculations, size limits, deposits, and Plutus execution costs. The transaction builder fetches these automatically, but you can also query them directly.

## Query Parameters

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const params = await client.getProtocolParameters()

console.log("Min fee coefficient:", params.minFeeA)
console.log("Min fee constant:", params.minFeeB)
console.log("Max tx size:", params.maxTxSize)
console.log("Key deposit:", params.keyDeposit)
console.log("Pool deposit:", params.poolDeposit)
```

## Key Parameters

| Parameter              | Description                       | Typical Value       |
| ---------------------- | --------------------------------- | ------------------- |
| `minFeeA`              | Fee per byte coefficient          | 44                  |
| `minFeeB`              | Base fee constant                 | 155381              |
| `maxTxSize`            | Maximum transaction size (bytes)  | 16384               |
| `keyDeposit`           | Stake key registration deposit    | 2000000 (2 ADA)     |
| `poolDeposit`          | Pool registration deposit         | 500000000 (500 ADA) |
| `coinsPerUtxoByte`     | Minimum ADA per UTxO byte         | 4310                |
| `collateralPercentage` | Collateral percentage for scripts | 150                 |
| `priceMem`             | Plutus memory cost coefficient    | 0.0577              |
| `priceStep`            | Plutus CPU cost coefficient       | 0.0000721           |

## Override in Build Options

You can provide custom protocol parameters when building transactions:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const customParams: any

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build({ protocolParameters: customParams })
```

## Next Steps

- [Transaction Status](./transaction-status) — Check confirmation status
- [UTxOs](./utxos) — Query unspent outputs
