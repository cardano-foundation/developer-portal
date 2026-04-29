---
title: Multi Output
description: Send payments to multiple recipients in one transaction
---

# Multi Output

Chain multiple `.payToAddress()` calls to send to several recipients in a single transaction. This is more efficient than separate transactions — one fee instead of many.

## Multiple Recipients

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
    assets: Assets.fromLovelace(5_000_000n)
  })
  .payToAddress({
    address: Address.fromBech32(
      "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
    ),
    assets: Assets.fromLovelace(3_000_000n)
  })
  .payToAddress({
    address: Address.fromBech32(
      "addr_test1qpq6xvp5y4fw0wfgxfqmn78qqagkpv4q7qpqyz8s8x3snp5n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgsc3z7t3"
    ),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Send All

Drain your entire wallet to a single address using `sendAll`:

```typescript
import { Address, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const tx = await client
  .newTx()
  .sendAll({
    to: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

This collects all wallet UTxOs and creates a single output containing all assets minus fees.

## Next Steps

- [Simple Payment](./simple-payment.md) — Single recipient payments
- [Your First Transaction](./first-transaction.md) — Complete walkthrough
- [Assets](../assets/overview.md) — Working with native tokens
