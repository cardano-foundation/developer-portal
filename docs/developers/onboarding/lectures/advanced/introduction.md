---
title: "Advanced: production-ready smart contracts"
sidebar_label: "Introduction"
description: "From a contract that works to a contract that is ready: how attackers think, the limits every transaction has to fit under, guarantees checked against generated transactions, and a deployment you can trust and watch."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Advanced: production-ready smart contracts

You finished Intermediate, so you can take an idea, design a contract, write it, test it and drive it from a browser. This track is about whether it is **ready**: whether it still does what you meant when the person building the transaction wants it to do something else, and whether it fits in a transaction the chain accepts.

## What you'll be able to do

- Think as an attacker before you write a contract, and again before you deploy it.
- Recognise the attacks that reach a validator, and know which handbook page has the full treatment of each.
- Write an attack as a test, so a contract carries the proof that its door is closed.
- Measure what a validator costs, and know the four levels where it can be made cheaper.
- Recognise the design patterns production protocols are built from, and when each one is worth its cost.
- Check every guarantee a contract makes against generated transactions, and know when an audit or a formal proof is worth it.
- Choose the infrastructure under an app, from a hosted provider to your own node, and handle a rollback.
- Deploy a contract and its app, write the deployment down, and watch it once it is live.

## The lectures

1. **[Detecting vulnerabilities](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities)**: the five goals an attacker has, attacks that fit in one transaction, attacks that take several, and three contracts whose doors you find and close: a gift card shop, a shared pot and a vault.
2. **[Optimization](/docs/developers/onboarding/lectures/advanced/optimization)**: the three limits a transaction has to fit under, how to measure what a validator costs, the four levels where it can be made cheaper, and an atomic swap you make cheaper three times.
3. **[Design patterns](/docs/developers/onboarding/lectures/advanced/design-patterns/introduction)**: the reusable shapes production protocols take as they grow, one pattern per page, each compared with the naive contract it replaces and measured. Read them in any order.
4. **[Higher assurance](/docs/developers/onboarding/lectures/advanced/higher-assurance)**: guarantees written as property tests, the weaker fixes they catch that unit tests miss, and what an audit and a formal proof add.
5. **[Going to production](/docs/developers/onboarding/lectures/advanced/going-to-production)**: the infrastructure under an app (hosted providers, when to run your own, custom pipelines), rollbacks, deploying the contract and the app, monitoring, and planning for a fix. You take the Intermediate oracle to Preprod and put its page on Vercel or Cloudflare.

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

Install it from the **[Aiken installation guide](https://aiken-lang.org/installation-instructions)** if it is not on your machine any more. The examples need v1.1.24 or newer, and `aiken --version` shows the version you have.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

## The example project {#the-example-project}

The finished code for every exercise, the contract as first written and each version that closes a door or takes a cost out:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/lectures/advanced advanced
```

Each contract has its own folder, and the lecture that uses it says which. Start with **[Detecting vulnerabilities](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities)**.
