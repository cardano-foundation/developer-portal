---
title: Provider Setup Comparison
description: Compare how to set up different providers. Choose the provider that best fits your needs.
---

# Provider Setup Comparison

Providers are your bridge to the Cardano blockchain—they handle querying UTxOs, submitting transactions, and fetching protocol parameters. Evolution SDK supports multiple providers with different trade-offs in setup complexity, hosting requirements, and performance characteristics.

Choose Blockfrost for quick setup with hosted infrastructure, or Kupmios for self-hosted control with lower latency. Both provide the same API interface, so switching later is just a configuration change.

## Blockfrost

Blockfrost offers hosted infrastructure with a free tier, perfect for development and small-scale applications. Setup takes minutes—just get an API key and connect.

```ts
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!,
    accountIndex: 0
  })
```

**Setup:**

1. Get a free API key at [blockfrost.io](https://blockfrost.io)
2. Add to environment: `BLOCKFROST_API_KEY=your_key`
3. Use the endpoint URL above

## Kupmios

Run your own Cardano node infrastructure for complete control and privacy. Kupmios combines Kupo (UTxO indexing) and Ogmios (node queries) for a fully local setup. Ideal for production applications that need guaranteed uptime and don't want external dependencies.

```ts
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withKupmios({
    kupoUrl: "http://localhost:1442",
    ogmiosUrl: "http://localhost:1337"
  })
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!,
    accountIndex: 0
  })
```

## Choosing a Provider

Here's how the providers compare across key dimensions:

| Feature         | Blockfrost                   | Kupmios             |
| --------------- | ---------------------------- | ------------------- |
| **Setup Time**  | 5 minutes                    | 30+ minutes         |
| **Hosting**     | Hosted                       | Self-hosted         |
| **Cost**        | Free tier available          | Infrastructure cost |
| **Latency**     | Network dependent            | Very low (local)    |
| **Privacy**     | Requests visible to provider | Fully private       |
| **Rate Limits** | Yes (tier-based)             | None                |
| **Maintenance** | Zero                         | Node sync & updates |

Use Blockfrost for rapid prototyping and development. Switch to Kupmios when you need production-level control, privacy, or performance.

## Switching Between Providers

The beauty of Evolution SDK's provider abstraction: your transaction code doesn't change. Only the configuration does:

```ts
import { preprod, Client } from "@evolution-sdk/evolution"

// Start with Blockfrost
const blockfrostClient = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!,
    accountIndex: 0
  })

// Switch to Kupmios — same wallet, different provider
const kupmiosClient = Client.make(preprod)
  .withKupmios({
    kupoUrl: "http://localhost:1442",
    ogmiosUrl: "http://localhost:1337"
  })
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!,
    accountIndex: 0
  })
```

## Environment Configuration

Use environment variables to manage provider credentials:

```bash
# .env.local
BLOCKFROST_API_KEY=your_key_here
KUPO_URL=http://localhost:1442
OGMIOS_URL=http://localhost:1337
```

Then in your code:

```ts
import { preprod, Client } from "@evolution-sdk/evolution"

const client = process.env.BLOCKFROST_API_KEY
  ? Client.make(preprod)
      .withBlockfrost({
        baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
        projectId: process.env.BLOCKFROST_API_KEY
      })
      .withSeed({
        mnemonic: process.env.WALLET_MNEMONIC!,
        accountIndex: 0
      })
  : Client.make(preprod)
      .withKupmios({
        kupoUrl: process.env.KUPO_URL!,
        ogmiosUrl: process.env.OGMIOS_URL!
      })
      .withSeed({
        mnemonic: process.env.WALLET_MNEMONIC!,
        accountIndex: 0
      })
```

## Next Steps

- [Client Basics](./client-basics.md) - Learn core client operations
- [Getting Started](../introduction/getting-started.md) - Quick start guide
- [Querying](../querying/overview.md) - Query blockchain state
