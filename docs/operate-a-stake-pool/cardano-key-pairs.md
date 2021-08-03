---
id: cardano-key-pairs
title: Cardano Key Pairs
sidebar_label: Cardano Key Pairs
description: Learn about Cardano key pairs.
image: ./img/og-developer-portal.png
---

Before working with Cardano, it's essential to understand the various cryptographic key pairs involved, the purpose of each key pair and best practices for securing those keys. Every aspiring Cardano developer and stake pool operator must acquire a thorough understanding of these relevant key pairs - along with the potential implications of any given secret (private) key being compromised. Learning how to manage, protect and store private keys is critical to success for any Cardano developer or stake pool operator.
 
Cardano cryptographic keys utilize `ed25519` cryptography key pairs, consisting of a `public verification key file` and a `secret (private) key file`. The public key file is typically represented as `keyname.vkey`, whereas the private key file is typically represented as `keyname.skey`. The private key file is used to sign transactions, is considered extremely sensitive and should be properly secured and protected. This means limiting third-party exposure to your private keys under all circumstances. The most effective way to mitigate private key exposure is to ensure the relevant private key is never stored on any internet-connected machine (hot node) for any amount of time. Please note key pair filenames are entirely arbitrary and named as desired.

:::danger 
Use extreme caution to avoid losing or overwriting secret (private) keys.
:::
 
## Wallet address key pairs
 
Cardano wallet addresses currently entail only two components - a payment address and a counterpart staking address. A payment address (and associated key pairs) are used to hold, to receive, and to send funds. A stake address (and associated keys) is used to store and withdraw rewards, to specify stake pool owner and rewards accounts, and to also specify target stake pool delegation for the wallet.
 
 
`payment.vkey` - payment address public verification key file (not sensitive; may be shared publicly).
`payment.skey` - payment address secret (private) signing key file and is highly sensitive. The private signing key file provides access to funds held within the corresponding payment address and should be guarded at all costs.

:::danger 
Never place payment signing keys on a hot node.
:::
 
 
`stake.vkey` - stake address public verification key file (not sensitive; may be shared publicly).
 
`stake.skey` - stake address secret (private) signing key file and is sensitive. This private signing key file provides access to withdraw any rewards funds held in the stake address and also can be used to delegate the wallet to a pool. The stake.skey should also be guarded.
 
`payment.addr` - This is a Cardano wallet payment address and is typically generated using both a payment.vkey and a stake.vkey file as inputs. A payment address does not require staking key components if the relevant address will only be used to send and receive funds. Furthermore, a single payment.vkey can be combined with multiple unique stake.vkey files to create different payment addresses that can be staked separately
 
 
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
 
`kes.skey`- secret (private) signing key file for the stake pool's KES key (required to start the stake pool's block producing node; sensitive but must be placed on a hot node in order to start a stake pool and must be rotated regularly). KES keys are used to generate a stake pool's operational certificate, which expires within 90 days of that opcert's specified KES period - thus, new KES keys must be regenerated along with a new opcert every 90 days or sooner in order for a Cardano Stake pool to be able to continue minting blocks.
 
`kes.vkey` - public verification key file for a Cardano stake pool's corresponding `kes.skey` (not sensitive and is not required to a block producer).