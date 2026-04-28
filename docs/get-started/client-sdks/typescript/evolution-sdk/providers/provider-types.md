---
title: Provider Types
description: Compare and configure Blockfrost, Kupmios, Maestro, and Koios providers
---

# Provider Types

The Evolution SDK supports four provider types, each connecting to different Cardano infrastructure. Choose based on your deployment model, feature requirements, and infrastructure preferences.

## Blockfrost

Hosted API service with generous free tier and pay-as-you-grow pricing.

### Configuration

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })
```

### Network Endpoints

```typescript
// Mainnet
baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0"

// Preprod testnet
baseUrl: "https://cardano-preprod.blockfrost.io/api/v0"

// Preview testnet
baseUrl: "https://cardano-preview.blockfrost.io/api/v0"
```

### Getting Project ID

1. Sign up at [blockfrost.io](https://blockfrost.io)
2. Create a project
3. Copy project ID from dashboard
4. Store in environment variable

```bash
# .env
BLOCKFROST_PROJECT_ID="mainnetYourProjectIdHere"
```

### Best For

Production applications requiring reliable uptime without infrastructure management. Ideal for startups and teams focusing on application logic rather than node operations.

**Advantages:**

- Zero infrastructure setup
- Generous free tier
- Global CDN distribution
- Automatic scaling
- Dashboard analytics

**Considerations:**

- API rate limits
- Requires internet connectivity
- Third-party dependency

---

## Kupmios

Self-hosted combination of Ogmios (Cardano node interface) and Kupo (lightweight chain indexer).

### Configuration

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withKupmios({
    ogmiosUrl: "http://localhost:1337",
    kupoUrl: "http://localhost:1442"
  })
```

### With Custom Headers (Demeter / Hosted)

For hosted Kupmios services like [Demeter](https://demeter.run), pass API keys via custom headers:

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withKupmios({
    ogmiosUrl: "https://ogmios.demeter.run",
    kupoUrl: "https://kupo.demeter.run",
    headers: {
      ogmiosHeader: { "dmtr-api-key": process.env.DEMETER_API_KEY! },
      kupoHeader: { "dmtr-api-key": process.env.DEMETER_API_KEY! },
    }
  })
```

Each service can have its own header — useful when Kupo and Ogmios use different authentication.

### Setup Requirements (Self-Hosted)

Requires running Cardano node, Ogmios, and Kupo services:

```bash
# Docker Compose example
services:
  cardano-node:
    image: inputoutput/cardano-node:latest
    # ... node configuration

  ogmios:
    image: cardanosolutions/ogmios:latest
    ports:
      - "1337:1337"
    depends_on:
      - cardano-node

  kupo:
    image: cardanosolutions/kupo:latest
    ports:
      - "1442:1442"
    depends_on:
      - cardano-node
```

### Network Configuration

```typescript
// Mainnet
chain: mainnet,
ogmiosUrl: "http://localhost:1337",
kupoUrl: "http://localhost:1442"

// Preprod testnet
chain: preprod,
ogmiosUrl: "http://localhost:1337",
kupoUrl: "http://localhost:1442"
```

### Best For

Organizations requiring full control over infrastructure, data sovereignty, and no third-party API dependencies.

**Advantages:**

- Complete control
- No rate limits
- Data sovereignty
- No external dependencies
- Can customize indexing

**Considerations:**

- Infrastructure management overhead
- Requires node synchronization
- Hardware requirements
- Operational expertise needed

---

## Maestro

Hosted API service with advanced features and analytics capabilities.

### Configuration

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withMaestro({
    baseUrl: "https://mainnet.gomaestro-api.org/v1",
    apiKey: process.env.MAESTRO_API_KEY!
  })
```

### Network Endpoints

```typescript
// Mainnet
baseUrl: "https://mainnet.gomaestro-api.org/v1"

// Preprod testnet
baseUrl: "https://preprod.gomaestro-api.org/v1"

// Preview testnet
baseUrl: "https://preview.gomaestro-api.org/v1"
```

### Getting API Key

1. Sign up at [gomaestro.org](https://gomaestro.org)
2. Create API key
3. Store in environment variable

```bash
# .env
MAESTRO_API_KEY="your-api-key-here"
```

### Best For

Applications requiring advanced blockchain analytics, extended historical data, or specialized indexing features.

**Advantages:**

- Advanced analytics
- Extended historical data
- Specialized indexing
- WebSocket support
- Enterprise features

**Considerations:**

- Pricing tiers
- API rate limits
- Third-party dependency

---

## Koios

Community-driven distributed API infrastructure.

### Configuration

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withKoios({
    baseUrl: "https://api.koios.rest/api/v1"
  })
```

### Network Endpoints

```typescript
// Mainnet
baseUrl: "https://api.koios.rest/api/v1"

// Preprod testnet
baseUrl: "https://preprod.koios.rest/api/v1"

// Preview testnet
baseUrl: "https://preview.koios.rest/api/v1"

// Guild network (alternative)
baseUrl: "https://guild.koios.rest/api/v1"
```

### Best For

Applications prioritizing decentralization, community infrastructure, or wanting to avoid single-provider dependency.

**Advantages:**

- Decentralized infrastructure
- Community-driven
- Free to use
- No API key required
- Multiple endpoints

**Considerations:**

- Variable performance across nodes
- Community support model
- Rate limiting varies by node

---

## Provider Comparison Matrix

| Feature               | Blockfrost       | Kupmios              | Maestro    | Koios            |
| --------------------- | ---------------- | -------------------- | ---------- | ---------------- |
| **Setup Complexity**  | Low              | High                 | Low        | Low              |
| **Infrastructure**    | Hosted           | Self-hosted          | Hosted     | Community-hosted |
| **API Key Required**  | Yes              | No                   | Yes        | No               |
| **Rate Limits**       | Yes              | No                   | Yes        | Varies           |
| **Cost**              | Free tier + paid | Infrastructure costs | Paid tiers | Free             |
| **Data Sovereignty**  | No               | Yes                  | No         | No               |
| **Decentralization**  | Low              | High                 | Low        | Medium           |
| **Advanced Features** | Standard         | Full control         | Extended   | Standard         |
| **Uptime SLA**        | Commercial       | Self-managed         | Commercial | Best effort      |

## Switching Providers

The unified interface allows switching providers with minimal code changes:

```typescript
import { preprod, mainnet, Client } from "@evolution-sdk/evolution"

// Development: Blockfrost
const devClient = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Production: Self-hosted Kupmios
const prodClient = Client.make(mainnet)
  .withKupmios({
    ogmiosUrl: process.env.OGMIOS_URL!,
    kupoUrl: process.env.KUPO_URL!
  })

// Same query methods work across all providers
const params = await devClient.getProtocolParameters()
```

## Environment-Based Configuration

Manage provider configuration per environment:

```typescript
import { preprod, mainnet, Client } from "@evolution-sdk/evolution"

const environment = (process.env.NODE_ENV || "development") as "development" | "staging" | "production"

const client =
  environment === "production"
    ? Client.make(mainnet).withKupmios({
        ogmiosUrl: process.env.OGMIOS_URL!,
        kupoUrl: process.env.KUPO_URL!
      })
    : environment === "staging"
      ? Client.make(preprod).withMaestro({
          baseUrl: "https://preprod.gomaestro-api.org/v1",
          apiKey: process.env.MAESTRO_STAGING_API_KEY!
        })
      : Client.make(preprod).withBlockfrost({
          baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
          projectId: process.env.BLOCKFROST_PREPROD_PROJECT_ID!
        })
```

## Next Steps

Now that you understand provider types, learn how to use them:

- [Provider-Only Client](./provider-only-client) - Query blockchain without wallet
- [Querying](./querying) - Master all query methods
- [Submission](./submission) - Submit transactions and monitor confirmations
