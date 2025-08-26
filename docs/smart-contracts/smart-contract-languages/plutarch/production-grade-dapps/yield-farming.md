---
id: yield-farming
title: Yield farming
sidebar_label: Yield Farming
description: Yield farming is a financial strategy in the world of decentralized finance (DeFi) that allows cryptocurrency holders to earn passive income through their assets.
---

Yield farming is a financial strategy in the world of decentralized finance (DeFi) that allows cryptocurrency holders to earn passive income through their assets. This guide will provide you with an understanding of yield farming and its implementation, particularly within the Cardano blockchain ecosystem, funded by the Cardano Treasury in [Catalyst Fund 10](https://projectcatalyst.io/funds/10/f10-developer-ecosystem-the-evolution/anastasia-labs-open-source-production-grade-dapps).

## Understanding Yield Farming

At its core, yield farming is about maximizing returns. Users, known as liquidity providers (LPs), lend their assets to DeFi protocols and earn rewards in return. These rewards can be in the form of transaction fees or new tokens, and they often yield attractive annual percentage rates (APR) or annual percentage yields (APY).

## Core Concepts of Yield Farming

### Decentralized Finance (DeFi)

- **Definition**: DeFi is a blockchain-based form of finance that does not rely on central financial intermediaries. Instead, it utilizes smart contracts on blockchains.

- **Goal**: To recreate and improve upon traditional financial systems in a decentralized and open-access manner.
  Liquidity Provision

- **LPs Role**: Liquidity providers contribute their assets to liquidity pools.

- **Purpose**: These pools facilitate a marketplace for lending, borrowing, or exchanging tokens.

- **Rewards**: LPs earn fees or additional tokens in exchange for their services.

### Smart Contracts and Liquidity Pools

- **Smart Contracts**: These are automated, self-enforcing contracts with the terms directly written into code.

- **Liquidity Pools**: Collections of funds locked in smart contracts, contributing to the market's liquidity.

### Staking and Pooling

- **Staking**: Depositing tokens into a pool to receive liquidity tokens or proof of stake.

- **Pooling**: Participation in a collective fund used for trading on the platform, contributing to market efficiency.

### Risks and Considerations

While yield farming on Cardano can be rewarding, it's important to understand the associated risks:

- **Smart Contract Risk**: The reliance on smart contracts means that any bugs can lead to the loss of staked assets.

- **Impermanent Loss**: The volatility of the cryptocurrency market can affect the value of staked assets, leading to potential losses.

- **Market Risk**: Fluctuations in market prices can significantly impact the expected returns from yield farming.

## Yield Farming Implementation on Cardano

### Functionalities of the Yield Farming Module

- `pvalidateYieldFarmW`:

The wrapper function that serves as the validator for yield farming operations. It ensures that all yield farming actions are compliant with the smart contract's rules.

- `pterminateYieldFarming`:

This function allows for the termination of yield farming activities, ensuring that users can cease operations securely and retrieve their staked assets.

- `paddYieldFarmRewards`:

Adds more rewards to the yield farming pool.

### Data Types

- `YieldFarmingDatum`

```haskell
data YieldFarmingDatum = YieldFarmingDatum
  { owner :: Address
  , lpCS :: CurrencySymbol
  , lpTN :: TokenName
  }
```

A data type that encapsulates the information related to a yield farming operation, including the owner's address and the liquidity pool's currency symbol and token name.

- `YieldFarmRedeemer`:

```haskell
data YieldFarmRedeemer
  = Terminate
  | HarvestRewards {ownIndex :: Integer}
  | AddRewards {ownIndex :: Integer, authIndex :: Integer}
```

Represents the actions that can be taken within a yield farming smart contract, such as terminating the farming operation, harvesting rewards, or adding rewards.

```mermaid
graph TD
    A[User] -->|Initiates| B[Yield Farming Smart Contract]
    B -->|Manages| C[Liquidity Pool]
    C --> D{Yield Farming Operations}
    D -->|Rewards Harvesting| F[Harvest Rewards]
    D -->|Rewards Addition| G[Add Rewards]

    D -->|Termination| E[Terminate Operation]

    E -->|Releases Funds| A
    F -.->|Accumulates| H[User Rewards]
    G -.->|Increases| C

    H -->|Claimed by| A

    B -.->|Data| I[YieldFarmingDatum]
    B -.->|Actions| J[YieldFarmRedeemer]

    I -->|Contains Owner Info| K[Owner Address]
    I -->|Identifies LP Tokens| L[Liquidity Pool Token]
    J -->|Actions| M[Terminate, Harvest, Add]

    class B,C,D operation
```

## Conclusion

Yield farming on Cardano, powered by Plutarch script, represents an innovative approach to earning rewards in the DeFi space. This guide has provided a comprehensive look at the yield farming implementation, the functions, data types, and a visual representation of the process. While yield farming can be profitable, it is crucial to be aware of the risks and approach this investment strategy with due diligence.

- Source Code can be found [here](https://github.com/Anastasia-Labs/yieldfarming).
