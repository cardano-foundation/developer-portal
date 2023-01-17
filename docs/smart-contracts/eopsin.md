---
id: eopsin
title: eopsin
sidebar_label: eopsin
description: eopsin
image: ../img/logo-eopsin.png
--- 

## Introduction

[eopsin](https://github.com/ImperatorLang/eopsin) is a programming language for developing smart contracts on the Cardano blockchain.
Its syntax is 100% valid Python code and it ensures that contracts evaluate on-chain
exactly as their Python counterpart.
This allows unit tests and verification of the Python code using standard tooling available for Python development.
Existing IDEs, linters and language servers may be re-used as well.
Note that the type system of eopsin is much stricter than the type system of Python, so that many optimizations can be implemented and an elevated level of security is provided.

The language interacts closely with the python library [pycardano](https://pycardano.readthedocs.io/en/latest/index.html).
The internal data structures are defined with data types compatible to the library and allow a tight combination of off- and on-chain code, all written in Python.

:::caution

eopsin is a still a work in progress and is NOT recommended for use in production.

:::

## Getting started

A short tutorial on getting started with eopsin may be found on [its GitHub page](https://github.com/ImperatorLang/eopsin).
Additionally, a tutorial demonstrating how to write matching off-chain code for eopsin contracts can be found in the [pycardano documentation](https://pycardano.readthedocs.io/en/latest/guides/plutus.html).


### Example contract

This is a basic validator written in eopsin:

```python
from eopsin.prelude import *

@dataclass()
class CancelDatum(PlutusData):
    pubkeyhash: bytes


def validator(datum: CancelDatum, redeemer: None, context: ScriptContext) -> None:
    sig_present = False
    for s in context.tx_info.signatories:
        if datum.pubkeyhash == s:
            sig_present = True
    assert sig_present, "Required signature missing"
```


## Links
- [eopsin Github Repository](https://github.com/ImperatorLang/eopsin).
- [pycardano Smart Contract documentation](https://pycardano.readthedocs.io/en/latest/guides/plutus.html).

