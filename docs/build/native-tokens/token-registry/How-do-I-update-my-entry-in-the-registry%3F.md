--- 
sidebar_label: How do I update my entry in the registry?
custom_edit_url: null
title: How do I update my entry in the registry?
--- 
# Updating existing metadata json files
Basically for updating metadata entries in the token registry the process is the same as for adding a new metadata entry like described [here](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-to-prepare-an-entry-for-the-registry-%28NA-policy-script%29) with only some slight differences. If you still have a _draft file_ available from a previous metadata creation session you start with step 2.

1. Start from scratch with a new JSON file using token-metadata-creator ([steps 1 - 4 of the preparation process](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-to-prepare-an-entry-for-the-registry-%28NA-policy-script%29))
2. If you still have the raw JSON file (the one that hasn't been signed and finalized ending with .json.draft), edit the values that need to change manually or use token-metadata-creator to do so.
3. Prior to signing the entry, manually edit the .json.draft file and increment the 'sequenceNumber' for the relevant fields. It is important that the sequenceNumber is incremented and that it is incremented before the signing is done because the signature includes this sequenceNumber.
4. Sign the new entry (will produce new signatures that will replace the existing ones for updated fields) ([Step 5](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-to-prepare-an-entry-for-the-registry-%28NA-policy-script%29)).
5. Finalize the submission using token-metadata-creator ([Step 6](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-to-prepare-an-entry-for-the-registry-%28NA-policy-script%29))
6. Submit a new pull request

## Example
We want to update the `description` and `decimals` property of the following metadata file that has already been registered.
```json
{
    "policy": "82008200581cfb864e59bf8620349c3ebe29af5ad0f9ca2e319d39e115eb93aa58a4",
    "name": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "7ad898472b591c5022bb6d0f92a1e630a959bdf8306e83b4cf75d5e4153eae114912b0efd417c0451f2a73a37a26b32442603cfd8f49825b8c206d5c6c768c0e"
            }
        ],
        "sequenceNumber": 0,
        "value": "My Gaming Token"
    },
    "url": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "d756e55b337ee18955f0838db4599eca4e49e8adcdb57917d0db4cae8a988a11d925cead905665f9d2810f085fe9b109f548b204cb20c753dd2323dd67828604"
            }
        ],
        "sequenceNumber": 0,
        "value": "https://finalfantasy.fandom.com/wiki/Gil"
    },
    "description": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "0a340c33881b0c47d6295c1dc40b9552bd784eb51f33f96fa25f55c56b09271b264b6605774f6451d7fcef9b850c5ef53bb9430a6f3c2e8a00cf7edcccbf3505"
            }
        ],
        "sequenceNumber": 0,
        "value": "My cool metaverse gaming token description."
    },
    "ticker": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "b27966971d0ed06d58d082423841387a338ce18bb21aba9abd5c6877c5678e4089ebbcd33705e3539c1aaab02645080b2661d2857502e2416a9912f248902b04"
            }
        ],
        "sequenceNumber": 0,
        "value": "MGT"
    },
    "subject": "6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65",
    "decimals": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "5a4db91646502b067d7771d158d36d145e66c4bcfef59e620deee044e3df4e610ad6d2eafe67b90977cd6187a142976ff1650f7f45e4791215be770eaffe4103"
            }
        ],
        "sequenceNumber": 0,
        "value": 4
    }
}
```

### Step 1: initialize a new draft file 
```console
token-metadata-creator entry --init 6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65
```
### Step 2: add the properties including the updated values for the `description` and `decimals` property
```console
token-metadata-creator entry 6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65 \
  --name "My Gaming Token" \
  --description "My updated description." \
  --policy policy.json \
  --ticker "MGT" \
  --url "https://finalfantasy.fandom.com/wiki/Gil" \
  --decimals 0
```

### REMARK: If you still have the draft file available from the previous metadata creation process, open an editor, edit the property values manually and continue with step 3. You could also use the token-metadata-creator with an already existing draft file in the current folder. It'll automatically update the values and empty the `signatures` array for each updated property and increment the according `sequenceNumber` fields. In the latter case you can jump to step 4.

### Step 3: increment `sequenceNumber`
Open a file editor and increment the `sequenceNumber` field of each property that has been updated. This results in the following draft file:
```json
{
    "policy": "82008200581cfb864e59bf8620349c3ebe29af5ad0f9ca2e319d39e115eb93aa58a4",
    "name": {
        "signatures": [],
        "sequenceNumber": 0,
        "value": "My Gaming Token"
    },
    "url": {
        "signatures": [],
        "sequenceNumber": 0,
        "value": "https://finalfantasy.fandom.com/wiki/Gil"
    },
    "description": {
        "signatures": [],
        "sequenceNumber": 1,
        "value": "My new description."
    },
    "ticker": {
        "signatures": [],
        "sequenceNumber": 0,
        "value": "MGT"
    },
    "subject": "6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65",
    "decimals": {
        "signatures": [],
        "sequenceNumber": 1,
        "value": 0
    }
}
```
###

### Step 4: sign and finalize the metadata file
* Sign the file via
```console
token-metadata-creator entry 6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65 -a policy.skey
````

* Finalize the file via
```console
token-metadata-creator entry 6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65 --finalize
```

The finalized file looks like:
```json
{
    "policy": "82008200581cfb864e59bf8620349c3ebe29af5ad0f9ca2e319d39e115eb93aa58a4",
    "name": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "7ad898472b591c5022bb6d0f92a1e630a959bdf8306e83b4cf75d5e4153eae114912b0efd417c0451f2a73a37a26b32442603cfd8f49825b8c206d5c6c768c0e"
            },
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "7ad898472b591c5022bb6d0f92a1e630a959bdf8306e83b4cf75d5e4153eae114912b0efd417c0451f2a73a37a26b32442603cfd8f49825b8c206d5c6c768c0e"
            }
        ],
        "sequenceNumber": 0,
        "value": "My Gaming Token"
    },
    "url": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "d756e55b337ee18955f0838db4599eca4e49e8adcdb57917d0db4cae8a988a11d925cead905665f9d2810f085fe9b109f548b204cb20c753dd2323dd67828604"
            },
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "d756e55b337ee18955f0838db4599eca4e49e8adcdb57917d0db4cae8a988a11d925cead905665f9d2810f085fe9b109f548b204cb20c753dd2323dd67828604"
            }
        ],
        "sequenceNumber": 0,
        "value": "https://finalfantasy.fandom.com/wiki/Gil"
    },
    "description": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "50e867afa51fcb60420594788d210e89a044fa52de31b5d66a763aa25f51dcaaa73462fb4a82ab6254d67bc25e4a47ab17daef92a783c10fbdff549261f4a405"
            }
        ],
        "sequenceNumber": 1,
        "value": "My new description."
    },
    "ticker": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "b27966971d0ed06d58d082423841387a338ce18bb21aba9abd5c6877c5678e4089ebbcd33705e3539c1aaab02645080b2661d2857502e2416a9912f248902b04"
            },
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "b27966971d0ed06d58d082423841387a338ce18bb21aba9abd5c6877c5678e4089ebbcd33705e3539c1aaab02645080b2661d2857502e2416a9912f248902b04"
            }
        ],
        "sequenceNumber": 0,
        "value": "MGT"
    },
    "subject": "6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65",
    "decimals": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "1f8065fdde60744eae79391c8a842a0338546e09f87d3267eeefff2fb4551bd6a073318b979446766d5ff9e7e433b19031212154147c5ea7bf222dae9b0d4304"
            }
        ],
        "sequenceNumber": 1,
        "value": 0
    }
}
```

### Step 5: do the PR
Follow the instructions provided [here](../How-to-submit-an-entry-to-the-registry).
## Token Registry Information  
This page was generated automatically from: [https://github.com/cardano-foundation/cardano-token-registry/wiki](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-do-I-update-my-entry-in-the-registry%3F).