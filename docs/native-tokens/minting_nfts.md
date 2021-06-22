---
id: minting_nfts
title: Minting NFTs
sidebar_label: Minting NFTs
---
:::note
There are many ways to realize NFTs with Cardano. In this guide we will concentrate on the most dominant way which is to attach storage references of other services like [IPFS](https://ipfs.io/) to our tokens.
:::

## What's the difference?
What is the difference between native assets and NFTs?  
From a technical point of view NFTs are exactly the same as native assets. But there are some additional characteristics which makes an native  asset truly a NFT:

1. As the name states - it must be 'non-fungible'. This means you need to have unique identifiers or attributes, attached to a token to make it distinguishable from others.
2. Most of the times a NFT should live on the blockchain forever. Therefore we need some sort of mechanism to ensure a NFT stays unique and can not be duplicated.

### The policyID 
Native assets in cardano feature the following characteristics:
1. An amount / value (how much are there?)
2. A name 
3. A unique policyID

Since asset names are not unique and can be easily duplicated, Cardano NFTs need to be identified by the <b>policyID</b>.  
This ID is unique and attached permanently to the asset.
The policy ID stems from a policy script which defines characteristics such as who can mit tokens and when those actions can be made.

Many NFT projects make the policyID under which the NFTs were minted publicly availiable so anyone can differentatiate fraudulent / duplicate NFTs from the original tokens.

Some services even offer to register your policyID to detect tokens which feature the same attributes as your token but were minted under a different policy.

### Metadata attributes

In addition to the unique policyID we can also attach metadata with various attributes to a transaction. 

Here is an example from [nft-maker.io](https://www.nft-maker.io/)

```json
{
  "721": {
    "{policy_id}": {
      "{policy_name}": {
        "name": "<required>",
        "description": "<optional>",
        "sha256": "<required>",
        "type": "<required>",
        "image": "<required>",
        "location": {
          "ipfs": "<required>",
          "https": "<optional>",
          "arweave": "<optional>"
        }
      }
    }
  }
}
```
Metadata helps us to display things like image URIs and stuff that truly makes it a NFT. With this workaround of attaching metadata, third party plattforms like [pool.pm](https://pool.pm/) can easily trace back to the last minting transaction, read the metadata and query images and attributes accordingly.
The query would look something like this:

1. Get asset name and policyID.
2. Look up the latest minting transaction of this asset.
3. Check the metadata for label ‘721’.
4. Match the asset name and (in this case) the {policy_name}-entry.
5. Query the IPFS hash and all other attributes to the corresponding entry.


:::note
<b>There is currently no offical standard as to how a NFT or the metadata is defined.</b>
There is a [Cardano Improvement Proposal](https://github.com/cardano-foundation/CIPs/pull/85) but it's not implemented - yet.
So be cautious, this guide only tries to explain and describe the current state and how NFTs are being made at the time of writing.
:::

### Time locking

Since NFTs are likely to be traded or sold, they should follow a more strict policy. Most of the time, a value is defined by the (artifical) scarcity of an asset.

You can regulate such factors with  [multisignature scripts](https://github.com/input-output-hk/cardano-node/blob/c6b574229f76627a058a7e559599d2fc3f40575d/doc/reference/simple-scripts.md).

For this guide we will chose the following constraints:

1. There should be only one defined signature allowed to mint (or burn) the NFT.
2. The signature will expire <b>10000 blocks</b> from now to leave room if something we screw something up.


## Pre-requisites
Apart from the same requisites as on the [minting native assets](minting.md) guide we will additionally need:

1. Obviously what / how many NFTs you want to make.  
--> We are going to make only one NFT
2. A already populated <i>metadata.json</i>  
3. Know how your minting policy should look like.
--> Only one signature allowed (which we will create in this guide)  
--> No further minting or burning of the asset allowed after 10000 blocks have passend since the transaction was made
4. Hash if uploaded image to IPFS  
--> We will use this [image](https://gateway.pinata.cloud/ipfs/QmcPiDP1THtK2gfnwAJDQiPynf4F78aVQPSYZWKaDra2V8)

:::note
We recommend upload images to IPFS as it is the most common decentralized storage service. There are alternatives but IFPS has the biggest adoption in terms of how many NFTs got minted.
:::

## Setup
Since the creation of native assets is documented extensivly in the [minting](minting_nfts.md) chapter we won't go into much detail here.
Here's a little recap and needed setup

### Working directory
First of all we are going to set up a new working directory and change into it.

```bash
mkdir nft
cd nft/
```

### Set variables
For better readability and debugging of failed transactions we will set important values in a more readable variable.
```bash
tokenname="NFT_1"
tokenamount="1"
fee="0"
output="0"
ipfs_hash="please insert your ipfs hash here"
```
:::note
The IFPS hash is a key requirement and can be found once you upload your image to IPFS. Here's an example of how the IPFS looks like when a image is uploaded in [pinata](https://pinata.cloud/)
![img](../../static/img/nfts/pinata_pin.PNG)
:::


### Generate keys and address

We will be generating new keys and a new payment address:

```bash
cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey
```

Those two keys can now be used to generate an address.

```bash
cardano-cli address build --payment-verification-key-file payment.vkey --out-file payment.addr --mainnet
```

We will save our address hash in a variable called address.

```bash
address=$(cat payment.addr)
```

### Fund the address

Submiting transactions always requires you to pay a fee. 
Sending native assets requires also requires to send at least 1 ada.  
So make sure the address you are going to use as the input for the minting transaction has sufficient funds. 
For our example the newly generated address was funded with 10 ADA.

```bash
cardano-cli query utxo --address $address --mainnet
```

### Export protocol parameters

For our transaction calculations we need some of the current protocol parameters. The parameters can be saved in a file called <i>protocol.json</i> with this command:

```bash
cardano-cli query protocol-parameters --mainnet --out-file protocol.json
```

### Creating the policyID
Just as in generating native assets we will first of all need to generate some policy related files like key pairs and a policy script.

```bash
mkdir policy
```

:::note
We don’t change into this directory and everything is done from our working directory
:::

Generate a new set of key pairs:

```bash
cardano-cli address key-gen \
    --verification-key-file policy/policy.vkey \
    --signing-key-file policy/policy.skey
```

Instead of only defining a single signature (as we did in the native asset minting guide) our script file needs to implement the following characteristics (which we defined above):

1. Only one signature allowed
2. No further minting or burning of the asset allowed after 10000 blocks have passend since the transaction was made

For this specific purpose <i>policy.script</i> file which will look like this:

```json
{
  "type": "all",
  "scripts":
  [
    {
      "type": "before",
      "slot": <insert slot here>
    },
    {
      "type": "sig",
      "keyHash": "insert keyHash here"
    }
  ]
}
```

As you can see we need to adjust two values here, the <i>slot</i> number as well as the <i>keyHash</i>.

In order to set everything at once and just copy and paste it, use this command(s):
<b>You need to have the <i>jq</i> installed to parse the tip correctly!</b>

```bash
echo "{" >> policy/policy.script
echo "  \"type\": \"all\"" >> policy/policy.script 
echo "  \"scripts\":" >> policy/policy.script 
echo "  [" >> policy/policy.script 
echo "   {" >> policy/policy.script 
echo "     \"type\": \"before\"" >> policy/policy.script 
echo "     \"slot\": $(expr $(cardano-cli query tip --mainnet | jq .slot?) + 10000)" >> policy/policy.script
echo "   }," >> policy/policy.script 
echo "   {" >> policy/policy.script
echo "     \"type\": \"sig\"" >> policy/policy.script 
echo "     \"keyHash\": \"$(cardano-cli address key-hash --payment-verification-key-file policy/policy.vkey)\"," >> policy/policy.script 
echo "   }" >> policy/policy.script
echo "  ]" >> policy/policy.script 
echo "}" >> policy/policy.script
```

If this command is not working, please set the key hash and correct slot manually.

To generate the keyHash use the following command:
```bash
cardano-cli address key-hash --payment-verification-key-file policy/policy.vkey
```

To calculate the correct slot query the current block and add 10000 to it:
```bash
cardano-cli query tip --mainnet
```

Make a new file called policy.script in the policy folder 
```bash
touch policy/policy.script
```
Paste the JSON from above, populated with your keyHash and your slot number into it
```bash
nano policy/policy.script
```

:::note
Be aware the the slot number is defined as a integer and therefore needs no double quotation marks whereas the keyHash is defined as a string and needs to be wrapped in double quotation marks.
:::

Take note of your slotnumber and save it in a variable

```bash
slotnumber="Replace this with your slot number"
```

The last step is to generate the policyID:

```bash
cardano-cli transaction policyid --script-file ./policy/policy.script >> policy/policyID
```

### Metadata
Since we now have our policy as well as our policyID defined, we need to adjust our metadata information.

Here’s an example of the metadata.json which we’ll use for this guide:

```json
{
        "721": {
            "please_insert_policyID_here": {
              "NFT_1": {
                "description": "This is my first NFT thanks to the Cardano foundation",
                "name": "Cardano foundation NFT guide token",
                "id": 1,
                "image": ""
              }
            }
        }
}
```

:::note
Please note that the third element in the hierarchy needs to have the same name as our NFT native asset will be named.
:::

Save this file as <i>metadata.json</i>. 

If you want to generate it "on the fly" use the following commands:

```bash
echo "{" >> metadata.json
echo "  \"721: {" >> metadata.json 
echo "    \"$(cat policy/policyID)\": {" >> metadata.json 
echo "      \"$(echo $tokenname)\": {" >> metadata.json
echo "        \"description\": \"This is my first NFT thanks to the Cardano foundation\"," >> metadata.json
echo "        \"name\": \"Cardano foundation NFT guide token\"," >> metadata.json
echo "        \"id\": 1," >> metadata.json
echo "        \"image\": \"$(echo $ipfs_hash)\"" >> metadata.json
echo "      }" >> metadata.json
echo "    }" >> metadata.json 
echo "  }" >> metadata.json 
echo "}" >> metadata.json
```


### Crafting the transaction

Let's begin building our transaction.
Before we start we will again, need some setup, to make the transaction building easier.
Query your payment address and take note of the different values present.

```bash
cardano-cli query utxo --address $address --mainnet
```

Your output should look something like this (fictional example):

```bash
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
b35a4ba9ef3ce21adcd6879d08553642224304704d206c74d3ffb3e6eed3ca28     0        1000000000 lovelace
```

Since we need each of those values in our transaction we will store them individually in a corresponding variable.

```bash
txhash="insert your txhash here"
txix="insert your TxIx here"
funds="insert Amount in lovelace here"
policyid=$(cat policy/policyID)
```

If you're unsure, check if all of the other needed variables for the transaction are set:

``bash
echo $fee
echo $address
echo $output
echo $tokenamount
echo $policyid
echo $tokenname
echo $slotnumber
```

If everything is set, run this command to generate a raw transaction file.

```bash
cardano-cli transaction build-raw \
--fee $fee  \
--tx-in $txhash#$txix  \
--tx-out $address+$output+"$tokenamount $policyid.$tokenname" \
--mint="$tokenamount $policyid.$tokenname" \
--metadata-json-file metadata.json  \
--invalid-hereafter $slotnumber
--out-file matx.raw
```

As with every other transaction we need to calculate the fee and the output and save them in the correspondong variables (which are currently set to zero).

Use this command to set the <i>$fee</i> variable.
```bash
fee=$(cardano-cli transaction calculate-min-fee --tx-body-file matx.raw --tx-in-count 1 --tx-out-count 1 --witness-count 1 --mainnet --protocol-params-file protocol.json | cut -d " " -f1)
```

And this command to calculate the correct value for <i>$output</i>.
```bash
output=$(expr $funds - $fee)
```

With the newly set values, re-issue the building of the raw transaction.

```bash
cardano-cli transaction build-raw \
--fee $fee  \
--tx-in $txhash#$txix  \
--tx-out $address+$output+"$tokenamount $policyid.$tokenname" \
--mint="$tokenamount $policyid.$tokenname" \
--metadata-json-file metadata.json  \
--invalid-hereafter $slotnumber
--out-file matx.raw
```

```bash
cardano-cli transaction sign  \
--signing-key-file payment.skey  \
--signing-key-file policy/policy.skey  \
--script-file policy/policy.script  \
--mainnet --tx-body-file matx.raw  \
--out-file matx.signed
```

:::note
The signed transaction will be saved in a new file called <i>matx.signed</i> instead of <i>matx.raw</i>.
:::

Now we are going to submit the transaction, therefore minting our native assets:
```bash
cardano-cli transaction submit --tx-file matx.signed --mainnet
```

Congratulations we have now successfully minted our own token.
After a couple of seconds we can check the output address
```bash
cardano-cli query utxo --address $address --mainnet
```

and should see something like this:

### Displaying your NFT

One of the most adopted NFT browers is [pool.pm](https://pool.pm/tokens).
Simply enter your address in the search bar, hit enter and your NFT will be displayed with all it's attributes and the corresponding image.

![img]