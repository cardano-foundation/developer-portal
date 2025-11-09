---
id: fees
title: Transaction Fees
sidebar_label: Transaction Fees
description: Understanding Cardano's deterministic and predictable transaction fee structure.
image: /img/og/og-getstarted-technical-concepts.png
---

Transaction fees on Cardano are deterministic and predictable, calculated using a simple linear formula based on transaction size and computational resources required. This approach ensures users can calculate exact fees before submitting transactions, avoiding the unpredictable fee spikes seen on other blockchains.

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/lpSIpPWp7H8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Fee Structure and Formula

Cardano uses a straightforward fee calculation: **fee = a × size(tx) + b**

Where:

- **a**: Protocol parameter reflecting the cost per byte of transaction data
- **b**: Fixed base fee applied to every transaction regardless of size
- **size(tx)**: Transaction size in bytes

## Protocol Parameters and Economic Security

Both parameters `a` and `b` serve crucial economic and security purposes:

**Parameter `a`** covers the resource costs of processing and storing larger transactions. As transaction size increases, more computational and storage resources are required, making this scaling factor essential for covering operational costs.

**Parameter `b`** provides a base security layer against economic attacks, particularly Distributed Denial-of-Service (DDoS) attacks. By requiring a minimum fee regardless of transaction size, it becomes prohibitively expensive for attackers to flood the network with millions of small transactions.

## Fee Distribution Model

Unlike many blockchains where fees go directly to block producers, Cardano uses a unique pooled distribution system. Transaction fees are collected and distributed among all stake pools that produced blocks during an epoch, regardless of which specific pool processed each transaction. This approach promotes network stability and fair reward distribution.

## Economic Attack Prevention

The fee structure prevents economic attacks where system operator costs exceed user fees. Without proper fee alignment, users could impose costs on operators without paying proportionally, potentially leading to reduced participation and system instability. Cardano's parameters are designed to ensure fees cover both processing and long-term storage costs.

<details>
<summary>Advanced: Current Protocol Parameters</summary>

The current values of `a` and `b` are set through on-chain governance and can be queried from any Cardano node. These parameters may change over time through governance proposals to adapt to network conditions and economic factors.

To query current parameters, use:

```bash
cardano-cli query protocol-parameters
```

Or check via blockchain explorers that display protocol parameters.

</details>

---

## Next Steps

- Learn about [Transactions](/docs/learn/core-concepts/transactions)
- Understand [EUTXO Model](/docs/learn/core-concepts/eutxo)
- Build transactions: [Building dApps](/docs/build/integrate/overview)
