# x402 Express Starter

The minimal starting point for agentic commerce on Cardano: a **seller** (an
API that charges 2 tADA per request via x402) and a **buyer** (an agent that
pays for it), talking through a facilitator on **Cardano preprod**. Around
60 lines each — read them, then replace the example route with your idea.

```text
buyer ── GET /api/message ──────────────► seller
buyer ◄─ 402 + payment requirements ───── seller
buyer:   builds + signs a Cardano tx (pays amount + network fee)
buyer ── GET + PAYMENT-SIGNATURE ───────► seller ──► facilitator /verify + /settle ──► chain
buyer ◄─ 200 + resource + receipt ─────── seller
```

## Quickstart

1. **Install**: `npm install` (Node 20+)
2. **Wallet**: `npm run wallet` — copy the `MNEMONIC=` line into `.env`
   (start from `cp .env.example .env`), fund the printed address at the
   [preprod faucet](https://docs.cardano.org/cardano-testnets/tools/faucet).
3. **Blockfrost**: free preprod project id at [blockfrost.io](https://blockfrost.io)
   → `BLOCKFROST_PROJECT_ID` in `.env`. Set `SELLER_ADDRESS` to any preprod
   address you control (the wallet script's address works).
4. **Facilitator**: set `FACILITATOR_URL` (see below).
5. **Run**: `npm run demo` — starts the seller, the buyer pays it, the
   terminal shows the receipt and an explorer link. Expect 20–60 seconds for
   on-chain confirmation.

`npm run seller` and `npm run buyer` run the two halves separately.

## Facilitator

The facilitator verifies and settles payments so neither seller nor buyer
needs chain infrastructure beyond Blockfrost. It holds no keys and no funds.

- **Hackathon**: use the hosted facilitator URL announced by the Cardano
  Foundation.
- **Local / offline**: `npm run facilitator` — this repo includes a minimal
  one (`src/facilitator.ts`, ~100 lines) built on `@x402/cardano`'s own
  facilitator scheme; it needs only your `BLOCKFROST_PROJECT_ID`. Keep
  `FACILITATOR_URL=http://localhost:4022` and run it in a second terminal
  (or let `npm run demo` talk to whichever facilitator the env points at).
  It binds `127.0.0.1`, so only your machine can reach it; set
  `FACILITATOR_HOST=0.0.0.0` only to share one with your team deliberately
  (every request spends your Blockfrost quota).

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Seller answers 500 with "no supported payment kinds" | The facilitator isn't reachable at `FACILITATOR_URL` — start one (`npm run facilitator` in a second terminal) or fix the URL |
| Buyer prints `Payment failed: HTTP 402` | The payment was attempted and rejected — the reason (`invalidReason`) is in the facilitator's log output |
| Buyer hangs ~1 min then fails | Wallet not funded yet, or faucet still pending — check the address on <https://preprod.cardanoscan.io> |
| `verify` fails with HTTP 200 and `isValid: false` | Normal shape for a rejected payment — read `invalidReason`; it is not a transport error |
| Amount errors on tiny prices | Pure-lovelace prices must clear the ~1 ADA min-UTxO; keep lovelace routes ≥ ~1.5 tADA |
| Spend-control rejection | lovelace is not USD-pegged; the buyer allows it via `allowedAssets` — keep that block if you change assets |
| Long waits after payment | 1 confirmation ≈ 20–60s on preprod; that is the chain, not a bug |

## Package versions

The x402 packages come straight from npm, pinned exactly at **2.26.0**
(content freeze for the hackathon — the x402 release train ships weekly, and
a version range would change what participants install mid-event). To bump
later: check `npm view @x402/cardano version`, update the six `@x402/*`
versions in `package.json`, and rerun `npm install`.

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
- The seller stays keyless (an address is all it holds). Move the
  buyer's mnemonic from `.env` to a secret store and keep its spend
  ceiling on.

## Going further

- The full protocol tour (browser wallet, USDM route, Masumi escrow, a
  visual step-by-step UI): [x402-cardano-demo](https://github.com/cardano-foundation/x402-cardano-demo)
- The Cardano scheme specification: [scheme_exact_cardano.md](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md)
- What x402 is: <https://www.x402.org> · Masumi (agent identity, discovery,
  escrow on Cardano): <https://www.masumi.network/x402>
