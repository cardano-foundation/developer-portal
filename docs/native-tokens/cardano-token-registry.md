---
id: cardano-token-registry
title: Cardano Token Registry
sidebar_label: Token Registry
description: The Cardano Token Registry provides a means to register off-chain token metadata that can map to on-chain identifiers. 
image: ./img/og-developer-portal.png
---

The [Cardano Token Registry](https://github.com/cardano-foundation/cardano-token-registry) provides a means to register off-chain token metadata to map to on-chain identifiers (typically hashes representing asset IDs, output locking scripts, or token forging policies).

A [server](#server-and-api) exposes the functionality of a key-value store, allowing users and applications to query registry entries through a RESTful API.

While this registry is limited in scope to handle native tokens only, it will also facilitate a discussion and introduce a standard for a metadata distribution system currently put forward as a [draft CIP](https://github.com/michaelpj/CIPs/blob/cip-metadata-server/cip-metadata-server.md).


## Who should register metadata?

Registration of metadata mappings is optional and is independent of any on-chain activities. However, users may choose to register metadata mappings with a server so that applications (for example, a wallet) can query and display additional human-readable data relevant to the on-chain identifier.


## New registration

New submissions to this registry will take the form of a GitHub Pull Request with the addition of one JSON file to the [mappings/](https://github.com/cardano-foundation/cardano-token-registry/tree/master/mappings) folder. Submissions will be subject to automated checking for well-formedness and human vetting before being merged into the registry.


## Updating existing entries

Modification of entries in this registry will take the form of a GitHub Pull Request with the modification of one or more JSON files in the [mappings/](https://github.com/cardano-foundation/cardano-token-registry/tree/master/mappings) folder. Submissions will be subject to automated checking for well-formedness and human vetting before being merged into the registry.


## Semantic content of registry entries

Each entry contains the following information:

**Name**         | **Required/Optional**|**Description**
---              | ---       | ---
`subject`        | Required  | The base16-encoded policyId + base16-encoded assetName.
`policy`         | Required  | The script that hashes to the policyId.
`name`           | Required  | A human-readable name for the subject, suitable for use in an interface.
`description`    | Required  | A human-readable description for the subject, suitable for use in an interface.
`ticker`         | Optional  | A human-readable ticker name for the subject, suitable for use in an interface.
`url`            | Optional  | A HTTPS URL (web page relating to the token).
`logo`           | Optional  | A PNG image file as a byte string.
`decimals`       | Optional  | The recommended value for decimal places. Native tokens are represented as whole numbers (numbers without decimals) on the blockchain.

For a comprehensive description of all fields and how to generate them, please see [off-chain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools).  

                       

## Submission well-formedness rules

1. Submissions to the registry must consist of a single commit directly off the **main** branch of the [**cardano-token-registry**](https://github.com/cardano-foundation/cardano-token-registry) repository.

2. Submissions must add or modify files in the [mappings/](https://github.com/cardano-foundation/cardano-token-registry/tree/master/mappings) folder.

3. The file name must match the encoded `"subject"` key of the entry, all lowercase.

4. The maximum file size of a single metadata entry is 370KB.


## Server and API

Users and applications can query this registry through an API at `https://tokens.cardano.org/metadata`.

The API documentation and source code for the server implementation is available with the [off-chain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools).        
            
Use of the `https://tokens.cardano.org/metadata` API is subject to the [API Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/API_Terms_of_Use.md).  

   
## How to prepare an entry for the token registry

### Prerequisites
To register native token mappings, it is recommended to have pre-existing knowledge about Cardano native assets. Start by reading through the [minting a new native asset](minting.md) example.  

After creating a Cardano native asset, you will need the following to proceed with the steps to generate a mapping for the registry:     

- The monetary policy script for your native asset.
- The assetName associated with the monetary policy script.
- The policyId of the monetary policy script.
- The private key/s used to define your asset policy.
- Install `offchain-metadata-tools` (see [off-chain-metadata tools](https://github.com/input-output-hk/offchain-metadata-tools)).

### Step 1: Generate the 'subject'

To create a new mapping, you must first obtain your metadata subject. The subject is defined as the concatenation of the base16-encoded policyId and base16-encoded assetName of your asset. In case your assetName is empty, then the policyId is your subject.

For this example, we will consider the following native asset:

`baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f.myassetname`

- Base16 encode your assetName:

```shell
$ echo -n "myassetname" | xxd -ps
6d7961737365746e616d65
```
- Concatenate the policyId with the base16-encoded assetName to obtain the 'subject' for your entry: 

`baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65`

### Step 2: Prepare a draft entry

- Initialize a new draft entry for the subject using `token-metadata-creator`

```shell
token-metadata-creator entry --init baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65
```
This creates a draft JSON file named after your subject.

### Step 3: Add required fields 

```shell
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
  --name "My Gaming Token" \
  --description "A currency for the Metaverse." \
  --policy policy.json
```
Where `policy.json` is the monetary policy script file that hashes to the policyId.

### Step 4: Add optional fields 

```shell
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
  --ticker "TKN" \
  --url "https://finalfantasy.fandom.com/wiki/Gil" \
  --logo "icon.png" \
  --decimals 4         
```

### Step 5: Sign your metadata

Each metadata item must be signed with the key/s used to define your asset policy. For this example, we assume only a single signing key is required to validate the monetary policy script and that all metadata fields will be signed at once with the signing key file. Please refer to [off-chain-metadata tools](https://github.com/input-output-hk/offchain-metadata-tools) for more granular options.

```shell
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 -a policy.skey
```

### Step 6: Finalize your mapping

This will run some additional validations on your submission and check that it is considered valid.

```shell
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 --finalize
```
Your finalized metadata file is now ready to submit to the [cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry).  

## How to submit an entry to the token registry

### Prerequisites

To submit a metadata entry for a native asset on Cardano, you must first follow the steps in [how to prepare an entry for the token registry](#how-to-prepare-an-entry-for-the-token-registry) and have a finalized metadata file ready for submission.

### Step 1: Fork and clone the registry repository

[Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) your own copy of [cardano-foundation/cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry) to your account.

Then clone a local copy:
```shell
$ git clone git@github.com:<your-github-username>/cardano-token-registry
$ cd cardano-token-registry
```
### Step 2: Add your metadata entry to the 'mappings' folder

```shell
$ cp /path-to-my-file/baa83...d65.json mappings/
```

### Step 3: Create a commit for the submission

```shell
$ git add mappings/baa83...d65.json
$ git commit -m "Your Token Name"
$ git push origin HEAD
```

### Step 4: Make a Pull Request

Create a [pull request from your fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork).

If the pull request validations pass, your submission will be reviewed and merged to the main branch subject to the [Registry Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/Registry_Terms_of_Use.md).
It may take a few hours following a merge to the main branch before your entry is added to the database and available via the api query.
