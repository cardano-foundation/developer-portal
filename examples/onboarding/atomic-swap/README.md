# Atomic Swap (onboarding example)

Runnable, tested code behind the onboarding **Quick Start** ([First E2E DApp](https://developers.cardano.org/docs/developers/onboarding/quick-start/overview)).

This is a scaffold. Today it holds a minimal, dependency-free off-chain draft
(`build-tx.ts`) so the code-import mechanism is proven end to end. It will grow into the full
Atomic Swap: an Aiken on-chain validator, MeshJS off-chain code, and a frontend.

## Why the code lives here

The onboarding docs **import** these files rather than pasting snippets, so the code a reader sees
is the exact code that CI runs. That keeps lessons from silently drifting out of date as libraries
and the chain evolve. See `examples/README.md` and issue #1886.

## Run

```bash
npm install
npm test
```

## Structure

- `build-tx.ts` — pure, deterministic off-chain swap draft (imported into the docs).
- `build-tx.test.ts` — unit test proving the file is real, runnable code (the future CI hook).
