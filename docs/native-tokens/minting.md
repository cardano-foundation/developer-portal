---
id: minting
title: Minting native assets
sidebar_label: Minting native assets
---

In this section we will be minting native assets - not NFTs. It is strongly advised to work through this section and get a better understand as to how transactions and minting works.
Minting NFTs will follow the same process, with only a few tweaks.

## Pre-requisites

1. A running and cardano node - accesible through the cardano-cli command
2. You have some knowledge in linux as to navigation between directories, creating and editing files as well as setting and inspecting variables via linux shell


## Overview
This tutorial will give you a copy & pastable walk through the complete token lifecycle:

![img](https://ucarecdn.com/75b79657-9f94-41b9-9426-7a65245f14ee/multiassetdiagram.png)

For this section we will be using the testnet. The only difference to minting native assets in the mainnet will be that you need to substitute the network variable with mainnet, instead of testnet.

### What we are going to do

Here's a brief explanation what we're going to do with the cardano-cli:

1. Set everything up
2. Build a new address and keys
3. Generate a minting policy
4. Draft a minting transaction
5. Calculate fees
6. Send the transaction and mint tokens (to ourselves)
7. Send the tokens to a Daedalus wallet 
8. Burn some token 

### Directory strucutre

We'll be working in a new directory. Here is an overview with every file we will be generating.

```
├── burning.raw                    # Raw transaction to burn token
├── burning.signed                 # Signed transaction to burn token
├── matx.raw                       # Raw transaction to mint token
├── matx.signed                    # Signed transaction to mint token
├── metadata.json                  # Metadata to specify NFT attributes
├── payment.addr                   # Address to send / recieve 
├── payment.skey                   # Payment signing key
├── payment.vkey                   # Payment verification key
├── policy                         # Folder which holds everything policywise
│   ├── policy.script              # Script to genereate the policyID
│   ├── policy.skey                # Policy signing key
│   ├── policy.vkey                # Policy verification key
│   └── policyID                   # File which holds the policy ID
└── protocol.json                  # Protocol parameters
```

### Token architecture

Before minting native assets, you need to ask yourself at least those four questions:

1. What will be the name of my custom token(s)?
2. How many do I want to mint?
3. Will there be a time constraint for interaction (minting or burning token?)
4. Who should be able to mint them?

Number 1, 3 and 4 will be defined in a so called monetary policy script, whereas the actual amount will only be defined on the minting transaction.

For this guide we will use:

1. What will be the name of my custom token(s)?  
--> Testtoken
2. How many do I want to mint?  
--> 10 million (10000000)
3. Will there be a time constraint for interaction (minting or burning token?)  
---> No (we will however when making NFTs), we want to mint and burn them however we like.
4. Who should be able to mint them?  
--> only one signature (which we posses) should be able to sign the transaction and therefore be able to mint the token

## Setup
### Cardano node socket path
To work with the cardano-cli we need to export an enviroment variable called <i>CARDANO_NODE_SOCKET_PATH</i>. Please note that the variable name is all uppercase.
The variable needs to hold the absolute path to the socket file of your running cardano node installation.

If you're unsure or do not know where to find your socket path, please check the command on how you start / run your cardano node.  
For example - if you start your node with this command
```bash
/home/user/.local/bin/cardano-node run \
 --topology config/testnet-topology.json \
 --database-path db \
 --socket-path /home/user/TESTNET_NODE/socket/node.socket \
 --port 3001 \
 --config config/testnet-config.json
```
As you can see, the bold part is the path we need to set the variable to:

```bash
export CARDANO_NODE_SOCKET_PATH="/home/user/TESTNET_NODE/socket/node.socket"
```
You obviously need to adjust the path on your setup and your socket path accordingly.

### Improve readability
Since we've already answered all of our questions above, we are going to set variables on our terminal / bash to make readability a bit easier.

```bash
testnet="testnet-magic 1097911063"
tokenname="Testtoken"
tokenamount="10000000"
fee="0"
output="0"
```

Make a new directory, for this guide and change into it
```bash
mkdir tokens
cd tokens/
```