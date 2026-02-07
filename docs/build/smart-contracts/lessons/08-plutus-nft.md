---
id: 08-plutus-nft
title: Plutus NFT Contract
sidebar_label: 08 - Plutus NFT Contract
description: Plutus NFT smart contract enforces non-fungibility and uniqueness of the NFT under the same policy.
---

After the simple vesting contract, let's level up to a more complex contract with multiple validators interacting with each other. This lesson will guide you step-by-step through the process of creating a Plutus NFT contract, ensuring clarity and simplicity.

## Overview

This lesson focuses on creating a smart contract for minting NFTs with an automatically incremented index. The contract ensures non-fungibility and uniqueness of the NFTs under the same policy. To achieve this, we will:

1. Set up a one-time minting policy to create an oracle token.
2. Use the oracle token to maintain the state and index of NFTs.
3. Increment the token index with each new NFT minted.

## Step 1: Oracle NFT

The oracle NFT acts as the single source of truth for the system. It uses a state thread token to ensure consistency. We will implement a one-time minting policy for the oracle NFT.

### Code Explanation

The following code defines the minting policy for the oracle NFT:

```aiken
pub type MintPolarity {
  RMint
  RBurn
}

validator oracle_nft(utxo_ref: OutputReference) {
  mint(redeemer: MintPolarity, policy_id: PolicyId, tx: Transaction) {
    when redeemer is {
      RMint -> {
        let Transaction { inputs, .. } = tx
        let hash_equal =
          fn(input: Input) {
            let hash = input.output_reference
            utxo_ref == hash
          }
        let target_input_exist = list.find(inputs, hash_equal)
        when target_input_exist is {
          Some(_) -> True
          None -> False
        }
      }
      RBurn -> check_policy_only_burn(tx.mint, policy_id)
    }
  }

  else(_) {
    fail
  }
}
```

**Key Points:**

- `RMint` ensures the token is minted only once.
- `RBurn` allows the token to be burned but prevents reminting.

## Step 2: Oracle Validator

The oracle validator holds the current state of the NFT index. It defines the datum and redeemer types for state changes.

### Datum Definition

```aiken
pub type OracleDatum {
  count: Int,
  lovelace_price: Int,
  fee_address: Address,
}
```

### Redeemer Types

```aiken
pub type OracleRedeemer {
  MintPlutusNFT
  StopOracle
}
```

### Validator Logic

The validator ensures the state changes are valid:

```aiken
validator oracle {
  spend(
    datum_opt: Option<OracleDatum>,
    redeemer: OracleRedeemer,
    input: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { mint, inputs, outputs, extra_signatories, .. } = tx
    expect Some(OracleDatum { count, lovelace_price, fee_address }) = datum_opt
    expect Some(own_input) = find_input(inputs, input)
    expect [(oracle_nft_policy, _, _)] =
      list.filter(flatten(own_input.output.value), fn(x) { x.1st != "" })

    todo
  }

  else(_) {
    fail
  }
}
```

In this setup, we identified the own input with `find_input` function, which is a utility function that finds the input with the given output reference. We also expect the oracle NFT policy to be present in the own input's value.

We know that for state change, we will have exactly one input from current address, and one output to the same address. We can then perform below pattern matching:

```aiken
    let own_address = own_input.output.address
    when
      (
        redeemer,
        inputs_at_with_policy(inputs, own_address, oracle_nft_policy),
        outputs_at_with_policy(outputs, own_address, oracle_nft_policy),
      )
    is {
      (MintPlutusNFT, [_], [only_output]) -> {
        todo
      }
      _ -> False
    }

```

Add in core checks for `MintPlutusNFT`:

```aiken
        let is_output_value_clean = list.length(flatten(only_output.value)) == 2
        let is_count_updated =
          only_output.datum == InlineDatum(
            OracleDatum { count: count + 1, lovelace_price, fee_address },
          )
        let is_fee_paid =
          get_all_value_to(outputs, fee_address)
            |> value_geq(from_lovelace(lovelace_price))
        is_output_value_clean? && is_count_updated? && is_fee_paid?
```

Notice there is a `is_output_value_clean` check here, which ensures the changed state UTxO only contains the state thread token and ADA, i.e. no other assets are present in the output value. This is to prevent a common vulnerability of `Unbounded Value`, where people can attach infinitely amount of assets to the output to make it unspendable by overflowing the transaction size.

Complete with `StopOracle` logics:

```aiken
      (StopOracle, [_], _) -> {
        let is_oracle_nft_burnt =
          only_minted_token(mint, oracle_nft_policy, "", -1)
        let owner_key = address_payment_key(fee_address)
        let is_owner_signed = key_signed(extra_signatories, owner_key)
        is_oracle_nft_burnt? && is_owner_signed?
      }
```

A complete oracle validator looks like this:

```aiken
validator oracle {
  spend(
    datum_opt: Option<OracleDatum>,
    redeemer: OracleRedeemer,
    input: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { mint, inputs, outputs, extra_signatories, .. } = tx
    expect Some(OracleDatum { count, lovelace_price, fee_address }) = datum_opt
    expect Some(own_input) = find_input(inputs, input)
    expect [(oracle_nft_policy, _, _)] =
      list.filter(flatten(own_input.output.value), fn(x) { x.1st != "" })
    let own_address = own_input.output.address
    when
      (
        redeemer,
        inputs_at_with_policy(inputs, own_address, oracle_nft_policy),
        outputs_at_with_policy(outputs, own_address, oracle_nft_policy),
      )
    is {
      (MintPlutusNFT, [_], [only_output]) -> {
        let is_output_value_clean = list.length(flatten(only_output.value)) == 2
        let is_count_updated =
          only_output.datum == InlineDatum(
            OracleDatum { count: count + 1, lovelace_price, fee_address },
          )
        let is_fee_paid =
          get_all_value_to(outputs, fee_address)
            |> value_geq(from_lovelace(lovelace_price))
        is_output_value_clean? && is_count_updated? && is_fee_paid?
      }
      (StopOracle, [_], _) -> {
        let is_oracle_nft_burnt =
          only_minted_token(mint, oracle_nft_policy, "", -1)
        let owner_key = address_payment_key(fee_address)
        let is_owner_signed = key_signed(extra_signatories, owner_key)
        is_oracle_nft_burnt? && is_owner_signed?
      }
      _ -> False
    }
  }

  else(_) {
    fail
  }
}
```

**Key Points:**

- `MintPlutusNFT` increments the NFT index and ensures fees are paid.
- `StopOracle` burns the oracle NFT and requires owner authorization.

## Step 3: Plutus NFT Minting Validator

The Plutus NFT minting validator ensures the NFT is unique and non-fungible.

### Code Explanation

```aiken
pub type MintPolarity {
  RMint
  RBurn
}

validator plutus_nft(collection_name: ByteArray, oracle_nft: PolicyId) {
  mint(redeemer: MintPolarity, policy_id: PolicyId, tx: Transaction) {
    when redeemer is {
      RMint -> {
        let Transaction { inputs, mint, .. } = tx
        expect [auth_input] = inputs_with_policy(inputs, oracle_nft)
        expect InlineDatum(input_datum) = auth_input.output.datum
        expect OracleDatum { count, .. }: OracleDatum = input_datum
        let asset_name =
          collection_name
            |> concat(" (")
            |> concat(convert_int_to_bytes(count))
            |> concat(")")
        only_minted_token(mint, policy_id, asset_name, 1)
      }

      RBurn -> check_policy_only_burn(tx.mint, policy_id)
    }
  }

  else(_) {
    fail
  }
}
```

**Key Points:**

- Ensures the NFT name includes the incremented index.
- Validates the minting and burning process.

The code example above is presented in [Mesh repository](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/plutus-nft/aiken-workspace), you can find the equivalent tests there.

### Compile and build script

1. Compile the script using:

```sh
aiken build
```

This command will generate a CIP-0057 Plutus blueprint, which you can find in [`plutus.json`](https://github.com/cardanobuilders/cardanobuilders.github.io/blob/main/codes/course-hello-cardano/07-vesting/src/aiken-workspace/plutus.json).

## Setup Oracle

To set up the oracle, we need to mint the oracle NFT first and lock it in the oracle validator. This is a one-time operation, and we can do it with the following code:

We prepare the wallet and tx-builder similar to previous lessons, and get some static information:

```ts
const compiledCode = <the compile code from blueprint>;

const utxos = await wallet?.getUtxos();
const collateral = (await wallet.getCollateral())[0]!;
const walletAddress = await wallet.getChangeAddress()

const paramUtxo = utxos[0]!;
const param: Data = mOutputReference(
  paramUtxo.input.txHash,
  paramUtxo.input.outputIndex,
);
const paramScript = applyParamsToScript(compiledCode, [param]);
const policyId = resolveScriptHash(paramScript, "V3");
const tokenName = "";
const { pubKeyHash, stakeCredentialHash } =
  deserializeAddress(walletAddress);
```

Then we can perform the setup:

```ts
const txHex = await txBuilder
  .txIn(
    paramUtxo.input.txHash,
    paramUtxo.input.outputIndex,
    paramUtxo.output.amount,
    paramUtxo.output.address,
  )
  .mintPlutusScriptV3()
  .mint("1", policyId, tokenName)
  .mintingScript(paramScript)
  .mintRedeemerValue(mConStr0([]))
  .txOut(oracleAddress, [{ unit: policyId, quantity: "1" }])
  .txOutInlineDatumValue(
    mConStr0([
      0,
      lovelacePrice,
      mPubKeyAddress(pubKeyHash, stakeCredentialHash),
    ]),
  )
  .txInCollateral(
    collateral.input.txHash,
    collateral.input.outputIndex,
    collateral.output.amount,
    collateral.output.address,
  )
  .changeAddress(walletAddress)
  .selectUtxosFrom(utxos)
  .complete();
```

Important, we need to save the `paramUtxo` information for later use:

## Mint Plutus NFT

To mint the Plutus NFT, first we need to define static info:

```ts
type OracleDatum = ConStr0<[Integer, Integer, PubKeyAddress]>;

const oracleCompileCode = <the compile code from oracle blueprint>;
const oracleNftCbor = applyParamsToScript(blueprint.validators[2]!.compiledCode, [
  mOutputReference(paramUtxo.txHash, paramUtxo.outputIndex),
])
const oracleNftPolicyId = resolveScriptHash(oracleNftCbor, "V3");

const oracleCbor = applyCborEncoding(<the oracle compile code>)
const oracleAddress = serializePlutusScript(
      {
        code: oracleCbor,
        version: "V3",
      },
      "", // the stake credential, we can supply if we have one
      "preprod",
    ).address

const getAddressUtxosWithToken = async (
    walletAddress: string,
    assetHex: string,
  ) => {
    let utxos = await fetcher.fetchAddressUTxOs(walletAddress);
    return utxos.filter((u) => {
      const assetAmount = u.output.amount.find(
        (a: any) => a.unit === assetHex,
      )?.quantity;
      return Number(assetAmount) >= 1;
    });
  };
```

And a helper method to get the existing oracle information:

```ts
const getOracleData = async () => {
  const oracleUtxo = (
    await getAddressUtxosWithToken(oracleAddress, oracleNftPolicyId)
  )[0]!;
  const oracleDatum: OracleDatum = parseDatumCbor(
    oracleUtxo!.output.plutusData!,
  );

  const nftIndex = oracleDatum.fields[0].int;
  const lovelacePrice = oracleDatum.fields[1].int;
  const feeCollectorAddressObj = oracleDatum.fields[2];
  const feeCollectorAddress = serializeAddressObj(
    feeCollectorAddressObj,
    "preprod",
  );

  const policyId = resolveScriptHash(oracleNftCbor, "V3");

  return {
    nftIndex,
    policyId,
    lovelacePrice,
    oracleUtxo,
    oracleNftPolicyId,
    feeCollectorAddress,
    feeCollectorAddressObj,
  };
};
```

Then we can build the core logic to mint the Plutus NFT:

```ts
const utxos = await wallet?.getUtxos();
const collateral = (await wallet.getCollateral())[0]!;
const walletAddress = await wallet.getChangeAddress()

const collectionName = "MyNFTCollection";
const nftCbor = applyParamsToScript(<the plutus NFT compiled code>, [
  stringToHex(collectionName),
  oracleNftPolicyId,
]);


const {
  nftIndex,
  policyId,
  lovelacePrice,
  oracleUtxo,
  oracleNftPolicyId,
  feeCollectorAddress,
  feeCollectorAddressObj,
} = await getOracleData();

const tokenName = `${collectionName} (${nftIndex})`;
const tokenNameHex = stringToHex(tokenName);

const updatedOracleDatum: OracleDatum = conStr0([
  integer((nftIndex as number) + 1),
  integer(lovelacePrice),
  feeCollectorAddressObj,
]);

const tx = txBuilder
  .spendingPlutusScriptV3()
  .txIn(
    oracleUtxo.input.txHash,
    oracleUtxo.input.outputIndex,
    oracleUtxo.output.amount,
    oracleUtxo.output.address,
    0
  )
  .txInRedeemerValue(mConStr0([]))
  .txInScript(oracleCbor)
  .txInInlineDatumPresent()
  .txOut(oracleAddress, [{ unit: oracleNftPolicyId, quantity: "1" }])
  .txOutInlineDatumValue(updatedOracleDatum, "JSON")
  .mintPlutusScriptV3()
  .mint("1", policyId, tokenNameHex)
  .mintingScript(nftCbor);

const assetMetadata = {
  name: `MyNFTCollection (${nftIndex})`,
  image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
  mediaType: "image/jpg",
  description: "This NFT was minted by Mesh (https://meshjs.dev/).",
};

const metadata = { [policyId]: { [tokenName]: { ...assetMetadata } } };
tx.metadataValue(721, metadata);

tx.mintRedeemerValue(mConStr0([]))
  .txOut(feeCollectorAddress, [
    { unit: "lovelace", quantity: lovelacePrice.toString() },
  ])
  .txInCollateral(
    collateral.input.txHash,
    collateral.input.outputIndex,
    collateral.output.amount,
    collateral.output.address,
  )
  .changeAddress(walletAddress)
  .selectUtxosFrom(utxos);

const txHex = await tx.complete();
```

## Packaged functions

The Plutus NFT contract has been implemented in `@meshsdk/contract` package, you can find further explanation at the [Mesh documentation](https://meshjs.dev/smart-contracts/plutus-nft) and more details about entire stack source code at [Mesh repository](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/plutus-nft).
