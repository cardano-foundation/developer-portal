# Onboarding Design patterns — runnable examples

One self-contained project per pattern, used by the onboarding **Design patterns** section
(`docs/developers/onboarding/design-patterns/`). Each project holds the naive contract the pattern
replaces, the pattern written by hand, the same with
[`aiken-design-patterns`](https://github.com/Anastasia-Labs/aiken-design-patterns) (Merkle tree uses a
compatibility port of the standalone `aiken-merkle-tree` library), the Mesh
transaction builders, and a benchmark that measures them.

| Folder | Pattern |
|---|---|
| `tx-level-validation/` | Transaction-level validation: a withdraw-zero or minting-policy coordinator |
| `utxo-indexers/` | UTxO indexers: each input told where its output is, in the redeemer |
| `batch-indexers/` | Batch indexers: one coordinator checks a whole batch, with an index for each input's output |
| `validity-range/` | Validity range normalization: a vesting grant that reads time from one canonical form of an interval, from the transaction's window and from a period in its datum |
| `parameter-validation/` | Parameter validation: a policy that mints only into lock-ups, recognizing each by rebuilding its script hash |
| `merkelized-validator/` | Merkelized validator: purchase vouchers with delegated price computation and redemption-code validation; inline/reference comparisons, deployment costs, and a wider policy that outgrows a monolith |
| `linked-list/` | Linked list: an authenticated participant registry with local mutations and reference-input membership/absence proofs, compared with one array datum; tested advanced and nested helper examples |
| `merkle-tree/` | Merkle tree: an allowlisted grant with a SHA-256 root and off-chain membership proof, compared with a list datum; includes a documented compatibility port of `aiken-merkle-tree` |
| `merkle-patricia-trie/` | Merkle Patricia trie: an open name registry kept as a trie off-chain, with its root on-chain, compared with a list datum |

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
