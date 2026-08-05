# Atomic Swap (onboarding example)

The runnable, tested code behind the onboarding **Quick Start** ([Build an Atomic Swap](https://developers.cardano.org/docs/developers/onboarding/quick-start/overview)). Two people exchange tokens in a single transaction, either both sides of the trade happen, or neither does.

## The scenario

**Bob** has GOLD and wants SILVER; **Alice** has SILVER and wants GOLD.

1. Bob (maker) **locks** his GOLD at the swap contract with a datum: `{ owner: Bob, price: [5 SILVER] }`.
2. Alice (taker) **swaps** in one transaction she pays 5 SILVER to Bob and takes the GOLD. The validator only allows it if Bob is paid the price, in an output **marked with the locked UTxO's reference** (so one payment can't settle two swaps).
3. If nobody takes it, Bob can **cancel** and reclaim his GOLD.

## Structure

```
on-chain/
  aiken/       the swap validator + a minting policy, in Aiken (with `aiken check` tests)
  scalus/      reserved, a Scala implementation, coming soon
off-chain/
  mesh/        the off-chain code (src/lib) + headless tests + a simple Vite + React frontend, with Mesh
  evolution/   reserved, an Evolution (Lucid) implementation, coming soon
```

The docs import code directly from these files, so what you read is what is tested. Each off-chain option is a self-contained app so the same lesson can be followed with different tools.

## Run it

### On-chain (Aiken)

```bash
cd on-chain/aiken
aiken check      # run the validator tests
aiken build      # regenerate plutus.json (the compiled blueprint)
```

`plutus.json` is committed and copied into `off-chain/mesh/`, so you don't need Aiken to run the off-chain code. Re-copy it after `aiken build` if you change the contract: `cp on-chain/aiken/plutus.json off-chain/mesh/plutus.json`.

### Off-chain (Mesh) — tests

Tests run the whole flow (mint, lock, fetch, swap) against an in-memory chain, no node, no network, and evaluate the Plutus scripts to prove on-chain and off-chain agree.

```bash
cd off-chain/mesh
npm install
npm test
```

### Frontend

```bash
cd off-chain/mesh
cp .env.example .env.local   # add a Blockfrost (or Maestro) Preview key
npm install
npm run dev
```

Connect a wallet (Lace) on the Preview network, mint a token, list an offer, and swap. See [Environment](https://developers.cardano.org/docs/developers/onboarding/quick-start/environment) for wallet, testnet, faucet, and provider setup.

## Prior art

The contract design (Lock / Swap / Cancel, and the output-reference marking that prevents double-satisfaction) follows [`rober-m/atomic-swap`](https://github.com/rober-m/atomic-swap).
