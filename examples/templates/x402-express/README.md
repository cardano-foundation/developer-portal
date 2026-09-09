# x402-cardano-starter

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

## When `@x402/cardano` is on npm

This starter currently vendors the freshly merged x402 packages as tarballs
in `vendor/` (the merge landed 2026-09-09; the npm publish is pending). Once
`npm view @x402/cardano version` resolves:

1. In `package.json`, replace the five `file:vendor/...` dependencies with
   registry versions (`"@x402/cardano": "^2"` etc.).
2. Delete `vendor/` and rerun `npm install`.

Nothing in `src/` changes.

## Going further

- The full protocol tour (browser wallet, USDM route, Masumi escrow, a
  visual step-by-step UI): [x402-cardano-demo](https://github.com/Kammerlo/x402-cardano-demo)
- The Cardano scheme specification: [scheme_exact_cardano.md](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md)
- What x402 is: <https://www.x402.org> · Masumi (agent identity, discovery,
  escrow on Cardano): <https://www.masumi.network/x402>
