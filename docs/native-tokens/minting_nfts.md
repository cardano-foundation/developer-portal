---
id: minting_nfts
title: Minting NFTs
sidebar_label: Minting NFTs
---


## What's different?

### Pre-requisites

1. Uploaded image to IPFS (need to have IPFS hash ready)

## Step by step
Since the creation of native assets is documented extensivly in the [minting](minting_nfts.md) chapter we won't go into much detail here.
Here's a little recap and needed setup

### Setup




### Crafting your transaction

### Metadata

Additionally we need some metadata to attach to the transaction. Metadata helps us to display things like image URIs and stuff that truly makes it a NFT. With this workaround, third party plattforms like pool.pm can easily trace back to the last minting transaction, read the metadata and query images and attributes accordingly.

The one thing to keep in mind — the names (in our case “Testtoken” and “MunichMetalCoin”) are case sensitive and need to match the names in the minting transaction.
We’ll leave the image property blank for now — if you want to attach an image best practice suggests you paste in your ipfs:// hash.

Here’s an example of my metadata.json which we’ll use for this guide:

```json
{
        "721": {
            "please_insert_policyID_here": {
              "NFT_1": {
                "description": "This is just a testtoken",
                "name": "One of ten testtokens",
                "type":"",
                "id": 1,
                "name": "This is my first test token",
                "image": ""
              }
            },
            "please_insert_policyID_here": {
              "NFT_2": {
                "description": "One coin to rule them all",
                "name": "One of ten Munich Metal Coins",
                "type":"",
                "id": 1,
                "name": "This is my first test token",
                "image": ""
              }
            }
        }
}
```