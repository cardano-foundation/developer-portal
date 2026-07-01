---
id: overview
title: Core Concepts
sidebar_label: Overview
description: The technical foundations of Cardano value, the eUTXO model, addresses, keys and wallets, transactions, and fees.
---

These pages cover how value is represented, owned, moved, and priced on Cardano. They are the foundation everything else builds on. You don't need to read all of it before you start building, most build guides link back here when a concept becomes relevant, but if you are new to Cardano, reading it in order pays off.

## Recommended reading order

1. **[The eUTXO Model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo)**: how Cardano represents and spends value
2. **[Addresses](/docs/developers/curriculum/fundamentals/core-concepts/addresses)**: where value lives and the credentials that guard it
3. **[Keys & Wallets](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys)**: who controls value, and how wallets manage keys
4. **[Transactions](/docs/developers/curriculum/fundamentals/core-concepts/transactions)**: how value moves
5. **[Transaction Fees](/docs/developers/curriculum/fundamentals/core-concepts/fees)**: what transactions cost and why

## Why these concepts matter

Cardano uses the Extended UTXO (eUTXO) model rather than account balances. That single choice changes how transactions, state, and smart contracts work compared to account-based chains like Ethereum:

- **Transactions are deterministic.** You know exactly what will happen before you submit.
- **Smart contracts validate, they don't act.** Scripts approve or reject a proposed transaction.
- **Tokens are native.** No smart contract is needed for basic token operations.

import DocCardList from '@theme/DocCardList';

<DocCardList />

## The big picture

Cardano was designed with input from a global team of experts in programming languages, network design, and cryptography. If you haven't seen it, the 2017 whiteboard video is still a worthwhile primer on what Cardano is and where it came from (some details have since evolved).

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/Ja9D0kpksxw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
