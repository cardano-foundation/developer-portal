---
id: cardano-key-pairs
title: Cardano Key Pairs
sidebar_label: Cardano Key Pairs
description: Learn about Cardano key pairs.
image: /img/og/og-developer-portal.png
---

It's critical to understand the numerous cryptographic key pairs connected with Cardano, as well as the purpose of each key pair and best practices for securing those keys, before you start working with it. Every ambitious Cardano developer and stake pool operator should get a complete grasp of these key pairs, as well as the ramifications of a single secret (private) key being hacked. Any Cardano developer or stake pool operator must learn how to manage, safeguard, and store private keys in order to succeed.
 
Cardano cryptographic keys are made up of `ed25519` key pairs, which include a `public verification key file` and a `secret (private) key file`. The public key file is commonly referred to as `keyname.vkey`, whereas the private key file is referred to as `keyname.skey`. The private key file, which is used to sign transactions, is extremely sensitive and should be adequately safeguarded. Under all circumstances, this entails limiting third-party access to your private keys. The most effective technique to prevent private key exposure is to guarantee that the necessary private key is never held for any length of time on any internet-connected machine (hot node). Please note that key pair filenames are completely random and can be named whatever you want.

:::danger 
Use extreme caution to avoid losing or overwriting secret (private) keys.
:::
 
## Wallet address key pairs
 
Currently, Cardano wallet addresses only have two parts: a payment address and a counterpart staking address. A payment address (together with its associated key pairs) is used to store, receive, and send money. A stake address (and related keys) is used to store and withdraw rewards, as well as to define the stake pool owner and rewards accounts, as well as the wallet's target stake pool delegation.
 
 
`payment.vkey` is the public verification key file for the payment address (not sensitive; may be shared publicly).

`payment.skey` is a highly sensitive payment address secret (private) signing key file. The private signing key file gives you access to monies in your payment address and should be kept safe at all times.

:::danger 
Never place payment signing keys on a hot node.
:::
 
 
`stake.vkey` - stake address public verification key file (not sensitive; may be shared publicly).
 
`stake.skey` - It is a sensitive stake address secret (private) signing key file. This private signing key file gives you access to any awards cash held in the stake address, as well as the ability to delegate the wallet to a pool. It's also a good idea to keep an eye on the stake.skey.
 
`payment.addr` - This is a Cardano wallet payment address that is usually generated with the help of both a payment.vkey and a stake. As inputs, use the vkey file. If a payment address is merely going to be used to send and receive money, no crucial components need to be staked. In addition, there is a single payment. Multiple unique stake.vkey files can be coupled with vkey to establish different payment addresses that can be staked independently.
 
 
`stake.addr` - stake address for a Cardano wallet and is generated using the stake.vkey file
 
## Cardano stake pool key pairs
 
### Stake pool cold keys

 `cold.skey` - secret (private) signing key file for a Cardano stake pool (extremely sensitive). The `cold.skey` is required to register a stake pool, to update a stake pool registration certificate parameters, to rotate a stake pool KES keys and to retire a stake pool.
 
 
`cold.vkey` - public verification key file for a stake pool's cold.skey private signing key file (cold.vkey is not sensitive; can be shared publicly).
 
 
`cold.counter` - incrementing counter file that tracks the number of times an operational certificate (opcert) has been generated for the relevant stake pool.
 
:::danger 
Always rotate KES keys using the latest `cold.counter`.
:::
 
### VRF hot keys

`vrf.skey` - secret (private) signing key file for a Cardano stake pool's VRF key (required to start a stake pool's block producing node; sensitive but must be placed on a hot node in order to start a stake pool).
 
`vrf.vkey` - public verification key file for a Cardano stake pool's vrf.skey (not sensitive and is not required to start a stake pool's block producing node).
 
 ### KES hot keys
 
`kes.skey`- secret (private) signature key file for the stake pool's KES key (needed to start the stake pool's block producing node; sensitive, but must be placed on a hot node to start a stake pool and rotated on a regular basis). KES keys are needed to establish a stake pool's operating certificate, which expires 90 days after the opcert's defined KES period has passed. As a result, fresh KES keys must be generated along with a new opcert every 90 days or sooner for a Cardano Stake pool to continue minting blocks.
 
`kes.vkey` - public verification key file for a Cardano stake pool's corresponding `kes.skey` (not sensitive and is not required to a block producer).

## References 
- [CIP 19 Cardano Addresses](https://cips.cardano.org/cip/CIP-0019)
