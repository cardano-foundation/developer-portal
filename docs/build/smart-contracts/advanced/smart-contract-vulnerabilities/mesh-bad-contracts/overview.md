---
id: overview
title: List of 'Bad' Contracts  
sidebar_label: List of 'Bad' Contracts 
description: Better understand how smart contracts work and improves their ability to fix bad contracts.
---

This helps developers to better understand how smart contracts work and improves their ability to fix bad contracts.

## [Unbound value](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/escrow/unbound-value)

Unbound value is a vulnerability where the hackers can spam the application by providing excessive unnecessary tokens in a validator, causing permanent lock of value in validator due to protocol limitation of execution units. In the escrow example, we did not specificallly guard this scenario since it did not make economical sense for both initiator and recipient to perform such hack. However, it other application or scenario it may be required to specifically check the length of input / output to prevent such hack from happening.

## [Infinite mint](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/giftcard/infinite-mint)

Infinite mint is a vulnerability where there is no strict restriction on minting a particular policy where malicious players can mint more than desired tokens from one transaction. Normally it comes from when the validator checks against whether a particular token has been minted without strictly prohibiting other tokens from minting. This vulnerability is dangerous when a complex application relies on certain policy ID for authentication, while malicious players can produce uncontrolled circulation of token with that policy ID, leading to complex hacking scenarios causing loss of funds.

## [Insufficient stake control](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/marketplace/insufficient-stake-control)

Insufficient stake control is a vulnerability where the value payment only check against payment key but not checking with a full address. Malicious player can fulfill the validator unlocking logic by sending value to an address with his/her own stake key to steal the staking reward and voting power if the user is not aware of that.

## [Locked value](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/plutus-nft/locked-value)

Locked value is a design where the application would cause permanent lock of value alike burning value permenantly. It will cause loss of fund and value circulation. However, in some scenarios it might be a intented behaviour to produce umtamperable utxos to serve as single proven source of truth for apps. One should consider the economics and tradeoff against the design choice. In the plutus nft example, locked value vulnerability is not considered as severe since only around 2 ADA would be permenantly lock in oracle.

## [Double satisfaction](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/swap/double-satisfaction)

This is a vulnerability where a bad actor can unlock multiple script utxos by fulfilling less than intented criteria. This swap example illustrate this vulnerability by not checking there is only 1 script input. It leads to bad actors can extract more value than it was expected from the protocol.

### Resources

- [Workshop #1 video recording](https://www.youtube.com/watch?v=JgIhzix7rMo)
- [Workshop #1 video recording](https://www.youtube.com/watch?v=IQoN6yL3z1A)