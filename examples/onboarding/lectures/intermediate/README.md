# Onboarding Intermediate — lock &amp; unlock a validator

A minimal end-to-end smart contract used by the onboarding **Intermediate** lectures: a spend validator
that locks funds and only releases them to the **owner** named in the datum, proven by a signature.
It's small but a real access-control pattern (the datum is public; the lock is a signature, not a
secret), and a complete on-chain + off-chain example you can run.

Get just this folder (no need to clone the whole repo):

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/lectures/intermediate intermediate
cd intermediate
```

## On-chain (Aiken)

The validator lives in `on-chain/aiken/validators/lock.ak`. The compiled blueprint `plutus.json` is
**committed** (and copied into `off-chain/mesh/`), so you don't need Aiken to run the off-chain code.
To re-check or recompile it:

```bash
cd on-chain/aiken
aiken check    # compile + run the inline tests
aiken build    # regenerate plutus.json
cp plutus.json ../../off-chain/mesh/plutus.json
```

## Off-chain (Mesh) + browser playground

```bash
cd off-chain/mesh
npm install
cp .env.example .env     # paste your Blockfrost Preview key
npm run dev
```

Open the printed URL in the browser where **Lace** (on the **Preview** network, with a little test ADA)
is installed, then: connect → set up collateral → **Lock** funds (you're the owner) → **Unlock** them
(you sign). Each transaction prints an explorer link.

`npm run typecheck` type-checks the off-chain code against the real Mesh types.
