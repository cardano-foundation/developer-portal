# x402 on Cardano — context for coding agents

Hackathon track context: "Agentic Commerce" at TOKEN2049 Origins 2026.
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

## Track facts

- Network: **Cardano preprod only** (`cardano:preprod`). No mainnet.
- Packages: all `@x402/*` packages pinned **exactly 2.26.0** (content
  freeze for the event — do not upgrade mid-hackathon).
- Recommended asset: **tADA** (`asset: "lovelace"`, amounts in lovelace,
  1 ADA = 1,000,000 lovelace). For cent-level prices use **tUSDM**
  (preprod USDM, 6 decimals, unit constant `USDM_PREPROD_ASSET` in
  `@x402/cardano`); self-serve claim at https://tusdm.moneta.global.
- The facilitator verifies and settles payments. It holds no keys and no
  funds; the client pays the network fee. The hosted facilitator URL is
  announced at the Oct 6 morning session — until then run the local one.

## The starter template

Scaffold:

    npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/x402-express my-app
    cd my-app && npm install

Files (~290 lines total):

- `src/seller.ts` (64 lines) — Express API charging 2 tADA per request
  via x402. Replace its route with your idea.
- `src/buyer.ts` (73 lines) — the paying agent: gets the 402, builds and
  signs a real Cardano tx, retries with `PAYMENT-SIGNATURE`.
- `src/facilitator.ts` (97 lines) — minimal local facilitator on port
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
- `npm run facilitator` starts the same minimal local facilitator;
  `npm run dev` serves on port 3002. `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID`
  ships the id to the browser — preprod keys only, never a mainnet key.

`.env` (from `cp .env.example .env`):

    FACILITATOR_URL=http://localhost:4022   # hosted URL announced before the event
    SELLER_ADDRESS=addr_test1...            # receives the payment
    SELLER_PORT=4021
    MNEMONIC=...                            # from npm run wallet, funded
    BLOCKFROST_PROJECT_ID=preprod...        # free at blockfrost.io

## The payment flow

    buyer ── GET /api/message ──────────────► seller
    buyer ◄─ 402 + payment requirements ───── seller
    buyer:   builds + signs a Cardano tx (pays amount + network fee)
    buyer ── GET + PAYMENT-SIGNATURE ───────► seller ──► facilitator /verify + /settle ──► chain
    buyer ◄─ 200 + resource + receipt ─────── seller

A successful `npm run demo` prints `402 Payment Required`, then
`200 OK` after 30–60s, then a receipt with a tx hash checkable at
preprod.cardanoscan.io.

## The APIs the starter actually uses

- `@x402/express`: `paymentMiddleware`, `x402ResourceServer` — turn an
  Express route into a paid route.
- `@x402/fetch`: `x402Client`, `wrapFetchWithPayment`, `x402HTTPClient`
  — a fetch that pays 402s automatically.
- `@x402/cardano`: `toClientCardanoSigner`, `toFacilitatorCardanoSigner`
  (mnemonic + Blockfrost → signer).
- `@x402/cardano/exact/client|server|facilitator`: `ExactCardanoScheme`
  — register per side with `client.register("cardano:*", new ExactCardanoScheme(signer))`.
- `@x402/core/types|server|facilitator`: shared types,
  `HTTPFacilitatorClient`, `x402Facilitator`.

## Gotchas (each one is a real failure mode)

1. **Spend controls reject lovelace by default** (it is not USD-pegged).
   The buyer must allow it explicitly:
   `new x402Client().setSpendControls({ allowedAssets: [{ network: "cardano:*", asset: "lovelace" }] })`.
   Keep that block if you change assets.
2. **Min-UTxO**: pure-lovelace prices below ~1 ADA are invalid on
   Cardano. Keep lovelace prices ≥ ~1.5 tADA (the starter charges
   2 tADA = `"2000000"` lovelace).
3. **`isValid: false` arrives as HTTP 200** from the facilitator's
   /verify — read `invalidReason`. 4xx/5xx means transport trouble, not
   a rejected payment.
4. **Confirmation takes 20–60 seconds** on preprod (one on-chain
   confirmation). That is the chain, not a bug — don't add retries
   around it.
5. **Seller answers 500 "no supported payment kinds"** → the facilitator
   isn't reachable at `FACILITATOR_URL`; start one (`npm run
   facilitator`) or fix the URL.
6. **Buyer hangs then fails** → wallet not funded yet; check the address
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

## Judging (what the output must include)

Working prototype on preprod · open-source repo with docs · demo video
(max 3 min) · short write-up · **at least one x402 payment on preprod
through the provided facilitator** — proof is a tx hash.

## Links

- Track hub (live, updated through the event): https://developers.cardano.org/x402
- Official x402 docs, Cardano pages: https://docs.x402.org/core-concepts/network-and-token-support
  and the Cardano Setup section of https://docs.x402.org/schemes/exact
- The Cardano scheme spec: https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md
- Masumi (escrow, agent identity, registry — extends x402 on Cardano): https://www.masumi.network/x402
- Full protocol demo (browser wallet, USDM, escrow routes): https://github.com/cardano-foundation/x402-cardano-demo
- Next.js paywall template source: https://github.com/cardano-foundation/developer-portal/tree/staging/examples/templates/x402-next
