---
title: "Design patterns"
sidebar_label: "Introduction"
description: "The reusable on-chain patterns Cardano protocols are built from: each one explained on its own, compared with the naive contract it replaces, measured, and shipped as tested code."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Design patterns

The onboarding lectures end with contracts that work and are ready for production. This section is about the shapes those contracts take once they hold many UTxOs, serve many users, or outgrow a single script. Production protocols on Cardano keep reusing the same few solutions to the same few problems. These solutions are **design patterns**.

Each page explains one pattern on its own. It is **not a sequence**: arrive with a problem, read the page that solves it, and leave. Pages link to each other where one pattern builds on another, but none needs another read first. Every page assumes you have finished the **[onboarding lectures](/docs/developers/onboarding/lectures/introduction)**: Beginner, Intermediate, and Advanced.

## The patterns

- **[Transaction-level validation](/docs/developers/onboarding/design-patterns/transaction-level-validation)**: spending _N_ UTxOs from one script runs the same check _N_ times. Run it once instead, with a withdraw-zero stake validator or a minting policy as the coordinator.

The section's other patterns are still being written. Until their pages exist, the **[design patterns reference](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/overview)** covers them.

## How a pattern is measured

Every pattern here trades something for something else, usually a little more code for a lot less cost, so each page measures it. Three figures matter:

- **Execution units.** Every script run uses **memory** units and **CPU** steps. A transaction has a limit on each, summed over all the scripts it runs, and a transaction over either limit is refused. A contract that is too expensive does not just cost more: past a certain size, its transaction cannot exist.
- **Size.** Every byte of a transaction, compiled scripts included, counts toward a size limit and toward the fee.
- **The fee.** It is computed from the size and the execution units, so it summarizes the other two in ADA.

**[Transaction fees](/docs/developers/curriculum/fundamentals/core-concepts/fees)** covers how they combine.

The figures on each page are measured, not estimated, and none of them is typed by hand. Each example builds its transactions on an in-memory chain with fixed inputs, runs the real compiled scripts on them, and writes the results to a `costs.json` file that the page reads. Fixed inputs give fixed numbers, so a test fails if the file drifts from the code.

## How each page is laid out

Every page follows the same outline, so after one you know where to look in the next:

1. **The problem**: a concrete situation, with a diagram of the transaction.
2. **The naive contract**: the obvious version, and what it costs.
3. **The pattern**: the idea, and the transaction with the pattern applied.
4. **Design**: the four questions from the Intermediate track.
5. **Write it by hand**: the smallest implementation, so the mechanism is visible.
6. **The same with the library**: the [`aiken-design-patterns`](https://github.com/Anastasia-Labs/aiken-design-patterns) equivalent, and what it does differently.
7. **Build the transaction**: the off-chain side.
8. **The numbers**: naive against pattern, measured.
9. **When to use it, and when not**: the trade-offs, security caveats included.
10. **Go deeper**: the reference pages, the library module, the related security pages.

## The playground {#the-playground}

Every pattern is a finished, tested project in one folder, the **playground**. Download it:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/design-patterns design-patterns
```

```
design-patterns/
└── tx-level-validation/
    ├── on-chain/aiken/
    │   ├── lib/                the check, shared by every version
    │   ├── validators/
    │   │   ├── naive.ak        the baseline the page measures against
    │   │   ├── by_hand.ak      the pattern written out
    │   │   └── with_library.ak the same with aiken-design-patterns
    │   └── plutus.json         the compiled blueprint, committed
    └── off-chain/mesh/
        ├── blueprints/         a copy of plutus.json
        ├── src/lib/            the transaction builders
        ├── src/*.test.ts       every transaction, run through the real scripts
        └── costs.json          the measured figures the page shows
```

**Each folder is a project in its own right**, and nothing in it reaches into a sibling. There is no browser app and nothing to submit: every transaction is built and evaluated offline, so you need no wallet, test ADA or provider key.

You need **[Aiken](https://aiken-lang.org/installation-instructions)** to compile and test the validators, and **[Node.js](https://nodejs.org/)** to run the off-chain code. Then, inside a pattern's folder:

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

```bash
cd on-chain/aiken
aiken check     # the validators' own tests
aiken build     # regenerate plutus.json
cp plutus.json ../../off-chain/mesh/blueprints/<pattern>.plutus.json
```

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

<Tabs groupId="offchain">
<TabItem value="mesh" label="Mesh" default>

```bash
cd off-chain/mesh
npm install
npm test        # build and evaluate every transaction, and check costs.json is current
npm run bench   # measure again and rewrite costs.json
```

</TabItem>
<TabItem value="evolution" label="Evolution">

An [Evolution](https://github.com/IntersectMBO/evolution-sdk) version is coming soon. The idea is identical, only the library calls differ.

</TabItem>
</Tabs>

Change a validator, rebuild, copy the blueprint across, and `npm test` tells you whether the figures on the page still hold. `npm run bench` updates them.

Start with whichever problem you have. If none is pressing yet, **[transaction-level validation](/docs/developers/onboarding/design-patterns/transaction-level-validation)** is the one the others most often build on.
