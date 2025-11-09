--- 
sidebar_label: How to prepare an entry for the registry (NA policy script)
custom_edit_url: null
title: How to prepare an entry for the registry (NA policy script)
sidebar_position: 5
--- 
## Pre-Requisites

To register native token mappings, it is recommended to have pre-existing knowledge about Cardano native assets. Start by reading through the [developer guide on Native Assets](https://developers.cardano.org/docs/native-tokens/minting/).    

After creating a Cardano native asset you will need the following to proceed with the steps to generate a mapping for the registry:     

- The monetary policy script for your native asset.
- The assetName associated with the monetary policy script.
- The policyId of the monetary policy script.
- The private key/s used to define your asset policy.
- Install `offchain-metadata-tools` (see [offchain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools)).

## Step 1: Generate the 'subject'

To create a new mapping, you must first obtain your metadata subject. The subject is defined as the concatenation of the base16-encoded policyId and base16-encoded name of your asset. In case your asset name is empty, then the policyId is your subject.

For this example, we will consider the following native asset:

`policyId="baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f"` `assetName="myassetname"`

- Base16 encode your assetName:

```console
$ echo -n "myassetname" | xxd -ps
6d7961737365746e616d65
```
- Concatenate the policyId with the base16-encoded assetName to obtain the 'subject' for your entry: 

`baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65`

**REMARK: With the current approach it is essential that the subject string is all lower case.**

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
  --policy policy.json
```
Where `policy.json` is the monetary policy script file that hashes to the policyId.

## Step 4: Add optional fields 

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
  --ticker "TKN" \
  --url "https://finalfantasy.fandom.com/wiki/Gil" \
  --logo "icon.png" \
  --decimals 4         
```

## Step 5: Sign your metadata

Each metadata item must be signed with the key/s used to define your asset policy. For this example we assume only a single signing key is required to validate the monetary policy script and that all metadata fields will be signed at once with the signing key file. Please refer to [offchain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools) for more granular options.

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 -a policy.skey
```

## Step 6: Finalize your mapping

This will run some additional validations on your submission and check that it is considered valid.

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 --finalize
```
Your finalized metadata file is now ready to submit to the [cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry). Follow [these steps](How-to-submit-an-entry-to-the-registry) to proceed with the submission.


## Token Registry Information  
This page was generated automatically from: [https://github.com/cardano-foundation/cardano-token-registry/wiki](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-to-prepare-an-entry-for-the-registry-%28NA-policy-script%29).