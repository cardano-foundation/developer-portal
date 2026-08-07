---
id: security
title: Smart Contract Security
sidebar_label: Security
description: How Cardano's eUTXO model neutralizes whole classes of attacks, the vulnerabilities you still have to guard against, and the patterns that keep validators safe.
---

Smart contract bugs are uniquely dangerous: deployed validators are immutable and they often guard significant value, so a single vulnerability can mean irreversible loss of funds. For web2 developers, the shift is stark: a bug here isn't an embarrassing hotfix, it's a permanent financial loss in an adversarial environment where anyone in the world can attempt the exploit.

The good news: Cardano's [eUTXO model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo) eliminates several of the worst attack classes by design. The rest you handle with careful validator logic and established patterns. This page covers what the platform protects you from, what it doesn't, and how to write validators that hold up.

> Network-level threats (51%, long-range, eclipse attacks) target consensus, not your contract. Cardano's Ouroboros protocol defends against those. See [Consensus & Ouroboros](/docs/developers/curriculum/fundamentals/consensus-and-ouroboros). The rest of this page is about application-level security.

Your security instincts transfer directly:

- **Reentrancy is like CSRF**: an action triggered at an unexpected point because origin/state wasn't verified. Cardano eliminates it structurally, the way `SameSite` cookies and CSRF tokens address it on the web.
- **Datum hijacking is like SQL injection**: manipulated input data changes the meaning of an operation. Both are prevented by validating all data at the boundary; never trust that it's well-formed or authorized.
- **Double satisfaction is like IDOR (insecure direct object reference)**: referencing someone else's resource to satisfy your own check. Prevention requires ensuring the resource you validate actually belongs to you.
- **Audits are like penetration testing**: you'd pen-test a web app before launch; you audit a contract before mainnet. The irreversibility makes it even more critical.
- **Formal verification is type systems on steroids**: not just "is this a number?" but "can this balance ever go negative?", proven for all inputs.

## What the eUTXO model protects you from

### Reentrancy is impossible

The **reentrancy attack** is the most famous smart contract vulnerability, responsible for the 2016 DAO hack that drained tens of millions of dollars in ETH. In Ethereum's account model, a contract can call another contract, which can call back into the original before the first call finishes, exploiting state that hasn't been updated yet.

**Cardano is structurally immune.** In the eUTXO model a transaction is a complete, atomic unit. A validator runs once per input, deciding whether that UTXO can be spent under the given conditions. There is no notion of a contract "calling" another contract mid-execution. The whole transaction, all inputs, outputs, and script runs, is validated as one unit: everything succeeds or everything fails. There is no mid-execution state for a reentrant call to exploit.

### Double-spending is prevented at the protocol level

The ledger tracks every unspent output and removes it the instant it's consumed, so any second attempt to spend the same output is structurally invalid.

```mermaid
graph TD
    UTXO_A["UTXO_A: 1,000 ADA (unspent)"] --> TX1["Transaction 1:\nspends UTXO_A"]
    TX1 --> UTXO_C["UTXO_C: 800 ADA (new)"]
    TX1 --> UTXO_D["UTXO_D: 200 ADA (new)"]
    UTXO_A -.->|"attempt to spend again"| TX2["Transaction 2:\nREJECTED"]
    TX2 -.->|"UTXO_A no longer exists"| FAIL[Invalid transaction]
```

This is simpler and more robust than the account model, where double-spend prevention relies on nonce tracking and careful state management. Here it's structural, not procedural.

### Determinism removes MEV levers

On Ethereum a transaction's outcome depends on global state at execution time, which can differ from construction time: the root of **MEV** (Maximal Extractable Value), where block producers profit by reordering, inserting, or censoring transactions.

On Cardano, transaction outcomes are [fully deterministic](/docs/developers/curriculum/smart-contracts/overview#deterministic-validation). A transaction names its exact inputs and outputs; if those inputs still exist when it reaches the chain, it executes exactly as built, otherwise it simply fails: no partial execution, no surprise. This removes entire categories of front-running and MEV attacks.

### Native assets share the ledger's security

On Ethereum, tokens are smart contracts (ERC-20), and every token contract is its own attack surface. On Cardano, [native assets](/docs/developers/curriculum/native-tokens/overview) are handled by the ledger itself and share ADA's guarantees. The minting policy controls creation, but once tokens exist there is no token contract to exploit.

## Vulnerabilities you still have to guard against

The platform removes some attacks; the rest are your responsibility. These are the big ones, each has a deep-dive in the [vulnerability reference](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/overview).

### Datum hijacking

Occurs when a script output doesn't properly validate the datum attached to it, letting an attacker substitute a malicious datum that changes ownership or another critical field in the continuing UTXO.

```text
Normal flow:
  Input UTXO:  [Script Address, Datum: {owner: "Alice", amount: 100}]
  Output UTXO: [Script Address, Datum: {owner: "Alice", amount: 80}]   (Alice withdrew 20)

Attack:
  Input UTXO:  [Script Address, Datum: {owner: "Alice", amount: 100}]
  Output UTXO: [Script Address, Datum: {owner: "Attacker", amount: 100}]  (owner changed!)
```

**Prevention**: explicitly check that the output datum meets all expected constraints: immutable fields (like ownership) unchanged, mutable fields (like balances) changed only per the allowed rules, and the datum structure matching the expected schema. See [arbitrary datum](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/unchecked-inputs#arbitrary-datum).

### Double satisfaction

Occurs when a single output satisfies the conditions of *multiple* validators in the same transaction, letting an attacker fulfill two scripts' requirements with one output instead of two.

```text
Script A (DEX pool):  "valid if an output contains 100 USDx"
Script B (lending):   "valid if an output contains 100 USDx"

Attacker's transaction:
  Inputs:  DEX pool UTXO (A), lending pool UTXO (B)
  Outputs: ONE output with 100 USDx

  Both A and B see the 100 USDx output and consider themselves satisfied,
  but only one output exists. The attacker pays once for two obligations.
```

**Prevention**: tag outputs with a unique identifier (a state/beacon token) and validate that *your specific* output exists, rather than that "some output" meets the condition. See [double satisfaction](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/double-satisfaction).

### Token forgery

A carelessly written minting policy can let an attacker mint unauthorized tokens: missing authorization checks, a "one-time" NFT policy that can actually run twice, or unvalidated policy parameters. The correct one-shot pattern ties minting to consuming a specific UTXO, which can never exist again:

```text
Policy: "minting allowed ONLY if this specific UTXO is consumed as input"

  Tx 1 (mint):     Inputs: [UTXO_Unique_123]   Mints: [1 MyNFT]   <- UTXO consumed
  Tx 2 (re-mint):  Inputs: [???]               Mints: [1 MyNFT]   <- FAILS, UTXO gone
```

See [token security](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/token-security) and [other token name](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/unchecked-inputs#other-token-name).

### Resource exhaustion

Validators have [ExUnits budgets](/docs/developers/curriculum/smart-contracts/choose-a-language#what-you-pay-for-execution-costs). An attacker can craft transactions that approach the limits, creating denial-of-service conditions for a protocol. Be conscious of worst-case execution cost; use parameterized scripts, bound loop iterations, and pre-compute expensive work off-chain. See [unbounded inputs](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion#unbounded-inputs) and related entries.

### Locked value

Not every failure is an exploit. **Locked value** is a design where funds become permanently stuck in a UTXO with no way to spend them, the on-chain equivalent of burning them.

Sometimes that is intentional: an untamperable UTXO can serve as a single, provable source of truth that no one, including its creator, can alter. The question is whether the value it traps is worth that guarantee. In Mesh's [Plutus NFT example](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/plutus-nft/locked-value) only about 2 ADA stays locked in the oracle UTXO, an acceptable tradeoff rather than a bug. Weigh the economics before adopting a design that locks value: how much is trapped, and what the permanence buys you.

## Common security patterns

Experienced Cardano developers reach for the same defensive patterns:

- **State / beacon token**: require a unique NFT (minted with a one-time policy) in every UTXO at a script address. This prevents rogue UTXOs at the address and solves double satisfaction.
- **Value-preservation check**: explicitly verify that total value in script outputs equals the expected value (inputs minus authorized withdrawals plus authorized deposits). Never rely on implicit preservation.
- **Datum-continuity validation**: when a script UTXO continues (is consumed and recreated with updated state), validate *every* field of the output datum against the transition rules. Never assume the datum is correct just because it's present.
- **Deadline enforcement**: use the transaction's [validity range](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/time-handling) for time-based conditions; it's checked at the protocol level, giving reliable time bounds.
- **Minimal on-chain logic**: every line of on-chain code is potential attack surface. Keep validators small and focused; move complex logic off-chain and check only the critical invariants.

## Practice on a real target: the CTF

The best way to internalize these is to attack them. The [Smart Contract CTF](/docs/developers/curriculum/smart-contracts/security/ctf) is an interactive Capture-the-Flag where you exploit deliberately vulnerable validators: the fastest way to develop an attacker's eye for your own code.

## Verification: testing, PBT, and audits

Defense in depth, from cheapest to strongest:

- **Unit tests** find the bugs you thought of. See [Testing](/docs/developers/curriculum/smart-contracts/testing).
- **Property-based testing** generates thousands of random inputs against invariants like "no transaction can extract more value than was deposited" or "only the owner can withdraw", catching edge cases you'd never enumerate by hand.
- **Audits** by specialized firms are standard practice before mainnet for any contract holding real value.
- **Formal verification** proves a property holds for *all* inputs, not just the ones you tried.

The last two are detailed below.

### Audits

Testing and property-based checks find the bugs you thought of; an audit is where people whose job is to break contracts look for the ones you didn't. On Cardano the stakes are high in a specific way: a script's address *is* the hash of its compiled code, so a deployed validator cannot be changed. A protocol can be designed to evolve, by migrating users to a new script address or by delegating logic to a script hash it reads from state it controls, but that has to be built in before launch, not added after a bug. The security model resembles hardware more than software: once a faulty component ships, recalling it can be very difficult or impossible.

#### What an audit checks

A vulnerable validator can lead to money being stolen from the protocol or its users, protocol-only tokens being leaked, funds becoming permanently locked, or the protocol being stalled by a denial-of-service under the UTxO model. An audit exists to catch those outcomes before they happen: auditors confirm the contract behaves as intended, is resistant to malicious exploitation, and protects user funds. Because Cardano contracts often coordinate several UTxOs and scripts in one transaction, much of the work is reasoning about subtle interactions between components, exactly where the [vulnerabilities in this catalog](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/overview) tend to hide.

#### How to prepare

The single biggest lever you control is how ready the codebase is when the auditors arrive. Time they spend reconstructing what the protocol is supposed to do is time not spent finding bugs. Provide:

- **A specification of intended behavior, independent of the code.** State the use cases, the assumptions and invariants, and the expected interactions between contracts. Without a spec that is separate from the implementation, auditors cannot tell intentional behavior from a bug, they only see what the code does, not what it should do.
- **A runnable test suite** covering the core on-chain logic with unit tests, realistic transaction flows with property-based or scenario tests, and edge cases (minimum-ADA boundaries, unexpected datum values). Auditors verify behavior by writing and modifying tests, so a suite they can run and extend lets them explore quickly.
- **A reproducible build.** Simple, documented steps to compile and deploy, so an auditor can make a small change to the on-chain code and run a test against it. This matters most when investigating a complex vulnerability.

The length of the first phase is roughly inversely proportional to the quality of this material. Shortening it is in your interest: every hour saved there is an hour available for deeper analysis.

#### The process

An audit usually runs in four phases.

```mermaid
graph LR
    A[Understand<br/>the codebase] --> B[Security<br/>analysis]
    B --> C[Prepare<br/>the report]
    C --> D[Review<br/>the fixes]
    style A fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style B fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    style C fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    style D fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
```

1. **Understand the codebase.** Auditors study the documentation and the code until they know how the protocol is intended to work and how it works under the hood, and confirm the test suite runs. This is where good preparation pays off.
2. **Security analysis.** They first check whether the common vulnerability classes apply to this code, writing tests to confirm each finding (a vulnerability is considered confirmed once a test demonstrates it), then move to protocol-design issues, the mathematical assumptions behind incentives and fees, and the parameters used to instantiate the contracts on-chain. Confirmed issues are communicated as they are found, though it is sometimes better to hold a fix until the whole picture is clear, since vulnerabilities can combine and a complete view often leads to a simpler, more efficient fix.
3. **Prepare the report.** Findings are compiled into a report: a summary of each issue with suggested fixes, plus context, disclaimers, and a description of each issue type. By this point most issues have already been raised informally with the team.
4. **Review the fixes.** After the team addresses the issues, the auditors verify each fix is the suggested one or equally effective and introduces no new problems, and record the outcome of every issue. Only then is the report final and ready to share publicly.

#### Certification standards

Cardano has a community standard for how audits are conducted and certified: **[CIP-52 (Cardano Audit Best Practice Guidelines)](https://cips.cardano.org/cip/CIP-52)**. It defines three assurance levels a project can target:

- **Level 1**: automated tooling and static analysis.
- **Level 2**: a manual audit by an independent team.
- **Level 3**: formal verification of critical properties (see [Formal verification](#formal-verification) below).

There is no mandatory audit registry on Cardano; certification runs through the auditors and certification services themselves. [CIP-96](https://github.com/cardano-foundation/CIPs/pull/499) proposes an on-chain standard for publishing certification metadata (audit reports, test results, formal proofs), but it remains a draft rather than an adopted mechanism.

### Formal verification

Testing shows a validator works on the cases you tried; **formal verification** proves it holds for all of them. Cardano's own ledger specification is formalized in Agda, and the Haskell and Aiken ecosystems are well suited to these techniques, so for high-value contracts machine-checked proofs are the strongest guarantee you can give.

**Blaster.**

[Blaster](https://github.com/input-output-hk/Lean-blaster) is proof automation for [Lean 4](https://lean-lang.org/): you hand it a theorem and it returns a proof, or a counterexample that shows why it is wrong. It simplifies the goal through a series of algebraic rewriting passes, emits a minimal SMT-Lib query, and discharges it with an SMT solver, so you can close goals with a single `blaster` tactic instead of writing proofs by hand.

:::info In active development
Blaster is under active development and not yet generally available. You can track progress and follow the documentation at the [Lean-blaster repository](https://github.com/input-output-hk/Lean-blaster). This page will be expanded as the tooling matures.
:::

## Key takeaways

- **Cardano removes whole attack classes by design**: reentrancy is impossible, double-spends are structurally prevented, determinism removes entire categories of MEV, and native assets share the ledger's security.
- **What remains is yours to handle**: datum hijacking, double satisfaction, token forgery, and resource exhaustion all come down to validating the whole transaction carefully.
- **Use established patterns**, state tokens, value preservation, datum continuity, deadline enforcement, minimal logic, rather than inventing your own.
- **Verify in layers**: unit tests, property-based testing, and an audit for anything holding real value.

## Next steps

- [Vulnerability reference](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/overview): the full catalog with deep-dives
- [Smart Contract CTF](/docs/developers/curriculum/smart-contracts/security/ctf): practice exploiting and fixing vulnerable validators
- [Testing](/docs/developers/curriculum/smart-contracts/testing): build the test suite that catches these before deployment
