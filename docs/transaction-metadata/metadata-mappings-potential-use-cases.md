---
id: metadata-mappings-potential-use-cases
title: Metadata Mappings Potential Use Cases
sidebar_label: Metadata Mappings Potential Use Cases
---

Within the Goguen era, a metadata distribution system could be applied to several use cases:

* Script hashes and native token Identifiers
* Datum hashes
* Public key hashes
* Stable addresses for oracle data
* Distributed exchange address listing
* Stake pool metadata

## Script hashes and native token identifiers

In the Goguen era of Cardano, script hashes will be used for locking outputs and forging policy identifiers. In both cases, users will likely want to know the script that goes with the hash. This information might be contained on-chain, but in most instances, the chain will only display the hash until the time the script runs (when spending a script-locked output, for example.)

Some of our applications might also require the provision of other metadata:

* 'Higher level' forms of the code (such as the Plutus IR)
* Creator information (contact details, etc.)
* Human-readable names

The latter would be particularly useful in the multi-asset support environment, as token holders will need to see easy-to-understand names for their tokens, rather than hash strings.

## Datum hashes

In the Extended UTXO ([EUTXO](https://iohk.io/en/blog/posts/2021/03/11/cardanos-extended-utxo-accounting-model/)) model, datums are provided by hash, and the spending party must provide the full value, which is inconvenient since the spending party needs to find out what the datum is. A quick enough metadata server to register new entries might provide a convenient off-chain channel for datum communication.

## Public key hashes

A perennial problem faced by communication via public keys is that people want to see names, rather than public keys, so an 'address book' is required. A metadata server would act as a decentralized address book for wallets, containing user contact details such as key servers for PGP keys.

## Distributed exchange address listing

Users offering tokens for sale and exchange can lock them in contracts that specify "you can spend this UTXO if you send x amount of tokens to y address". In this context, an output constitutes an "offer", which can be considered as metadata about the output, and could be managed by a metadata server.

## Stake pool metadata

Currently, stake pool metadata is handled by a [metadata aggregation server (SMASH)](https://docs.cardano.org/en/latest/explore-cardano/cardano-architecture-overview/smash-handbook.html) because:

* The stake pool metadata system does have to monitor the chain, since the metadata is fetched from URLs posted to the chain.
* The stake pool metadata system is “pull-based”: it must monitor a large number of stake pool metadata URLs for updates.
* The implementation cost for a metadata server is not extremely high, as it mostly consists of a database with a small HTTP API.
* The stakepool metadata has different restrictions on content. For instance, the size limit of stake pool metadata is much smaller than what we would reasonably limit a script size by.
* Types of metadata in Cardano.
