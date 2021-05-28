---
id: utxo-model
title: Classic UTxO model
sidebar_label: Classic UTxO model
image: ./img/og-developer-portal.png
---

In the [classic UTxO model](https://docs.cardano.org/projects/cardano-wallet/en/latest/About-UTxO.html) (Cardano SL in Byron and Shelley), a transaction output locked by a script carries two pieces of information:

* its value (the amount)
* its reference address (the "proof" of ownership telling who is the owner of the output)

Every transaction has at least one input and at least one output. Transactions carries the information about money flow. Inputs inform where the money came from (source address), while outputs inform where the money goes to (destination address). Every new transactions spend outputs of previous transactions and produce new outputs that can be spent by future transactions. The blockchain records the collective history of those transactions. 

The key issue here is that not all transactions consumes the whole output of the previous transactions. An unspent transaction output is called a UTxO (as in **U**nspent **Tx** **O**utput) and represents an amount of money owned by a participant that can be spent as an input in a new transaction. 

Therefore, the current balance in a wallet is the sum of all its unspent transaction outputs (UTxOs). On future transactions, those UTxOs could become the inputs for those new transactions.

Its important to note that UTx0s cannot be consume in part. Rather, the difference is sent back to the source as a "change" during the transaction, which is represented as a new UTx0.

### Reference material

[Understanding Unspent Transaction Outputs in Cardano](https://emurgo.io/blog/understanding-unspent-transaction-outputs-in-cardano)
