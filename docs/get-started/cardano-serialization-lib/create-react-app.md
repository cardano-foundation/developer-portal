---
id: create-react-app
sidebar_position: 6
title: Create React App for Serialization-Lib
sidebar_label: Create React App
description: A Create React App with the necessary code to get started developing front-end DApps on Cardano
image: /img/og/og-getstarted-serialization-lib.png
--- 

## cardano-wallet-connector
`cardano-wallet-connector` is a Create React App boilerplate code that includes examples of how to use the Serialization-Lib to connect
to different Cardano Web wallets and send transactions. This lets developers who are familiar with React JS to get started
quickly with Cardano. The boilerplate code includes examples of how to execute simple transaction of sending someone ADA
and also how to interact with Plutus scripts (locking and redeeming assets from scripts). A developer familiar with React JS can clone
the GitHub repo and start building DApps

GitHub: [cardano-wallet-connector](https://github.com/dynamicstrategies/cardano-wallet-connector)

## Table of Contents

- [Introduction](#introduction)
- [Use Cases](#use-cases)
- [Installation](#installation)
- [Code Walkthrough](#code-walkthrough)
    + [Define Protocol Parameters](#1-define-protocol-parameters)
    + [Initialize the Transaction Builder](#2-initialize-the-transaction-builder)
    + [Add UTXOs to the Transaction as Inputs](#3-add-utxos-to-the-transaction-as-inputs)
    + [Add Outputs to the Transaction](#4-add-outputs-to-the-transaction)
    + [Add the Address where Change will be sent](#5-add-the-address-where-change-will-be-sent)
    + [Build the Body of the Transaction](#6-build-the-body-of-the-transaction)
    + [Sign the Transaction](#7-sign-the-transaction)
    + [Send the Transaction](#8-send-the-transaction)
- [UI Components](#ui-components)
- [Demo](#demo)

## Introduction
React JS is by far the most popular front-end framework and continues to grow fast, judging by the number of 
Stackoverflow questions when compared to other frameworks such as Angular, Vue and Svelte ([source](https://gist.github.com/tkrotoff/b1caa4c3a185629299ec234d2314e190)). 
It is also well documented, so that a beginner with some Javascript knowledge can pick it up, 
and powerful enough that more sophisticated full stack frameworks such as Next JS incorporate it.

A Create React App is the command that any new application is created with in React JS and anyone who has used this framework before
will know what it is and what to do with it.

React also has a mobile extension called React Native and the Serialization Lib has binding for it. Therefore choosing React Js
as starting point for a new projects comes with benefits that it can be expanded to a full stack, or a mobile project later on.

Having boilerplate code for React JS makes it easy for a large population of developers to get up and running quickly with Cardano.
And those familiar with other front-end frameworks can pick-it-up quickly after a short revision of [React basics](https://reactjs.org/docs/create-a-new-react-app.html)

## Use Cases

The boilerplate code covers the following use cases, starting with the simplest and working toward the more 
involved examples of interacting with smart contracts

1. Send ada to an address
2. Send Tokens (NFTs) to an address
3. Lock ada at a Plutus Script address
4. Lock Tokens (NFTs) at a Plutus Script address
5. Redeem ada from a Plutus Script address
6. Redeem Tokens (NFTs) from a Plutus Script address

In all of these examples the user signs the transactions with their Web wallet.
The wallets included in the boilerplate are Nami, Flint and CCVault 
(this last one has been rebranded to Eternlwallet at the end of March 2022). The code is extensible to other
wallets by adding a few lines of code as long as wallet follows the [CIP-30 standard](https://cips.cardano.org/cips/cip30/)

## Installation

Clone the Git repository into your dev machine and start a local server. When it finishes loading it will tell you what 
IP and port number it started on. In most cases it will be on localhost:3000. If the browser does not 
automatically open this address then open `localhost:3000` in your web browser.

```sh
git clone https://github.com/dynamicstrategies/cardano-wallet-connector.git
cd cardano-wallet-connector
npm install
npm start
```

:::note

Check the Node version that you are running and make sure that it is version 14 or greater

:::

```sh
node --version
```

## Code Walkthrough
In this section we will walkthrough the code and explain what different parts of it do. This should give the reader
a better understanding of what code is doing and what and then use this
information to built their own use cases. For this we will start with the example of how to Send some ada to an address

Building a Sending a transaction can be broken down into 8 steps:

### 1. Define Protocol Parameters

These parameters are set by Cardano and are static for the most part. If in doubt, the parameters can be checked by looking
in the table called `epoch_param` that is maintained by the `cardano-db-sync` service - how this is done is out of scope, 
for more info consult [cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync)

```javascript
this.protocolParams = {
    linearFee: {
        minFeeA: "44",
        minFeeB: "155381",
    },
    minUtxo: "34482",
    poolDeposit: "500000000",
    keyDeposit: "2000000",
    maxValSize: 5000,
    maxTxSize: 16384,
    priceMem: 0.0577,
    priceStep: 0.0000721,
    coinsPerUtxoWord: "34482",
}
```

### 2. Initialize the Transaction Builder

The transaction builder is initialized by giving it the protocol parameters

```javascript
initTransactionBuilder = async () => {

    const txBuilder = TransactionBuilder.new(
        TransactionBuilderConfigBuilder.new()
            .fee_algo(
                LinearFee.new(
                    BigNum.from_str(this.protocolParams.linearFee.minFeeA), 
                    BigNum.from_str(this.protocolParams.linearFee.minFeeB)
                )
            )
            .pool_deposit(BigNum.from_str(this.protocolParams.poolDeposit))
            .key_deposit(BigNum.from_str(this.protocolParams.keyDeposit))
            .coins_per_utxo_word(BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
            .max_value_size(this.protocolParams.maxValSize)
            .max_tx_size(this.protocolParams.maxTxSize)
            .prefer_pure_change(true)
            .build()
    );

    return txBuilder
}
```

### 3. Add UTXOs to the Transaction as Inputs
Define the address where the ada will be sent and the address to where any change will be given after the transaction builder is
done with balancing the transaction (so that the inputs + fees are always equal to the outputs). The first address is usually where you
want to send the ada (your friend, or plutus script address) and the second address is usually your own wallet address, so that the change
comes back to you.

```javascript
const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA)
const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)
```

Then add inputs to the transaction. This can be done by giving the Transaction Builder all the
available UTXOs in your wallet and the letting the Transaction Builder choose which ones to use.
There are a number of algorithms to choose from for how the Transaction Builder will choose the UTXOs. The available ones are 
`0` for LargestFirst, `1` for RandomImprove, `2` for LargestFirstMultiAsset and `3` for RandomImproveMultiAsset
In this example we use the RandomImprove algorithm.

```javascript
const txUnspentOutputs = await this.getTxUnspentOutputs();
txBuilder.add_inputs_from(txUnspentOutputs, 1)
```

Note that as of version Serialization-Lib v10, it now has these UTXO selection algorithms built-in.
In the previous versions of the Serialization-Lib, the RandomImprove had to be done using other libraries which and as a result you still might
see this when reading code from implementation of others - be careful to check which version of the Serialization-Lib they are using

### 4. Add Outputs to the Transaction

Every transaction needs some Outputs that it will spend.  When sending ada the amount needs to be sent in Lovelaces and
there are 1 000 000 lovelaces in 1 ada. The amount of lovelaces to send needs to be give as a String

```javascript
txBuilder.add_output(
    TransactionOutput.new(
        shelleyOutputAddress,
        Value.new(BigNum.from_str(this.state.lovelaceToSend.toString()))
    ),
);
```

### 5. Add the Address where Change will be sent
This is needed to ensure that the values of inputs + fees is 
always equal to the value of outputs

```javascript
txBuilder.add_change_if_needed(shelleyChangeAddress)
```

### 6. Build the Body of the Transaction

A transaction is composed of the Body that defines what inputs and outputs are affected, and
the Transaction Witness that defines who signed the transaction and in cases where
Plutus scripts are involved it also carries Datums and Validation logic. This step builds
the Transaction Body

```javascript
const txBody = txBuilder.build();
```

The next step creates the Transaction Witness

### 7. Sign the Transaction

A Transaction Witness is created, added to the transaction and the transaction is signed with the Web wallet.
When this part of the code is executed a pop-up from the user's web wallet will ask for the user to provide the password to their wallet
and once the user provides the password the wallet then Signs the transaction

```javascript
const transactionWitnessSet = TransactionWitnessSet.new();

const tx = Transaction.new(
    txBody,
    TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
)

let txVkeyWitnesses = await this.API.signTx(
    Buffer.from(
        tx.to_bytes(), "utf8"
    ).toString("hex"), 
    true
);

txVkeyWitnesses = TransactionWitnessSet.from_bytes(
    Buffer.from(txVkeyWitnesses, "hex")
);

transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

const signedTx = Transaction.new(
    tx.body(),
    transactionWitnessSet
);
```

### 8. Send the Transaction

The last step is to submit the transaction to the web wallet. The web wallet then forwards it to the blockchain.
If the submitted transaction passes validation checks that are done by the wallet it will return a transaction Id which means that 
the transaction has been added to the Mempool and waiting to be added to be included in one of the upcoming blocks.

```javascript
const submittedTxHash = await this.API.submitTx(
    Buffer.from(
        signedTx.to_bytes(), "utf8"
    ).toString("hex")
);
console.log(submittedTxHash)
```

We can `console.log(submittedTxHash)` the Transaction Hash and go try to find it on a blockchain explorer such as [cardanoscan.io](https://cardanoscan.io/)

## UI Components
When building a front-end app it is useful to have buttons, forms and other components that the user can interact with.
So included in the Create React App is an example of UI components from Blueprint JS which is a high performance
React-based UI toolkit for the web. It is an opensource project developer by Palantir that has an extensive library
for building applications and is well documented

Link to [Blueprint UI docs](https://blueprintjs.com/docs/)

## Demo

A working demo of this Create React App is available [HERE](https://dynamicstrategies.io/wconnector)

## Troubleshooting
### Out of Memory

If you get an error that starts with:

:::caution

`FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory ...` 

:::

then run this snippet in your terminal before executing `npm start`
```shell
export NODE_OPTIONS="--max-old-space-size=8192"
```

### Not Enough ADA
If you get this error:

:::caution

`Not enough ADA leftover to include non-ADA assets in a change address ...`

:::

Then first make sure that you have enough ada in your wallet and then try changing the "strategy" number 
in this part of the code `txBuilder.add_inputs_from(txUnspentOutputs, 1)` which determines how it selects 
available UTXOs from your wallet from section [Add UTXOs to the Transaction as Inputs](#3-add-utxos-to-the-transaction-as-inputs). 
The options are `0` for LargestFirst, `1` for RandomImprove, `2` for LargestFirstMultiAsset and `3` for RandomImproveMultiAsset
