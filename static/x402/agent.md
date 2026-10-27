# x402 on Cardano — context for coding agents

Feed this file to your coding agent (Claude Code, Codex, Cursor, …) so it
works from current facts instead of stale training data. Human-readable
hub: https://developers.cardano.org/x402

## What x402 is

x402 is an open payment standard built on HTTP's reserved 402 "Payment
Required" status code. A client requests a resource, receives a 402 with
payment requirements, pays on-chain, retries the request with a
`PAYMENT-SIGNATURE` header, and gets the resource plus a receipt. No
accounts, no API keys. Cardano is an officially supported network
(scheme `exact`, spec merged upstream 2026-09-09; SDK on npm).

Three Cardano properties worth building on: the wallet signs the
complete final transaction (fees fixed at signature, outputs cannot
change, it lands as signed or not at all); the facilitator holds no
keys and no funds and cannot alter a signed transaction; there are no
standing approvals — every payment is one discrete signed tx.

## Networks, packages and assets

- Networks: **Cardano preprod** (`cardano:preprod`) for building and
  testing, which everything below uses, and Cardano mainnet
  (`cardano:mainnet`).
- Packages: the templates pin all `@x402/*` packages at **2.26.0**.
  Newer versions are on npm; check `npm view @x402/cardano version` and
  test before upgrading.
- Recommended asset: **tADA** (`asset: "lovelace"`, amounts in lovelace,
  1 ADA = 1,000,000 lovelace). For cent-level prices use **tUSDM**
  (preprod USDM, 6 decimals, unit constant `USDM_PREPROD_ASSET` in
  `@x402/cardano`); self-serve claim at https://tusdm.moneta.global.
  Masumi's dispenser (https://dispenser.masumi.network) gives a
  different preprod tUSDM (policy `16a55b2a…`): same name, different
  asset. A wallet funded there cannot pay a route priced in the SDK's
  tUSDM, and the other way round.
- The facilitator verifies and settles payments. It holds no keys and no
  funds; the client pays the network fee. The Cardano Foundation runs
  hosted facilitators for preprod
  (https://x402.preprod.dev.ecosyseng.cf-deployments.org, the default in
  both templates) and mainnet
  (https://x402.mainnet.dev.ecosyseng.cf-deployments.org). Each lists
  what it supports at `/supported`. The templates also ship a minimal
  local facilitator for offline work.

## The starter template

Scaffold:

    npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/x402-express my-app
    cd my-app && npm install

Files (~290 lines total):

- `src/seller.ts` (64 lines) — Express API charging 2 tADA per request
  via x402. Replace its route with your idea.
- `src/buyer.ts` (73 lines) — the paying agent: gets the 402, builds and
  signs a real Cardano tx, retries with `PAYMENT-SIGNATURE`.
- `src/facilitator.ts` (102 lines) — minimal local facilitator on port
  4022 (offline fallback; needs only a Blockfrost project id).
- `src/wallet.ts` (17 lines) — generates a preprod wallet, prints the
  `MNEMONIC=` line and the address to fund.
- `src/demo.ts` (36 lines) — runs seller + buyer in one command.

Scripts: `npm run wallet | seller | buyer | facilitator | demo`,
`npm run typecheck`.

## The Next.js paywall template (for web apps)

Scaffold:

    npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/x402-next my-app
    cd my-app && npm install

What it is: Next.js (App Router) API routes protected with `withX402`
from `@x402/next`, plus a browser paywall for CIP-30 wallets (Eternl,
Lace) — the stock `@x402/paywall` package covers EVM/Solana/Algorand
only, so the Cardano browser side ships inside the template
(`lib/x402/cip30.ts`, `lib/x402/payFlow.ts`, `components/Paywall.tsx`).

- Two priced routes teach two things: `/api/message` costs 1 tADA
  (simple native payment), `/api/message-usdm` costs 0.10 tUSDM
  (cent pricing; lovelace cannot go that low because of min-UTxO).
- `withX402(handler, config, server)` settles only after the handler
  returns a successful response. A new paid route is the same config
  copied into another `route.ts`.
- Browser flow: the wallet signs, the facilitator submits. Settlement
  waits for one block confirmation (20–60s; the UI shows a counter).
  If the server reports `settlement_pending`, the flow re-checks the
  SAME signed payment and never pays twice.
- `npm run dev` serves on port 3002. `BLOCKFROST_PROJECT_ID` stays on
  the server: the paywall reaches Blockfrost through the
  `/api/blockfrost` route. `npm run facilitator` starts the same minimal
  local facilitator if you want to work offline.

`.env` for the Express starter (from `cp .env.example .env`):

    FACILITATOR_URL=https://x402.preprod.dev.ecosyseng.cf-deployments.org   # or http://localhost:4022 for the local one
    SELLER_ADDRESS=addr_test1...            # receives the payment
    SELLER_PORT=4021
    MNEMONIC=...                            # from npm run wallet, funded
    BLOCKFROST_PROJECT_ID=preprod...        # free at blockfrost.io

The Next.js template needs `FACILITATOR_URL`, `SELLER_ADDRESS` and a
server-only `BLOCKFROST_PROJECT_ID`, and no mnemonic: the browser wallet
pays.

## The payment flow

    buyer ── GET /api/message ──────────────► seller
    buyer ◄─ 402 + payment requirements ───── seller
    buyer:   builds + signs a Cardano tx (pays amount + network fee)
    buyer ── GET + PAYMENT-SIGNATURE ───────► seller ──► facilitator /verify + /settle ──► chain
    buyer ◄─ 200 + resource + receipt ─────── seller

A successful `npm run demo` prints `HTTP 200 after <n>s` (usually
20–60s), the response body, a payment receipt and an explorer link to
the tx on preprod.cardanoscan.io.

## The APIs the starter actually uses

- `@x402/express`: `paymentMiddleware`, `x402ResourceServer` — turn an
  Express route into a paid route.
- `@x402/fetch`: `x402Client`, `wrapFetchWithPayment`, `x402HTTPClient`
  — a fetch that pays 402s automatically.
- `@x402/cardano`: `toClientCardanoSigner` (mnemonic + Blockfrost) and
  `toFacilitatorCardanoSigner` (Blockfrost only; no mnemonic needed).
- `@x402/cardano/exact/client|server|facilitator`: `ExactCardanoScheme`
  — register per side with `client.register("cardano:*", new ExactCardanoScheme(signer))`.
- `@x402/core/types|server|facilitator`: shared types,
  `HTTPFacilitatorClient`, `x402Facilitator`.

## Gotchas (each one is a real failure mode)

1. **Spend controls reject lovelace by default** (it is not USD-pegged).
   The buyer must allow it explicitly:
   `new x402Client().setSpendControls({ allowedAssets: [{ network: "cardano:*", asset: "lovelace", maxAmountPerPayment: "5000000" }] })`.
   Without `maxAmountPerPayment` the entry is uncapped; an autonomous
   agent should always set one.
2. **Min-UTxO**: pure-lovelace prices below ~1 ADA are invalid on
   Cardano. Keep lovelace prices at 1 tADA or more (the Express starter
   charges 2 tADA = `"2000000"` lovelace, the Next template 1 tADA).
3. **`isValid: false` arrives as HTTP 200** from the facilitator's
   /verify — read `invalidReason`. 4xx/5xx means transport trouble, not
   a rejected payment.
4. **Confirmation takes 20–60 seconds** on preprod (one on-chain
   confirmation). That is the chain, not a bug — don't add retries
   around it.
5. **Seller answers HTTP 500** and its console logs "no supported payment
   kinds" → the facilitator isn't reachable at `FACILITATOR_URL`; start
   one (`npm run facilitator`) or fix the URL.
6. **Buyer fails with "Funding wallet has no UTXOs available"** → wallet
   not funded yet, or the faucet transfer hasn't landed; check the address
   on preprod.cardanoscan.io. Test ADA is free at
   https://docs.cardano.org/cardano-testnets/tools/faucet (select
   Preprod).
7. **Browser paywall: "Coin selection failed for …"** → the connected
   wallet account lacks the priced asset. Fund it, claim tUSDM, or
   switch accounts. Fails before signing; nothing was paid.
8. **Browser paywall keeps checking a pending payment** → normal on a
   slow confirmation; the same signed payment is re-checked, never
   re-paid. Do not reload the page mid-flow.
9. **`@x402/next` requires Next >= 16.2.6** (peer dependency), and
   leaving `withX402`'s `syncFacilitatorOnStart` at its default is
   required — setting it to false breaks route support detection.
10. **The public x402.org facilitator does not support Cardano.** Its
    `/supported` lists no cardano kind. Use the Cardano Foundation's
    hosted facilitator or the local one.
11. **Cardano is TypeScript-only for now.** The Python and Go x402 SDKs
    have no Cardano support yet (a Python implementation is in review
    upstream). Don't hand-roll a client; call a small TypeScript
    service from your Python agent instead.
12. **One wallet, one payment at a time.** The client signer uses the
    wallet's first UTxO as the payment nonce, so concurrent payments
    from one wallet collide. Parallel agents need separate wallets.
13. **Pricing on Cardano.** Every payment output must carry a minimum
    of ADA (~1 ADA for pure ADA, ~1.2–1.5 ADA alongside a token; it
    goes to the seller with the payment), plus a network fee of about
    0.17 ADA. Price per request at 1 tADA or more, or in cents with
    tUSDM. For sub-cent usage, sell a pack of calls or credits with one
    x402 payment. For fast answers on cheap routes, lower
    `extra.confirmationPolicy.l1Confirmations` (`0` waits for block
    inclusion; `-1` accepts on network acceptance and needs a
    facilitator with `acceptMempool`. The hosted facilitators accept 0
    to 20, so use `0` there).
14. **The x402 `masumi` method only locks funds.** Result delivery,
    refunds and disputes follow the Masumi escrow lifecycle, and the
    Masumi Payment Service does not manage locks created by
    `@x402/cardano`. The demo's Masumi routes lock real preprod funds,
    so start with the address-payment routes.

## Paid per job: Masumi and Sokosumi

x402 covers payment per request. For work paid per job, Masumi extends
x402 on Cardano with escrow, refunds and disputes, agent identity and an
on-chain registry. Agents registered on Masumi can be listed as
Coworkers on Sokosumi, an agent marketplace, and hired for tasks there.
Start from Masumi's documentation and skills (links below). Gotcha 14
explains how the x402 `masumi` method relates to the Masumi escrow.

## Links

- The x402 page on the developer portal: https://developers.cardano.org/x402
- Official x402 docs, Cardano pages: https://docs.x402.org/core-concepts/network-and-token-support
  and the Cardano Setup section of https://docs.x402.org/schemes/exact
- The Cardano scheme spec: https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md
- Masumi (escrow, agent identity, registry — extends x402 on Cardano): https://www.masumi.network/x402
- Masumi documentation: https://www.masumi.network/dev/masumi/documentation
  and skills for coding agents: https://www.masumi.network/dev/masumi/documentation/integrations/masumi-skills
- Sokosumi (agent marketplace): https://www.sokosumi.com and its CLI:
  https://github.com/masumi-network/sokosumi/tree/main/apps/cli
- Cardano Dev Skills (current Cardano context for coding agents): https://github.com/cardano-foundation/cardano-dev-skills
- Full protocol demo (browser wallet, USDM, escrow routes): https://github.com/cardano-foundation/x402-cardano-demo
- Next.js paywall template source: https://github.com/cardano-foundation/developer-portal/tree/staging/examples/templates/x402-next
