---
title: "Advanced: production-ready smart contracts"
sidebar_label: "Introduction"
description: "From a contract that works to a contract that is safe: how attackers think, the attacks that reach a validator, and the tests that prove a door is closed."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Advanced: production-ready smart contracts

You finished Intermediate, so you can take an idea, design a contract, write it, test it and drive it from a browser. This track is about whether it is **safe**: whether it still does what you meant when the person building the transaction wants it to do something else.

## What you'll be able to do

- Think as an attacker before you write a contract, and again before you deploy it.
- Recognise the attacks that reach a validator, and know which handbook page has the full treatment of each.
- Write an attack as a test, so a contract carries the proof that its door is closed.

## The lectures

1. **[Detecting vulnerabilities](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities)**: the five goals an attacker has, attacks that fit in one transaction, attacks that take several, and a gift card shop with two doors you find and close.

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

Install it from the **[Aiken installation guide](https://aiken-lang.org/installation-instructions)** if it is not on your machine any more.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

## The example project {#the-example-project}

The finished code for every exercise, the contract as first written and each version that closes a door:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/lectures/advanced advanced
```

Each contract has its own folder, and the lecture that uses it says which. Start with **[Detecting vulnerabilities](/docs/developers/onboarding/lectures/advanced/detecting-vulnerabilities)**.
