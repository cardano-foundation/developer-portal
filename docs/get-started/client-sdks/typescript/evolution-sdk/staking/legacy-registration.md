---
title: Legacy Stake Registration
description: Register stake credentials using the pre-Conway certificate format (no deposit)
---

# Legacy Stake Registration

The Conway era introduced new registration certificates (`RegCert`, CDDL tag 7) that require a 2 ADA deposit. However, the **legacy** certificates (`StakeRegistration`, CDDL tag 0) are still accepted on mainnet and are what most wallets and tools use today.

Use legacy registration when:

- You want to avoid the 2 ADA deposit
- You need compatibility with pre-Conway tooling
- You're building a wallet that supports older node versions

## Legacy vs Conway Registration

| | Legacy (pre-Conway) | Conway |
| --- | --- | --- |
| Certificate | `StakeRegistration` (tag 0) | `RegCert` (tag 7) |
| Deposit | None | 2 ADA (from protocol params) |
| Builder method | `registerStakeLegacy()` | `registerStake()` |
| Deregistration | `deregisterStakeLegacy()` | `deregisterStake()` |
| Combined register + delegate | Not available | `registerAndDelegateTo()` |

:::info
Both formats are valid on mainnet today. The ledger accepts either. Choose legacy for simplicity or Conway for deposit-based guarantees.
:::

## Basic Legacy Registration

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const address = await client.address()
const stakeCredential = address.stakingCredential!

// Legacy registration — no deposit required
const tx = await client.newTx().registerStakeLegacy({ stakeCredential }).build()

const signed = await tx.sign()
await signed.submit()
```

Compare with Conway registration which fetches `keyDeposit` from protocol parameters:

```typescript
import { Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const stakeCredential: Credential.Credential

// Conway registration — 2 ADA deposit deducted automatically
const tx = await client.newTx().registerStake({ stakeCredential }).build()
```

## Register and Delegate in One Transaction

Legacy registration doesn't have a combined certificate, but you can chain both operations in a single transaction:

```typescript
import { Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const stakeCredential: Credential.Credential
declare const poolKeyHash: any

const tx = await client
  .newTx()
  .registerStakeLegacy({ stakeCredential })
  .delegateToPool({ stakeCredential, poolKeyHash })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Script-Controlled Legacy Registration

```typescript
import { Credential, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptStakeCredential: Credential.Credential
declare const stakeScript: any

const tx = await client
  .newTx()
  .registerStakeLegacy({
    stakeCredential: scriptStakeCredential,
    redeemer: Data.constr(0n, []),
    label: "legacy-register-script-stake"
  })
  .attachScript({ script: stakeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Withdrawal with a Stake Script

Stake scripts are Plutus validators that run when you withdraw rewards. This is also the foundation of the **coordinator pattern** used by DeFi protocols — a zero-amount withdrawal triggers the stake validator, which can enforce global invariants across multiple script inputs.

### Basic Script Withdrawal

```typescript
import { Credential, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptStakeCredential: Credential.Credential
declare const stakeScript: any
declare const rewardAmount: bigint

const tx = await client
  .newTx()
  .withdraw({
    stakeCredential: scriptStakeCredential,
    amount: rewardAmount,
    redeemer: Data.constr(0n, []),
    label: "withdraw-rewards"
  })
  .attachScript({ script: stakeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

### Coordinator Pattern (Zero-Amount Withdrawal)

Use `amount: 0n` to trigger a stake validator without withdrawing rewards. The validator runs and can enforce rules across the entire transaction:

```typescript
import { Credential, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptStakeCredential: Credential.Credential
declare const stakeScript: any

const tx = await client
  .newTx()
  .withdraw({
    stakeCredential: scriptStakeCredential,
    amount: 0n,
    redeemer: Data.constr(0n, []),
    label: "coordinator-trigger"
  })
  .attachScript({ script: stakeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

### Batch Redeemer (Coordinated Spend + Withdraw)

The most powerful pattern combines script UTxO spending with a withdrawal validator. The withdrawal redeemer receives the indices of all spent inputs:

```typescript
import { Credential, Data, preprod, Client, Cardano } from "@evolution-sdk/evolution"
import * as Bytes from "@evolution-sdk/evolution/Bytes"
import * as PlutusV3 from "@evolution-sdk/evolution/PlutusV3"
import * as ScriptHash from "@evolution-sdk/evolution/ScriptHash"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const compiledCode: string
const stakeScript = new PlutusV3.PlutusV3({ bytes: Bytes.fromHex(compiledCode) })
const scriptHash = ScriptHash.fromScript(stakeScript)
const scriptStakeCredential = scriptHash

const makeSpendRedeemer = (inputIndex: bigint): Data.Data =>
  Data.int(inputIndex)

const makeWithdrawRedeemer = (inputIndices: Array<bigint>): Data.Data =>
  Data.constr(0n, [Data.list(inputIndices.map(Data.int))])

declare const scriptUtxos: Cardano.UTxO.UTxO[]
const utxosToSpend = scriptUtxos.slice(0, 2)

let txBuilder = client.newTx()

for (const utxo of utxosToSpend) {
  txBuilder = txBuilder.collectFrom({
    inputs: [utxo],
    redeemer: (indexedInput) => makeSpendRedeemer(BigInt(indexedInput.index))
  })
}

txBuilder = txBuilder.attachScript({ script: stakeScript })

txBuilder = txBuilder.withdraw({
  stakeCredential: scriptStakeCredential,
  amount: 0n,
  redeemer: {
    all: (indexedInputs) =>
      makeWithdrawRedeemer(indexedInputs.map((inp) => BigInt(inp.index))),
    inputs: utxosToSpend
  },
  label: "coordinator-withdraw"
})

const tx = await txBuilder.build()
const signed = await tx.sign()
await signed.submit()
```

:::info
**Why batch redeemers?** Input indices aren't known until coin selection runs. The `all` callback receives the final sorted indices after the transaction is balanced — solving the chicken-and-egg problem.
:::

## Legacy Deregistration

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const address = await client.address()
const stakeCredential = address.stakingCredential!

const delegation = await client.getWalletDelegation()

const tx = await client
  .newTx()
  .withdraw({ stakeCredential, amount: delegation.rewards })
  .deregisterStakeLegacy({ stakeCredential })
  .build()

const signed = await tx.sign()
await signed.submit()
```

:::warning
Always withdraw rewards before deregistering. Rewards are lost after deregistration regardless of which certificate format you used.
:::

## Full Lifecycle Example

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const poolKeyHash: any

const address = await client.address()
const stakeCredential = address.stakingCredential!

// 1. Register + delegate
const regTx = await client
  .newTx()
  .registerStakeLegacy({ stakeCredential })
  .delegateToPool({ stakeCredential, poolKeyHash })
  .build()
await (await regTx.sign()).submit()

// 2. Withdraw rewards
const delegation = await client.getWalletDelegation()
const withdrawTx = await client
  .newTx()
  .withdraw({ stakeCredential, amount: delegation.rewards })
  .build()
await (await withdrawTx.sign()).submit()

// 3. Deregister when done
const deregTx = await client
  .newTx()
  .deregisterStakeLegacy({ stakeCredential })
  .build()
await (await deregTx.sign()).submit()
```

## Next Steps

- [Registration (Conway)](./registration) — Conway-era registration with deposit
- [Delegation](./delegation) — Pool and DRep delegation options
- [Withdrawal](./withdrawal) — Reward withdrawal patterns
- [Deregistration](./deregistration) — Conway-era deregistration with refund
