---
id: formal-verification
title: Formal Verification
sidebar_label: Formal verification
description: Formal verification for Cardano smart contracts, proving correctness with tools like Blaster.
image: /img/og/og-developer-portal.png
---

## Introduction

[Testing](/docs/developers/curriculum/smart-contracts/testing) shows a validator works on the cases you tried; **formal verification** proves it holds for all of them. For high-value contracts, machine-checked proofs of correctness are the strongest guarantee you can give.

## Blaster

[Blaster](https://github.com/input-output-hk/Lean-blaster) is proof automation for [Lean 4](https://lean-lang.org/): you hand it a theorem and it returns a proof, or a counterexample that shows why it is wrong. It simplifies the goal through a series of algebraic rewriting passes, emits a minimal SMT-Lib query, and discharges it with an SMT solver, so you can close goals with a single `blaster` tactic instead of writing proofs by hand.

:::info In active development
Blaster is under active development and not yet generally available. You can track progress and follow the documentation at the [Lean-blaster repository](https://github.com/input-output-hk/Lean-blaster). This page will be expanded as the tooling matures.
:::
