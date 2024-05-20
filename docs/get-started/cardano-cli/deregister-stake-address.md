---
id: deregister-stake-addreess
title: Deregister stake address
sidebar_label: Deregister stake address
sidebar_position: 6
description: How to deregister a stake address.
keywords: [cardano-cli, cli, deregistration, deregister, rewards, withdrawal, stake, stake addresses, cardano-node, transactions]
---

:::tip
In order to accommodate the integration of the Conway era, which significantly differs from all previous eras, cardano-cli has introduced `<era>` as a top-level command, replacing the previous `<era>` flags. For instance, instead of using era-specific flags like `--babbage-era` with commands such as `cardano-cli transaction build --babbage-era`, users must now utilize the syntax `cardano-cli babbage transaction build <options>`. 
:::

Deregistering a stake address is achieved by submitting a **Stake Address Deregistration Certificate**. 


