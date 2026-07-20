---
id: going-to-production
title: Going to Production
sidebar_label: Going to production
description: "A checklist for taking a Cardano dApp from working on testnet to running on mainnet: testing, security, reliable transactions, optimization, and infrastructure."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Working on a testnet is not the same as being production-ready. Mainnet has real value, real users, and **irreversible** transactions. This page is a checklist for the jump: each item links to the canonical guide for that concern, so treat it as a map rather than a tutorial.

## 1. Test thoroughly

- **On-chain validators**: your validators are pure functions, so test them exhaustively with mock transactions. See [Testing](/docs/developers/curriculum/smart-contracts/testing), and use the fuzzer for property-based coverage ([Optimization](/docs/developers/curriculum/smart-contracts/advanced/optimization)).
- **Off-chain code**: test transaction building and submission too. Evolution ships unit tests, an emulator, and devnet integration tests ([Testing your off-chain code](/docs/developers/curriculum/smart-contracts/testing#testing-your-off-chain-code)).
- **Rehearse on Preprod**: Preprod mirrors mainnet (same protocol parameters and epoch length). Do a full dry run of your user flow there before mainnet. See [Networks & test ADA](/docs/developers/curriculum/start-building/networks-and-test-ada). Mainnet transactions cannot be reversed, so the burn-in happens here.

## 2. Secure it

- **Guard the vulnerability classes**: datum hijacking, double satisfaction, token forgery, resource exhaustion. See [Smart contract security](/docs/developers/curriculum/smart-contracts/security), and sharpen your eye on the [CTF](/docs/developers/curriculum/smart-contracts/advanced/security/ctf).
- **Get an audit**: for any contract holding meaningful value, a professional audit is standard practice before mainnet. Testing finds the bugs you thought of; audits find the ones you didn't. See [Audits](/docs/developers/curriculum/smart-contracts/advanced/security/audits) for the process and how to prepare.
- **Keep keys and secrets safe**: the frontend should only sign; build and submit on a backend ([frontend signs, backend submits](/docs/developers/curriculum/dapps/connect-a-wallet#frontend-signs-backend-builds-and-submits)). Never ship provider API keys in client-side code. Review [key & wallet security](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys#working-with-wallets-in-code). For backends that custody keys controlling real value, the operator cold-key playbook applies too: see the [secure transaction workflow](/docs/operators/security/secure-workflow) (build online, sign offline, submit online) and an [air-gapped environment](/docs/operators/security/air-gap).

## 3. Make transactions reliable

The most common production failure mode is a transaction rejected because an input was already spent or an indexer lagged.

- **Retry safely**: structure build → sign → submit so retries re-read chain state instead of replaying a stale UTxO. See [resilient submission](/docs/developers/curriculum/start-building/transaction-building#resilient-submission-retry-safe).
- **Chain multi-step flows**: build dependent transactions up front without waiting for confirmation between steps. See [transaction chaining](/docs/developers/curriculum/start-building/transaction-building#chaining-transactions).
- **Handle errors structurally**: distinguish recoverable (stale input, provider hiccup) from terminal (insufficient funds) failures. See [Error handling](https://github.com/IntersectMBO/evolution-sdk).

### Harden your provider

A single managed API is a single point of failure, and chatty code can hit its rate limits. Two patterns fix this, and both rest on the same idea: a **provider is a pluggable data source behind a common interface**, so you can stack or swap providers without touching transaction-building code.

- **Failover**: try the next provider when one errors, so a single outage doesn't take you down.
- **Caching**: memoize slow-changing reads (protocol parameters, asset metadata) for a short window to cut redundant calls.

How you get there differs by SDK: one ships failover as configuration, the other gives you a small interface to assemble it yourself.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

Evolution has failover **built in**. Wrap your providers in a `MultiProvider` with a **priority** strategy (try them in order) or **round-robin** (spread load), and it switches automatically on a provider error, accumulating the failures for debugging:

```typescript
// priority: try provider 1, fall through to 2 on error
const strategy = {
  type: "priority",
  providers: [
    { provider: blockfrost, priority: 1 },
    { provider: koios, priority: 2 },
  ],
}
// or spread requests evenly: { type: "round-robin", providers: [...] }
```

See the [Evolution provider docs](https://intersectmbo.github.io/evolution-sdk/docs/providers/) for wiring `MultiProvider` into a client. Pointing at your own indexer or node beyond the four built-in providers is an advanced, internal path.

</TabItem>
<TabItem value="mesh" label="Mesh">

Mesh has no built-in multi-provider, but its providers are a public `IFetcher` / `ISubmitter` interface, so failover and a cache are a few lines you write once and reuse. The same interface lets you point at a private indexer, node, or GraphQL source:

```typescript
import { IFetcher } from "@meshsdk/core";

// Failover: an IFetcher that falls through to the next provider on error
class ResilientProvider implements IFetcher {
  constructor(private providers: IFetcher[]) {}
  async fetchAddressUTxOs(address: string, asset?: string) {
    for (const p of this.providers) {
      try { return await p.fetchAddressUTxOs(address, asset); } catch { /* next */ }
    }
    throw new Error("All providers failed");
  }
  // wrap the remaining IFetcher methods (and add a TTL cache) the same way
}

const txBuilder = new MeshTxBuilder({ fetcher: new ResilientProvider([blockfrost, koios]) });
```

For the full walkthrough, see Mesh's [custom provider](https://meshjs.dev/guides/custom-provider) and [production deployment](https://meshjs.dev/guides/production-deployment) guides.

</TabItem>
</Tabs>

## 4. Optimize

- **On-chain cost (ExUnits)**: smaller, faster validators mean lower fees and more headroom under the per-transaction and per-block limits. See [Optimization](/docs/developers/curriculum/smart-contracts/advanced/optimization) and the [execution-cost model](/docs/developers/curriculum/smart-contracts/choose-a-language#what-you-pay-for-execution-costs).
- **Off-chain efficiency**: coin selection and change management affect transaction size and UTxO fragmentation. See [Performance](https://github.com/IntersectMBO/evolution-sdk).

## 5. Choose your infrastructure

Decide how your dApp will read and submit to the chain: a managed API (fastest to ship) or your own node and indexer (most control). See [Production infrastructure](/docs/developers/curriculum/production/infrastructure) for the full decision.

## 6. Smooth the on-ramp

Production also means users who may not have a wallet or any ADA. Lower the barrier:

- **Wallet-as-a-Service**: let users create a non-custodial wallet with social login ([connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet#no-browser-extension-wallet-as-a-service)).
- **Transaction sponsorship**: pay fees on behalf of users so they can transact before holding ADA ([sponsorship](https://docs.utxos.dev/sponsor)).

## Checklist

- [ ] Validators and off-chain code covered by tests; full flow rehearsed on Preprod
- [ ] Security reviewed; audit done for value-bearing contracts
- [ ] Frontend signs only; provider keys server-side
- [ ] Transactions are retry-safe; errors handled by category
- [ ] On-chain and off-chain paths optimized within limits
- [ ] Infrastructure chosen (managed vs self-hosted) and load-appropriate
- [ ] Onboarding path decided (browser wallet, WaaS, sponsorship)

## Next steps

- [Production infrastructure](/docs/developers/curriculum/production/infrastructure): pick and run your stack
- [Scaling overview](/docs/developers/curriculum/production/overview): if production load needs Hydra or batching
