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
- Show the connected wallet's stake address and balance.
- Send ADA: a small server builds the transaction with your Blockfrost key, and the wallet signs it in
  the browser. The key never reaches the browser.

## Prerequisites

- Node.js 20.19+ and npm.
- A Cardano wallet browser extension (Eternl, Lace, and so on).
- A free Blockfrost project ID from [blockfrost.io](https://blockfrost.io), matching your network.

## Getting started

```bash
# 1. Configure the network and your Blockfrost key
cp .env.example .env
# edit .env: set VITE_NETWORK (preprod by default) and BLOCKFROST_PROJECT_ID for that network

# 2. Install and run
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Connect a wallet, then send some [test ADA](https://developers.cardano.org/docs/developers/curriculum/start-building/networks-and-test-ada#get-test-ada).

Commit the `package-lock.json` that `npm install` creates, so every install of your app gets the same
dependency versions.

## How it works

Vite exposes every `VITE_` variable to the browser, so a provider key in the frontend is readable by
anyone who opens the app. This template follows the Evolution SDK's recommended split instead: the
server builds, the browser signs.

1. The browser reads the wallet's address and posts it, with the recipient and amount, to
   `/api/build-payment`.
2. The server builds the transaction with `Client.make(chain).withBlockfrost(...).withAddress(from)`
   and returns it unsigned.
3. The wallet asks the user to approve and returns its signatures, which the browser adds to the
   transaction.
4. The browser posts the signed transaction to `/api/submit-tx`, and the server submits it.

```typescript
// Browser (src/components/TransactionBuilder.tsx): no provider, only the wallet
const client = Client.make(chain).withCip30(walletApi)
const from = Address.toBech32(await client.address())
const { txCbor } = await post("/api/build-payment", { from, to, lovelace })
const witnessSet = await client.signTx(txCbor)
const signedTxCbor = Transaction.addVKeyWitnessesHex(txCbor, TransactionWitnessSet.toCBORHex(witnessSet))
const { txHash } = await post("/api/submit-tx", { signedTxCbor })
```

The API is in `server/payments.ts`. In development the Vite dev server serves it; in production
`server/index.ts` serves it together with the built app. Network settings are in `src/network.ts`
and `src/config.ts`.

## What it can do with your funds

The app asks your wallet to sign one payment each time you press Send, for the amount and recipient
you entered. Nothing is sent without your approval in the wallet, and on mainnet the app asks you to
confirm first. It holds no keys that can move funds. To revoke its access, disconnect the site in your
wallet's settings; rotate the Blockfrost key in your Blockfrost dashboard.

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

## Going to production

This template is a starting point, not a production app. Before real users and real ADA:

- **Protect the API.** `/api/build-payment` and `/api/submit-tx` are public. Add rate limiting or an
  origin check so others cannot use your Blockfrost quota through them, and log errors on the server
  instead of returning them to the browser.
- **Know the network check's limits.** CIP-30 reports only mainnet or testnet, so a wallet on preview
  passes the check in an app set to preprod. Tell users which testnet to use.
- **Know what the server sees.** It builds from the UTxOs at the one address the browser sends.
  Wallets that spread funds across many addresses may need the browser to send more of them.
- **Handle what the template does not:** confirmation tracking after submission, multiple recipients
  or assets, and hardware-wallet flows.

## Scripts

- `npm run dev` starts the dev server, with the API.
- `npm run build` builds the app into `dist/` and the server into `dist-server/`.
- `npm start` runs the production server on port 3000 (set `PORT` to change it).
- `npm run typecheck` checks the code; `npm run ci` runs it and the build.

## Learn more

- [Build a dApp walkthrough](https://developers.cardano.org/docs/developers/curriculum/dapps/your-first-dapp)
- [Evolution SDK](https://github.com/IntersectMBO/evolution-sdk)
- [Cardano Connect with Wallet](https://github.com/cardano-foundation/cardano-connect-with-wallet)
