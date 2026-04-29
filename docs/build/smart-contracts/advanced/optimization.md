---
title: Smart Contract Optimization
sidebar_label: Contract Optimization
description: Optimization techniques and benchmarking workflow for Aiken smart contracts.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Smart Contract Optimization

> Sourced from the [Aiken team's optimization guide](https://aiken-lang.org/language-tour/optimizing-programs).

## Before Optimizing

Optimizing code can be counter-intuitive, especially in the context of smart contracts. The virtual machine and its associated cost models can be sometimes confusing and move in ways that one fails to anticipate.

Hence, before doing any optimisation work it is primordial to setup some baseline benchmarks. Those benchmarks shall cover simple and complex scenarios alike, to easily identify the impact of changes. Sometimes, a change may introduce a one-time cost that slightly increases a simple case while making a more complex scenario significantly better.

### Writing Baseline Benchmarks

A good strategy for writing baseline benchmarks is to write a simple _test_ executing one or more validator from a pre-constructed context and redeemer. This allows to get an overview that is as close as possible to a "real scenario" with a "real transaction".

For example:

```aiken
use my_validator

test baseline() {
  my_validator.main.withdraw(
    baseline_redeemer,
    baseline_credential,
    baseline_transaction,
  )
}
```

### Use `const`

Aiken constants are fully evaluated **during compilation** and **inlined** where used. It is, therefore, highly recommended to define preparatory code for benchmarks as constants. This not only allows separating fixture code from benchmark executions, but also allows measuring a cost closer to the real execution.

```aiken
const baseline_transaction: Transaction = Transaction {
  ..transaction.placeholder,
  inputs: some_inputs(3),
}

test baseline() {
  my_validator.main.withdraw(
    baseline_redeemer,
    baseline_credential,
    baseline_transaction,
  )
}
```

### Using `Fuzzer`

Fuzzers constitutes a very practical way to write fixtures. Transactions in particular can be easily created using the primitives from [`fuzz/cardano`](https://aiken-lang.github.io/stdlib/cardano/fuzz.html). For example:

```aiken
use aiken/fuzz
use cardano/fuzz as cardano

pub fn some_basic_input() -> Fuzzer<Input> {
  let output_reference <- fuzz.and_then(cardano.output_reference())
  let address <- fuzz.and_then(cardano.address())
  fuzz.constant(Input {
    output_reference,
    output: Output {
      address,
      value: min_ada_value,
      datum: NoDatum,
      reference_script: None,
    }
  })
}
```

A good rule of thumb is to start off `transaction.placeholder` from the standard library, and progressively add elements to a transaction in order to make it valid. Fuzzers are handy for elements in the transaction that can be arbitrary, while you may stick to well-known values for others.

```aiken
const transaction = Transaction {
  ..transaction.placeholder,
  inputs: [
    some_input_with_programmable_tokens(
      [(policy_programmable_token, asset_name_programmable_token, 42)],
      "programmable tokens input",
    ),
    some_input_fuel("fuel input"),
  ],
  outputs: [
    some_output_with_programmable_tokens(
      [(policy_programmable_token, asset_name_programmable_token, 28)],
    ),
    some_output_with_programmable_tokens(
      [(policy_programmable_token, asset_name_programmable_token, 14)],
    ),
    some_output_change("change output"),
  ],
}
```

### The Standard Library: Good or Bad?

Let's cover one last point before we dive in: the standard library. Should you use it? Most certainly yes. Will it harm the performances of your program? To some extend, yes. The standard library is **reasonably well optimised**, yet it is tuned for **correctness** and **ease of use**. Its main goal is to get you started and to be convenient.

Yet, it is easy to replace surgically where needed. Most functions in the standard library are standalone, easily inlinable and can be specialised. Thus it is recommended to always start with the standard library in order to write the most _obviously correct_ code and only then, think about where it could be optimised.

Many optimisations are actually domain-specific and requires intrinsic knowledge to be really effective. While still designing smart contracts, optimisations about how the code is written shouldn't be the priority (but rather, be only an architectural concern). Once your on-chain code is mostly fleshed out, it's good to take a step back and reflect on your usage of the standard lib in critical parts of your program: maybe you don't need all the genericity offere by this particular function, or maybe you can use a simpler, more direct recursive implementation of that other function.

There are few functions from the standard library that you particularly want to look for and avoid in validators. Those functions are usually only good for testing, but not so much for critical paths. These red flags are:

- `assets.{flatten, flatten_with, restricted_to}`
- `dict.{from_pairs, keys, map, values}`
- `list.{count, flat_map, map, reverse, sort, zip}`

You almost certainly never want to use any of those in validators.

## Optimization Techniques

### Fail Fast

On-chain code isn't about error handling. If something is wrong: fail. `Option` is _rarely_ something you want to use.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}]}>
  <TabItem value="dont">

  **mem=1.80K** · **cpu=501.69K**

  ```aiken
  // Be nice to transaction builders in case they provide a negative value
  let value = if datum.value <= 0 { -datum.value } else { datum.value }
  ```
  </TabItem>

  <TabItem value="do">

  **mem=1.40K** · **cpu=336.48K**

  ```aiken
  /// invariant violation: value must be non-negative
  expect datum.value >= 0
  ```
  </TabItem>
</Tabs>


### Use Simple(r) Structures

Unless it's coming from the _outside world_ (i.e. datum or redeemer), avoid constructing large records. Aiken is a language which operates directly on encoded objects (a.k.a. `Data`). This is handy when objects have been pre-constructed ahead of the script execution as it the case for datum, redeemers or the transaction itself.

Yet, constructing large records to carry context across multiple transaction elements will often come at a significant cost. So, prefer using functions with explicit arguments when you do not actually need to materialize an intermediate structure.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
  <TabItem value="dont">

  **mem=5.81M** · **cpu=19.53K**

  ```aiken
  type MultisigContext {
    owner: VerificationKeyHash,
    signatories: List<VerificationKeyHash>,
    withdrawals: Pairs<VerificationKeyHash, Lovelace>,
  }

  // NOTE: The implementation is irrelevant.
  fn verify_multisig(ctx: MultisigContext) {
    or {
      list.has(ctx.signatories, ctx.owner),
      list.any(ctx.withdrawals, fn(Pair(vk, _)) { vk == ctx.owner }),
    }
  }
  ```
  </TabItem>

  <TabItem value="do">

  **mem=3.71M** · **cpu=14.12K**

  ```aiken
  // NOTE: The implementation is irrelevant.
  fn verify_multisig(owner, signatories, withdrawals) {
    or {
      list.has(signatories, owner),
      list.any(withdrawals, fn(Pair(vk, _)) { vk == owner }),
    }
  }
  ```
  </TabItem>

  <TabItem value="bench">

  ```aiken
  test baseline_dont() {
    let ctx = MultisigContext {
      owner: baseline_owner,
      signatories: baseline_signatories,
      withdrawals: baseline_withdrawals,
    }

    verify_multisig(ctx)
  }

  test baseline_do() {
    verify_multisig(
      baseline_owner,
      baseline_signatories,
      baseline_withdrawals,
    )
  }
  ```
  </TabItem>
</Tabs>


In particular, if you can avoid it, do not construct `Value` and prefer `Dict` or `Pairs` over `Value` whenever possible.

`Value` preserves two important invariants: it does not contain assets with null quantities or policies with empty assets. If you do not rely on these invariants, you can safely go down to `Dict`.

`Dict` preserves two important invariants: their keys are in ascending orders and contain no duplicate. If you do not rely on these invariants, you can safely go down to `Pairs`


### Use Fast Recursion for Infaillible Searches

This is a more specific version of the fail fast stategy that applies to _'infaillible searches'_. This happens when looking for specific elements within a collection without any possible error recovery: if not present, then it's an error and the entire validator must fail.

Such a scenario is actually quite common in validators, especially when dealing with elements that are part of a protocol.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
  <TabItem value="dont">

  **mem=12.15K** · **cpu=3.13M**

  ```aiken
  // Repeatedly check for empty list
  pub fn has(haystack: List<a>, needle: a) -> Bool {
    when haystack is {
      [] -> False
      [head, ..tail] -> head == needle || has(tail, needle)
    }
  }
  ```
  </TabItem>


  <TabItem value="do">

  **mem=9.56K** · **cpu=2.33M**

  ```aiken
  // Fails anyway on empty list, value must be present.
  pub fn has(haystack: List<a>, needle: a) -> Bool {
    head_list(haystack) == needle || has(tail_list(haystack), needle)
  }
  ```
  </TabItem>

  <TabItem value="bench">

  ```aiken
  test baseline() {
    expect has(["alice", "bob", "carol"], "carol")
  }
  ```
  </TabItem>
</Tabs>

### Favor Binary Searches Over Linear Searches

It is quite common to have chains of multiple conditions which, when written in the most naive way can result in unnecessary evaluations. When conditions are somewhat equiprobable (i.e. there's no clear unbalance that one may be satisfied way more often than others), it may be useful to restructure and nest certain if/then/else to perform a binary search.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
  <TabItem value="dont">

  **mem=46.98K** · **cpu=12.68M**

  ```aiken
  // Linear search, not ideal.
  fn mod32(i) {
    if i < 32 { 0 }
    else if i < 64 { 1 }
    else if i < 96 { 2 }
    else if i < 128 { 3 }
    else if i < 160 { 4 }
    else if i < 192 { 5 }
    else if i < 224 { 6 }
    else { 7 }
  }
  ```
  </TabItem>

  <TabItem value="do">

  **mem=37.06K** · **cpu=9.76M**

  ```aiken
  // Binary search, more efficient and predictable.
  fn mod32(i) {
    if i < 128 {
      if i < 64 {
        if i < 32 { 0 } else { 1 }
      } else {
        if i < 96 { 2 } else { 3 }
      }
    } else {
      if i < 192 {
        if i < 160 { 4 } else { 5 }
      } else {
        if i < 224 { 6 } else { 7 }
      }
    }
  }
  ```
  </TabItem>

  <TabItem value="bench">

  ```aiken
  test baseline() {
    and {
      mod32(15) == 0,
      mod32(47) == 1,
      mod32(89) == 2,
      mod32(114) == 3,
      mod32(147) == 4,
      mod32(171) == 5,
      mod32(200) == 6,
      mod32(225) == 7,
    }
  }
  ```
  </TabItem>
</Tabs>

In this example, we branch based on the value of some integer chosen between 0 and 255. The first form evaluates each condition one after the other, resulting in a **linear search** that will average at `(n + 1) / 2` evaluations. So for `n=7`, that's an average of `4` evaluations.

The _do_ example, however, arranges the conditions to reduce the amount of evaluations done at each pass. It performs a **binary search** which results in `log2(n)` evaluations. So for `n=7`, that's an average of `3` evaluations.

Morover, the binary search has the benefit of being more **predictable**. In the previous example, it does not only average to 3 conditions evaluations, but it always evaluate 3 conditions per pass. Unlike the _don't_ example, which sometimes evaluate one condition, sometimes three, sometimes seven, etc...

### Put Cheap and Likely Checks First

When chaining conditions with `and` or `or`, order matters. Aiken short-circuits boolean operators, which means that the first satisfied branch of an `or` avoids evaluating the others, and the first failing branch of an `and` stops the rest.

So, when possible, place first the checks that are both:

1. cheaper to evaluate, and
2. more likely to determine the result (i.e. more frequently `True`)

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}]}>
<TabItem value="dont">

```aiken
or {
  input.output.value |> assets.has_nft_strict(my_nft),
  input.output.address.payment_credential != my_script_credential,
}
```
</TabItem>
<TabItem value="do">

```aiken
or {
  input.output.address.payment_credential != my_script_credential,
  input.output.value |> assets.has_nft_strict(my_nft),
}
```
</TabItem>
</Tabs>

In this example, comparing credentials is a direct and predictable check. Inspecting the value to determine whether a specific NFT is present is more involved. Since the first condition may already be sufficient to decide the whole expression, putting it first gives the runtime more opportunities to stop early.

### Defer Distinctions Until They Matter

Another common source of unnecessary work comes from splitting terminal cases too early. When several branches eventually collapse into a smaller number of "real" outcomes, it is often better to test the broader condition first and refine only when necessary.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
<TabItem value="dont">

**mem=85.04K** · **cpu=29.49M**

```aiken
fn insert_in_order(self: List<Int>, elem: Int) -> List<Int> {
  when self is {
    [] -> [elem]
    [head, ..tail] ->
      if head == elem {
        self
      } else if elem < head {
        [elem, ..self]
      } else {
        [head, ..insert_in_order(tail, elem)]
      }
  }
}
```
</TabItem>
<TabItem value="do">

**mem=72.91K** · **cpu=26.11M**

```aiken
fn insert_in_order(self: List<Int>, elem: Int) -> List<Int> {
  when self is {
    [] -> [elem]
    [head, ..tail] ->
      if elem <= head {
        if head == elem {
          self
        } else {
          [elem, ..self]
        }
      } else {
        [head, ..insert_in_order_alt(tail, elem)]
      }
  }
}
```
</TabItem>
<TabItem value="bench">

```aiken
test baseline() {
  and {
    insert_in_order([], 1) == [1],
    insert_in_order([1, 2, 3, 4, 5, 6, 7], 8) == [1, 2, 3, 4, 5, 6, 7, 8],
    insert_in_order([1, 2, 3, 5, 6], 4) == [1, 2, 3, 4, 5, 6],
    insert_in_order([1, 2, 3, 4, 5], 3) == [1, 2, 3, 4, 5],
  }
}
```
</TabItem>
</Tabs>

This is a small transformation, but it matters in tight recursive loops and in code that executes frequently over large structures.

### Prefer `Data` Equality Over Manual Structural Comparisons

Aiken programs operate over encoded `Data`, and comparing `Data` values directly is often surprisingly efficient. If two values are expected to match structurally, a raw equality check is almost always cheaper than reconstructing that logic manually.

This can be particularly helpful when working with datums that represent values or state snapshots.

The standard library already exposes useful helpers for this. For instance, [`assets.match`](https://aiken-lang.github.io/stdlib/cardano/assets.html#match) can compare a runtime `Value` against a `Data` representation while letting you parameterize how lovelace should be checked:

```aiken
pub fn match(
  left: Value,
  right: Data,
  assert_lovelace: fn(Lovelace, Lovelace) -> Bool,
) -> Bool
```

The more general lesson is that if most of a structure should remain unchanged, it is often better to compare the unchanged parts directly and isolate only the parts that are expected to vary.

For instance, a powerful optimisation pattern is to quickly split a structure into:

* the part before the variable region,
* the variable region itself,
* the part after the variable region.

You can then compare the stable regions directly through data equality and only inspect the changing part in detail.

```aiken
let input_tokens_before, input_tokens_at, input_tokens_after <- split_at(input.value, policy_id)
let output_tokens_before, output_tokens_at, output_tokens_after <- split_at(output.value, policy_id)
```

Then:

```aiken
expect and {
  (input_tokens_before == output_tokens_before)?,
  (input_tokens_after == output_tokens_after)?,
  (input_tokens_at != output_tokens_at)?,
}
```

This is often much cheaper than re-computing full semantic comparisons over complete `Value` structures.

### Use Backpassing When Returning More Than One Value

Returning large tuples or records is convenient, but it also means constructing intermediary values only to immediately destructure them again. In hot paths, that overhead can become noticeable.

Backpassing lets you thread the "continuation" directly through the function instead.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
<TabItem value="dont">

**mem=63.84K** · **cpu=19.49M**

```aiken
// Construct and de-construct a 2-tuple on each pass
pub fn count_and_sum(self: List<Int>) -> (Int, Int) {
  when self is {
    [] -> (0, 0)
    [head, ..tail] -> {
      let (count, sum) = count_and_sum(tail)
      (count + 1, sum + head)
    }
  }
}
```

</TabItem>

<TabItem value="do">

**mem=47.26K** · **cpu=12.69M**

```aiken
// Leverage back-passing to avoid needless tuple constructions
pub fn count_and_sum_ret(self: List<Int>, return: fn(Int, Int) -> result) -> result {
  when self is {
    [] -> return(0, 0)
    [head, ..tail] -> {
      let count, sum <- count_and_sum_ret(tail)
      return(count + 1, sum + head)
    }
  }
}
```
</TabItem>
<TabItem value="bench">

```aiken
test baseline_tuple() {
  expect (0, 0) = count_and_sum([])
  expect (3, 3) = count_and_sum([1, 1, 1])
  expect (5, 15) = count_and_sum([1, 2, 3, 4, 5])
  Void
}

test baseline_backpassing() {
  expect 0, 0 <- count_and_sum([])
  expect 3, 3 <- count_and_sum([1, 1, 1])
  expect 5, 15 <- count_and_sum([1, 2, 3, 4, 5])
  Void
}
```
</TabItem>
</Tabs>

This style becomes even more useful in recursive code and stateful folds. It is also the reason helpers such as `list.foldl2` and `list.foldr2` are so valuable: they allow you to accumulate multiple pieces of state without repeatedly packaging and unpackaging them.

### If Backpassing Is Not an Option, Prefer `Pair` Over 2-tuples

When you need to return exactly two values and backpassing would make the code less readable, `Pair<a, b>` is often slightly preferable to `(a, b)`.

Both are ergonomic to access:

* `pair.1st` / `tuple.1st`
* `pair.2nd` / `tuple.2nd`

But `Pair` integrates more naturally with dictionaries and pairs-based APIs, so it tends to compose better with the rest of the standard library.

This is not usually a game-changing optimisation, but it is a good default when dealing with key-value shaped data.

### Avoid Re-traversals

Traversing the same collection multiple times is one of the easiest ways to accumulate avoidable costs. In validators, collections are often not that large, but repeated passes still add up quickly.

If you need several derived values from the same list, try to compute them in one traversal.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
<TabItem value="dont">

**mem=143.78K** · **cpu=39.27M**

```aiken
fn count_all_and_filter(
  self: List<Int>,
  return: fn(Int, List<Int>) -> result,
) -> result {
  let count = list.count(self, fn(_) { True })
  let positive = list.filter(self, fn(n) { n >= 0 })
  return(count, positive)
}
```
</TabItem>
<TabItem value="do">

**mem=103.30K** · **cpu=27.79M**

```aiken
fn count_all_and_filter(
  self: List<Int>,
  return: fn(Int, List<Int>) -> result,
) -> result {
  list.foldr2(self, 0, [], fn(n, count, positive, next) {
      next(
        count + 1,
        if n >= 0 {
          [n, ..positive]
        } else {
          positive
        },
      )
    },
    return
  )
}
```
</TabItem>
<TabItem value="bench">

```aiken
test baseline() {
  expect 0, [] <- count_all_and_filter([])
  expect 1, [] <- count_all_and_filter([-1])
  expect 3, [1, 2, 3] <- count_all_and_filter([1, 2, 3])
  expect 8, [1, 3, 5, 7] <- count_all_and_filter([1, -2, 3, -4, 5, -6, 7, -8])
  Void
}
```
</TabItem>
</Tabs>

The exact shape of the fold depends on the situation, but the principle remains the same: if you already have the element in hand, do as much useful work with it as possible before moving on.

### Validate While Iterating

The same principle applies to validation. If your goal is merely to ensure that all matching elements satisfy some property, it is often unnecessary to first extract them into a separate list.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
<TabItem value="dont">

**mem=71.42K** · **cpu=20.37M**

```aiken
fn validate_outputs(self: Pairs<ByteArray, Int>) -> Void {
  let my_outputs = list.filter(self, fn(output) { output.1st == "my_address" })
  expect list.all(my_outputs, fn(output) { output.2nd >= 42 })
}
```
</TabItem>
<TabItem value="do">

**mem=59.7K** · **cpu=17.44M**

```aiken
fn validate_outputs(self: Pairs<ByteArray, Int>) -> Void {
  expect list.all(
    self,
    fn(output) { output.1st != "my_address" || output.2nd >= 42 },
  )
}
```
</TabItem>
<TabItem value="bench">

```aiken
test baseline() {
  validate_outputs([Pair("me", 42), Pair("you", 14), Pair("me", 1337)])
  validate_outputs([Pair("a", 1), Pair("b", 2), Pair("c", 3)])
  validate_outputs([Pair("me", 100), Pair("me", 100), Pair("me", 100)])
}
```
</TabItem>
</Tabs>

This form avoids building an intermediate list and often short-circuits earlier.

### Build Local Caches

Aiken functions are first-class and cheap enough to make small local caches a practical optimisation technique. When you repeatedly test membership against the same collection, you can pre-build a closure that captures the known elements.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
<TabItem value="dont">

**mem=40.79K** · **cpu=11.82M**

```aiken
// Repeatedly traverse the withdrawals for each ask
fn has_withdrawal(
  script: ScriptHash,
  withdrawals: Pairs<ScriptHash, Int>,
) -> Bool {
  list.any(withdrawals, fn(Pair(k, _)) { k == script })
}
```
</TabItem>
<TabItem value="do">

**mem=31.39K** · **cpu=8.15M**


```aiken
// Build a local cache that's faster to repeatedly call
fn new_cache(has: fn(k) -> Bool, elems: Pairs<k, Int>) -> fn(k) -> Bool {
  when elems is {
    [] -> has
    [Pair(head, _), ..tail] -> new_cache(fn(k) { head == k || has(k) }, tail)
  }
}
```
</TabItem>
<TabItem value="bench">

```aiken
const baseline_withdrawals =
  [Pair("a", 1), Pair("b", 2), Pair("c", 3), Pair("d", 4)]

test baseline_dont() {
  and {
    has_withdrawal("a", baseline_withdrawals),
    has_withdrawal("b", baseline_withdrawals),
    has_withdrawal("c", baseline_withdrawals),
    has_withdrawal("d", baseline_withdrawals),
  }
}

test baseline_do() {
  let has_withdrawal = new_cache(fn(_) { False }, baseline_withdrawals)
  and {
    has_withdrawal("a"),
    has_withdrawal("b"),
    has_withdrawal("c"),
    has_withdrawal("d"),
  }
}
```
</TabItem>
</Tabs>

Conceptually, this transforms the collection into a small decision chain that can then be reused multiple times without unpacking the original structure again and again.

This is particularly nice when the source collection is static for the whole validator execution, but queried many times.

### Unroll Recursions

When a recursive function advances one step at a time, its convergence can sometimes be improved by manually unrolling the first few steps. This reduces the number of recursive calls needed in the common case.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
<TabItem value="dont">

**mem=47.53K** · **cpu=12.74M**

```aiken
fn elem_at(elems: List<a>, at: Int) -> a {
  if at <= 0 {
    list.head(elems)
  } else {
    elem_at(list.tail(elems), at - 1)
  }
}
```
</TabItem>
<TabItem value="do">

**mem=35.01K** · **cpu=9.70M**

```aiken
fn elem_at(elems: List<a>, at: Int) -> a {
  if at >= 2 {
    elem_at(list.tail(list.tail(elems)), at - 2)
  } else {
    list.head(if at == 1 { list.tail(elems) } else { elems })
  }
}
```
</TabItem>
<TabItem value="bench">

```aiken
test baseline() {
  and {
    elem_at([1], 0) == 1,
    elem_at([1, 2, 3, 4, 5], 0) == 1,
    elem_at([1, 2, 3, 4, 5], 4) == 5,
    elem_at([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 9) == 10,
  }
}
```
</TabItem>
</Tabs>

This sort of transformation is most useful for small, performance-critical helpers that get called repeatedly.

### Write Tail-Recursive Functions

The Plutus VM usually behaves better with tail-recursive functions, especially when working with bytes and accumulators. So when you can express a function as a loop with an explicit accumulator, prefer that form.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
<TabItem value="dont">

**mem=80.36K** · **cpu=21.83M**

```aiken
fn fib(n: Int) -> Int {
  if n <= 1 { 1 }
  else { fib(n - 1) + fib(n - 2) }
}
```
</TabItem>
<TabItem value="do">

**mem=49.98K** · **cpu=12.60M**

```aiken
fn fib(n: Int) -> Int {
  do_fib(1, 1, n)
}

fn do_fib(last: Int, current: Int, n: Int) -> Int {
  if n <= 1 { current }
  else { do_fib(current, current + last, n - 1) }
}
```
</TabItem>
<TabItem value="bench">

```aiken
test baseline() {
  and {
    fib(0) == 1,
    fib(1) == 1,
    fib(2) == 2,
    fib(3) == 3,
    fib(4) == 5,
    fib(5) == 8,
  }
}
```
</TabItem>
</Tabs>

The tail-recursive version makes the control flow more explicit and typically avoids building up deferred work across calls.

This pattern is especially relevant for:

* folds,
* list traversals,
* byte processing,
* numeric loops.


### Lean More on ByteArrays

Byte arrays are extremely cheap compared to richer structured data. So, when cost is absolutely critical, one option is to give up some of the convenience of structured encodings and operate directly on bytes.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}]}>
<TabItem value="dont">

```aiken
pub type MyRedeemer {
  key: ByteArray,
  signature: ByteArray,
}

let MyRedeemer { key, signature } = redeemer
```

</TabItem>

<TabItem value="do">

```aiken
pub type MyRedeemer = ByteArray

let key = bytearray.slice(redeemer, 0, 32)
let signature = bytearray.slice(redeemer, 32, 64)
```

</TabItem> </Tabs>

This comes with obvious trade-offs:

* less self-documenting code,
* more manual slicing and offset management,
* fewer type-level guarantees.

So it should only be used when the savings are worth the loss in readability and maintainability.

### Replace Expensive Computations With Lookups

A recurring optimisation theme is that computation is often more expensive than lookup. If a function operates on a bounded domain, it may be possible to precompute all results and store them in a compact lookup structure.

For very small domains, a byte array can already act as a lookup table. The exact implementation may vary, but the technique is useful whenever:

* the input space is bounded,
* the output can be encoded compactly,
* and the computation is expensive enough to justify precomputation.

A nice example from the standard library is `math.pow2` which combines bytearray lookups and unrolling recursions for maximum efficiency:

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}, {label: 'Bench', value: 'bench'}]}>
<TabItem value="dont">

**mem=91.50K** · **cpu=25.44M**

```aiken
// Naively iterating one operand at a time
pub fn pow2(e: Int) -> Int {
  if e <= 0 {
    if e == 0 {
      1
    } else {
      0
    }
  } else {
    2 * pow2(e - 1)
  }
}
```
</TabItem>
<TabItem value="do">

**mem=25.86K** · **cpu=6.58M**

```aiken
// Unrolling the last 8 levels of recursions thanks to a bytearray lookup
pub fn pow2(e: Int) -> Int {
  if e < 8 {
    if e < 0 {
      0
    } else {
      bytearray.at(#[1, 2, 4, 8, 16, 32, 64, 128], e)
    }
  } else {
    256 * pow2(e - 8)
  }
}
```
</TabItem>
<TabItem value="bench">

```aiken
test baseline() {
  and {
    pow2(0) == 1,
    pow2(1) == 2,
    pow2(7) == 128,
    pow2(10) == 1024,
    pow2(11) == 2048,
  }
}
```
</TabItem>
</Tabs>

Notice how the small cases are handled via direct byte array lookup instead of repeated multiplication. That same idea can often be applied for small operations on integers. Even multiple array lookups (for values larger than 255 for example) may sometimes be worth considering!

### Use Merkle Patricia Forestry for Larger Registries

For larger lookup spaces, plain byte arrays are no longer enough. This is where [Merkle Patricia Forestry](https://github.com/aiken-lang/merkle-patricia-forestry) can become useful: it lets you represent arbitrarily large key-value registries with very cheap membership checks on-chain.

So instead of:

```aiken
let y = expensive_function(x)
```

you can sometimes do:

```aiken
expect mpf.member(y, root)
```

where `root` is the precomputed authenticated structure committed off-chain.

The general pattern is:

1. compute a large registry off-chain,
2. commit its root on-chain,
3. pass proofs or queried values through the redeemer,
4. verify membership instead of recomputing.

This is especially attractive for deterministic but expensive (>1% of the total execution budget) functions over bounded domains.

### Don't Compute, Verify

This brings us to a broader principle: validators do not always need to perform a computation from scratch. Very often, it is enough to verify that a value provided by the transaction is correct.

<Tabs groupId="optimization" defaultValue="dont" values={[{label: "Don't", value: 'dont'}, {label: 'Do', value: 'do'}]}>
<TabItem value="dont">

**mem=55.79K** · **cpu=18.16M**

```aiken
math.sqrt(123456789) == Some(11111)
```
</TabItem>
<TabItem value="do">

**mem=1.00K** · **cpu=0.22M**

```aiken
math.is_sqrt(123456789, 11111)
```
</TabItem>
</Tabs>

Redeemers are perfect for this. They can carry precomputed candidate values, witnesses, proofs, or decompositions, and the validator only needs to check that they are valid.

This is **one of the most important optimisation patterns** in on-chain programming: move work off-chain whenever correctness can still be verified cheaply on-chain.

### Leverage Ledger Invariants

A final optimisation technique is not really about code shape, but about knowing the ledger well enough to rely on its guarantees.

Many structures that validators inspect already satisfy strong invariants. For example:

* inputs are alphabetically ordered,
* values are ordered by policy and asset name,
* redeemers and datums are indexed by hashes,
* output values never contain negative quantities,
* output values always include ADA.
* minted values never include ADA.
* etc...

These are not merely convenient facts; they are often the key to writing much cheaper algorithms.

If you know a structure is already sorted, you can merge or compare it linearly instead of re-sorting it. If you know quantities cannot be negative, you can avoid defensive normalization logic. If you know a map has no duplicate keys, you can use more direct traversal strategies.

The most effective optimisations are often not "clever code tricks", but code that aligns tightly with invariants already guaranteed by the ledger.

## Closing Thoughts

Most optimisation work in Aiken follows a few recurring themes:

* fail early instead of recovering,
* avoid reconstructing rich structures unnecessarily,
* traverse collections as few times as possible,
* replace computation by lookup when practical,
* replace computation by verification whenever possible,
* and lean on the invariants the ledger already gives you.

A good workflow is usually:

1. write the simplest obviously correct validator,
2. benchmark it end-to-end,
3. identify the actual hot paths,
4. optimise only those parts,
5. re-benchmark after every significant change.
