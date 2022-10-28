---
id: utxo-model
title: Classic UTxO model
sidebar_label: Classic UTxO model
description: "Stake pool course: The classic UTxO model." 
image: ../img/og/og-developer-portal.png
---

In the classic UTxO model (Cardano SL in Byron and Shelley), a transaction output locked by a script carries two pieces of information:

* its value (the amount)
* its reference address (the "proof" of ownership telling who is the owner of the output)

Every transaction has at least one input and at least one output. Transactions carries the information about money flow. Inputs inform where the money came from (source address), while outputs inform where the money goes to (destination address). Every new transactions spend outputs of previous transactions and produce new outputs that can be spent by future transactions. The blockchain records the collective history of those transactions. 

An unspent transaction output is called a UTxO (as in **U**nspent **Tx** **O**utput) and represents an amount of money owned by a participant that can be spent as an input in a new transaction. The key issue here is that a complete UTxO must be used as an input for a new transaction. UTxOs cannot be consumed in part. Rather, the difference is sent back to the source as a "change" during the transaction, which is represented as a new UTxO. 

For example, asuming zero transaction fees, let's say Alice has 100 ada and Bob has 20 ada. If Alice wants to transfer Bob 40 ada, Alice must consume the full 100 ada as input to the new transaction. This new transaction will have two outputs: 40 ada to Bob and 60 ada to Alice. 

Therefore, the current balance in a wallet will be the sum of all its unspent transaction outputs (UTxOs). On future transactions, those UTxOs will become the inputs for those new transactions.

### Reference material

[Understanding Unspent Transaction Outputs in Cardano](https://emurgo.io/blog/understanding-unspent-transaction-outputs-in-cardano)
