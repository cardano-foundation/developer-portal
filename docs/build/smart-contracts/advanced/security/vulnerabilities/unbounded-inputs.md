---
id: unbounded-inputs
title: Unbounded Inputs
sidebar_label: Unbounded Inputs
---

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
Let us illustrate this issue by considering the case of a faucet where users are allowed to claim 100 ADA in each transaction. A naive implementation could look like the following:

```rust
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
