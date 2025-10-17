---
id: sponsorship
sidebar_position: 3
title: Transaction Sponsorship
sidebar_label: Transaction Sponsorship
description: Create seamless user experiences by eliminating the need for end-users to hold tokens in their wallets for transactions
image: /img/og/og-getstarted-utxos.png
---

Network fees are the costs required to execute transactions, compensating network validators for processing and securing the blockchain. These fees are paid in the network’s native token, such as ADA on Cardano. While essential for incentivizing validators and maintaining network security, network fees can pose a challenge for end users, as they must hold tokens to cover these costs when interacting with applications.

To illustrate how much friction fees can add to your user experience, here’s an analogy: Imagine you’re trying to buy something on Amazon, when you get to the checkout screen, there is a new fee that you’ve never heard of, and you can only pay this new fee in a currency that you’ve also never heard of, and there are no instructions where to acquire this alien sounding currency. Adding fees to the purchase flow for a web3 asset adds this much friction for most users.

To address this challenge, UTXOS offers a transaction sponsorship solution that enables developers to pay network fees on behalf of their users.

Sponsorship enables developers to create seamless user experiences by eliminating the need for end-users to hold tokens in their wallets for transactions. Instead, transactions inputs and network fees are deducted from the developer’s wallet, solving one of the most significant challenges in blockchain application development and enabling frictionless onboarding and interaction for end-users.

To get started with UTXOS transaction sponsorship, visit the [UTXOS documentation](https://docs.utxos.dev/sponsor).

## How to enable Transaction Sponsorship

First, initialize the Web3Sdk with your project credentials and network configuration:

```javascript
import { Web3Sdk } from "@meshsdk/web3-sdk";
 
const sdk = new Web3Sdk({
  projectId: process.env.NEXT_PUBLIC_UTXOS_PROJECT_ID, // https://utxos.dev/dashboard
  apiKey: process.env.UTXOS_API_KEY,
  network: "preprod",
  privateKey: process.env.UTXOS_PRIVATE_KEY,
  fetcher: provider,
  submitter: provider,
});
```

Next, build your transaction with any TX builder of your choice, for example, using MeshTxBuilder:

```javascript
// Get the required static information
const staticInfo = sdk.sponsorship.getStaticInfo();
 
// Build your transaction with the required fields
const txBuilder = your_preferred_transaction_builder
  .
  .
  // Required: Set the change address from static info
  .changeAddress(staticInfo.changeAddress)
  // Required: Add the static UTXO as an input
  .txIn(
    staticInfo.utxo.input.txHash,
    staticInfo.utxo.input.outputIndex,
    staticInfo.utxo.output.amount,
    staticInfo.utxo.output.address,
    0,
  )
  // If required: Add the static UTXO as collateral
  .txInCollateral(
    staticInfo.collateral.input.txHash,
    staticInfo.collateral.input.outputIndex,
    staticInfo.collateral.output.amount,
    staticInfo.collateral.output.address,
  );
 
const transaction = txBuilder.complete();
```

Once your transaction is built, sponsor it and submit to the network:

```javascript
try {
  // Step 1: Request sponsorship for your transaction
  const sponsorTxResult = await sdk.sponsorship.sponsorTx({
    sponsorshipId: "your_sponsorship_id", // Replace with your actual sponsorship ID
    tx: transaction, // Your built transaction
  });
 
  if (sponsorTxResult.success === false) {
    throw new Error(sponsorTxResult.error);
  }
 
  // Step 2: User signs the sponsored transaction
  const signedTx = await wallet.cardano.signTx(sponsorTxResult.data, true);
 
  // Step 3: Submit the signed transaction to the network
  const txHash = await wallet.cardano.submitTx(signedTx);
 
  console.log(`Transaction submitted successfully! Hash: ${txHash}`);
} catch (error) {
  console.error("Sponsorship failed:", error);
  // Handle sponsorship errors (insufficient funds, policy violations, etc.)
}
```