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
- Keep the Blockfrost key on the server, behind a small API route.

## Prerequisites

- Node.js 20.19+ and npm.
- A Cardano wallet browser extension (Eternl, Lace, and so on).
- A free Blockfrost project ID from [blockfrost.io](https://blockfrost.io), matching your network.

## Getting started

```bash
# 1. Configure the network and your Blockfrost key
cp .env.example .env
# edit .env: set NEXT_PUBLIC_NETWORK (preprod by default) and BLOCKFROST_PROJECT_ID for that network

# 2. Install and run
npm install
npm run dev
```

Commit the `package-lock.json` that `npm install` creates, so every install of your app gets the same
dependency versions.

The app runs at `http://localhost:3000`. Connect a wallet, then send some [test ADA](https://developers.cardano.org/docs/developers/curriculum/start-building/networks-and-test-ada#get-test-ada).

## The Mesh pieces

`MeshProvider` (in `src/pages/_app.tsx`) makes wallet state available to the hooks. `useWallet` and
`useLovelace` read the connected wallet; `MeshTxBuilder` builds the payment, and the wallet signs and
submits it:

```tsx
const provider = new BlockfrostProvider("/api/blockfrost")
const params = await provider.fetchProtocolParameters()

const unsignedTx = await new MeshTxBuilder({ fetcher: provider, params })
  .txOut(recipient, [{ unit: "lovelace", quantity: lovelace.toString() }])
  .changeAddress(await wallet.getChangeAddress())
  .selectUtxosFrom(await wallet.getUtxos())
  .complete()

const txHash = await wallet.submitTx(await wallet.signTx(unsignedTx))
```

See `src/pages/index.tsx` for the full flow with the balance display, the send form, and error states.

## What it can do with your funds

The app asks your wallet to sign one payment each time you press Send, for the amount and recipient
you entered. Nothing is sent without your approval in the wallet, and on mainnet the app asks you to
confirm first. It holds no keys of its own. To revoke its access, disconnect the site in your
wallet's settings.

## Where the Blockfrost key lives

Anything in a `NEXT_PUBLIC_` variable is copied into the JavaScript every visitor downloads, so the
key is a plain `BLOCKFROST_PROJECT_ID` that only the server reads. The browser's `BlockfrostProvider`
points at `/api/blockfrost` (`src/pages/api/blockfrost/[...path].ts`), and that route adds the key
before calling Blockfrost. It only forwards the calls the app makes, so it cannot be used to spend your
quota on other queries. If you add a call, add its path to `ALLOWED_PATHS`.

The rest of the configuration is in `src/config.ts`: the network, the matching address prefix, and the
explorer link.

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

## Going to production

This template is a starting point, not a production app. Before real users and real ADA:

- **Protect the API route.** It is public. Add rate limiting or an origin check so others cannot use
  your Blockfrost quota through it.
- **Know the network check's limits.** CIP-30 reports only mainnet or testnet, so a wallet on preview
  passes the check in an app set to preprod. Tell users which testnet to use.
- **Handle what the template does not:** confirmation tracking after submission, multiple recipients or
  assets, and hardware-wallet flows.

## Scripts

- `npm run dev` starts the dev server.
- `npm run build` builds for production.
- `npm run start` serves the production build.
- `npm run lint` checks the code with ESLint.
- `npm run ci` runs lint, type-check, and build, as CI does.

## Learn more

- [Build a dApp walkthrough](https://developers.cardano.org/docs/developers/curriculum/dapps/your-first-dapp)
- [Mesh](https://meshjs.dev)
- [CIP-30: dApp-Wallet Web Bridge](https://cips.cardano.org/cip/CIP-0030)
