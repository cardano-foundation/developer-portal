---
id: direct-offer
title: Direct Offer
sidebar_label: Direct Offer
description: Plutarch-based implementation of a smart contract enabling peer-to-peer trading, in a trustless manner, for the Cardano blockchain.
---

## Introduction

The Direct Offer project provides a Plutarch-based implementation of a smart contract enabling peer-to-peer trading, in a trustless manner, for the Cardano blockchain. Without the need for a trusted third party or a Decentralized Exchange (DEX), a user can put up any Cardano native asset(s) for sale in exchange for any user-specified native asset(s).

:::info
The source code for these dApps can be found [here](https://github.com/Anastasia-Labs/direct-offer).
:::

## Documentation

### What is Peer-to-Peer (P2P) trading?

P2P trading in the context of this project refers to the direct buying and selling of Cardano Native Tokens (both Fungible & Non-Fungible Tokens) among users, without a third party or an intermediary. This is unlike buying and selling digital assets using a Centralized Exchange (CEX), where you cannot transact directly with counterparties or a DEX where you trade against a fixed Liquidity Pool.

Trading on a CEX requires you to give custody of your tokens to them, so they can execute the trades you enter based on their charts and market order aggregators. A CEX provides access to their order book and facilitates trades and takes fees in exchange.

Depending on the type of order you use, effects such as slippage may mean you don’t get the exact price you want. P2P trading, on the other hand, gives you full control over pricing, settlement time, and whom you choose to sell to and buy from. What is even better you don't need to give custody of your assets to a centralized entity, they are locked in a contract from which you can reclaim them up until the point they are bought.

### How can this project facilitate P2P trading?

This project fulfills the cornerstone requirement of a trusted Escrow, over seeing the trade in the form of a smart contract. It locks the seller's assets in the contract until a buyer provides the required ask price or the seller wishes to cancel the offer and claim the funds back.

### Details

#### Basics of a single offer

A seller sends the assets he wishes to exchange, to the contract, thus locking the funds therein. This UTxO contains a datum which specifies the "creator" of the offer and the assets wished in return, "toBuy" indicates the price.

```rust
data PDirectOfferDatum (s :: S)
  = PDirectOfferDatum
      ( Term
          s
          ( PDataRecord
              '[ "creator" ':= PAddress
               , "toBuy" ':= PValue 'Sorted 'Positive
               ]
          )
      )
```

A buyer interested in the offered assets initiates a transaction (with a "PExecuteOffer" redeemer) spending the locked UTxO, along with sending the "toBuy" assets to the "creator". This condition is validated by the contract first before allowing the transaction to proceed further. However, if the seller decides to cancel the offer, he can do so by initiating a transaction (with a "PReclaim" redeemer) and claim all the locked assets back.

```rust
data PDirectOfferRedeemer (s :: S)
  = PExecuteOffer (Term s (PDataRecord '[]))
  | PReclaim (Term s (PDataRecord '[]))
```

One UTxO at the smart contract address translates to one sell order.

#### Multiple offer matching in a single transaction

A single transaction can fulfill multiple sell orders by matching it with valid buy orders. Whether all the buy orders in the tx are correct or not is validated only once at the tx level using the [Zero ADA Withdrawal Trick](https://github.com/cardano-foundation/CIPs/pull/418#issuecomment-1366605115) from the Staking validator.

```
directOfferGlobalLogic :: Term s PStakeValidator
```

This Staking validator's credential is used as a parameter to a Spending Validator (the smart contract which locks the seller UTxOs). Spending validator ensures that the Staking validator is executed in the tx. A successful validation from both spending and staking validator is essentail for the spending of seller UTxOs.

```
directOfferValidator :: Term s (PStakingCredential :--> PValidator)
```

For carrying out this validation, the Staking Validator requires a redeemer containing one-to-one correlation between script input UTxOs (seller UTxOs) and buy output UTxOs (sent to seller from buyer). This is provided via ordered lists of input/output indices of inputs/ouputs present in the Script Context.

```
data PGlobalRedeemer (s :: S)
  = PGlobalRedeemer
      ( Term
          s
          ( PDataRecord
              '[ "inputIdxs" ':= PBuiltinList (PAsData PInteger)
               , "outputIdxs" ':= PBuiltinList (PAsData PInteger)
               ]
          )
      )
```

For e.g.

```
Inputs     :  [saleOfferA, saleOfferC, buyerInput3, saleOfferB, buyerInput1, buyerInput2]
Outputs    :  [buyOfferA, buyOfferB, buyOfferC, buyerOuput1, buyerOutput2, buyerOutput3]
InputIdxs  :  [0, 1, 3]
OutputIdxs :  [0, 2, 1]
```

While its easy to understand and declare indices of outputs (the order in which outputs appear in the tx builder), we cannot control the order of inputs as seen by the script. As inputs are sorted lexicographically based on their output reference, first by Tx#Id and then by Tx#Idx.

Note: Staking validator is not needed to be invoked if the seller wishes to cancel the offer and reclaim his funds.

## Offchain Implementation

You can find the entire offchain implementation complimenting this dApp [here](https://github.com/Anastasia-Labs/direct-offer-offchain).
