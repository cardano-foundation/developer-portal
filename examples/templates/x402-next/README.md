# x402 Next.js Paywall

Payment-gated Next.js API routes via x402 on **Cardano preprod**, with a
browser paywall for CIP-30 wallets. The server side is `withX402` from
`@x402/next`; the browser side builds and signs the payment transaction
with your wallet, and the facilitator broadcasts it.

Two priced routes out of the box, and they teach two different things:
`/api/message` costs 1 tADA (the simple native payment), and
`/api/message-usdm` costs 0.10 tUSDM (cent-level pricing in a
stablecoin). Pure-lovelace prices must clear the min-UTxO floor, so
keep them at 1 tADA or more; anything cheaper is priced in tUSDM.
Claim test tUSDM at [tusdm.moneta.global](https://tusdm.moneta.global/#manual).
A new paid route is the same `withX402` config, copied into another
`route.ts`.

The browser paywall also enforces a spend ceiling per asset (5 tADA by
default); if you raise a route's price above it, pass a higher
`maxAmount` to the `Paywall` component or the payment is rejected
client-side.

## Quickstart

1. **Install**: `npm install` (Node 20+)
2. **Env**: `cp .env.example .env`, then set
   - `SELLER_ADDRESS`: any preprod address you control
   - `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID`: free preprod id at [blockfrost.io](https://blockfrost.io).
     `NEXT_PUBLIC_` ships the id to the browser, which is fine for a free
     preprod key and this template only. Never put a mainnet key behind
     `NEXT_PUBLIC_`.
3. **Facilitator**: `npm run facilitator` in a second terminal, or point
   `FACILITATOR_URL` at the hosted one once announced.
4. **Run**: `npm run dev`, open <http://localhost:3002>, pay with a
   CIP-30 wallet (Eternl or Lace on preprod, funded from the
   [preprod faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)).
   Expect 20 to 60 seconds for on-chain confirmation.

Headless clients work against the same routes with `@x402/fetch` and a
mnemonic signer; the
[x402 Express Starter](https://github.com/cardano-foundation/developer-portal/tree/staging/examples/templates/x402-express)
shows that side.

## How it is put together

- `app/api/*/route.ts`: `withX402(handler, config, server)` protects a
  route and settles only after a successful response.
- `lib/x402/server.ts`: one `x402ResourceServer` with
  `ExactCardanoScheme` registered against `FACILITATOR_URL`.
- `lib/x402/cip30.ts` and `lib/x402/payFlow.ts`: the browser payment
  blocks, adapted from the
  [x402-cardano-demo](https://github.com/cardano-foundation/x402-cardano-demo)
  frontend. The stock `@x402/paywall` package covers EVM and Solana
  only, so these ~200 lines are the Cardano paywall.
- `components/Paywall.tsx`: wallet list, pay button, step log, unlocked
  content. The paywall talks CIP-30 directly rather than through a
  connector library: the payment needs the wallet's raw API for
  transaction signing, and a connector would add its UI stack and
  dependencies to a template this small.
- `scripts/facilitator.ts`: a minimal local facilitator (the offline
  fallback). It holds no keys and no funds, and binds `127.0.0.1` so
  only your machine can reach it (`FACILITATOR_HOST` overrides).

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| "No CIP-30 wallet found" | Install Eternl or Lace, enable it for this site, reload. |
| "Switch your wallet to Cardano preprod" | The wallet is on mainnet or preview. Change its network to preprod. |
| "No live preprod inputs match your wallet" | The wallet is unfunded, or its UTxO cache is stale after a payment. Fund it or wait a minute. |
| Payment rejected before submission | The facilitator log has the reason (`invalidReason`). |
| Everything takes 20 to 60 seconds after paying | One on-chain confirmation on preprod. It is the chain, not a bug. |

## Building with a coding agent

Cardano Dev Skills gives a coding agent skills and docs for the whole
Cardano toolchain, refreshed weekly, so it works from current facts. The
setup guide is on the developer portal:
<https://developers.cardano.org/docs/developers/curriculum/start-building/ai-assisted-development/>

## Going to production

- `NETWORK`, the Blockfrost project and the asset ids switch to their
  mainnet forms (`USDM_PREPROD_ASSET` becomes `USDM_MAINNET_ASSET`),
  and cent-level prices belong in a stablecoin, since the ~1 ADA
  min-UTxO floor is real money there.
- Use a facilitator you run or trust, over HTTPS. The seller acts on
  its verification answers.
- Give the facilitator scheme a durable `settlementStore`, so replay
  protection survives restarts and spans replicas (the default is
  in-memory).
- The default single confirmation is right for small payments. Raise
  `extra.confirmationPolicy.l1Confirmations` on a route as its
  amounts grow.
- A mainnet paywall must not ship a Blockfrost key to the browser.
  Route chain queries through your own backend.
