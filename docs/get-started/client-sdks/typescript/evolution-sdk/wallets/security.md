---
title: Security
description: Essential security rules and best practices
---

# Wallet Security

Complete security guide covering essential rules, environment setup, common mistakes, and environment-specific checklists.

## Essential Rules

### Never Do

:::danger
**Never** hardcode private keys or mnemonics in source code. **Never** commit keys to version control. **Never** log secrets. **Never** expose keys in frontend bundles. **Never** share wallet instances across user requests.
:::

These practices expose credentials to anyone with repository access, leak secrets to logging systems, bundle keys into client-side JavaScript, or create shared wallets that all users access.

```typescript
// Error: Hardcoded credentials exposed in source
const badSeedConfig = {
  mnemonic: "abandon abandon abandon..." // Exposed in code (DON'T DO THIS)
};
```

```typescript
// Error: Environment file committed to git
// .env
MNEMONIC="abandon abandon abandon..." # Gets committed to git
```

```typescript
// Error: Secrets leaked to logs
console.log(process.env.PRIVATE_KEY);
logger.debug({ mnemonic: process.env.MNEMONIC });
```

```typescript
// Error: Keys bundled to client
const badPrivateKeyConfig = {
  paymentKey: process.env.PRIVATE_KEY! // Bundled to client (DON'T DO THIS)
};
```

```typescript
// Error: Shared wallet across all users
const globalWalletConfig = { mnemonic: process.env.MNEMONIC! };

// Avoid creating a single global wallet instance that signs on behalf of all users.
// Instead, create per-request or per-user signing flows and store keys in a vault.
```

### Always Do

Always use environment variables for configuration in development and staging. Always use vault solutions like AWS Secrets Manager or Azure Key Vault in production. Always use read-only wallets on backend services when you only need to build transactions. Always keep private keys on user devices when building frontend applications. Always separate keys per environment to prevent cross-environment contamination.

```typescript
// Load wallet config from environment (do not create client here in wallet docs)
const walletConfig = {
  mnemonic: process.env.MNEMONIC!
};
```

```typescript
// Retrieve from vault securely
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function getPrivateKey(): Promise<string> {
  const client = new SecretsManagerClient({ region: "us-east-1" });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: "evolution-wallet-key" })
  );
  return response.SecretString!;
}
```

```typescript
// Backend: read-only wallet config (no private keys)
const readOnlyWalletConfig = {
  address: userAddress
};

// Combine this with your provider in the clients docs when building
// a backend client capable of constructing transactions.
```

```typescript
// Frontend: user wallet manages keys via CIP-30
declare const cardano: any;
const walletApi = await cardano.eternl.enable();

// Use `walletApi` directly for signing and user interactions.
```

```bash
# .env.development
MNEMONIC="develop develop develop..."

# .env.staging
MNEMONIC="staging staging staging..."

# .env.production (managed by vault)
AWS_SECRET_ARN="arn:aws:secretsmanager:us-east-1:123456789012:secret:prod-wallet"
```

---

## Environment Variables

### Setup

**Never commit `.env` files:**

```bash
# .gitignore
.env
.env.*
!.env.example
```

**Provide examples:**

```bash
# .env.example
MNEMONIC="your 24 word mnemonic here"
PRIVATE_KEY="ed25519e_sk1..."
BLOCKFROST_PROJECT_ID="your_project_id"
```

**Load safely:**

```typescript
import * as dotenv from "dotenv";
dotenv.config();

// Validate required variables
if (!process.env.MNEMONIC) {
  throw new Error("MNEMONIC not set in environment");
}

const walletConfig = { mnemonic: process.env.MNEMONIC };
```

### Development

Use test mnemonics and preprod/preview networks:

```bash
# .env.development
NETWORK=preprod
MNEMONIC="develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop develop art"
BLOCKFROST_PROJECT_ID=preprodxxxxxxxxxxxx
```

```typescript
// Example server-side provider + wallet configs. Instantiate the client in your
// backend code (see ../clients for client creation examples).

const providerConfig = {
  network: process.env.NETWORK as "preprod" | "mainnet",
  provider: {
    baseUrl: process.env.NETWORK === "preprod"
      ? "https://cardano-preprod.blockfrost.io/api/v0"
      : "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  }
};

const walletConfig = { mnemonic: process.env.MNEMONIC! };
```

### Staging

Use separate keys from production:

```bash
# .env.staging
NETWORK=mainnet
MNEMONIC="staging staging staging..."
BLOCKFROST_PROJECT_ID=mainnetxxxxxxxxxxxx
```

### Production

Use vault solutions—never plain environment variables:

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function loadMnemonicFromVault() {
  const secretsClient = new SecretsManagerClient({ region: "us-east-1" });

  // Retrieve from vault
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: "evolution-prod-mnemonic" })
  );
  const mnemonic = response.SecretString!;

  // Return wallet configuration; combine with provider in the clients docs
  return { mnemonic } as const;
}
```

---

## Common Mistakes

### Wrong: Provider Keys in Frontend

```typescript
// Error: API keys exposed to browser
const badBlockfrostConfig = { projectId: "mainnetxxxxxxxxxxxx" };

// Do not include provider configs or keys in frontend bundles.
```

**Correct: Provider on Backend Only**

```typescript
// Frontend: no provider (use walletApi directly for signing)
// Backend: create a read-only wallet config and combine with provider in clients docs
const backendProviderConfig = { projectId: process.env.BLOCKFROST_PROJECT_ID! };
const readOnlyWalletConfig = { address: userAddress };
```

### Wrong: Building Transactions on Frontend

```typescript
// Frontend - will fail without provider if you attempt to build. Use backend
// to build unsigned transactions and return CBOR to frontend for signing.
```

**Correct: Backend Builds, Frontend Signs**

```typescript
// Backend builds: create a provider config + read-only wallet config, then
// instantiate a client in your backend (see ../clients for the client API).

// Frontend signs using the walletApi obtained via CIP-30.
```

### Wrong: Same Keys in All Environments

```bash
# Error: Same mnemonic used everywhere
MNEMONIC="abandon abandon abandon..." # Used in dev, staging, AND production
```

**Correct: Separate Keys Per Environment**

```bash
# .env.development
MNEMONIC="develop develop develop..."

# .env.staging
MNEMONIC="staging staging staging..."

# Production (in vault, not .env)
# AWS Secrets Manager: evolution-prod-mnemonic
```

### Wrong: Reusing Addresses

```typescript
// Error: Always uses same address
const address = await client.address();
// Use for everything - bad for privacy
```

**Correct: Multiple Accounts**

```typescript
// Account configs
const mainAccount = { mnemonic: process.env.MNEMONIC!, accountIndex: 0 };
const payoutAccount = { mnemonic: process.env.MNEMONIC!, accountIndex: 1 };

// Pass these wallet configs to your client factory in the clients docs.
```

---

## Security Checklists

### Development Environment

Use preprod or preview networks with test mnemonics containing minimal funds. Never use production keys in development. Add `.env` files to `.gitignore` and provide `.env.example` for your team. Log important events but never log secrets. Avoid reusing production addresses to prevent accidental mainnet transactions during development.

### Staging Environment

Use mainnet with separate keys from production. Keep minimal funds for realistic testing. Use a separate Blockfrost project to isolate staging from production. Load environment variables from your CI/CD system. Test your key rotation process regularly. Monitor transaction history for anomalies. Never use production keys and never mix staging configuration with development.

### Production Environment

Use vault solutions like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault instead of plain environment variables. Enable vault audit logging to track all secret access. Rotate keys regularly with a minimum of every 90 days. Use read-only wallets wherever possible to minimize key exposure. Implement transaction signing approval flows for sensitive operations. Monitor all wallet activity continuously. Set up alerting for unusual transactions. Backup mnemonics offline in a secure physical location. Document your key recovery process. Use hardware security modules for high-value wallets. Never log private keys or mnemonics. Never share vault credentials. Never commit secrets to version control. Never expose API keys to frontend code.

---

## Wallet Type Security Matrix

| Wallet Type | Use Case | Security Level | Key Storage | Network Exposure |
|-------------|----------|----------------|-------------|------------------|
| **Seed Phrase** | Development, testing | Low (if test funds) | Environment variable or vault | Backend only |
| **Private Key** | Production automation | High (requires vault) | Vault + HSM | Backend only |
| **API Wallet** | User-facing applications | Highest (user controls) | User's device | Frontend only |
| **Read-Only** | Backend transaction building | Highest (no keys) | None (address only) | Backend only |

---

## Incident Response

### If Keys Are Exposed

1. **Immediately transfer funds** to new wallet
2. **Rotate all keys** in affected environment
3. **Audit transaction history** for unauthorized activity
4. **Review access logs** to identify exposure scope
5. **Update vault secrets** with new keys
6. **Document incident** for post-mortem
7. **Notify team** and stakeholders

### If Provider Keys Are Exposed

1. **Revoke compromised API keys** in Blockfrost dashboard
2. **Generate new project** with fresh keys
3. **Update environment variables** in all deployments
4. **Review usage logs** for unauthorized access
5. **Monitor for unusual API activity**

---

## Best Practices Summary

### Frontend Applications

Use API wallets implementing CIP-30 for signing operations. Never include provider configuration in frontend code. Let backend services build transactions. User must approve every signature through their wallet interface. Never bundle private keys or mnemonics into client-side code.

### Backend Services

Use read-only wallets whenever possible to eliminate key exposure. Store any required keys in vault solutions with proper access controls. Separate keys per environment to prevent cross-contamination. Build transactions for frontend to sign but never sign unless in automation scenarios. Never expose vault credentials through logs or error messages.

### Automation & Scripts

Use private key wallets for automated operations. Store keys in vault solutions with comprehensive audit logging. Implement signing approval flows for sensitive operations. Rotate keys regularly according to your security policy. Never log keys or mnemonics in application or system logs.

---

## Next Steps

- **[Client Architecture](../clients/architecture.md)** - Frontend/backend patterns
- **[API Wallets](./api-wallet.md)** - CIP-30 integration
- **[Private Key](./private-key.md)** - Vault integration
- **[Seed Phrase](./seed-phrase.md)** - Development wallets
