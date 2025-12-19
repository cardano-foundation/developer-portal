---
id: 07-vesting
title: Vesting Contract
sidebar_label: 07 - Vesting Contract
description: Vesting smart contract that locks up funds and allows the beneficiary to withdraw the funds after the lockup period.
---

Vesting contracts are a type of smart contract designed to lock funds for a specified period, ensuring that only the designated beneficiary can withdraw them after the lockup period ends. This lesson will guide you through the process of understanding, implementing, and interacting with a vesting contract on Cardano.

## Overview

### What is a Vesting Contract?

A vesting contract locks funds and allows the beneficiary to withdraw them after a specified lockup period. It ensures security and control over fund distribution.

### Key Features

- **Lockup Period**: Funds are locked until a specific timestamp.
- **Owner and Beneficiary**: The owner deposits funds, and the beneficiary withdraws them after the lockup period.

## Smart Contract Details

### Datum Definition

The datum serves as the configuration for the vesting contract. It includes:

- **`lock_until`**: The timestamp until which funds are locked.
- **`owner`**: Credentials of the fund owner.
- **`beneficiary`**: Credentials of the beneficiary.

First, we define the datum's shape, as this datum serves as configuration and contains the different parameters of our vesting operation.

```aiken
pub type VestingDatum {
  /// POSIX time in milliseconds, e.g. 1672843961000
  lock_until: Int,
  /// Owner's credentials
  owner: ByteArray,
  /// Beneficiary's credentials
  beneficiary: ByteArray,
}
```

This datum can be found in `aiken-vesting/aiken-workspace/lib/vesting/types.ak`.

Next, we define the spend validator.

```aiken
validator vesting {
  spend(
    datum_opt: Option<VestingDatum>,
    _redeemer: Data,
    _input: OutputReference,
    tx: Transaction,
  ) {
    // In principle, scripts can be used for different purpose (e.g. minting
    // assets). Here we make sure it's only used when 'spending' from a eUTxO
    expect Some(datum) = datum_opt
    or {
      key_signed(tx.extra_signatories, datum.owner),
      and {
        key_signed(tx.extra_signatories, datum.beneficiary),
        valid_after(tx.validity_range, datum.lock_until),
      },
    }
  }

  else(_) {
    fail
  }
}
```

In this example, we define a `vesting` validator that ensures the following conditions are met:

- The transaction must be signed by owner

Or:

- The transaction must be signed by beneficiary
- The transaction must be valid after the lockup period

### How it works

The owner of the funds deposits the funds into the vesting contract. The funds are locked up until the lockup period expires.

Transactions can include validity intervals that specify when the transaction is valid, both from and until a certain time. The ledger verifies these validity bounds before executing a script and will only proceed if they are legitimate.

This approach allows scripts to incorporate a sense of time while maintaining determinism within the script's context. For instance, if a transaction has a lower bound `A`, we can infer that the current time is at least `A`.

It's important to note that since we don't control the upper bound, a transaction might be executed even 30 years after the vesting delay. However, from the script's perspective, this is entirely acceptable.

The beneficiary can withdraw the funds after the lockup period expires. The beneficiary can also be different from the owner of the funds.

### Testing

To test the vesting contract, we have provided the a comphrehensive test script,you can run tests with `aiken check`.

The test script includes the following test cases:

- success unlocking
- success unlocking with only owner signature
- success unlocking with beneficiary signature and time passed
- fail unlocking with only beneficiary signature
- fail unlocking with only time passed

We recommend you to check out [`vesting.ak`](https://github.com/cardanobuilders/cardanobuilders.github.io/blob/main/codes/course-hello-cardano/07-vesting/src/aiken-workspace/validators/vesting.ak) to learn more.

### Compile and build script

To compile the script, run the following command:

```sh
aiken build
```

This command will generate a CIP-0057 Plutus blueprint, which you can find in [`plutus.json`](https://github.com/cardanobuilders/cardanobuilders.github.io/blob/main/codes/course-hello-cardano/07-vesting/src/aiken-workspace/plutus.json).

## Deposit funds

First, the owner can deposit funds into the vesting contract. The owner can specify the lockup period.

```ts
const assets: Asset[] = [
  {
    unit: "lovelace",
    quantity: "10000000",
  },
];

const lockUntilTimeStamp = new Date();
lockUntilTimeStamp.setMinutes(lockUntilTimeStamp.getMinutes() + 1);
```

In this example, we deposit 10 ADA into the vesting contract. The funds are locked up for 1 minute, and the beneficiary is specified.

```ts
// app wallet
const wallet = new MeshWallet({
  networkId: 0,
  key: {
    type: "mnemonic",
    words: appWallet,
  },
  fetcher: provider,
  submitter: provider,
});

const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();

const { pubKeyHash: ownerPubKeyHash } = deserializeAddress(changeAddress);
const { pubKeyHash: beneficiaryPubKeyHash } =
  deserializeAddress(beneficiaryAddress);
```

For this tutorial, we use another wallet to fund the deposit. We get the UTXOs from the app wallet and the change address.

We also need both the owner and beneficiary's public key hashes. We can get the public key hash from the address using `deserializeAddress`.

```ts
const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true,
});

const unsignedTx = await txBuilder
  .txOut(script.address, amount)
  .txOutInlineDatumValue(
    mConStr0([lockUntilTimeStampMs, ownerPubKeyHash, beneficiaryPubKeyHash])
  )
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();
```

We construct the transaction to deposit the funds into the vesting contract. We specify the script address of the vesting contract, the amount to deposit, and the lockup period, owner, and beneficiary of the funds.

Finally, we sign and submit the transaction.

```ts
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Upon successful execution, you will receive a transaction hash. Save this transaction hash for withdrawing the funds.

Example of a [successful deposit transaction](https://preprod.cardanoscan.io/transaction/556f2bfcd447e146509996343178c046b1b9ad4ac091a7a32f85ae206345e925).

## Withdraw funds

After the lockup period expires, the beneficiary can withdraw the funds from the vesting contract. The owner can also withdraw the funds from the vesting contract.

First, let's look for the UTxOs containing the funds locked in the vesting contract.

```ts
const txHashFromDesposit =
  "556f2bfcd447e146509996343178c046b1b9ad4ac091a7a32f85ae206345e925";
const utxos = await provider.fetchUTxOs(txHash);
const vestingUtxo = utxos[0];
```

We fetch the UTxOs containing the funds locked in the vesting contract. We specify the transaction hash of the deposit transaction.

Like before, we prepare a few variables to be used in the transaction. We get the wallet address and the UTXOs of the wallet. We also get the script address of the vesting contract, to send the funds to the script address. We also get the owner and beneficiary public key hashes.

Next, we prepare the datum and the slot number to set the transaction valid interval to be valid only after the slot.

```ts
const datum = deserializeDatum<VestingDatum>(vestingUtxo.output.plutusData!);

const invalidBefore =
  unixTimeToEnclosingSlot(
    Math.min(datum.fields[0].int as number, Date.now() - 15000),
    SLOT_CONFIG_NETWORK.preprod
  ) + 1;
```

We prepare the datum and the slot number to set the transaction valid interval to be valid only after the slot. We get the lockup period from the datum and set the transaction valid interval to be valid only after the lockup period.

Next, we construct the transaction to withdraw the funds from the vesting contract.

```ts
const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true,
});

const unsignedTx = await txBuilder
  .spendingPlutusScript("V3")
  .txIn(
    vestingUtxo.input.txHash,
    vestingUtxo.input.outputIndex,
    vestingUtxo.output.amount,
    script.address
  )
  .spendingReferenceTxInInlineDatumPresent()
  .spendingReferenceTxInRedeemerValue("")
  .txInScript(script.cbor)
  .txOut(walletAddress, [])
  .txInCollateral(
    collateralInput.txHash,
    collateralInput.outputIndex,
    collateralOutput.amount,
    collateralOutput.address
  )
  .invalidBefore(invalidBefore)
  .requiredSignerHash(pubKeyHash)
  .changeAddress(walletAddress)
  .selectUtxosFrom(inputUtxos)
  .complete();
```

we construct the transaction to withdraw the funds from the vesting contract. We specify the UTxO containing the funds locked in the vesting contract, the script address of the vesting contract, the wallet address to send the funds to, and the transaction valid interval.

Finally, we sign and submit the transaction.

Example of a [successful withdraw transaction](https://preprod.cardanoscan.io/transaction/13d6b2258680bbdf08f50a3bbc03e7ed674f5614844ce773fc191c9582282b04).

## Source code

The source code for this lesson is available on [GitHub](https://github.com/cardanobuilders/cardanobuilders.github.io/tree/main/codes/course-hello-cardano/07-vesting).

## Challenge

Change the vesting contract to gradual vesting schedule where instead of a single unlock date, implement gradual vesting where funds are released on a schedule. Or add a cliff feature where the beneficiary must wait for a minimum period before any tokens become available.
