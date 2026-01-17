---
id: transactions
title: Transactions
sidebar_label: Transactions
description: Understanding how transactions work on Cardano, including deterministic validation, transaction structure, and time handling.
image: /img/og/og-getstarted-technical-concepts.png
---

Cardano transactions are deterministic by design, meaning their behavior and outcomes can be predicted before execution. This predictability extends to validation results, fees, and ledger state changes.

## Transaction Validation

Transaction validation on Cardano uses scripts (pieces of code) that implement pure functions returning True or False. Script validation occurs for several actions:

- **Spending UTXOs**: Scripts validate whether UTXOs can be consumed
- **Minting tokens**: Policy scripts control token creation
- **Reward withdrawal**: Scripts govern stake reward claims
- **Certificate applications**: Scripts validate delegation and registration certificates

Each transaction specifies all arguments passed to scripts during validation, including user-provided redeemers that serve different purposes depending on the script logic.

## Deterministic Outcomes

Determinism means you can predict locally (off-chain) how your transaction will impact the on-chain state, without:

- **Unexpected script validation outcomes** or failures
- **Unexpected fees**
- **Unexpected ledger or script state updates**

This is fundamentally different from account-based blockchains like Ethereum, where gas prices can fluctuate between submission and execution, DEX rates can change, or scripts can fail mid-execution (costing fees without completing the action).

The predictable nature of Cardano transactions is ensured by:

- Scripts always terminate and return consistent results for the same inputs
- Transactions fix all arguments passed to the script interpreter
- All required script validations are specified in the transaction
- Cryptographic signatures prevent transaction tampering
- EUTXO model ensures deterministic ledger state updates

### Rejected vs Failed

A transaction can have two negative outcomes, and the difference matters:

**Rejected**: The transaction couldn't be applied to the ledger at all. It has no effect on the state, and **no fees are paid**. This typically happens when inputs have already been spent by another transaction.

**Failed (Phase 2)**: The transaction structure was valid, but script execution returned False. **Collateral is consumed** as a penalty, but other effects don't occur.

Because validation is deterministic, Phase 2 failures are locally predictable. A user acting in good faith should never have their collateral consumed, since they can verify script execution will succeed before submitting.

## Transaction Anatomy and CBOR Format

At the lowest level, Cardano transactions are binary data encoded using CBOR (Concise Binary Object Representation), a format similar to "binary JSON" that provides compact serialization while maintaining structure.

### CBOR and Cardano Specifications

CBOR allows Cardano to define precise transaction formats in the ledger specifications using CDDL (Concise Data Definition Language). Each Cardano era has its own specification document that defines the exact structure transactions must follow - any deviation causes rejection.

Understanding CBOR becomes crucial when debugging transaction failures, as blockchain explorers typically show processed data rather than the raw transaction structure that nodes actually validate.

<details>
<summary>Advanced: Transaction Structure Details</summary>

A complete transaction consists of four main components:

```
transaction = [
  transaction_body,      // Core transaction data
  transaction_witness_set, // Signatures and scripts
  validity_flag,         // Transaction validity
  auxiliary_data         // Metadata (optional)
]
```

**Transaction Body** contains:

- **Inputs** (field 0): References to UTXOs being spent
- **Outputs** (field 1): New UTXOs being created
- **Fee** (field 2): Transaction cost in lovelace
- **Script Data Hash** (field 11): Hash of redeemers and datums for script validation
- **Collateral** (field 13): UTXOs spent if script validation fails
- **Other fields**: Time validity, minting, certificates, etc.

**Transaction Witness Set** contains:

- **Signatures** (field 0): Cryptographic proofs of authorization
- **Plutus Scripts** (field 3): Smart contract code being executed
- **Plutus Data** (field 4): Unhashed datums referenced in the transaction
- **Redeemers** (field 5): Arguments passed to script execution

### Implications

**Input Ordering**: Inputs are automatically sorted lexicographically by (transaction_id, index), not by the order you specify. This affects redeemer indexing.

**Script Data Hash**: Any change to redeemers, datums, or protocol parameters requires recalculating this hash. Transaction libraries handle this automatically.

### Two-Phase Validation

Transaction validation is divided into two phases to limit uncompensated work by nodes.

**Phase 1** checks whether the transaction is constructed correctly and can pay its fees:

- Correct fee and collateral amounts provided
- All required script data present
- Protocol parameter bounds respected (output sizes, etc.)
- All inputs exist on the ledger
- Computational budget within limits
- Integrity hash correct

If Phase 1 fails, the transaction is rejected with no effect and no fees charged. Nodes do minimal work.

**Phase 2** executes the scripts:

- If all scripts return True: transaction is fully applied
- If any script returns False: collateral is consumed, other effects are ignored

Phase 2 failure should be rare because users can predict script outcomes locally before submitting. The collateral mechanism exists to compensate nodes for script execution work even when validation fails.

For complete technical specifications and debugging tools, see the [Cardano Ledger Specifications](https://github.com/IntersectMBO/cardano-ledger) and [Lace Anatomy](https://laceanatomy.com/) for decoding raw transactions.

</details>

## Validity Intervals and Time

Smart contract execution on Cardano is fully deterministic, which raises an interesting challenge: how to handle time-dependent logic? Since asking for "current time" would break determinism, Cardano uses **validity intervals** to introduce time constraints.

### How Validity Intervals Work

Transactions can specify a time window during which they're considered valid:

- **Lower bound**: Transaction valid only after this time
- **Upper bound**: Transaction expires after this time

These intervals are checked during Phase 1 validation, before script execution. This means validators can assume the transaction is within the specified time bounds, enabling deterministic time-based logic.

:::note Why Scripts Can't See the Current Slot
Allowing a script to see the actual slot number would break determinism. A user cannot know the exact slot in which their transaction will be processed, so they couldn't predict how the script would behave. By using validity intervals instead, the script only sees bounds that the user specified, preserving determinism.
:::

### Practical Applications

**Time-locked contracts**: Record a deadline in the datum and check that the transaction's lower bound exceeds that deadline.

**Auction deadlines**: Set an upper bound so bids can only be placed before the auction ends.

## Transaction Latency vs Finality

Understanding the difference between when a transaction appears on-chain versus when it becomes permanent is crucial for dApp development.

**Latency**: Time for a transaction to appear in a block (~20 seconds average block time).

**Finality**: Time for a transaction to become immutable and irreversible. This depends on:

- Network conditions and adversarial stake proportion
- Number of confirmations required (Risk tolerance of your application)

For most applications, waiting 6-20 confirmations provides really strong finality guarantees. High-value transactions may require more confirmations, while small transactions might accept fewer.

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/OSNf1MgAbII" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Guaranteed Transaction Delivery

How dropped transactions happen on cardano and how to ensure we always deliver them into blocks.
<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/gm-phCUGEoY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

---

## Next Steps

- Learn about [Transaction Fees](/docs/learn/core-concepts/fees)
- Understand [Addresses](/docs/learn/core-concepts/addresses)
- Build transactions: [Building dApps](/docs/build/integrate/overview)
