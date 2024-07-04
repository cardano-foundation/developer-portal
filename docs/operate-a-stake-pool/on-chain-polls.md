---
id: on-chain-polls
title: On-Chain Polls
sidebar_label: On-Chain Polls
description: On-Chain Polls
image: ../img/og-developer-portal.png
---

In the 8.0.0 version of Cardano-node, we incorporated a new group of commands to facilitate voting among stake pool operators. An "official" poll is characterized by being endorsed with a genesis delegate key.

:::important
This tutorial requires cardano-node 8.0.0 

https://github.com/IntersectMBO/cardano-node/releases/tag/8.0.0
:::

## CIP-0094 - Poll participation
### Pre-requisites
​For this guide, you require a Cardano-cli that has the `governance poll` subcommands. You can use anything from the Cardano-node [release v8.0.0](https://github.com/IntersectMBO/cardano-node/releases) or a specially [backported 1.35.7 version](https://github.com/CardanoSolutions/cardano-node/releases/tag/1.35.7%2Bcip-0094). Once a Genesis Delegate Key holder has signed and posted a new poll question on the chain, it will appear in this Cardano Foundation [CIP-0094-polls repository](https://github.com/cardano-foundation/CIP-0094-polls).

You can find the JSON file containing the poll question in CBOR format by navigating into the specific subfolder.

For instance, the first [PreProd network Test question](https://github.com/cardano-foundation/CIP-0094-polls/tree/main/networks/preprod/d8c1b1d871a27d74fbddfa16d28ce38288411a75c5d3561bb74066bcd54689e2) appears like this:
**poll.json**

```json
{
    "type": "GovernancePoll",
    "description": "An on-chain poll for SPOs: How satisfied are you with the current rewards and incentives scheme?",
    "cborHex": "a1185ea200827840486f77207361746973666965642061726520796f752077697468207468652063757272656e74207265776172647320616e6420696e63656e74697665732073636568656d653f0183816c646973736174697366696564816a6e6f206f70696e696f6e8169736174697366696564"
}
```

:::info
The signature from the genesis delegate key isn't included in this metadata but is employed as an additional signatory on the initiating transaction.
:::

Download this file to your node.

## Creating answer
​
From that point, you can generate a metadata entry to respond to the poll using the `governance answer-poll` command in the following way:
​
```bash
$ cardano-cli governance answer-poll --poll-file poll.json
```
​
This command will invite an interactive response from you. If you prefer not to respond interactively, you can employ `--answer` along with the index of the answer.

Executing this command will present the survey in a format easy to comprehend and will ask for your answer, as demonstrated below:
​
```
How satisfied are you with the current rewards and incentives scheme?
[0] dissatisfied
[1] no opinion
[2] satisfied
​
Please indicate an answer (by index): _
```

You can move forward by entering one of the possible answer indices (in this case, `0`, `1`, or `2`) followed by a newline. This will generate witnessed metadata in the form of a detailed JSON schema, which should be subsequently posted on-chain in any transaction and **signed with your stake pool's cold key**: ideally, this is achieved by constructing a basic transaction directed to yourself that carries the metadata.

Here is a sample of metadata where the answer `2` is selected:

**answer.json**

```json
{
  "94": {
    "map": [
      {
        "k": { "int": 2 },
        "v": { "bytes": "62c6be72bdf0b5b16e37e4f55cf87e46bd1281ee358b25b8006358bf25e71798" }
      },
      {
        "k": { "int": 3 },
        "v": { "int": 2 }
      }
    ]
  }
}
```
## Publishing answer
​
From this point, you can utilize the `transaction build` command to generate a transaction for posting on-chain. You will require a signing key linked to a UTxO possessing sufficient funds to facilitate the transaction (approximately 0.2 Ada if you're making a basic transaction to yourself).

Assuming you have stored the metadata generated from the previous step in a file named `answer.json`, the command to construct the transaction would appear as follows:

```
$ cardano-cli transaction build \
    --babbage-era \
    --cardano-mode \
    --mainnet \
    --tx-in $TXID#$IX \
    --change-address $ADDRESS \
    --metadata-json-file answer.json \
    --json-metadata-detailed-schema \
    --required-signer-hash $POOL_ID \
    --out-file answer.tx
```

:::caution

Please be aware that adding `--required-signer-hash` is crucial for the response to be considered valid for the survey; this serves as your identification as a stake pool operator.

:::

You can produce the `$POOL_ID` hash from the Bech32 formatted pool ID using the Bech32 command:
​
```
$ bech32 <<< pool1....
```

To submit the response to the chain, you need to provide the respective values for `--tx-in` & `--change-address` from one of your wallets.

From this point, you can sign `answer.tx` using your stake pool's cold key and any necessary payment key, then submit the result as usual. If everything proceeds correctly, the cardano-cli should present a transaction id that you can monitor on-chain to confirm your survey response was correctly published.

SPO-Poll Dashboards where your transaction should now be visible:

- Cardanoscan.io  [[PreProd](https://preprod.cardanoscan.io/spo-polls/)]   [[Mainnet](https://cardanoscan.io/spo-polls/)]
​
## Verifying Answers
​
Lastly, you can validate answers observed on-chain using the `governance verify-poll` command. The term 'verify' here has a dual meaning:

- It verifies that an answer is valid in the context of a specific survey
- It provides a list of the signatory key hashes found in the transaction; in the case of a valid submission, one key hash will correspond to a recognized stake pool id.

Assuming you still have the original `poll.json` file, and a signed transaction carrying a survey answer as `answer.signed`, you can confirm its validity using:
​
```
$ cardano-cli governance verify-poll \
  --poll-file poll.json \
  --tx-file answer.signed
```
​
Upon successful execution, this should produce something like:
​
```
Found valid poll answer, signed by:
[
    "f8db28823f8ebd01a2d9e24efb2f0d18e387665770274513e370b5d5"
]
```
​
Alternatively, the command will identify a problem with the answer and/or poll.

## References
- [Entering Voltaire: on-chain poll for SPOs](https://forum.cardano.org/t/entering-voltaire-on-chain-poll-for-spos/117330?u=adatainment)
- [Cardano Node 8.0.0 release](https://github.com/IntersectMBO/cardano-node/releases/tag/8.0.0)
- [Cardano Node documentation: Governance](https://github.com/input-output-hk/cardano-node-wiki/wiki/cardano-governance)
