---
title: Stake Pool Operations
description: Register and retire stake pools on Cardano
---

# Stake Pool Operations

Stake pool operators use `registerPool` to register a new pool on-chain and `retirePool` to announce retirement. Both operations require the pool operator's key to sign the transaction.

## Pool Registration

Register a stake pool with full parameters — operator key, VRF key, pledge, cost, margin, relays, and optional metadata:

```typescript
import {
  KeyHash,
  PoolKeyHash,
  PoolParams,
  RewardAccount,
  UnitInterval,
  VrfKeyHash,
  preprod,
  Client,
} from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const operatorKeyHash: PoolKeyHash.PoolKeyHash
declare const vrfKeyHash: VrfKeyHash.VrfKeyHash
declare const ownerKeyHash: KeyHash.KeyHash
declare const rewardAccount: RewardAccount.RewardAccount

const poolParams = new PoolParams.PoolParams({
  operator: operatorKeyHash,
  vrfKeyhash: vrfKeyHash,
  pledge: 500_000_000n , // 500 ADA pledge
  cost: 340_000_000n ,   // 340 ADA fixed cost per epoch
  margin: new UnitInterval.UnitInterval({ numerator: 1n, denominator: 100n }), // 1% margin
  rewardAccount,
  poolOwners: [ownerKeyHash],
  relays: [],
  poolMetadata: null
})

const tx = await client
  .newTx()
  .registerPool({ poolParams })
  .build()

const signed = await tx.sign()
await signed.submit()
```

### Pool Parameters Reference

| Parameter | Type | Description |
| --- | --- | --- |
| `operator` | `PoolKeyHash` | Pool operator's key hash (28 bytes) |
| `vrfKeyhash` | `VrfKeyHash` | VRF verification key hash (32 bytes) |
| `pledge` | `Coin` | Operator's pledge in lovelace |
| `cost` | `Coin` | Fixed cost per epoch in lovelace (min 340 ADA on mainnet) |
| `margin` | `UnitInterval` | Pool margin as a fraction (numerator/denominator) |
| `rewardAccount` | `RewardAccount` | Where pool fees are collected |
| `poolOwners` | `KeyHash[]` | Key hashes of all pool owners |
| `relays` | `Relay[]` | Network relay endpoints (see below) |
| `poolMetadata` | `PoolMetadata?` | Optional metadata URL + hash |

## Relay Configuration

Relays tell the network how to reach your pool. Use `SingleHostAddr` for IP-based relays:

```typescript
import { IPv4, SingleHostAddr } from "@evolution-sdk/evolution"

const relay = new SingleHostAddr.SingleHostAddr({
  port: 3001n,
  ipv4: new IPv4.IPv4({ inner: new Uint8Array([192, 168, 1, 100]) }),
  ipv6: undefined,
})
```

Pass relays in the `relays` array of `PoolParams`.

## Pool Metadata

Link to off-chain metadata (pool name, description, ticker) hosted at a URL:

```typescript
import { Bytes32, PoolMetadata, Url } from "@evolution-sdk/evolution"

declare const metadataHash: Bytes32.Bytes32

const metadata = new PoolMetadata.PoolMetadata({
  url: new Url.Url({ url: "https://my-pool.com/metadata.json" }),
  hash: metadataHash,
})
```

The metadata JSON file must follow the [CIP-6 standard](https://cips.cardano.org/cip/CIP-0006) with fields like `name`, `description`, `ticker`, and `homepage`.

## Pool Retirement

Announce retirement effective at a future epoch:

```typescript
import { PoolKeyHash, preprod, Client } from "@evolution-sdk/evolution"
import type { EpochNo } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const poolKeyHash: PoolKeyHash.PoolKeyHash
declare const retirementEpoch: EpochNo.EpochNo

const tx = await client
  .newTx()
  .retirePool({
    poolKeyHash,
    epoch: retirementEpoch,
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

Retirement takes effect at the specified epoch. The pool deposit (500 ADA on mainnet) is refunded to the pool's reward account after retirement.

## Update Pool Parameters

To update an existing pool's parameters (cost, margin, relays, metadata), submit a new `registerPool` with the updated `PoolParams`. The chain treats this as an update if the operator key hash matches an existing pool.

## Next Steps

- [Stake Registration](./registration) — Register stake credentials before delegating
- [Delegation](./delegation) — Delegate stake to a pool
- [Governance](../governance) — Participate in on-chain governance
