---
title: Transaction Status
description: Wait for transaction confirmation on the blockchain
---

# Transaction Status

After submitting a transaction, use `awaitTx` to wait for it to appear on-chain. This polls the provider at a configurable interval until the transaction is confirmed or the timeout expires.

## Wait for Confirmation

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()

const confirmed = await client.awaitTx(txHash, 3000)
console.log("Confirmed:", confirmed)
```

## Parameters

| Parameter       | Type              | Description                       |
| --------------- | ----------------- | --------------------------------- |
| `txHash`        | `TransactionHash` | Transaction hash to monitor       |
| `checkInterval` | `number`          | Polling interval in milliseconds  |
| `timeout`       | `number`          | Maximum wait time in milliseconds |

On devnet with fast blocks, transactions confirm almost instantly. On mainnet or testnet with 1-second slots, expect 10-20 seconds for the first confirmation.

## Next Steps

- [UTxOs](./utxos) — Query UTxOs after confirmation
- [Your First Transaction](../transactions/first-transaction) — Complete transaction workflow
