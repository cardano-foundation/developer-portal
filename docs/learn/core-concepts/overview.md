---
id: overview
slug: /learn/core-concepts/
title: Core Concepts
sidebar_label: Overview
description: Learn the core technical concepts behind Cardano including EUTXO, transactions, addresses, and more.
image: /img/og/og-getstarted-technical-concepts.png
---

## How to Use This Section

These pages cover the technical foundations of Cardano. You don't need to read everything before you start building. Most guides in the [Build](/docs/build/smart-contracts/overview) section link here when a concept becomes relevant.

**Start here if you're:**

- New to Cardano
- Following a Build guide that linked you here for background
- Curious about why Cardano works the way it does

**Jump ahead to Build if you:**

- Prefer learning by doing
- Want to reference concepts as you encounter them

## Recommended Reading Order

1. **[Addresses](addresses)**: Where value lives on Cardano
2. **[EUTXO Model](eutxo)**: How value is represented and spent
3. **[Transactions](transactions)**: How value moves between addresses
4. **[Transaction Fees](fees)**: What transactions cost and why
5. **[Assets & Tokens](assets)**: Creating and managing native tokens

## Why These Concepts Matter

Cardano uses the Extended UTXO (EUTXO) model rather than account balances. This means transactions, state management, and smart contracts all work differently than on account-based chains like Ethereum.

- **Transactions are deterministic**: You know exactly what will happen before you submit
- **Smart contracts validate, they don't act**: Scripts approve or reject proposed transactions
- **Tokens are native**: No smart contracts needed for basic token operations

Explore the topics below:

---

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Introduction to Cardano: the big picture

Cardano was designed with input from a large global team including leading experts and professors in the fields of computer programming languages, network design and cryptography.

If you haven't seen it yet, watch the legendary whiteboard video from 2017. Some details are a bit outdated, but it is still worth seeing to understand what Cardano is and where Cardano came from.

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/Ja9D0kpksxw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
