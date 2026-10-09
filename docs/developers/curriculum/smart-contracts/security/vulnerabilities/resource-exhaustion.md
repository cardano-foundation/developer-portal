---
id: resource-exhaustion
title: Resource Exhaustion
sidebar_label: Resource exhaustion
description: "Five ways a protocol can be made unusable by growth or contention: unbounded value, datum, and inputs, plus cheap spam and UTXO contention."
---

Every UTXO and every transaction has hard limits: a maximum serialized size, a memory budget, and an execution-unit budget. This class is what happens when a protocol lets something it never bounded grow past one of those limits, or lets many actors compete for a single UTXO. The outcome is the same each time, value that can no longer be spent or a protocol that can no longer make progress, and so is the defense: bound the thing before an attacker does.

The first three entries are the size limits, which share one mechanism. The last two are liveness attacks, where nothing exceeds a limit but the protocol still stops working.

## Unbounded Value

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `unbounded-value`

**Property statement:**
Values of all legit UTxOs locked by the protocol have an upper bound for their size, and the upper bound is low enough to not prevent consumption of the UTxO as an input in a future transaction.

**Test:**
A transaction can successfully lock in the protocol a legit UTxO with a value large enough to make its consumption fail due to an unexpected number of tokens or reaching the network resources constraints.

**Impact:**

- Unspendable outputs
- Protocol halting

**Further explanation:**
Typically, a large value could make a transaction fail in three ways:

**Scenario 1:** if a script expects an exact or bounded number of tokens in some of its inputs, the transaction will fail if more tokens are present in those inputs. For instance, in the case where a validator script contains code similar to `let [(cs,tn,amt)] = flattenValue (input.value)`, if a previous transaction had locked an output with any token other than ADA, a subsequent transaction consuming that output would fail.

**Scenario 2:** if an input UTxO has N native tokens in the value, then just by passing on the input values to the output and adding some M additional tokens, the transaction might fail due to exceeding the transaction size limit. The most common pattern where this becomes a problem are script logics that require the ongoing addition of distinct tokens to the UTxOs locked by scripts. Note that values held by UTxOs only contribute to the size of the transaction when being part of the outputs of the transaction, but not when they are part of the inputs.

**Scenario 3:** if the input UTxO contains a lot of different native tokens and the script logic is such that it must go through and process them, then the transaction might fail due to execution resources (XU limits) being breached. This is the hardest scenario to identify, as it becomes a problem in scripts where unexpected tokens are not taken into account, being easy to forget about them. For instance, if a script had to fold through the value of an input looking for a specific combination of asset class and amount, it would be problematic if that input contained a large amount of asset classes.
A common case where this problem arises is when the logic of the scripts allow the presence and addition of foreign tokens (i.e. tokens not expected by the protocol).

This problem can be prevented with tighter constraints on output values: it is not enough to check that the expected tokens are present in the locked outputs, you should also explicitly check that *only* the expected tokens are present, disallowing any extras.

Also, resource consumption monitoring tests should be implemented, and transactions involving maximum expected flows of value should be covered by those tests.

## Unbounded Datum

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `unbounded-datum`

**Property statement:**
Datum for all legit UTxOs locked by the protocol have an upper bound for their size, and the upper bound is low enough to not prevent consumption of the UTxO as an input in a future transaction.

**Test:**
A transaction can successfully lock in the protocol a legit UTxO with a datum such that its consumption in a second transaction fails due to reaching the network resources constraints.

**Impacts:**

- Unspendable outputs
- Protocol halting

**Further explanation:**
A common design pattern that introduces such vulnerability can be observed in the following excerpt:

```haskell
data MyDatum = Foo {
  users :: [String],
  userToPkh :: Map String PubKeyHash
}
```

If the protocol allows `MyDatum` to grow indefinitely, eventually memory and CPU usage limits and/or size limits imposed by the Plutus interpreter will be reached, rendering the output unspendable.

Note that although inline datum for the inputs of a transaction do not contribute to its size (unlike a non-inline datum, as it must be attached), they still might contribute to increase the memory and CPU usage depending on the validator's logic.

The recommended design patterns are either to limit the growth of such datum in validators or to split the datum across different outputs.

## Unbounded Inputs

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `unbounded-inputs`

**Property statement:**
All transactions within the scope of the protocol can be performed with a number of inputs low enough to not exceed the transaction size or resources usage (memory and CPU usage) limits.

**Test:**
The protocol reaches a state where too many UTxOs are supposed to be consumed simultaneously, making a legit transaction fail because of exceeding the size or resources usage limit.

**Impact:**

- Unspendable outputs
- Protocol halting

**Further explanation:**
Consider the case of a faucet where users are allowed to claim 100 ADA in each transaction. A naive implementation could look like the following:

```haskell
vulnValidator _ _ ctx =
  traceIfFalse "Must return change to script" $ contOutputsValue == (inputsOwnAddressValue - (singleton "" "" 100000000))
  where
    ownInput = txInInfoResolved $ findOwnInput ctx
    ownAddress = txOutAddress ownInput
    inputsOwnAddress = filter (\i -> txOutAddress (txInInfoResolved i) == ownAddress) $ txInfoInputs (scriptContextTxInfo ctx)
    inputsOwnAddressValue = sum [txOutValue i | i <- inputsOwnAddress]
    contOutputs = getContinuingOutputs ctx
    contOutputsValue = sum [txOutValue o | o <- contOutputs]
```

The validator above ensures that only 100 ADA (100,000,000 lovelaces) is spent from the faucet and that the rest is locked backed in the same script. However, it does not enforce anything about the structure of these outputs. Therefore, all the value in the inputs coming from the script (minus the claimed 100 ADA) could be locked back in the script diluted in as many outputs as the size of the transaction allows. Depending on the original amount and distribution of ADA locked in the script, this could result in a situation in which in order to claim the next 100 ADA, too many inputs are needed (as no individual or small amount of inputs contain the needed 100 ADA) and the limits are reached. This would result in unspendable UTxOs locked by the script.

In order to prevent the issue described above, it could be enforced that there is a single input coming from the script and a single output being locked back in the script.

## Cheap Spam

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `cheap-spam`

**Property statement:**
All intended actions can be performed in a timely manner under the assumption that nobody is willing to spend more resources than the potential gain by denying service of the protocol.

**Test:**
A denial of service status is achieved by introducing many actions that interfere with the intended use of the protocol, making it impossible to consume the target UTxO in a timely manner.

**Impact:**

- Protocol stalling
- Protocol halting

**Further explanation:**
Stalling is problematic when the cost to stall is lower than the loss of opportunity cost it causes (i.e., by spending N Ada you cause the protocol to lose M Ada, where M > N). Usually this snowballs, especially in financially incentivised protocols because people lose trust and then it all amplifies.

For instance, if the solvency of a lending protocol depends on liquidations of debt to be performed in a timely manner, it is important to make sure that there are no actions such as creating many small and undercollateralised debt positions that would delay liquidation of a big debt position.

Note that the combination of this vulnerability with [UTxO contention](#utxo-contention) increases its severity, as it would be easier to deny service to a single UTxO.

## UTxO Contention

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `utxo-contention`

**Property statement:**
The protocol is designed in such a way that disincentivises the attempt to consume the same UTxO by multiple actors.

**Test:**
One out of two or more transactions trying to consume the same UTxO fails due to the UTxO not existing anymore.

**Impact:**
Protocol stalling

**Further explanation:**
This vulnerability is very common in the case where a UTxO carries some global datum or shared value (global state).

For instance, a decentralised exchange (DEX) that holds in a single UTxO (global UTxO) the pool of assets available to be swapped would experience a high degree of contention, since every swap would require consuming the global UTxO and recreating it by locking back the pool of assets with the swap already performed. In practice, this would make the DEX unusable, since as soon as it becomes popular and volume of transactions is significant, the global UTxO would be unavailable for most of the users.

Protocols that aim to minimise this vulnerability should aim for parallel transactions and distributed state management wherever possible.

Concretely, this means not holding mutable shared state in one global UTxO. Instead, partition it across many independent UTxOs, one per user, position, or campaign, so that concurrent transactions land on different UTxOs and never compete for the same one. This per-instance (or "siloed") layout is the deliberate design response to contention: the [linked list](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/linked-list) and [trie](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/trie) patterns are concrete structures for distributing state this way while keeping it verifiable on-chain. For state that genuinely must be shared, keep it in a UTxO that transactions consume as a reference input rather than spend, so any number of them can read it in parallel without contending.
