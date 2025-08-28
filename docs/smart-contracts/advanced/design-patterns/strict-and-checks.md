---
id: strict-and-checks
title: Strict `&&` Checks
sidebar_label: Strict `&&` Checks
description: Predictable compilation outcomes, producing code devoid of extraneous `force` and `delay` expressions.
---

## Introduction

In the realm of Cardano smart contracts, the offchain component plays a pivotal role. These
components are essentially pure functions that evaluate based on transaction-related details fed as
parameters. Typically, the implementation of these checks follows a two-step process:

1. **Data Acquisition**: This step is centered around parsing arguments provided and selecting the
   necessary values required for subsequent validation.
2. **Condition Evaluation**: Here, the values obtained from the first step are utilized to assess
   the stipulated conditions.

A common practice in writing this part of the code is represented as:

```ts
  ...
  check1 && check2 && check3
  ...
```

## The Problem

Although Haskell inherently operates under lazy semantics, a notable shift occurs when validator
code is compiled to UPLC (Untyped Plutus Core), which adheres to strict evaluation principles. For a
validator to pass, it is imperative that all conditions are met successfully. However, certain
language compilers, in an attempt to mimic Haskell's lazy evaluation, end up introducing superfluous
`force` and `delay` operations into the generated UPLC code.

Consider the following illustration where a Haskell code segment akin to the one above could be
translated into this UPLC code by some compilers:

```ts
  Force (Force (
    Builtins.IfTheElse
      check1
      (Delay Builtins.IfThenElse
               check2
               (Delay check3)
               (con False)
      )
      (con False)
  ))
```

Although this representation is semantically accurate, it poses efficiency issues, particularly in
successful (fully evaluated) scenarios. The optimization of evaluating validator functions is
crucial, especially in the context of successful transactions, as no transaction costs are incurred
when a validator fails, but costs do apply when it passes.

## The Solution

Given the inconsistent implementation of the boolean binary operator `&&` across various languages
like Plutus, Plutarch, and Aiken, we propose a dual-operation set in this library. This set is
designed to ensure predictable compilation outcomes, producing code devoid of extraneous `force` and
`delay` expressions. Additionally, it includes an alternate operation set that does incorporate
these expressions, catering to scenarios where such behavior is desirable for debugging or other
specific purposes.

## Conclusion

In conclusion, this library addresses a critical aspect of Cardano smart contract development by
offering a reliable solution to a common problem encountered during the compilation process. By
providing a clear and predictable way to handle boolean operations, we enhance the efficiency and
reliability of smart contract execution on the Cardano blockchain. This approach not only optimizes
transaction costs but also simplifies the development process, allowing developers to focus more on
the functional aspects of their smart contracts rather than getting entangled in the intricacies of
compilation semantics.
