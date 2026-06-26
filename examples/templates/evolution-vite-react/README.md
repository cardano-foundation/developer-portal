# Evolution SDK: Vite + React dApp template

A minimal Cardano dApp built with the [Evolution SDK](https://github.com/IntersectMBO/evolution-sdk),
Vite, and React. It connects a wallet, shows the balance, and sends ADA. Use it as the starting point
for your own app.

This is a template from the [Cardano Developer Portal](https://developers.cardano.org). Start a new
project from it with:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/evolution-vite-react my-app
```

## What it does

- Connect a CIP-30 browser wallet (via `@cardano-foundation/cardano-connect-with-wallet`).
- Read and display the connected wallet's stake address and balance.
- Build, sign, and submit a plain ADA payment with the Evolution SDK.

## Prerequisites

- Node.js 18+ and npm.
- A Cardano wallet browser extension (Eternl, Lace, Nami, and so on).
- A free Blockfrost project ID from [blockfrost.io](https://blockfrost.io), matching your network.

## Getting started

```bash
# 1. Configure the network and your Blockfrost key
cp .env.example .env
# edit .env: set VITE_NETWORK (preprod | preview | mainnet) and VITE_BLOCKFROST_PROJECT_ID

# 2. Install and run
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Connect a wallet, then send test ADA.

## The Evolution SDK pieces

A single staged client carries the provider (for protocol params and submission) and the connected
CIP-30 wallet (for signing):

```typescript
import { Address, Assets, Client, preprod, TransactionHash } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({ baseUrl: "https://cardano-preprod.blockfrost.io/api/v0", projectId })
  .withCip30(walletApi)   // walletApi = await window.cardano[name].enable()

const tx = await client
  .newTx()
  .payToAddress({ address: Address.fromBech32(recipient), assets: Assets.fromLovelace(amount) })
  .build()

const hash = TransactionHash.toHex(await (await tx.sign()).submit())
```

See `src/components/TransactionBuilder.tsx` for the full flow with input handling and error states, and
`src/components/WalletConnect.tsx` for the wallet connection.

## Build configuration

The `optimizeDeps` block in `vite.config.ts` is not boilerplate; it controls how Vite serves the
Evolution SDK in development:

- **Evolution stays unbundled.** `exclude: ["@evolution-sdk/evolution"]` keeps the SDK served as
  source, matching the upstream Evolution example, so Vite's dependency pre-bundling does not have to
  process it.
- **`@scure/bip39` is pre-bundled.** Because Evolution is excluded, its transitive `@scure/bip39` is
  served raw, and that package ships `sourceMappingURL` comments without the `.map` files, so Vite
  logs a harmless `Failed to load source map` warning on every transform. Listing it in `include`
  pre-bundles just that package through esbuild, which drops the dangling comments and silences the
  noise. Cosmetic only; the app runs the same without it.

## Scripts

- `npm run dev` starts the dev server.
- `npm run build` type-checks and builds for production into `dist/`.
- `npm run preview` serves the production build locally.

## Learn more

- [Build a dApp walkthrough](https://developers.cardano.org/docs/developers/curriculum/dapps/your-first-dapp)
- [Evolution SDK](https://github.com/IntersectMBO/evolution-sdk)
- [Cardano Connect with Wallet](https://github.com/cardano-foundation/cardano-connect-with-wallet)
