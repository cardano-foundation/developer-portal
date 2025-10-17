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

## How to integrate Wallet as a Service

Minimal required code to integrate wallet as a service is simple:

```javascript
import { EnableWeb3WalletOptions, Web3Wallet } from "@meshsdk/web3-sdk";
 
// Configure UTXOS wallet options
const options: EnableWeb3WalletOptions = {
  networkId: parseInt(process.env.NEXT_PUBLIC_NETWORK_ID) || 0, // 0: preprod, 1: mainnet
  projectId: process.env.NEXT_PUBLIC_UTXOS_PROJECT_ID, // https://utxos.dev/dashboard
};
 
// Enable the wallet
const wallet = await Web3Wallet.enable(options);
```

You can now use the `wallet` instance to build and sign transactions, query balances, and perform other wallet operations. For instance, to get the UTXO of the wallet:

```javascript
const utxos = await wallet.cardano.getUtxos();
console.log("UTXOs:", utxos);
```

Here is a exmaple to send ADA from the wallet:

```javascript
import { Web3Wallet, EnableWeb3WalletOptions } from "@meshsdk/web3-sdk";
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";
 
async function sendADA(recipientAddress, amountADA) {
  try {
    // Initialize provider and wallet
    const provider = new BlockfrostProvider(`/api/blockfrost/preprod/`);
 
    const options: EnableWeb3WalletOptions = {
      projectId: process.env.NEXT_PUBLIC_UTXOS_PROJECT_ID,
      networkId: parseInt(process.env.NEXT_PUBLIC_NETWORK_ID),
      fetcher: provider,
      submitter: provider,
      keepWindowOpen: true
    };
 
    const wallet = await Web3Wallet.enable(options);
 
    // Build transaction
    const tx = new MeshTxBuilder({
      fetcher: provider,
    });
 
    const amountLovelace = (amountADA * 1_000_000).toString();
 
    // Build the asset unit (policy ID + asset name)
    const assetUnit = policyId + assetName;
 
    tx.txOut(recipientAddress, [
      { unit: "lovelace", quantity: amountLovelace }
    ])
    tx.txOut(recipientAddress, [
      { unit: "lovelace", quantity: "1500000" },
      { unit: assetUnit, quantity: "1" }, // NFT
    ])
    .changeAddress(await wallet.cardano.getChangeAddress())
    .selectUtxosFrom(await wallet.cardano.getUtxos());
 
    // Complete, sign, and submit
    const unsignedTx = await tx.complete();
    console.log("Transaction built successfully");
 
    const signedTx = await wallet.cardano.signTx(unsignedTx);
    console.log("Transaction signed");
 
    const txHash = await wallet.cardano.submitTx(signedTx);
    console.log("Transaction submitted:", txHash);
 
    return txHash;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}
 
// Usage
await sendADA("addr_test1...", 5); // Send 5 ADA
```

Interact with a smart contract using the wallet:

```javascript
import { PlutusScript, resolvePaymentKeyHash } from "@meshsdk/core";
 
async function interactWithContract(contractAddress, datum, redeemer) {
  try {
    const provider = new BlockfrostProvider(`/api/blockfrost/preprod/`);
    const wallet = await Web3Wallet.enable({
      networkId: 0,
      fetcher: provider,
      submitter: provider,
      projectId: process.env.NEXT_PUBLIC_UTXOS_PROJECT_ID,
      keepWindowOpen: true,
    });
 
    // Get script UTXOs at the contract address
    const scriptUtxos = await provider.fetchUTXOs(contractAddress);
 
    if (scriptUtxos.length === 0) {
      throw new Error("No UTXOs found at contract address");
    }
 
    const tx = new MeshTxBuilder({ fetcher: provider });
 
    // Consume from script
    tx.txIn(
      scriptUtxos[0].input.txHash,
      scriptUtxos[0].input.outputIndex,
      scriptUtxos[0].output.amount,
      contractAddress,
    )
      .spendingPlutusScript(PlutusScript.fromCbor("your_script_cbor"))
      .txInInlineDatumPresent()
      .txInRedeemerValue(redeemer)
 
      // Add collateral for script execution
      .txInCollateral(
        (await wallet.cardano.getCollateral())[0].input.txHash,
        (await wallet.cardano.getCollateral())[0].input.outputIndex,
        (await wallet.cardano.getCollateral())[0].output.amount,
        (await wallet.cardano.getCollateral())[0].output.address,
      )
 
      // Output back to wallet
      .txOut(await wallet.cardano.getChangeAddress(), [
        { unit: "lovelace", quantity: "2000000" },
      ])
      .changeAddress(await wallet.cardano.getChangeAddress())
      .selectUtxosFrom(await wallet.cardano.getUtxos())
      .requiredSignerHash(
        resolvePaymentKeyHash(await wallet.cardano.getChangeAddress()),
      );
 
    const unsignedTx = await tx.complete();
    const signedTx = await wallet.cardano.signTx(unsignedTx);
    const txHash = await wallet.cardano.submitTx(signedTx);
 
    console.log("Contract interaction successful:", txHash);
    return txHash;
  } catch (error) {
    console.error("Contract interaction failed:", error);
    throw error;
  }
}
```