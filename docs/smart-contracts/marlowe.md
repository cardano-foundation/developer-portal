---
id: marlowe
title: Marlowe
sidebar_label: Marlowe
description: Marlowe
image: /img/og/og-developer-portal.png
--- 

## Get started with Marlowe 
Marlowe is a domain-specific language (DSL) that enables users to create blockchain applications that are specifically designed for financial contracts.

If you want to learn Marlowe from the ground up, start with [Marlowe Tutorial](https://docs.marlowe.iohk.io/tutorials), or jump right into the [Marlowe Playground](https://docs.marlowe.iohk.io/docs/developer-tools/playground): 

[![Marlowe Playground](../../static/img/get-started/smart-contracts/marlowe-playground.jpg)](https://docs.marlowe.iohk.io/docs/developer-tools/playground)

On the Cardano Forum, you can [discuss Marlowe](https://forum.cardano.org/tag/marlowe) or if you prefer Telegram, there is a special [Marlowe Telegram Group](https://t.me/IOHK_Marlowe).

## The Marlowe platform
When compared to a [Turing-complete](https://en.wikipedia.org/wiki/Turing_completeness) language, the Marlowe DSL provides significantly greater security, certainty, [guarantees of termination](https://en.wikipedia.org/wiki/Halting_problem), and behavior correctness.

The design guarantees the following:
- Contracts are finite. No recursion or loops.
- Contracts will terminate. Timeout on all actions.
- Contracts have a defined lifetime. 
- No assets retained on close. 
- Conservation of value.

## Marlowe Playground 
The Marlowe Playground is a plug-and-play smart contract builder and simulator that is simple to use, visual, and modular. Build, simulate, and analyze Marlowe contracts in this 4-minute tour of the Marlowe Playground.
<iframe width="560" height="315" src="https://www.youtube.com/embed/EgCqG0hPmwc?si=doukCRT63l-mUOD6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Resources for Developing and Deploying Marlowe Contracts

### How do I run my Marlowe contract on the Cardano blockchain?

1. Design your contract using [Marlowe Playground](https://docs.marlowe.iohk.io/docs/developer-tools/playground).
2. Press the `Send to Simulator` button and then press `Download as JSON` to download your contract in JSON format.
3. *If you want to run your contract at the command line using `marlowe-cli`,* install [`marlowe-cli`](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-cli/ReadMe.md#installation) and follow the instructions [Running Contracts with Marlowe CLI](https://github.com/input-output-hk/real-world-marlowe/blob/main/archives/marlowe-cli/lectures/04-marlowe-cli-concrete.md). A video lecture playlist [Marlowe CLI](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0GbvCw-61e9VfRafBT1JSw) provides an overview of the `marlowe-cli` tool.
4. *If you want to run your contract in a Jupyter notebook,* then use git to clone [github.com/input-output-hk/marlowe-cardano](https://github.com/input-output-hk/marlowe-cardano), run `nix develop --command jupyter-lab` from the `marlowe-cli/` folder, open the notebook [Marlowe CLI Lecture 4](https://github.com/input-output-hk/marlowe-cardano/blob/mpp-cli-lectures/marlowe-cli/lectures/04-marlowe-cli-concrete.ipynb), and follow the instructions. A video lecture [Running a Marlowe Contract with Marlowe CLI](https://www.youtube.com/watch?v=DmF7dIKmJMo&list=PLNEK_Ejlx3x0GbvCw-61e9VfRafBT1JSw&index=4) demonstrates running a contract from within a Jupyter notebook.
5. *If you want to run your contract from the command-line using the Marlowe Runtime backend,* then follow the [tutorial for Marlowe Runtime](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-runtime/doc/tutorial.ipynb). A video [Marlowe Runtime Tutorial](https://www.youtube.com/playlist?list=PLnPTB0CuBOByd1Y6W9B8Xj_wiiWkobtrY) demonstrates its use.
6. *If you want to run your contract using Marlowe Lambda,* follow the example for [using Marlowe Lambda from the command line](https://github.com/input-output-hk/marlowe-lambda/blob/main/examples/zcb.ipynb) or study the example [web application for Marlowe Lambda](https://github.com/input-output-hk/marlowe-lambda/tree/main/web). The video [Marlowe Lambda in the Browser](https://www.youtube.com/watch?v=yKhQpIEliBc&t=6s) demonstrate the use of Marlowe Lambda.

## High level technical summary

Marlowe is implemented for the Cardano blockchain as a validator script that uses the Marlowe DSL in transaction datums for describing the contract states.

The script is implemented in Plutus [here](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/src/Language/Marlowe/Scripts.hs) and plays a crucial role in validating state transitions for Marlowe contracts. Its purpose is to ensure that transitions caused by transactions comply with both the general rules defined in the Marlowe specification and the current state of the contract, as described in the datum using the Marlowe DSL.

One important rule enforced by the Marlowe validator is that [a transaction can only consume a single UTXO](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/specification/marlowe-cardano-specification.md#constraint-2-single-marlowe-script-input) and [output at most one from the same Marlowe script address](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/specification/marlowe-cardano-specification.md#constraint-3-single-marlowe-output). Consequently, a Marlowe contract can be envisioned as a chain of transactions that concludes with a transaction consuming an input from the Marlowe address but producing no output to the same address.

When a transaction consumes the final UTXO of a contract chain without outputting a new UTXO to the same validator address, it indicates the closure of the contract. Such a transaction will contain a redeemer but does not require a datum.

A transaction that consumes the final UTXO and outputs a new one to the same validator address, effectively extending the contract's transaction chain, will also include a redeemer describing the action being applied to the previous state. Additionally, a datum is required to describe the new contract state using the Marlowe DSL. The validator script applies the action to the previous state and returns true (allowing the transaction) only if the transition is permitted by the previous state and results in the provided new state.

Marlowe contracts using the same validator version will utilize the same script address by default. However, it is also possible to derive a staked version of the script address. In this case, only the payment part of the address remains constant for a specific script version. To identify a transaction containing a Marlowe contract, one needs to examine the payment part of the address, which would correlate to a well-known script hash for a validator script version.

### Validator versions

Currently, there is only a single known implementation of Marlowe available for Cardano: [input-output-hk/marlowe-cardano](https://github.com/input-output-hk/marlowe-cardano).

The well-known versions of the validator script are specified in the [ScriptRegistry.hs](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-runtime/src/Language/Marlowe/Runtime/Core/ScriptRegistry.hs) file.

Version hashes as of January 20, 2024:

Marlowe uses two validators: the _semantics validator_ for the Marlowe DSL and a _role-payout_ validator that allows the holder of a role token to withdraw funds paid by the semantics validator.
There is also an optional _open-role validator_ which enables just-in-time assignment of roles to a contract.

| Version | Technical Notes                         | Hash for Semantics Validator                               | Hash for Role-Payout Validator                             | Hash for Open-Role Validator                               |
|---------|-----------------------------------------|------------------------------------------------------------|------------------------------------------------------------|------------------------------------------------------------|
| V5      | Optimized using `PlutusTx.asData`       | `377325ad84a55ba0282d844dff2d5f0f18c33fd4a28a0a9d73c6f60d` | `fcb8885eb5e4f9a5cfca3c75e8c7280e482af32dcdf2d13e47d05d27` | `2722e12a53dfb4fe3742b8a2c0534bd16b0b5ae492a3d76554bbe8a5` |
| v4      | Optimized using PlutusTx 1.15           | `6027a8010c555a4dd6b08882b899f4b3167c6e4524047132202dd984` | `fdade3b86107bc715037b468574dd8d3f884a0da8c9956086b9a1a51` | `36a5c7e49a6b11c7fb65fb61db69ed5ceaa35326af9d952fd30185c0` |
| v3      | Recompiled with Node 8.1.2 dependencies | `d85fa9bc2bdfd97d5ebdbc5e3fc66f7476213c40c21b73b41257f09d` | `10ec7e02d25f5836b3e1098e0d4d8389e71d7a97a57aa737adc1d1fa` | `b1d61d0c8a3c0f081a7ccebf0050e3f2c9751e82a4f3953a769dddfb` |
| v2      | Changes in response to audit            | `2ed2631dbb277c84334453c5c437b86325d371f0835a28b910a91a6e` | `e165610232235bbbbeff5b998b233daae42979dec92a6722d9cda989` |                                                            |
| v1      | Audited                                 | `6a9391d6aa51af28dd876ebb5565b69d1e83e5ac7861506bd29b56b0` | `49076eab20243dc9462511fb98a9cfb719f86e9692288139b7c91df3` |                                                            |

## More resources

### Documentation & overview

- Official [Marlowe documentation](https://docs.marlowe.iohk.io)
- [A comprehensive guide to Marlowe's security: audit outcomes, built-in functional restrictions, and ledger security features](https://iohk.io/en/blog/posts/2023/06/27/a-comprehensive-guide-to-marlowes-security-audit-outcomes-built-in-functional-restrictions-and-ledger-security-features/)

### GitHub repositories

- [Marlowe language and semantics](https://github.com/input-output-hk/marlowe)
- [Marlowe Improvement Proposals (MIPs)](https://github.com/input-output-hk/MIPs)
- [Marlowe on Cardano](https://github.com/input-output-hk/marlowe-cardano)
- [Marlowe Playground](https://github.com/input-output-hk/marlowe-playground)
- [PureScript implementation of Marlowe](https://github.com/input-output-hk/purescript-marlowe)
- [ACTUS in Marlowe](https://github.com/input-output-hk/marlowe-actus-labs)
- [AWS Lambda service for Marlowe Runtime](https://github.com/input-output-hk/marlowe-lambda)

### Developer Discussions

- [Marlowe on Cardano Forum](https://forum.cardano.org/tag/marlowe)
- [\#marlowe on Cardano StackExchange](https://cardano.stackexchange.com/questions/tagged/marlowe)
- [\#ask-marlowe on Discord](https://discord.com/channels/826816523368005654/936295815926927390)
- [IOG\_Marlowe on Telegram](https://t.me/IOHK_Marlowe)
- [Discussion of improvements to Marlowe](https://github.com/input-output-hk/MIPs/discussions)
- [Discussion of changes to Marlowe's implementation on Cardano](https://github.com/input-output-hk/marlowe-cardano/discussions)

### Specifications

- [Marlowe Specification, Version 3](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/specification/marlowe-isabelle-specification-4f9fa249fa51ec09a4f286099d5399eb4301ed49.pdf)
- [Marlowe-Cardano Specification](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/specification/marlowe-cardano-specification.md)

### Testing and debugging

- [The Marlowe Debugging Cookbook](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/debugging-cookbook.md)
- [Marlowe Test Report](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/test/test-report.md)

### Tools

- [Marlowe CLI](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-cli/ReadMe.md): a command-line interface for running Marlowe contracts on the Cardano blockchain.
- [Marlowe Runtime](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-runtime/doc/ReadMe.md): an application back-end for running Marlowe contracts on the Cardano blockchain.
- [Marlowe Lambda](https://github.com/input-output-hk/marlowe-lambda): an AWS Lambda client for Marlowe Runtime.

### Examples

- [Gallery of Marlowe Contracts on Cardano Mainnet (Real World Marlowe)](https://github.com/input-output-hk/real-world-marlowe)
- [Index of example Marlowe contracts and their on-chain execution](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/example-contracts.md)
- [Marlowe Debugging Cookbook](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/debugging-cookbook.md)
- [Marlowe Runtime Tutorial](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-runtime/doc/tutorial.md)
- [Marlowe Runtime examples](https://www.youtube.com/playlist?list=PLnPTB0CuBOByd1Y6W9B8Xj_wiiWkobtrY)
- [Haskell examples of Marlowe contracts](https://github.com/input-output-hk/marlowe-cardano/tree/main/marlowe-contracts)
- [ACTUS contracts in Marlowe](https://github.com/input-output-hk/marlowe-cardano/tree/main/marlowe-actus)

### Videos

- Marlowe Pioneers 1st Cohort
	1. [Welcome](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x3xkV0OQ0PjRaCtlbPhL0Eg)
	2. [Using Marlowe](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x1o4Hv1GC_0kxXnquikXl70)
	3. [Marlowe in Depth](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0beuXQwbcy58pAIyF4kASc)
	4. [Marlowe Embedded in Haskell and JavaScript](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0maFKSYpW-17FV0B0MbAoW)
	5. [Marlowe and Standardization / ACTUS](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0KLofo1maCkO3AYjQKknz-)
	6. [Assurance and Convenience](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x3PArP4vcu4WV0Z5xV0OLhy)
	7. [Marlowe CLI](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0GbvCw-61e9VfRafBT1JSw)
- [Using the Marlowe Runtime backend to execute a Marlowe contract on Cardano's preview network](https://www.youtube.com/watch?v=ZmZdgxz2i9A)
- [Marlowe Lambda in the Browser](https://www.youtube.com/watch?v=yKhQpIEliBc)

## Presentations

- [Blockchain Essentials](https://www.youtube.com/watch?v=yi8-xaoTQT4)
- [Domain-specific languages](https://www.youtube.com/watch?v=T4W19TdJHMw)
- [Financial contracts](https://www.youtube.com/watch?v=1HRaRVyj2BI)
- [Onto blockchain](https://www.youtube.com/watch?v=dhcmKmAZslc)
- [Escrow onto blockchain](https://www.youtube.com/watch?v=ADMCMDQK7Yo)
- [Marlowe in full](https://www.youtube.com/watch?v=Ro8iBh7V7oc)

## Further Tutorials

- [A first contract](https://www.youtube.com/watch?v=es4qpcHxr0I)
- [Elaborating the contract](https://www.youtube.com/watch?v=DS_ebkGwmXw)
- [Choices and observations](https://www.youtube.com/watch?v=25fnB7C8mPE)
- [Writing Marlowe contracts in JavaScript](https://www.youtube.com/watch?v=6tkZ3hlYZ7k)
- [Using Haskell in the playground](https://www.youtube.com/watch?v=S0crHs-wTAc)
- [Using JavaScript in the playground](https://www.youtube.com/watch?v=Oeuyy5AAQ3o)
- [Building Marlowe directly in the playground](https://www.youtube.com/watch?v=9lHkCq0H4pw)
- [Building contracts in Blockly](https://www.youtube.com/watch?v=9SKB5MfA_L8)
- [Simulation in the playground](https://www.youtube.com/watch?v=3aFoN2wg9oc)
- [Oracles in the playground](https://www.youtube.com/watch?v=LsTQEPMxyIU)
- [Analysis in the playground](https://www.youtube.com/watch?v=VmoUAifui38)
- [ACTUS labs](https://www.youtube.com/watch?v=6PPWFZEfkks)

## Metrics, Adoption, Audit

- [Marlowe Explorer: Scanners for contracts on Mainnet & testnets](https://marlowescan.com/)
- [MarloweStat: Statistics for Marlowe contracts on public networks](http://data.marlowestat.org/)
- [Technical review of Marlowe: Final report (Tweag, 2023-03-24)](https://github.com/tweag/tweag-audit-reports/blob/main/Marlowe-2023-03.pdf)
  - [Response to Audit Report for the Marlowe Specification (IOG)](https://github.com/input-output-hk/marlowe/blob/master/response-to-audit-report.md)
