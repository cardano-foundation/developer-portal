---
id: opshin
title: opshin
sidebar_label: opshin
description: opshin
image: /img/logo-opshin.png
--- 

## Introduction

[opshin](https://github.com/OpShin/opshin) is a programming language for developing smart contracts on the Cardano blockchain.
Its syntax is 100% valid Python code and it ensures that contracts evaluate on-chain
exactly as their Python counterpart.
This allows unit tests and verification of the Python code using standard tooling available for Python development.
Existing IDEs, linters and language servers may be re-used as well.
Note that the type system of opshin is much stricter than the type system of Python, so that many optimizations can be implemented and an elevated level of security is provided.

The language interacts closely with the python library [PyCardano](https://pycardano.readthedocs.io/en/latest/index.html).
The internal data structures are defined with data types compatible to the library and allow a tight combination of off- and on-chain code, all written in Python.

:::caution

opshin is a still a work in progress and is NOT recommended for use in production.

:::

## Getting started

A complete example on a small written contract and off-chain code to deploy it on-chain can be found in the [opshin-starter-kit](https://github.com/OpShin/opshin-starter-kit) repository.
It contains code that will compile the contract and deploy it to the preview testnet, runnable in demeter.run, in your browser.

### Example contract

This is a basic validator written in opshin:

```python
from opshin.prelude import *


@dataclass()
class WithdrawDatum(PlutusData):
    pubkeyhash: bytes


def validator(datum: WithdrawDatum, redeemer: None, context: ScriptContext) -> None:
    sig_present = False
    for s in context.tx_info.signatories:
        if datum.pubkeyhash == s:
            sig_present = True
    assert sig_present, "Required signature missing"
```

It checks the presence of a specific signature in the transaction to approve spending funds.
We can compile the contract like this

```bash
$ python3 -m pip install opshin
$ opshin build contract.py
```

The result is a directory filled with the contract address, policy ID and data that will be used by off-chain libraries to interact with the contract.


## Links
- [opshin Github Repository](https://github.com/OpShin/opshin).
- [opshin pioneer program](https://github.com/OpShin/opshin-pioneer-program)
- [opshin starter kit](https://github.com/OpShin/opshin-starter-kit)
- [PyCardano Smart Contract documentation](https://pycardano.readthedocs.io/en/latest/guides/plutus.html).

