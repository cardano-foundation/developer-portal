# Mesh: Next.js dApp template

A minimal Cardano dApp built with [Mesh](https://meshjs.dev) and Next.js. It connects a wallet, shows
the balance, and sends ADA. Use it as the starting point for your own app.

This is a template from the [Cardano Developer Portal](https://developers.cardano.org). Start a new
project from it with:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/mesh-nextjs my-app
```

## What it does

- Connect a CIP-30 browser wallet with Mesh's `<CardanoWallet />` component.
- Read and display the connected wallet's balance with the `useLovelace` hook.
- Build, sign, and submit a plain ADA payment with `MeshTxBuilder`.

## Prerequisites

- Node.js 18+ and npm.
- A Cardano wallet browser extension (Eternl, Lace, and so on).
- A free Blockfrost project ID from [blockfrost.io](https://blockfrost.io), matching your network.

## Getting started

```bash
# 1. Set your Blockfrost key (used to build transactions)
cp .env.example .env.local
# edit .env.local: set NEXT_PUBLIC_BLOCKFROST_API_KEY (use a preprod key for testnet)

# 2. Install and run
npm install
npm run dev
```

The app runs at `http://localhost:3000`. Connect a wallet, then send test ADA.

## The Mesh pieces

`MeshProvider` (in `src/pages/_app.tsx`) makes wallet state available to the hooks. `useWallet` and
`useLovelace` read the connected wallet; `MeshTxBuilder` builds the payment, and the wallet signs and
submits it:

```tsx
const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider })

const unsignedTx = await txBuilder
  .txOut(recipient, [{ unit: "lovelace", quantity: lovelaceAmount }])
  .changeAddress(await wallet.getChangeAddress())
  .selectUtxosFrom(await wallet.getUtxos())
  .complete()

const txHash = await wallet.submitTx(await wallet.signTx(unsignedTx))
```

See `src/pages/index.tsx` for the full flow with the balance display, the send form, and error states.

## Build configuration

`next.config.ts` and the `overrides` block in `package.json` are not boilerplate; they are required to
build Mesh under Next.js today:

- **Node polyfills.** Mesh uses Node built-ins (`Buffer`, `crypto`, `stream`). `next.config.ts` adds
  `node-polyfill-webpack-plugin` and strips the `node:` scheme (the plugin alone does not cover
  `node:`-prefixed imports).
- **libsodium override.** A current Mesh release transitively pulls `libsodium-wrappers-sumo@0.7.x`,
  whose ESM build is broken, so `next build` fails with `Can't resolve './libsodium-sumo.mjs'`. The
  `"overrides": { "libsodium-wrappers-sumo": "^0.8.4" }` pin fixes it. This is temporary, until Mesh
  ships the upstream fix (`@cardano-sdk/crypto@0.4.6+`).

## Scripts

- `npm run dev` starts the dev server.
- `npm run build` builds for production.
- `npm run start` serves the production build.

## Learn more

- [Build a dApp walkthrough](https://developers.cardano.org/docs/developers/curriculum/dapps/your-first-dapp)
- [Mesh](https://meshjs.dev)
- [CIP-30: dApp-Wallet Web Bridge](https://cips.cardano.org/cip/CIP-0030)
