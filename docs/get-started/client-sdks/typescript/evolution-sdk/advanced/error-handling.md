---
title: Error Handling
description: Effect-based error handling patterns
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Error Handling

Evolution SDK is built on Effect, providing structured error handling with typed errors. Every operation that can fail returns an `Effect<Success, Error>` type, making error cases explicit and composable.

## Error Types

| Error                       | When                                                          |
| --------------------------- | ------------------------------------------------------------- |
| **TransactionBuilderError** | Build phase failures (insufficient funds, invalid parameters) |
| **ProviderError**           | Provider communication issues (network, API errors)           |
| **EvaluationError**         | Plutus script evaluation failures                             |

## Build Modes

Evolution SDK offers three ways to handle errors from `.build()`:

<Tabs>
<TabItem value="promise" label="Promise (Default)" default>

The standard `.build()` returns a Promise. Errors throw as exceptions:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

try {
  const tx = await client
    .newTx()
    .payToAddress({
      address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
      assets: Assets.fromLovelace(2_000_000n)
    })
    .build()

  const signed = await tx.sign()
  await signed.submit()
} catch (error) {
  console.error("Transaction failed:", error)
}
```

</TabItem>
<TabItem value="effect" label="Effect">

Use `.buildEffect()` for composable error handling with Effect:

```typescript
import { Effect } from "effect"
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const program = client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .buildEffect()

// Effect.runPromise(program).catch(console.error)
```

</TabItem>
<TabItem value="either" label="Either">

Use `.buildEither()` for explicit success/failure without exceptions:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const result = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .buildEither()

// result is Either<Error, SignBuilder>
```

</TabItem>
</Tabs>

## All Error Types

### Transaction Building

| Error | Source | Common Causes |
| --- | --- | --- |
| **TransactionBuilderError** | `Client.newTx().build()` | Insufficient funds, invalid parameters, missing required fields |
| **EvaluationError** | Script evaluation phase | Plutus validator rejected the transaction, exceeded execution limits |
| **CoinSelectionError** | UTxO selection phase | Wallet has insufficient funds, no UTxOs match required assets |

### Provider

| Error | Source | Common Causes |
| --- | --- | --- |
| **ProviderError** | Any provider call | Network timeout, invalid API key, rate limiting, endpoint down |

### Encoding / Decoding

| Error | Source | Common Causes |
| --- | --- | --- |
| **DataError** | `Data.withSchema()` codec operations | Schema mismatch, invalid PlutusData structure |
| **CBORError** | CBOR encoding/decoding | Malformed CBOR bytes, unexpected data format |
| **UPLCError** | UPLC operations | Invalid flat encoding, corrupted script bytes |

### Wallet / Key

| Error | Source | Common Causes |
| --- | --- | --- |
| **WalletError** | Wallet operations | CIP-30 wallet not connected, user rejected, missing API method |
| **DerivationError** | Key derivation | Invalid mnemonic, bad derivation path |
| **PrivateKeyError** | Private key operations | Invalid key bytes, signing failure |
| **Bip32PrivateKeyError** | BIP-32 HD keys | Invalid extended key |
| **Bip32PublicKeyError** | BIP-32 public keys | Invalid public key derivation |

### Script

| Error | Source | Common Causes |
| --- | --- | --- |
| **NativeScriptError** | Native script operations | Invalid timelock, bad multi-sig configuration |

## Debugging Common Errors

### "Insufficient funds" (CoinSelectionError)

```typescript
try {
  const tx = await client.newTx()
    .payToAddress({ address, assets: Assets.fromLovelace(1000_000_000n) })
    .build()
} catch (e) {
  // Check: Does the wallet have enough ADA?
  // Check: Are UTxOs locked at script addresses?
  // Check: Is there enough ADA for fees + min UTxO?
  console.error(e)
}
```

**Fix:** Query your wallet UTxOs first to verify available balance.

### "Script evaluation failed" (EvaluationError)

```typescript
try {
  const tx = await client.newTx()
    .collectFrom({ inputs: scriptUtxos, redeemer: Data.constr(0n, []) })
    .attachScript({ script: validatorScript })
    .build()
} catch (e) {
  // Check: Is the redeemer correct for your validator?
  // Check: Does the datum match what the validator expects?
  // Check: Are required signers included?
  console.error(e)
}
```

**Fix:** Use debug labels (`label: "my-operation"`) on `collectFrom` to identify which script failed.

### "Provider request failed" (ProviderError)

```typescript
try {
  const tx = await client.newTx()
    .payToAddress({ address, assets })
    .build()
} catch (e) {
  // Check: Is your API key valid?
  // Check: Is the provider endpoint reachable?
  // Check: Are you on the correct network (preprod vs mainnet)?
  console.error(e)
}
```

**Fix:** Verify your provider configuration, API key, and network connectivity.

### "CBOR decoding failed" (CBORError)

```typescript
import { CBOR } from "@evolution-sdk/evolution"

try {
  const value = CBOR.fromCBORHex("invalid-hex")
} catch (e) {
  console.error(e)
}
```

**Fix:** Verify the hex string is valid and the correct encoding level. Use `UPLC.getCborEncodingLevel()` to check script encoding.

## Inspecting Errors

All Evolution SDK errors are tagged errors with structured fields. You can inspect them by checking the `_tag` property.

### Identifying Error Types

```typescript
try {
  const tx = await client.newTx()
    .payToAddress({ address, assets })
    .build()
  const signed = await tx.sign()
  await signed.submit()
} catch (e: any) {
  switch (e._tag) {
    case "TransactionBuilderError":
      console.error("Build failed:", e.message)
      break
    case "EvaluationError":
      console.error("Script failed:", e.message)
      if (e.failures) {
        for (const f of e.failures) {
          console.error(`  [${f.purpose}] ${f.label ?? "unlabeled"}: ${f.validationError}`)
          if (f.traces.length > 0) {
            console.error("  Traces:", f.traces.join(", "))
          }
        }
      }
      break
    case "CoinSelectionError":
      console.error("Insufficient funds:", e.message)
      break
    case "ProviderError":
      console.error("Provider issue:", e.message)
      break
    default:
      console.error("Unknown error:", e)
  }
}
```

### EvaluationError Script Failures

When a Plutus script fails, `EvaluationError` contains a `failures` array with detailed information about each failed script:

| Field | Type | Description |
| --- | --- | --- |
| `purpose` | `string` | `"spend"`, `"mint"`, `"withdraw"`, or `"publish"` |
| `index` | `number` | Index within the purpose category |
| `label` | `string?` | Your debug label from `collectFrom({ label: "..." })` |
| `validationError` | `string` | The error message from the validator |
| `traces` | `string[]` | Execution traces emitted by the script |
| `scriptHash` | `string?` | Hash of the failed script |
| `utxoRef` | `string?` | UTxO reference (for spend redeemers) |
| `policyId` | `string?` | Policy ID (for mint redeemers) |
| `credential` | `string?` | Credential hash (for withdraw/cert redeemers) |

### Using Labels for Debugging

```typescript
const tx = await client
  .newTx()
  .collectFrom({
    inputs: escrowUtxos,
    redeemer: Data.constr(0n, []),
    label: "claim-escrow"
  })
  .collectFrom({
    inputs: vestingUtxos,
    redeemer: Data.constr(1n, []),
    label: "unlock-vesting"
  })
  .attachScript({ script: escrowScript })
  .attachScript({ script: vestingScript })
  .build()
```

When a script fails, the error tells you exactly which operation caused it:

```
EvaluationError: Script evaluation failed
  [spend] claim-escrow: Validator returned False
  Traces: "deadline not reached", "current time: 1735600000"
```

### Safe Parsing with Either

```typescript
const result = await client
  .newTx()
  .payToAddress({ address, assets })
  .buildEither()

if (result._tag === "Left") {
  console.error("Failed:", result.left)
} else {
  const signed = await result.right.sign()
  await signed.submit()
}
```

## Next Steps

- [Architecture](./architecture) — How errors flow through build phases
- [TypeScript Tips](./typescript) — Type patterns with Effect
- [UPLC](../encoding/uplc) — UPLC error debugging
