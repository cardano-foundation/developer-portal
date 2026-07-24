# Onboarding lecture snippets (Mesh)

Small, self-contained [Mesh](https://meshsdk.dev/) snippets used by the lectures. Each snippet is wrapped in `// #region NAME` … `// #endregion NAME` markers so the docs import the exact code shown here, the same pattern the Tutorial uses.

Get just this folder (no need to clone the whole repo):

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/lectures/mesh send-ada
cd send-ada
```

The snippets run in the **browser** with a connected wallet (CIP-30), so there is no offline test to run; instead `npm test` type-checks them against the real Mesh types so they stay valid:

```bash
npm install
npm test
```

## Run it in the browser

A tiny page (`index.html` + `src/app.ts`) wires the snippets to a button so you can actually connect a wallet and submit a transaction. You need [Lace](https://www.lace.io/) on the **Preview** network with a little test ADA.

```bash
npm run dev
```

Open the printed URL in the browser where Lace lives, then click the button. The "send 1 ADA to yourself" example prints an explorer link so you can see the transaction on-chain.
