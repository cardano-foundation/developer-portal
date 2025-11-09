--- 
sidebar_label: How do I delete my entry from the registry?
custom_edit_url: null
title: How do I delete my entry from the registry?
--- 
Removing an entry from the registry is not an ad-hoc process. If this was allowed without verification, anyone could delete anyone's metadata. The verification process is therefore identical to updating an entry, with the additional step of updating the value of the 'name' and 'description' fields to 'VOID' and explicitly mentioning in the title of your Pull Request that you would like the entry deleted.

If the Pull Request passes validation (meaning you have signed the submission with the required key/s), the maintainers of the registry will delete your entry.

## Steps

- [Update](How-do-I-update-my-entry-in-the-registry%3F) your entry by updating the value of the 'name' and 'description' fields to 'VOID'.
- Submit a pull request with a title that indicates the request for deletion.
- After successful verification we will do the actual deletion of the file.

## Example

Following along the example provided in [How do I update my entry in the registry?](How-do-I-update-my-entry-in-the-registry%3F) we change the `name` and `description` properties to the value `VOID`, increment the `sequenceNumber` fields of those properties and again sign and finalize the file. 

Considering that the "old" metadata file is still available on your local machine the sequence of the following commands does the job:
```console
token-metadata-creator entry 6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65 --name "VOID" --description "VOID"
token-metadata-creator entry 6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65 -a policy.skey
token-metadata-creator entry 6ad121cd218e513bdb8ad67afc04d188f859b25d258a694c382699416d7961737365746e616d65 --finalize
```

The final file looks like:
```json
{
    "policy": "82008200581cfb864e59bf8620349c3ebe29af5ad0f9ca2e319d39e115eb93aa58a4",
    "name": {
        "signatures": [
            {
                "publicKey": "04a72e68bd7601aa1cc1da7194676b0f8c9fb55be0291f1089ff5d6ce5e2998a",
                "signature": "8f71c95853d9136b206d3837ff86e88d060d2543e608091e56a60ce1fad7bff3807f832053652351d5fb885ba0099fe0f3a165f73e845db8fa99e32725f0430c"
            }
        ],
        "sequenceNumber": 1,
        "value": "VOID"
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
                "signature": "8257c2ad5aad6f2f5f7e1df76a4026d5650aab6e6fb770af39e05baf0ee2768c28f4482ad9b01d16a4c6dbd6e2b6751708635ffe331860ca7b40673f91238201"
            }
        ],
        "sequenceNumber": 2,
        "value": "VOID"
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
            },
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

This file can then be registered via a PR with an appropriate title indicating that the metadata shall be deleted.
## Token Registry Information  
This page was generated automatically from: [https://github.com/cardano-foundation/cardano-token-registry/wiki](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-do-I-delete-my-entry-from-the-registry%3F).