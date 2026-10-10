# Onboarding Design patterns — runnable examples

One self-contained project per pattern, used by the onboarding **Design patterns** section
(`docs/developers/onboarding/design-patterns/`). Each project holds the naive contract the pattern
replaces, the pattern written by hand, the same with
[`aiken-design-patterns`](https://github.com/Anastasia-Labs/aiken-design-patterns), the Mesh
transaction builders, and a benchmark that measures them.

| Folder | Pattern |
|---|---|
| `tx-level-validation/` | Transaction-level validation: a withdraw-zero or minting-policy coordinator |

Get just this folder (no need to clone the whole repo):

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/design-patterns design-patterns
cd design-patterns/<pattern>
```

## On-chain (Aiken)

The compiled blueprint `plutus.json` is **committed** (and copied into `off-chain/mesh/blueprints/`), so
you don't need Aiken to run the off-chain code. To re-check or recompile it:

```bash
cd on-chain/aiken
aiken check    # compile + run the inline tests
aiken build    # regenerate plutus.json
cp plutus.json ../../off-chain/mesh/blueprints/<pattern>.plutus.json
```

## Off-chain (Mesh) and the benchmark

Everything runs offline, against an in-memory chain: no wallet, no provider key, nothing submitted.

```bash
cd off-chain/mesh
npm install
npm test         # build and evaluate every transaction, and fail if costs.json is stale
npm run bench    # measure again and rewrite costs.json
npm run typecheck
```

`costs.json` is **committed**: the docs page reads its figures from it. After changing a validator or a
transaction builder, run `npm run bench` and commit the result.
