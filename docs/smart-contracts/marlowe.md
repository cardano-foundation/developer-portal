---
id: marlowe
title: Marlowe
sidebar_label: Marlowe
description: Marlowe
image: ../img/og/og-developer-portal.png
--- 

## Get started with Marlowe 
Marlowe is a domain-specific language (DSL) that enables users to create blockchain applications that are specifically designed for financial contracts.

If you want to learn Marlowe from the ground up, start with [Marlowe Tutorial](https://play.marlowe-finance.io/doc/marlowe/tutorials/index.html), or jump right into the [Marlowe Playground](https://play.marlowe-finance.io): 

[![Marlowe Playground](../../static/img/get-started/smart-contracts/marlowe-playground.jpg)](https://alpha.marlowe.iohkdev.io/)

On the Cardano Forum, you can [dicuss Marlowe](https://forum.cardano.org/c/developers/cardano-marlowe/149) or if you prefer Telegram, there is a special [Marlowe Telegram Group](https://t.me/IOHK_Marlowe).

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
<iframe width="100%" height="325" src="https://www.youtube.com/embed/axP-jYQ_6lo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Resources for Developing and Deploying Marlowe Contracts

### How do I run my Marlowe contract on the Cardano blockchain?

1. Design your contract using [Marlowe Playground](https://play.marlowe-finance.io/#/).
2. Press the `Send to Simulator` button and then press `Download as JSON` to download your contract in JSON format.
3. *If you want to run your contract at the command line using `marlowe-cli`,* install [`marlowe-cli`](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-cli/ReadMe.md#installation) and follow the instructions [Running Contracts with Marlowe CLI](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-cli/lectures/04-marlowe-cli-concrete.md). A video lecture playlist [Marlowe CLI](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0GbvCw-61e9VfRafBT1JSw) provides an overview of the `marlowe-cli` tool.
4. *If you want to run your contract in a Jupyter notebook,* then use git to clone [github.com/input-output-hk/marlowe-cardano](https://github.com/input-output-hk/marlowe-cardano), run `nix develop --command jupyter-lab` from the `marlowe-cli/` folder, open the notebook [Marlowe CLI Lecture 4](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-cli/lectures/04-marlowe-cli-concrete.ipynb), and follow the instructions. A video lecture [Running a Marlowe Contract with Marlowe CLI](https://www.youtube.com/watch?v=DmF7dIKmJMo&list=PLNEK_Ejlx3x0GbvCw-61e9VfRafBT1JSw&index=4) demonstrates running a contract from within a Jupyter notebook.
5. *If you want to run your contract from the command-line using the Marlowe Runtime backend,* then follow the [tutorial for Marlowe Runtime](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-runtime/doc/tutorial.ipynb). A video [Marlowe Runtime Tutorial](https://youtu.be/WlsX9GhpKu8) demonstrates its use.
6. *If you want to run your contract using Marlowe Lambda,* follow the example for [using Marlowe Lambda from the command line](https://github.com/input-output-hk/marlowe-lambda/blob/main/examples/zcb.ipynb) or study the example [web application for Marlowe Lambda](https://github.com/input-output-hk/marlowe-lambda/tree/main/web). Videos [Marlowe Lambda at the Command Line](https://youtu.be/huXbRyrmW60) and [Marlowe Lambda in the Browser](https://youtu.be/o5m_y5l_i_g) demonstrate the use of Marlowe Lambda.

### Why can't I run my Marlowe contract on `mainnet`?

- Marlowe's audit is not complete, so it is not advisable to run Marlowe contracts on `mainnet`.
- However, a pull request [enable Marlowe on `mainnet`](https://github.com/input-output-hk/marlowe-cardano/pull/377) modifies Marlowe tools for running on `mainnet`.

### GitHub repositories

- [Marlowe language and semantics](https://github.com/input-output-hk/marlowe)
- [Marlowe Improvement Proposals (MIPs)](https://github.com/input-output-hk/MIPs)
- [Marlowe on Cardano](https://github.com/input-output-hk/marlowe-cardano)
- [Marlowe Playground](https://github.com/input-output-hk/marlowe-playground)
- [PureScript implementation of Marlowe](https://github.com/input-output-hk/purescript-marlowe)
- [ACTUS in Marlowe](https://github.com/input-output-hk/marlowe-actus-labs)
- [AWS Lambda service for Marlowe Runtime](https://github.com/input-output-hk/marlowe-lambda)

### Developer Discussions

- [Marlowe on Cardano Forum](https://forum.cardano.org/c/developers/cardano-marlowe/149)
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

- [Index of example Marlowe contracts and their on-chain execution](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe/example-contracts.md)
- [Marlowe Cookbook](https://github.com/input-output-hk/marlowe-cardano/tree/main/marlowe-cli/cookbook/ReadMe.md)
- [Marlowe Runtime Tutorial](https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-runtime/doc/tutorial.md)
- [Marlowe Runtime examples](https://github.com/input-output-hk/marlowe-cardano/tree/main/marlowe-runtime/examples/ReadMe.md)
- [Haskell examples of Marlowe contracts](https://github.com/input-output-hk/marlowe-cardano/tree/main/marlowe-contracts)
- [ACTUS contracts in Marlowe](https://github.com/input-output-hk/marlowe-cardano/tree/main/marlowe-actus)

### Videos

- [Marlowe Pioneers 1st Cohort](https://www.youtube.com/@iogacademy9189/playlists?view=50&sort=dd&shelf_id=2)
	1. [Welcome](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x3xkV0OQ0PjRaCtlbPhL0Eg)
	2. [Using Marlowe](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x1o4Hv1GC_0kxXnquikXl70)
	3. [Marlowe in Depth](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0beuXQwbcy58pAIyF4kASc)
	4. [Marlowe Embedded in Haskell and JavaScript](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0maFKSYpW-17FV0B0MbAoW)
	5. [Marlowe and Standardization / ACTUS](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0KLofo1maCkO3AYjQKknz-)
	6. [Assurance and Convenience](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x3PArP4vcu4WV0Z5xV0OLhy)
	7. [Marlowe CLI](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x0GbvCw-61e9VfRafBT1JSw)
- [Using the Marlowe Runtime backend to execute a Marlowe contract on Cardano's preview network](https://youtu.be/WlsX9GhpKu8)
- [Marlowe Lambda at the Command Line](https://youtu.be/huXbRyrmW60)
- [Marlowe Lambda in the Browser](https://youtu.be/o5m_y5l_i_g)
- [A Geo-Located Smart Contract Using Cardano Beam and Marlowe](https://youtu.be/DmkYen0eaV0)

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

