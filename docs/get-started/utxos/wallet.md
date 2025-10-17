---
id: wallet
sidebar_position: 2
title: Wallet as a Service
sidebar_label: Wallet as a Service
description: Integrate social logins create non-custodial wallets for your users.
image: /img/og/og-getstarted-utxos.png
---

UTXOS wallet-as-a-service (WaaS) solution provide a seamless way for users to transact on-chain. Developers can integrate social logins and other familiar experiences into their applications, making onboarding fast and effortless. Users can create non-custodial wallets (the user owns the key and have full control over their digital assets) instantly without needing to manage private keys. Users can also recover their wallets and export their private keys at any time.

Wallet key management system uses Shamir’s Secret Sharing to split the private key into multiple parts. The parts are stored in different locations, such as the user’s device and encrypted in the server. Neither UTXOS nor the developer’s application has access to the user’s keys. The private key is reconstructed only on the user’s device during transaction signing, in an isolated iframe, which persists in-memory and is destroyed after the transaction is signed.

Overall, the integration with a wallet-as-a-service solution provides a self-custody wallet to end users and accelerates the time-to-market for developers.

To get started with UTXOS wallet-as-a-service, visit the [UTXOS documentation](https://docs.utxos.dev/wallet).