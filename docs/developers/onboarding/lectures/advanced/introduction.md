---
title: "Advanced: production-ready smart contracts"
sidebar_label: "Introduction"
description: "From a contract that works to a contract that is ready: how attackers think, the attacks that reach a validator, and the three limits every transaction has to fit under."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Advanced: production-ready smart contracts

You finished Intermediate, so you can take an idea, design a contract, write it, test it and drive it from a browser. This track is about whether it is **ready**: whether it still does what you meant when the person building the transaction wants it to do something else, and whether it fits in a transaction the chain accepts.

## What you'll be able to do

- Think as an attacker before you write a contract, and again before you deploy it.
- Recognise the attacks that reach a validator, and know which handbook page has the full treatment of each.
- Write an attack as a test, so a contract carries the proof that its door is closed.
- Measure what a validator costs, and know the three places to make it cheaper.

## The lectures

1. **[Detecting vulnerabilities](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities)**: the five goals an attacker has, attacks that fit in one transaction, attacks that take several, and a gift card shop with two doors you find and close.
2. **[Optimization](/docs/developers/onboarding/lectures/advanced/optimization)**: the three limits a transaction has to fit under, how to measure what a validator costs, and a payout queue you make cheaper three times.

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

Install it from the **[Aiken installation guide](https://aiken-lang.org/installation-instructions)** if it is not on your machine any more.

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
