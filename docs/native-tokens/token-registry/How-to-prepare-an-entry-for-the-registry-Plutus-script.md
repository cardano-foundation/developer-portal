--- 
sidebar_label: How to prepare an entry for the registry (Plutus script)
custom_edit_url: null
title: How to prepare an entry for the registry (Plutus script)
sidebar_position: 6
--- 
## Pre-Requisites    

For a Plutus script, you will need the following to proceed with the steps to generate a mapping for the registry:     

- The Plutus script for your native asset.
- The assetName associated with the script.
- A set of trusted keys managed by the user, to sign your registry entries.
- Install `offchain-metadata-tools` (see [offchain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools)).

## Step 1: Generate the 'subject'

To create a new mapping, you must first obtain your metadata subject. The subject is defined as the concatenation of the base16-encoded policyId and base16-encoded name of your asset. In case your assetName is empty, then the policyId is your subject.

First obtain the policyId:

`cardano-cli transaction policyid --script-file <my_minting_script.plutus>`
`baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f`

For this example, we will consider the following native asset:

`policyId="baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f"` `assetName="myassetname"`

- Base16 encode your assetName:

```console
$ echo -n "myassetname" | xxd -ps
6d7961737365746e616d65
```
- Concatenate the policyId with the base16-encoded assetName to obtain the 'subject' for your entry: 

`baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65`


## Step 2: Prepare a draft entry

- Initialise a new draft entry for the subject using `token-metadata-creator`

```console
token-metadata-creator entry --init baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65
```
This creates a draft JSON file named after your subject.

## Step 3: Add required fields 

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
  --name "My Gaming Token" \
  --description "A currency for the Metaverse." \
```

## Step 4: Add optional fields 

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
  --ticker "TKN" \
  --url "https://finalfantasy.fandom.com/wiki/Gil" \
  --logo "icon.png" \
  --decimals 4         
```

## Step 5: Sign your metadata

Each metadata item must be signed with a set of trusted keys managed by the user.

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 -a owner.skey
```

## Step 6: Finalize your mapping

This will run some additional validations on your submission and check that it is considered valid.

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 --finalize
```
Your finalized metadata file is now ready to submit to the [cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry). Follow [these steps](How-to-submit-an-entry-to-the-registry) to proceed with the submission.


## Token Registry Information  
This page was generated automatically from: [https://github.com/cardano-foundation/cardano-token-registry/wiki](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-to-prepare-an-entry-for-the-registry-%28Plutus-script%29).