---
title: Custom Providers
description: Implement your own blockchain provider
---

# Custom Providers

:::info
The SDK currently provides four built-in providers. Custom provider implementation requires working with the internal `ProviderEffect` interface — this is an advanced topic and the API may change.
:::

## Provider Interface

All providers implement the `ProviderEffect` interface internally. This is what each built-in provider (Blockfrost, Kupmios, Maestro, Koios) satisfies:

```typescript
interface ProviderEffect {
  getProtocolParameters(): Effect<ProtocolParameters, ProviderError>
  getUtxos(addressOrCredential): Effect<UTxO[], ProviderError>
  getUtxosWithUnit(addressOrCredential, unit): Effect<UTxO[], ProviderError>
  getUtxoByUnit(unit): Effect<UTxO, ProviderError>
  getUtxosByOutRef(refs): Effect<UTxO[], ProviderError>
  getDelegation(rewardAddress): Effect<Delegation, ProviderError>
  getDatum(datumHash): Effect<Data, ProviderError>
  submitTx(tx): Effect<TransactionHash, ProviderError>
  awaitTx(txHash, checkInterval?, timeout?): Effect<boolean, ProviderError>
  evaluateTx(tx, additionalUTxOs?): Effect<EvalRedeemer[], ProviderError>
}
```

## Built-in Providers

| Provider        | Connection       | Best For                          |
| --------------- | ---------------- | --------------------------------- |
| **Blockfrost**  | REST API         | Production apps, simple setup     |
| **Maestro**     | REST API         | Advanced queries, data analytics  |
| **Koios**       | REST API         | Open source, community maintained |
| **Kupo/Ogmios** | WebSocket + REST | Self-hosted, devnet, full control |

## Using a Provider

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

// Blockfrost
const blockfrostClient = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })

// Kupo/Ogmios
const kupmiosClient = Client.make(preprod)
  .withKupmios({
    kupoUrl: "http://localhost:1442",
    ogmiosUrl: "http://localhost:1337"
  })
```

## Next Steps

- [Architecture](./architecture.md) — How providers fit into the build pipeline
- [Providers](../providers/overview.md) — Provider comparison and configuration
