---
title: "Off-chain and frontend integration"
sidebar_label: "Frontend integration"
description: "The off-chain half of a contract: deriving its address, building the transactions that lock and unlock, proving them offline, and wiring the whole thing to a wallet in the browser."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import extractRegion from "@site/src/utils/extractRegion";
import Blueprint from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/src/lib/blueprint.ts";
import Datum from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/src/lib/datum.ts";
import LockLib from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/src/lib/lock.ts";
import UnlockLib from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/src/lib/unlock.ts";
import FetchLib from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/src/lib/fetch.ts";
import MintLib from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/src/lib/mint.ts";
import OfflineTests from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/src/vault.test.ts";
import Minimal from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/src/app.tsx";
import VercelFn from "!!raw-loader!@site/examples/onboarding/lectures/intermediate/vault/off-chain/mesh/api/blockfrost/[...path].ts";

# Off-chain and frontend integration

Your contract is finished. It compiles, its eight tests pass, and it has a hash. And it can do nothing at all, because **a contract cannot act**.

That something is your app, and this lecture is the whole of it. **[On-chain vs off-chain](/docs/developers/onboarding/lectures/intermediate/on-chain-vs-off-chain)** drew the line at the start of this track and left the `off-chain/` folder empty. Everything on that side of the line arrives here. By the end you will have a page in a browser with a **Connect wallet** button, a **Lock** button and an **Unlock** button, driving the vault you wrote.

It arrives all at once for a reason. The contract is where the thinking is, and it changed with every lecture: a datum, a rule, a parameter, a second purpose. The off-chain half barely changes at all. It is the same few builders every time: derive the address, attach the datum, spend the UTxO. Writing them against a contract that has stopped moving is far easier than rewriting them six times as the contract grows.

**You write all of it.** Six files carry a Cardano idea: the address, the datum, and the four transactions your page sends. The rest is the page, its config, and the tests that prove the whole thing before a wallet is ever connected.

## The bridge: from blueprint to address

The off-chain side starts from `plutus.json`, the file your compiler wrote. It holds the compiled validator. Filling in its parameter finishes the script, and hashing the finished script gives the **address**. **[Parameters](/docs/developers/onboarding/lectures/intermediate/parameters#why-a-parameter-changes-the-address)** drew that chain and promised you the two lines of code at the end of it. You write them below, in the first file you create.

Deriving the address is not a deployment. The address exists because the contract exists, so you could work it out on a computer that has never been online, and anyone with the same contract and the same parameter arrives at the same address.

## Lock, then unlock

Locking is an ordinary payment that happens to be addressed to a script, with the datum attached to the output, exactly as **[what a validator is](/docs/developers/onboarding/lectures/intermediate/what-is-a-validator#locking-is-just-a-payment)** described. **Unlocking is where the contract runs.** That transaction still carries everything a plain payment does, its inputs, outputs, fee, signatures and validity window, and it carries four things a plain payment never needs:

- the **script** itself, because the network cannot run a program it has not been given.
- the **redeemer**, because the validator has to be told which action you are taking.
- a **required signer** entry, because the rule reads the signer list and this is what puts you on it.
- **collateral**, a deposit the network keeps if the script fails after passing its checks.

Your wallet signing a transaction is not the same as your key hash appearing in the transaction's required-signers field. That field is `extra_signatories`, the one your vault reads in **[the transaction context](/docs/developers/onboarding/lectures/intermediate/transaction-context)**, and asking for it is a separate step from signing. Forget it and the signature is there but the validator cannot see it, so a correct contract refuses a legitimate spend.

Minting adds nothing conceptually. The token has a policy script of its own, and its hash is the policy id, from **[validator purposes](/docs/developers/onboarding/lectures/intermediate/validator-purposes)**. Minting does add collateral, because it runs a script, and a plain lock does not.

## Collateral, and what a script costs

Collateral is a deposit the network takes only when a script fails after passing structural checks. The rules are in **[fees](/docs/developers/curriculum/fundamentals/core-concepts/fees#collateral)** and the two-phase model behind them is in **[transaction failures](/docs/developers/curriculum/start-building/transaction-failures#the-two-phase-model)**. Three things about it are specific to what you are building:

- It must hold **only ADA**, and it must sit at a **plain key address** with no script guarding it. Otherwise the network would need to run a second script just to collect the deposit.
- **In normal use it is never taken**, because the validator runs before you send anything. In the tests below that happens on your own machine. In the page, the job goes to the **provider**, the service that reads the chain for you, which is Blockfrost here.
- This is the first project whose **code** reads the chain, which is why it needs a Blockfrost key when the Beginner track never did. The builder resolves inputs and fee settings through the provider, and the check before you send asks it to run your script as well.

:::tip Set collateral once and forget it
In **[Lace](https://www.lace.io/)** this is a one-time setup that sets a few ADA aside. See the [Lace FAQ](https://www.lace.io/faq). The ADA is still yours and still counted in your balance, only reserved. Without it, every script spend you build fails before it leaves your machine, with a "no collateral" error.
:::

Unlocking also costs more than locking, because it runs a program and that is priced separately in **[execution units](/docs/developers/curriculum/fundamentals/core-concepts/fees#script-execution-fees)**. Our vault is about as small as a contract can be, so here the difference is a fraction of a test ADA.

## The browser half

Every builder below ends the same way: it returns an **unsigned transaction**, which the **wallet** signs and submits. Your code never sees a key. That division is [CIP-30](/docs/developers/curriculum/dapps/connect-a-wallet#what-cip-30-gives-you), the interface every Cardano wallet exposes to a page, which is why an app written for one wallet works with the rest.

The wallet signs an unlock **partially**: it signs the inputs it owns and leaves the rest alone. One of those inputs is the locked UTxO, and it sits at a script address, where no key can sign for anything. Whether it may be spent is the validator's decision, made when the network runs it.

## The browser cannot keep a secret

For the first half of this lecture your Blockfrost key sits in `.env`, and that is safe, because everything reading it runs on your own machine. A browser app is the opposite. Everything it needs in order to run has to be **sent to the person using it**, and anything sent can be read. There is no private part of a page, so a key written into that JavaScript is published.

Vite, the build tool that serves and bundles your page, draws that line for you: **your page can only read variables whose names start with `VITE_`, and whatever it reads is written into the files it ships.** Everything else in `.env` stays on your machine, where the backend can still read it, and never reaches the browser at all. That is why your key is never given the prefix, and why the network id is.

So the key has to live somewhere the browser never reaches: a small **proxy**, running on a machine you control, holds it and is the only thing that talks to Blockfrost. The full version of that split, where transaction building moves server-side too, is **[frontend signs, backend builds and submits](/docs/developers/curriculum/dapps/connect-a-wallet#frontend-signs-backend-builds-and-submits)**. Here only the provider calls move, which is enough to protect the key.

## The whole flow, end to end

```mermaid
sequenceDiagram
    participant App as Your app<br/>(the browser, no secrets)
    participant Back as Your proxy<br/>(holds the Blockfrost key)
    participant W as The wallet<br/>(browser extension)
    participant Net as Network
    participant Vault as The vault's address<br/>(no wallet, no keys, no owner)
    App->>App: derive the address from the blueprint
    App->>W: here is an unsigned payment of 5 ADA,<br/>with a datum naming the owner
    W->>Net: signed, submitted
    Net->>Vault: payment valid, the 5 ADA now sits here
    Note over Vault: the validator has not run yet
    App->>Back: what is locked at that address?
    Back->>Net: the same question, with the key attached
    Net-->>App: one UTxO, and the datum on it
    App->>App: build a spend of that UTxO: script,<br/>redeemer, required signer, collateral
    App->>Back: would this script pass, and what will it cost?
    Back-->>App: yes, and here is its budget
    App->>W: here is an unsigned spend
    W->>Net: signed (partially), submitted
    Net->>Net: run the validator: is the datum's owner<br/>among the transaction's signers?
    Net-->>W: yes
    Vault->>App: the 5 ADA comes back
```

## Try it

**Fill `off-chain/`.** You have been inside `on-chain/vault/` since **[set up your tools](/docs/developers/onboarding/lectures/intermediate/tools)**. From there, go up two levels to the workspace root:

```bash
cd ../..    # from cardano-vault/on-chain/vault/ back to cardano-vault/
```

That is the last folder change in the track. Every command from here runs from `cardano-vault/`.

<Tabs groupId="offchain">
<TabItem value="mesh" label="Mesh" default>

### 1. The app project

You need **[Node.js](https://nodejs.org/) 22.18 or newer**, because from that version it runs TypeScript files directly, with no build step.

```bash
npm init -y
npm pkg set type=module
npm install @meshsdk/core@^1.9.1 @meshsdk/core-csl@^1.9.1 @meshsdk/wallet@^1.9.1
mkdir off-chain/src off-chain/src/lib
```

The SDK project is just a `package.json`. `npm pkg set type=module` switches it to modern `import` syntax, which the SDK uses. Of the three packages, `@meshsdk/core` is Mesh itself, `@meshsdk/core-csl` is the **evaluator** that runs a compiled validator on your own machine, and `@meshsdk/wallet` is a wallet that signs without a browser.

Note where that `package.json` landed: the **workspace root**, not inside `off-chain/`. `npm` acts on the folder holding `package.json`, and `node` looks there for the packages it installed.

One more file, so your editor understands the code you are about to write. Create `tsconfig.json` beside `package.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "types": ["node", "vite/client"]
  },
  "include": ["off-chain/src"]
}
```

`skipLibCheck` stops TypeScript checking Mesh's own dependencies and reporting errors from libraries you never imported. `types` brings in Node's globals, which the tests need, and Vite's, which is what makes `import.meta.env` a known thing. `resolveJsonModule` lets you import `plutus.json`. And `allowImportingTsExtensions` is what lets your imports say `./lib/lock.ts`, extension and all, the way Node runs them.

### 2. From blueprint to address

The first file you write, and the bridge the top of this lecture describes. Create `off-chain/src/lib/blueprint.ts`:

<CodeBlock language="ts" title="off-chain/src/lib/blueprint.ts">
  {extractRegion(Blueprint, "file")}
</CodeBlock>

Four things in it:

- **The import path** reaches across into the other half of your workspace: from `off-chain/src/lib/` that is `"../../../on-chain/vault/plutus.json"`. This is the only place the two halves of your workspace touch, and it is a file, not a network call.
- **The title** `vault.vault.spend` is `<file>.<validator>.<purpose>`, so it names your `vault.ak`, its `vault` validator, and its spend handler.
- **`applyParamsToScript`** fills the blank from **[parameters](/docs/developers/onboarding/lectures/intermediate/parameters)**. These are the two lines that lecture promised you.
- **`ADMIN`** is that parameter, and it decides the address. Any 56-character hex string works, which is 28 bytes written out.

:::caution Changing ADMIN moves the vault
It is part of the script, so it is part of the hash, so it is part of the address. Lock funds with one value, change a single character, and your app will look for them somewhere else entirely and find nothing. The funds are not lost, they are at the old address, but you would have to put the old value back to reach them.
:::

### 3. The datum and the redeemers

The shapes from **[datum & redeemer](/docs/developers/onboarding/lectures/intermediate/datum-and-redeemer)**, now built from the other side. Create `off-chain/src/lib/datum.ts`:

<CodeBlock language="ts" title="off-chain/src/lib/datum.ts">
  {extractRegion(Datum, "file")}
</CodeBlock>

`mConStr0` names a constructor by number, which is how a type reaches a validator: by the position it was declared in, not by its name. `mConStr0([ownerPubKeyHash])` is constructor 0 carrying one field, which is the `VaultDatum { owner }` your validator expects. `mConStr0([])` is constructor 0 carrying nothing, which is `Unlock`. And `mConStr1([])` is constructor 1, which is `AdminUnlock`, because it is declared second in `VaultAction`.

### 4. The four transactions

These are the whole off-chain half: lock funds, find them again, unlock them, and mint the vault's own token. First `off-chain/src/lib/lock.ts`:

<CodeBlock language="ts" title="off-chain/src/lib/lock.ts">
  {extractRegion(LockLib, "file")}
</CodeBlock>

An ordinary payment, with two additions. `deserializeAddress(...).pubKeyHash` pulls your key hash out of your address, which is what goes in the datum, and `.txOutInlineDatumValue(...)` attaches that datum to the output. No script, no collateral, no redeemer: the contract does not run when you lock.

Then `off-chain/src/lib/unlock.ts`, which is where the contract does run:

<CodeBlock language="ts" title="off-chain/src/lib/unlock.ts">
  {extractRegion(UnlockLib, "file")}
</CodeBlock>

The four things a script spend adds each get a line. `.txInScript` carries the compiled contract, `.txInRedeemerValue` says which action you are taking, `.txInCollateral` offers the deposit, and `.requiredSignerHash(owner)` is the one people forget: it puts your key hash in `extra_signatories`, which is the list your validator actually reads.

The rest say what is being spent. `.spendingPlutusScriptV3()` declares that this input is guarded by a script, `.txIn(...)` names the locked UTxO, and `.txInInlineDatumPresent()` says its datum is already on the chain, so there is nothing to attach.

Passing an **evaluator** makes the builder run your **real compiled validator** before it returns anything. A spend the contract would refuse fails here, immediately, instead of on the chain where it would cost you the collateral.

Next `off-chain/src/lib/fetch.ts`, because you cannot unlock what you cannot find. A script address is an ordinary address, so this is the same [UTxO query](/docs/developers/curriculum/start-building/query-the-chain#datums) you have made since Beginner:

<CodeBlock language="ts" title="off-chain/src/lib/fetch.ts">
  {extractRegion(FetchLib, "file")}
</CodeBlock>

**The vault's address is not yours.** Anyone who compiled the same contract with the same parameter arrives at the same address, so what sits there is everyone's UTxOs mixed together. The only thing that says which are yours is the `owner` in each datum, which is exactly what your validator will check later.

Last `off-chain/src/lib/mint.ts`, which is `lock.ts` plus the mint from **[validator purposes](/docs/developers/onboarding/lectures/intermediate/validator-purposes)**, in one transaction:

<CodeBlock language="ts" title="off-chain/src/lib/mint.ts">
  {extractRegion(MintLib, "file")}
</CodeBlock>

`vaultTokenPolicyId()` hashes the policy script, the second one in your blueprint, so the value it returns has nothing to do with the vault's address. Two scripts run in this transaction: `.mintingScript(...)` carries the policy so the network can ask it about the token, and the output goes to `vaultAddress(...)`.

### 5. Prove it offline

**[Testing](/docs/developers/onboarding/lectures/intermediate/testing)** named a third level of testing it could not reach, because there was no app to test. There is now, and it needs no network.

Create `off-chain/src/vault.test.ts`. The imports first:

<CodeBlock language="ts" title="off-chain/src/vault.test.ts">
  {extractRegion(OfflineTests, "offline-imports")}
</CodeBlock>

Then a pretend chain and a wallet to go with it. `OfflineFetcher` is an in-memory chain you fill in yourself, and `MeshWallet` is a wallet built from a seed phrase rather than an extension. The cost-model lines are housekeeping: a pretend chain has none, and handing over the same defaults the builder would fall back to keeps the output clean:

<CodeBlock language="ts" title="off-chain/src/vault.test.ts">
  {extractRegion(OfflineTests, "offline-setup")}
</CodeBlock>

Then a few helpers for putting UTxOs on that chain. A real chain hands you a transaction hash; here you invent one, because nothing was ever submitted:

<CodeBlock language="ts" title="off-chain/src/vault.test.ts">
  {extractRegion(OfflineTests, "offline-helpers")}
</CodeBlock>

Now the first test. Locking runs no contract, so this one only has to build:

<CodeBlock language="ts" title="off-chain/src/vault.test.ts">
  {extractRegion(OfflineTests, "offline-lock")}
</CodeBlock>

And the second. It calls the very same `buildUnlockTx` your page will call, then evaluates it, which runs your **real compiled validator**. Getting an execution budget back means the contract said yes:

<CodeBlock language="ts" title="off-chain/src/vault.test.ts">
  {extractRegion(OfflineTests, "offline-unlock")}
</CodeBlock>

Run it:

```bash
node --test off-chain/src/vault.test.ts
```

Two tests, two passes, in a few milliseconds. Node runs the TypeScript directly.

Node prints one warning above that, about importing a WebAssembly module. It comes from Mesh loading the library that serialises transactions, and it is safe to ignore.

**Now break the off-chain side, and watch which layer notices.** In `off-chain/src/lib/unlock.ts`, delete the `.requiredSignerHash(owner)` line and save.

Your contract is untouched, and its eight tests would still pass, because nothing is wrong with the rule.

Run the test file again. It fails, in the same few milliseconds, and the evaluator reports which script did the refusing:

```
"tag":"spend","errorMessage":"the validator crashed / exited prematurely"
```

That `"tag":"spend"` says the refusal came from the spend validator, not from a transaction that failed to build. It cost milliseconds and no test ADA. On the network you would have had to lock funds first and wait for that transaction to settle before you could even attempt the unlock that fails.

Put the line back and run it once more to be sure.

### 6. The key, and where it lives

So the key gets its own file, which the page never reads.

First a `.env` file at the top of `cardano-vault/`, beside `package.json`, so no key is ever written into your code:

```bash title=".env"
BLOCKFROST_API_KEY=previewYourKeyHere
VITE_NETWORK_ID=0
```

- `BLOCKFROST_API_KEY` your Preview **project id**, from your project's page on [blockfrost.io](https://blockfrost.io/). It starts with `preview`.
- `VITE_NETWORK_ID` `0` for a test network, which is Preview here, and `1` for mainnet. This is the one that carries the `VITE_` prefix, for the reason the section above gives: the page needs it, and it is not a secret.

Nothing in this track puts `cardano-vault/` into version control, but the day you do, add `.env` to a `.gitignore` **before** the first commit. A key in a commit is a key you have given away, even if you delete it in the next one.

What reads it is a **proxy**: a rule that catches every call your page makes to `/api/blockfrost/…`, adds the key, and passes the call on to Blockfrost. Your page therefore only ever talks to its own origin.

### 7. The page, and run it

The last piece: a browser, a wallet and a user.

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript vite-plugin-node-polyfills @types/react @types/react-dom
npm pkg set scripts.dev=vite
npm pkg set scripts.build="vite build"
```

`vite` is the dev server, and the `build` script is there for the last exercise in this lecture. `typescript` and the `@types/` packages are what your `tsconfig.json` from step 1 has been describing; nothing here runs `tsc`. `vite-plugin-node-polyfills` is there because Mesh reaches for Node built-ins like `Buffer` and `crypto`, which a browser does not have.

Two small files Vite needs, and they are the only ones whose paths depend on where things sit in your workspace. `index.html` goes at the top of `cardano-vault/`, beside `package.json`, because Vite serves the folder you run it from:

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My vault</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/off-chain/src/app.tsx"></script>
  </body>
</html>
```

And `vite.config.ts` beside it, which carries the proxy rule from the step before:

```ts title="vite.config.ts"
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  // Read `.env` here, in Node. Nothing in this file reaches the browser.
  const env = loadEnv(mode, process.cwd(), "");
  const key = env.BLOCKFROST_API_KEY ?? "";

  const proxy = {
    "/api/blockfrost": {
      target: `https://cardano-${key.slice(0, 7)}.blockfrost.io/api/v0`,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api\/blockfrost/, ""),
      headers: { project_id: key },
    },
  };

  return {
    plugins: [
      react(),
      nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
    ],
    server: { proxy },
    preview: { proxy },
  };
});
```

`target` is where the calls really go, `rewrite` strips the `/api/blockfrost` prefix your page uses, `headers` attaches the key, and `changeOrigin` makes the request look like it came from Blockfrost's own host. The network comes from the key itself: a Blockfrost key names its own network in its first seven characters, which is why one variable configures both.

:::note Where this rule still applies once you deploy
It depends on what the host runs. On anything with a **Node process**, a container, a VPS, or a service that runs `npm run preview`, this same config serves the built page and proxies exactly as it does locally. On a **static host**, which is what Vercel and Netlify give a Vite app by default, there is no Node process: the page is served from a CDN and nothing answers `/api/blockfrost/…`.

A redirect will not rescue the static case, because it passes the browser's headers along and cannot add your key. What has to stay true is the shape: the browser calls your own origin, and something you control attaches the key.
:::

**If you deploy it to Vercel**, that something is one file. Put it at `api/blockfrost/[...path].ts`, set `BLOCKFROST_API_KEY` in the project's environment variables, and change nothing else. Your page still calls `/api/blockfrost/…`, and Vercel routes it here instead of to Vite:

<CodeBlock language="ts" title="api/blockfrost/[...path].ts">
  {extractRegion(VercelFn, "file")}
</CodeBlock>

It is the same four decisions as the config. Returning `fetch(...)` straight out passes the status and body through untouched. The forwarding itself is portable, since it is plain `Request` in, `Response` out, but each host wants its own entry point: Netlify Edge Functions expect the file under `netlify/edge-functions/`, and Cloudflare Workers export `{ fetch }` and read secrets from an `env` argument rather than `process.env`.

**And none of `off-chain/src/lib/` changes here.** Until now a `MeshWallet` built from a seed phrase satisfied the `IWallet` argument your builders take. A browser wallet satisfies exactly the same one, which is why those builders were typed against the interface Mesh defines rather than against a particular wallet.

So the last file you write is the page. Create `off-chain/src/app.tsx`:

<CodeBlock language="tsx" title="off-chain/src/app.tsx">
  {extractRegion(Minimal, "file")}
</CodeBlock>

Look at the provider line first, because it is the entire client-side cost of keeping the key out of the browser:

```ts
const provider = new BlockfrostProvider("/api/blockfrost");
```

No key, and no change anywhere else. Mesh supports this directly: hand `BlockfrostProvider` a path instead of a project id and it treats it as a privately hosted Blockfrost, which is exactly what yours now is. Those builders take a `provider` instead of creating one of their own, so nothing in them had to move.

Three more things in it are the browser section above, in code:

- `BrowserWallet.enable("lace")` is the permission handshake. Swapping `"lace"` for another wallet id is the only change another wallet needs.
- `wallet.signTx(unsignedTx, true)` is the **partial** signature. Drop that `true` on the unlock and the wallet refuses, because you are asking it to sign a script input it holds no key for.
- `buildUnlockTx(wallet, provider, utxo, provider)` passes `provider` twice on purpose. The first is the **fetcher**, for looking things up; the second is the **evaluator**, which runs your contract before you send it.

Start it:

```bash
npm run dev
```

Open the printed URL **in the browser where Lace is installed**, with Lace set to Preview and collateral already set. Then, in order:

1. **Connect wallet.** The extension asks for permission once.
2. **Lock 5 ADA.** Approve it. This is the plain payment: no contract runs.
3. **Refresh locked** after a few seconds, and your UTxO appears.
4. **Unlock.** This one runs your validator. The funds come back.
5. **Mint & lock 5 ADA.** The same lock, plus a TOKEN A minted under the policy you wrote, in one transaction. **Refresh locked** and unlock it the same way: the token comes back with the ADA.

If the page loads but **Lock** fails, look at `.env` before anything else. A Preview key starts with `preview`, and a mainnet or mistyped key shows up as a 401 on `/api/blockfrost/…` in the browser's **Network** tab.

**Then prove the key is gone.** Open the developer tools, go to the **Network** tab, and press **Refresh locked**. Every request goes to `/api/blockfrost/…` on your own origin, and none to `blockfrost.io`. The browser cannot reach the provider, because it has nothing to authenticate with.

Now check the code that goes to the browser, which is the part that would have been public:

```bash
npm run build
```

Then search `dist/` for your key. It is not there. Without the proxy it would have been, sitting in `dist/assets/index-*.js`, where anyone who opened your page could have read it. Search for the bare word `preview` instead and you will get hits, but those are Mesh's own network names, not your key.

**And notice which rules applied where.** Your proxy reads the key straight out of `.env` and that is correct: it runs on your machine, for you. The page goes to anyone who opens it, so it gets none of it. The only thing that decides which rules apply is **where the code runs**.

**Then break it on purpose, one last time.** You already watched the offline tests catch a missing `.requiredSignerHash(owner)`. Delete that line again and press **Unlock** here. Nothing reaches the chain: the check before sending, where your proxy asks Blockfrost to run the script, already said no. The owner's key was never in `extra_signatories`, so `list.has` was false. Same refusal, same rule, now with a wallet connected and real test ADA at stake. Put the line back.

</TabItem>
<TabItem value="evolution" label="Evolution">

An [Evolution](https://github.com/IntersectMBO/evolution-sdk) version is coming soon. The idea is identical, only the library calls differ.

</TabItem>
</Tabs>

Stuck? The finished code is in the playground. See the **[introduction](/docs/developers/onboarding/lectures/intermediate/introduction#the-playground)**.

## What you built

You started with an empty folder. You now have a contract you wrote and tested, a minting policy beside it, and an app that locks, mints and unlocks real test ADA through them.

Six lectures went into the contract, and every one of them added something to it. One went into the app, because its shape never changed: derive the address, build a transaction, hand it to a wallet.

Each of the remaining lectures is the same shape with a different rule in the middle:

- **Handling time**: funds that cannot move before a date.
- **Multi validators**: a token that acts as a key, where burning it is what opens the lock.
- **Modifying state**: data that is updated instead of released.
- **Reference inputs & scripts**: one contract reading another's data.

## Go deeper

- [Lock and Spend](/docs/developers/curriculum/smart-contracts/lock-and-spend): the same two transactions, using more of what the SDK offers.
- [Query the chain](/docs/developers/curriculum/start-building/query-the-chain): providers, and reading datums back out.
- [Use a provider](/docs/developers/curriculum/production/use-a-provider): keys, quotas and what to do when one goes down.
- [Local testing](/docs/developers/curriculum/start-building/local-testing): an in-memory emulator or a private devnet to build against, instead of Preview.
- [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet): CIP-30 in full, and the backend-builds pattern this lecture starts.
- [Going to production](/docs/developers/curriculum/production/going-to-production): the rest of the checklist this is one line of.
- [Optimization](/docs/developers/curriculum/smart-contracts/advanced/optimization): keeping execution units, and therefore fees, down.

Next: **Handling time: vesting**.
