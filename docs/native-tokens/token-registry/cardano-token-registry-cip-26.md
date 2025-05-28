--- 
id: cardano-token-registry-cip26
title: CIP 26
sidebar_label: "CIP 26: Offchain Token Metadata"
description: The Cardano Token Registry provides a means to register off-chain token metadata that can map to on-chain identifiers. 
image: /img/og/og-developer-portal.png 
sidebar_position: 2
--- 
The [Cardano Token Registry](https://github.com/cardano-foundation/cardano-token-registry) provides a means to register off-chain token metadata to map to on-chain identifiers (typically hashes representing asset IDs, output locking scripts, or token forging policies).

# CIP26 Off-Chain Metadata Registry (mainnet)
This is the [CIP26](https://cips.cardano.org/cip/CIP-0026) off-chain metadata registry for **mainnet**. If you intend to register any metadata for on-chain assets that exist on the publicly available testnets only (e.g. preview and preprod environments) please use the [metadata-registry from IOHK](https://github.com/input-output-hk/metadata-registry-testnet).

##  Background
This repository provides a means to register off-chain token metadata that can map to on-chain identifiers (typically hashes representing asset IDs, output locking scripts, or token forging policies).

A [server](#server) exposes the functionality of a key-value store, allowing users and applications to query registry entries through a RESTful API.

While this registry is limited in scope to handle native tokens only, it will also serve to facilitate a discussion and introduce a standard for a metadata distribution system that is currently put forward as a [draft CIP](https://github.com/michaelpj/CIPs/blob/cip-metadata-server/cip-metadata-server.md).

Use of this registry is subject to the [Registry Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/Registry_Terms_of_Use.md).           
Use of the public API is subject to the [API Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/API_Terms_of_Use.md).

## Process

#### New registration

New submissions to this registry will take the form of a GitHub Pull Request with the addition of one JSON file to the [mappings/](https://github.com/cardano-foundation/cardano-token-registry/blob/master/mappings) folder. Submissions will be subject to automated checking for well-formedness and human vetting before being merged to the registry.


#### Updating existing entries

Modification of entries in this registry require a GitHub Pull Request with the modification of one JSON file in the [mappings/](https://github.com/cardano-foundation/cardano-token-registry/blob/master/mappings) folder.  Submissions will be subject to automated checking for well-formedness and human vetting before being merged to the registry. 


## Semantic content of registry entries

Each entry contains the following information:

**Name**             | **Required/Optional**|**Description**
---              | ---       | ---
`subject`        | Required  | The base16-encoded policyId + base16-encoded assetName
`name`           | Required  | A human-readable name for the subject, suitable for use in an interface
`description`    | Required  | A human-readable description for the subject, suitable for use in an interface
`policy`         | Optional  | The base16-encoded CBOR representation of the monetary policy script, used to verify ownership. Optional in the case of Plutus scripts as verification is handled elsewhere.
`ticker`         | Optional  | A human-readable ticker name for the subject, suitable for use in an interface
`url`            | Optional  | A HTTPS URL (web page relating to the token)
`logo`           | Optional  | A PNG image file as a byte string
`decimals`       | Optional  | how many decimals to the token

The policy field is optional in order to support Plutus Smart-Contracts which are not linked to a set of signing keys by default. It is used in priority if present. Otherwise, signature verification is performed using user-provided trusted keys.

For a comprehensive description of all fields and how to generate them, please see [offchain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools).  

## Submission well-formedness rules

1. Submissions to the registry must consist of a single commit, directly off the **master** branch of the **cardano-token-registry** repository.

2. Submissions must add or modify a singular file in the [mappings/](https://github.com/cardano-foundation/cardano-token-registry/blob/master/mappings) folder. Multiple mappings should be split across multiple PRs.

3. The file name must match the encoded `"subject"` key of the entry, all lowercase.

4. The maximum file size of a single metadata entry is 370KB.


##  Server

Users and applications can query this registry through an API at `https://tokens.cardano.org/metadata`.

The API documentation and source code for the server implementation is available with the [offchain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools).        
            
Use of the `https://tokens.cardano.org/metadata` API is subject to the [API Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/API_Terms_of_Use.md).  

   
  
## Token Registry Information  
This page was generated automatically from: [https://github.com/cardano-foundation/cardano-token-registry/blob/master/](https://github.com/cardano-foundation/cardano-token-registry/blob/master//README.md).