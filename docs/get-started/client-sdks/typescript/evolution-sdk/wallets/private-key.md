---
title: Private Key Wallets
description: Direct cryptographic control for server automation
---

# Private Key Wallets

Private key wallets accept raw extended signing keys (96 bytes, hex-encoded) directly—no mnemonic derivation. They work with keys generated externally or loaded from key management systems.

## What They Are

Direct cryptographic signing keys in extended format (xprv), bypassing mnemonic derivation entirely. You provide 192-character hex strings representing 96-byte extended signing keys.

## When to Use

- **Server automation**: Backend services requiring automated signing
- **CI/CD pipelines**: Automated testing with dedicated keys
- **Payment processors**: High-volume transaction signing
- **Treasury systems**: Programmatic fund management
- **External key integration**: Keys from HSMs or enterprise vaults

## Why They Work

Eliminate derivation overhead, integrate with hardware security modules (HSMs) and enterprise key vaults, enable programmatic key generation and rotation.

## How to Secure

:::danger
You manage raw cryptographic material with **no backup mechanism**. If you lose the key, the funds are gone.
:::

Requirements for production:

- Store in dedicated secret management (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- Rotate keys regularly with automated schedules
- Encrypt at rest and in transit
- Audit all key access
- Use separate keys per service and environment

Never log or transmit keys in plaintext. Never store in environment variables as source of truth (use only for runtime injection). Never commit to version control.

## Basic Setup

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

// Create signing-only client with private key (no provider)
// Can sign transactions but cannot query blockchain or submit
const client = Client.make(preprod)
  .withPrivateKey({
    paymentKey: process.env.PAYMENT_SIGNING_KEY! // 192 hex chars
    // Optional: stakeKey for staking operations
  })

const address = await client.address()
console.log("Payment address:", address)

// To query blockchain or submit, add a provider:
// const fullClient = client.withBlockfrost({ ... });
```

## Configuration Options

```typescript
interface PrivateKeyWalletConfig {
  paymentKey: string // Extended signing key (96 bytes = 192 hex chars) (required)
  stakeKey?: string // Extended staking key (optional)
}
```

## Production Pattern with Vault

Load keys from secure secret management systems:

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

declare const secretsManager: {
  getSecretValue(params: { SecretId: string }): {
    promise(): Promise<{ SecretString: string }>
  }
}

async function createSecureClient() {
  // Load from secure vault (AWS Secrets Manager, Azure Key Vault, etc.)
  const signingKey = await loadFromSecureVault("cardano-payment-key")

  return Client.make(mainnet)
    .withPrivateKey({
      paymentKey: signingKey
    })
}

// Example vault integration pattern
async function loadFromSecureVault(keyId: string): Promise<string> {
  // Example: AWS Secrets Manager pattern
  const { SecretString } = await secretsManager
    .getSecretValue({
      SecretId: keyId
    })
    .promise()

  return JSON.parse(SecretString).paymentKey
}
```

## Key Management Checklist

**Generation:**
Use cryptographically secure RNG. Generate offline or in trusted environments. Move to secure storage before any network exposure. Never use predictable sources.

**Storage:**
Use dedicated secret management systems. Consider hardware security modules (HSMs) for high-value operations. Encrypt at rest. Do not use environment variables as source of truth. Do not use configuration files.

**Rotation:**
Implement automated schedules. Maintain previous keys during transition periods. Audit all rotation events. Test rotation procedures in staging environments first.

**Access Control:**
Apply least privilege principles (only services that need signing). Use separate keys per service. Use separate keys per environment (dev/staging/prod). Use separate keys based on risk level.

**Monitoring:**

Log all key access events without logging the keys themselves. Alert on unusual access patterns. Track which service used which key and when. Never log key material.

## AWS Secrets Manager Example

Uses [`@aws-sdk/client-secrets-manager`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/secrets-manager/) — see the [official quickstart](https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets-javascript.html).

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

declare class SecretsManagerClient {
  constructor(config: { region: string })
  send(command: GetSecretValueCommand): Promise<{ SecretString?: string }>
}

declare class GetSecretValueCommand {
  constructor(params: { SecretId: string })
}

const secretsManager = new SecretsManagerClient({ region: "us-east-1" })

async function createProductionClient() {
  // Retrieve secret
  const command = new GetSecretValueCommand({
    SecretId: "prod/cardano/payment-key"
  })

  const response = await secretsManager.send(command)
  const secret = JSON.parse(response.SecretString!)

  // Create client with retrieved key
  return Client.make(mainnet)
    .withPrivateKey({
      paymentKey: secret.paymentKey
    })
}
```

## Azure Key Vault Example

Uses [`@azure/keyvault-secrets`](https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-secrets/secretclient) + [`@azure/identity`](https://learn.microsoft.com/en-us/azure/key-vault/secrets/quick-create-node) — see the [official quickstart](https://learn.microsoft.com/en-us/azure/key-vault/secrets/quick-create-node).

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

declare class DefaultAzureCredential {}

declare class SecretClient {
  constructor(vaultUrl: string, credential: any)
  getSecret(name: string): Promise<{ value?: string }>
}

const credential = new DefaultAzureCredential()
const vaultUrl = "https://your-vault.vault.azure.net"
const secretClient = new SecretClient(vaultUrl, credential)

async function createProductionClient() {
  // Retrieve secret
  const secret = await secretClient.getSecret("cardano-payment-key")

  return Client.make(mainnet)
    .withPrivateKey({
      paymentKey: secret.value!
    })
}
```

## Key Rotation Strategy

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

async function rotateKeys() {
  // 1. Generate new key (offline, secure environment)
  const newKey = await generateNewSigningKey()

  // 2. Store new key in vault
  await storeInVault("cardano-payment-key-new", newKey)

  // 3. Create client with new key
  const client = Client.make(mainnet)
    .withPrivateKey({
      paymentKey: await loadFromVault("cardano-payment-key-new")
    })

  // 4. Monitor for issues
  await monitorTransactions(client)

  // 5. After confirmation period, promote new key
  await promoteKey("cardano-payment-key-new", "cardano-payment-key")

  // 6. Archive old key (don't delete immediately)
  await archiveKey("cardano-payment-key-old")
}

declare function generateNewSigningKey(): Promise<string>
declare function storeInVault(id: string, key: string): Promise<void>
declare function loadFromVault(id: string): Promise<string>
declare function monitorTransactions(client: any): Promise<void>
declare function promoteKey(newId: string, currentId: string): Promise<void>
declare function archiveKey(id: string): Promise<void>
```

## Environment Separation

```typescript
import { preprod, mainnet, Client } from "@evolution-sdk/evolution"

// Development
const devClient = Client.make(preprod)
  .withPrivateKey({
    paymentKey: await loadFromVault("dev/cardano-payment-key")
  })

// Staging
const stagingClient = Client.make(preprod)
  .withPrivateKey({
    paymentKey: await loadFromVault("staging/cardano-payment-key") // Different key
  })

// Production
const prodClient = Client.make(mainnet)
  .withPrivateKey({
    paymentKey: await loadFromVault("prod/cardano-payment-key") // Different key
  })

declare function loadFromVault(id: string): Promise<string>
```

## Critical Security Rules

Never hardcode keys in source code. Never commit keys to Git repositories. Never log key material to console or logging systems. Never transmit keys over unencrypted channels. Never reuse keys across different environments. Never share keys between different services.

Always use dedicated secret management solutions like AWS Secrets Manager or Azure Key Vault. Always implement key rotation with regular schedules. Always audit key access with comprehensive logging. Always encrypt keys both at rest and in transit.

## Next Steps

- **[API Wallets](./api-wallet)** - User-facing applications
- **[Client patterns](../clients/architecture)** - Backend architecture and client wiring
- **[Security](./security)** - Complete security guide
