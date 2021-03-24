---
id: metadata-server
title: Cardano Metadata Server
sidebar_label: Metadata Server
---

## Metadata Server in the Goguen Era

The Goguen era of Cardano focuses on functionality to support smart contracts and custom token issuance, which will turn Cardano into a more interoperable and scalable platform to satisfy business needs, while further providing Cardano users with the power of decentralized governance and decision-making.

## What is a Metadata Server

A [metadata server](https://github.com/input-output-hk/metadata-server) exposes the functionality of a key-value store and allows users and applications to query metadata entries (mappings) from a database through a RESTful API.

Examples of applications that may use the server:
* Wallets
* DApps

## What problem does a metadata server address?

The introduction of a new metadata server for the Goguen era addresses one fundamental problem: Mapping opaque on-chain identifiers (typically hashes representing asset IDs, output locking scripts, token forging policies, or public key hashes) to metadata suitable for human consumption registered off-chain.

## Why we don’t store metadata on-chain

There are a number of reasons why we don’t want to store metadata on-chain:

* The trust model for metadata is different to the one used by the ledger and transactions. The only trust we have (and can expect to have) in the metadata is that it is signed by a particular key, regardless of the purpose or nature of the data. For instance, when posting a script, there is no explicit association between the script and the signing key other than the owner of the key choosing to post it.
* The metadata is precisely that: metadata. While it is about the chain, it does not directly affect ledger state transitions, and therefore we should not require it to be associated with a specific transaction.
* Higher cost to users for modifications and storage
* Increases in the UTXO size
* Difficulty in querying the data
* Size limits on transaction metadata

## Defining metadata in the Goguen era

Blockchain data is usually represented in forms that are not very human- or user-friendly. Long strings of hashes or other types of obscure identifiers often pose a challenge for the human user who's used to clearer and more logical methods of interpreting and understanding data.

The blockchain may contain personal information in the form of metadata, which is often hashed for security and privacy purposes. This hashed metadata is, by design, unintelligible and unreadable, so a method is required to map the information contained in on-chain identifiers -such as hashes- to metadata suitable for human understanding.

Much of the metadata that we want to store is not determined by the chain, so we propose a system that is independent from the blockchain. A case exists to develop a metadata distribution system that includes features that would benefit the usability of applications in the Cardano ecosystem.

For example:
* The identification of a hash's preimage (the script corresponding to an output locked by a script hash, or the public key corresponding to a public key hash).
* Inclusion of human- and user-friendly metadata, like the name and ticker of a native token or the creator’s website address.
* The integration of the metadata into the UI of IOG's applications. An example of this would be the naming convention of a currency. The name should be displayed on the UI, rather than the hash that contains the name's cyphered form.
* A solid security model for the metadata.
