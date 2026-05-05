---
title: Transaction Submission
description: Submit transactions and monitor confirmations
---

# Transaction Submission

Providers handle transaction submission and confirmation monitoring. Submit pre-signed transactions and track their status on the blockchain.

## Basic Submission

Submit a signed transaction CBOR string:

```typescript
import { Transaction, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const signedTxCbor = "84a300..." // Signed transaction CBOR
const signedTx = Transaction.fromCBORHex(signedTxCbor)
const txHash = await client.submitTx(signedTx)

console.log("Transaction submitted:", txHash)
```

## Wait for Confirmation

Monitor transaction until confirmed on blockchain:

```typescript
import { Transaction, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const signedTxCbor = "84a300..."
const signedTx = Transaction.fromCBORHex(signedTxCbor)
const txHash = await client.submitTx(signedTx)

// Wait for confirmation (checks every 5 seconds by default)
const confirmed = await client.awaitTx(txHash)

// Custom interval: check every 10 seconds
// const confirmed = await client.awaitTx(txHash, 10000)
```

## Transaction Evaluation

Evaluate a transaction before submission to estimate script execution costs:

```typescript
import { Transaction, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const unsignedTxCbor = "84a300..." // Unsigned transaction with scripts
const unsignedTx = Transaction.fromCBORHex(unsignedTxCbor)

// Evaluate script execution costs
const redeemers = await client.evaluateTx(unsignedTx)

redeemers.forEach((redeemer) => {
  console.log(`[${redeemer.redeemer_tag}#${redeemer.redeemer_index}]`,
    `mem: ${redeemer.ex_units.mem}, steps: ${redeemer.ex_units.steps}`)
})
```

## Common Submission Errors

| Error String | Meaning | Retryable? |
| --- | --- | --- |
| `OutsideValidityIntervalUTxO` | Transaction expired | No — rebuild with new validity |
| `BadInputsUTxO` | UTxO already spent | No — rebuild with fresh UTxOs |
| `ValueNotConservedUTxO` | Input/output value mismatch | No — fix transaction logic |
| `FeeTooSmallUTxO` | Fee too low | No — rebuild with correct fee |
| Network timeout | Provider unreachable | Yes — retry after delay |

```typescript
try {
  const signedTx = Transaction.fromCBORHex(signedTxCbor)
  const txHash = await client.submitTx(signedTx)
  const confirmed = await client.awaitTx(txHash)
} catch (error: any) {
  if (error.message.includes("BadInputsUTxO")) {
    console.error("UTxO already spent — rebuild with fresh UTxOs")
  } else if (error.message.includes("OutsideValidityIntervalUTxO")) {
    console.error("Transaction expired — rebuild with new validity window")
  } else {
    console.error("Submission failed:", error.message)
  }
}
```

## Next Steps

- [Use Cases](./use-cases.md) — Complete real-world examples
- [Provider Types](./provider-types.md) — Choose the right provider
- [Error Handling](../advanced/error-handling.md) — Full error type reference and debugging
- [Retry-Safe Transactions](../transactions/retry-safe.md) — Builder-level retry patterns
