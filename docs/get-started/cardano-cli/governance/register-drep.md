---
id: register drep
sidebar_label: Register as a DRep
title: Registering as Delegated Representative (DReps)
sidebar_position: 1
description: How to register as a delegated representative
keywords: [Governance, DREP, Delegated representative, CIP1694]
---

Delegated representatives (DReps) serve as the community's spokesperson, actively participating in voting on governance actions and advocating for the community's collective interests. DReps hold significant responsibilities in the governance process, voting on important system updates. Approval depends on the governance action type and requires a majority vote from the corresponding governance bodies. 

DReps can register on chain using Ed25519 keys, Simple scripts or Plutus scripts. 


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="key-based"
  values={[
    {label: 'Key-based DRep', value: 'key-based'},
    {label: 'Simple script DRep', value: 'simple-script'},
    {label: 'Plutus script DRep', value: 'plutus-script'},
  ]}>
  <TabItem value="key-based">

## Register a Key-based DRep

### Generate DRep keys: 

```shell
cardano-cli conway governance drep key-gen \
--verification-key-file drep.vkey \
--signing-key-file drep.skey
```
This returns the keys wrapped on text envelopes:  

```json
{
    "type": "DRepSigningKey_ed25519",
    "description": "Delegated Representative Signing Key",
    "cborHex": "5820eba7053fdc9cb3b8aacf142d3d4ad575bb48fb92f4082d81605ac8e2ccfead5d"
}
```
```json
{
    "type": "DRepVerificationKey_ed25519",
    "description": "Delegated Representative Verification Key",
    "cborHex": "5820c19e0e939609531cfd04dcfa5bf1a5f3e245aa88e163759341aba296af34cc7e"
}
```

### Generate the DRep Id:
The hash of the verification key is the DRep ID, get it with:

```shell
cardano-cli conway governance drep id \
  --drep-verification-key-file drep.vkey \
  --output-format hex
```
```shell
687c9849e1792f9b43d2a78153c412406950ee0c6f2b417226da9dcc
```

Or in bech32 format

```shell
cardano-cli conway governance drep id \
  --drep-verification-key-file drep.vkey \
  --output-format bech32 
```
```shell
drep124w9k5ml25kcshqet8r3g2pwk6kqdhj79thg2rphf5u5urve0an
```

### Prepare the DRep metadata file:

DReps have the option to include metadata in their registration certificate to convey their motivations and positions regarding the current and future state of the Cardano blockchain. Stakeholders looking to delegate their voting power can review this metadata to make informed decisions about whom to delegate their vote to. [CIP-119](https://cips.cardano.org/cip/CIP-0119) provides a specification for off-chain DReps metadata. 

To add metadata to the registration certificate, you need to provide an anchor, which is a URL pointing to the metadata payload, along with a hash of the metadata content.

In this example we use the [test vector of CIP119](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/test-vector.md). 

### Get the metadata hash:

Download the metadata from its URL:

```shell
wget https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0119/examples/drep.jsonld
```

Use cardano-cli or b2sum to get its hash

```shell
cardano-cli conway governance drep metadata-hash \
  --drep-metadata-file drep.jsonld 

a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de
```

```shell 
b2sum -l 256 drep.jsonld 
a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de  drep.jsonld
```

### Generate the DRep registration certificate:

Registering a DRep requires a deposit, query the protocol parameters to find the amount:

```shell
cardano-cli query protocol-parameters | jq .dRepDeposit
500000000
```

Generate the certificate Using the `drep.vkey` file:

```shell
cardano-cli conway governance drep registration-certificate \
  --drep-verification-key-file drep.vkey \
  --key-reg-deposit-amt 500000000 \
  --drep-metadata-url https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0119/examples/drep.jsonld \
  --drep-metadata-hash a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de \
  --out-file drep-reg.cert 
```

Or using the DRep verification key:

```shell
cardano-cli conway governance drep registration-certificate \
  --drep-verification-key c19e0e939609531cfd04dcfa5bf1a5f3e245aa88e163759341aba296af34cc7e \
  --key-reg-deposit-amt 500000000 \
  --drep-metadata-url https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0119/examples/drep.jsonld \
  --drep-metadata-hash a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de \
  --out-file drep-reg.cert 
```

Or using the DRep ID:

```shell
cardano-cli conway governance drep registration-certificate \
  --drep-key-hash "$(< drep.id)" \
  --key-reg-deposit-amt 500000000 \
  --drep-metadata-url https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0119/examples/drep.jsonld \
  --drep-metadata-hash a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de \
  --out-file drep-reg.cert 
```

Any of the above methods produces `drep-reg.cert ` in a text envelope:

```json
{
    "type": "CertificateConway",
    "description": "DRep Key Registration Certificate",
    "cborHex": "84108200581c555c5b537f552d885c1959c714282eb6ac06de5e2aee850c374d394e1a1dcd650082785e68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f63617264616e6f2d666f756e646174696f6e2f434950732f6d61737465722f4349502d303131392f6578616d706c65732f647265702e6a736f6e6c645820a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de"
}
```

### Submit the Registration certificate in a transaction:

Build the transaction. Note that we use `--witness-override 2` because this tranaction will contain 2 signatures, with the `payment.skey` and with the `drep.skey`. 

```shell
cardano-cli conway transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file drep-reg.cert  \
  --witness-override 2 \
  --out-file tx.raw
```

Sign it with payment and DRep signing keys:

```shell
cardano-cli conway transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file drep.skey \
  --out-file tx.signed
```

Submit it to the chain:

```shell
cardano-cli conway transaction submit \
--tx-file tx.signed
```

### Query the DRep state to confirm:

```shell
cardano-cli conway query drep-state  --all-dreps


cardano-cli conway query drep-state --drep-key-hash 687c9849e1792f9b43d2a78153c412406950ee0c6f2b417226da9dcc 
[
    [
        {
            "keyHash": "687c9849e1792f9b43d2a78153c412406950ee0c6f2b417226da9dcc"
        },
        {
            "anchor": null,
            "deposit": 2000000,
            "expiry": 188
        }
    ]
]
```

  </TabItem>
  <TabItem value="simple-script">

## Register a Simple script based DRep

A basic example of a DRep using a native script is a DRep that consists of various memebers where, to issue votes, a minimum number of members must sign the transaction. 

### Generate a DRep key pair for each member

```shell
cardano-cli conway governance drep key-gen \
  --verification-key-file drep1.vkey \
  --signing-key-file drep1.skey
```
```json
{
    "type": "DRepSigningKey_ed25519",
    "description": "Delegate Representative Signing Key",
    "cborHex": "5820eba7053fdc9cb3b8aacf142d3d4ad575bb48fb92f4082d81605ac8e2ccfead5d"
}
```
```json
{
    "type": "DRepVerificationKey_ed25519",
    "description": "Delegate Representative Verification Key",
    "cborHex": "5820c19e0e939609531cfd04dcfa5bf1a5f3e245aa88e163759341aba296af34cc7e"
}
```
### Get verification key hashes:

Each member generates the hash of the verification key (This is exactly what the `governance drep id` command do)

```shell
cardano-cli conway governance drep id \
  --drep-verification-key-file drep1.vkey \
  --output-format hex \
  --out-file drep1.id
```
```shell
cat drep1.id
e6d27c194fd18f39e080073e5ea02aa78abe4b6c84d78a498302461c
```

### Build the Simple script:

Multi-signature scripts can be written using JSON syntax, which is the format accepted by the cardano-cli tool.

In this example, the DRep consists of three members, so we include the DRep ID of each member. The script should evaluate to `True` if and only if **at least two valid signatures are present**. This requirement is specified by the `type` and `required` fields.

Use your favorite text editor to create your script, and save it as drep-multisig.json:

```json
{
  "type": "atLeast",
  "required": 2,
  "scripts": [
    {
      "type": "sig",
      "keyHash": "e6d27c194fd18f39e080073e5ea02aa78abe4b6c84d78a498302461c"
    },
    {
      "type": "sig",
      "keyHash": "5ab00e8cd1142fcffc5f7a2c2e3549874afd89e26995d7686c2714d4"
    },
    {
      "type": "sig",
      "keyHash": "db5a8cbb0df0359c36541727229993b21371f834202733c9bbabc1fd"
    }
  ]
}
```

We can choose a different type of script, for example type "any", where the script evaluates to `True` with a single valid signature from the list:

```json
{
  "type": "any",
  "scripts": [
    {
      "type": "sig",
      "keyHash": "e6d27c194fd18f39e080073e5ea02aa78abe4b6c84d78a498302461c"
    },
    {
      "type": "sig",
      "keyHash": "5ab00e8cd1142fcffc5f7a2c2e3549874afd89e26995d7686c2714d4"
    },
    {
      "type": "sig",
      "keyHash": "db5a8cbb0df0359c36541727229993b21371f834202733c9bbabc1fd"
    }
  ]
}
```

Or for a more strict setup we can use type "all", where all the signatures are required:

```json
{
  "type": "all",
  "scripts": [
    {
      "type": "sig",
      "keyHash": "e6d27c194fd18f39e080073e5ea02aa78abe4b6c84d78a498302461c"
    },
    {
      "type": "sig",
      "keyHash": "5ab00e8cd1142fcffc5f7a2c2e3549874afd89e26995d7686c2714d4"
    },
    {
      "type": "sig",
      "keyHash": "db5a8cbb0df0359c36541727229993b21371f834202733c9bbabc1fd"
    }
  ]
}
```
### Prepare the DRep metadata file:

Optionally, DReps can include metadata in their registration certificate to convey their motivations and positions regarding the current and future state of the Cardano blockchain. Stakeholders looking to delegate their voting power can review this metadata to make informed decisions about whom to delegate their vote to. [CIP-119](https://cips.cardano.org/cip/CIP-0119) provides a specification for off-chain DReps metadata. 

To add metadata to the registration certificate, you need to provide an anchor, which is a URL pointing to the metadata payload, along with a hash of the metadata content.

In this example we use the [test vector of CIP119](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/test-vector.md). 

### Get the metadata hash:

Download the metadata from its URL:

```shell
wget https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0119/examples/drep.jsonld
```

Use cardano-cli or b2sum to get its hash:

```shell
cardano-cli conway governance drep metadata-hash \
  --drep-metadata-file drep.jsonld 

a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de
```

```shell 
b2sum -l 256 drep.jsonld 
a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de  drep.jsonld
```
### Generate the DRep ID:

This DRep will be registered on-chain as a script, therefore, the hash of the script will serve as the DRep ID. Calculate it with:

```shell
cardano-cli hash script \
  --script-file drep-multisig.json \
  --out-file drep-multisig.id
```
```shell 
cat drep-multisig.id
d862ee2eb3ce246b23ff7e1f62ae0705013e793787485cb6e1845356
```

### Generate the DRep registration certificate:

Registering a DRep requires a deposit, query the protocol parameters to find the amount:

```shell
drepDeposit=$(cardano-cli query protocol-parameters | jq .dRepDeposit)

echo $drepDeposit
500000000
```

Generate the registration certificate:

```shell
cardano-cli conway governance drep registration-certificate \
  --drep-script-hash "$(< drep-multisig.id)" \
  --key-reg-deposit-amt "$drepDeposit" \
  --out-file drep-multisig-reg.cert
```

### Submit the Registration certificate in a transaction

Build the transaction. Note that we use `--witness-override 4` because this tranaction will contain up to 4 signatures, 1 from the payment key and up to 3 members of the DRep.

```shell
cardano-cli conway transaction build \
  --tx-in $(cardano-cli conway query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file drep-multisig-reg.cert \
  --certificate-script-file drep-multisig.json \
  --witness-override 4 \
  --out-file tx.raw
```

Each member of the DRep will witness the transaction with its individual keys from step 1. In addition, we need the witness from the payment address to pay for the transaction fee. 

Witnessing the transaction with the payment key:

```shell
cardano-cli conway transaction witness \
   \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file payment.witness
```

Witnessing the transaction with the DRep keys from each memeber:

```shell
cardano-cli conway transaction witness \
  --tx-body-file tx.raw \
  --signing-key-file drep1.skey \
  --out-file drep1.witness
```

```shell
cardano-cli conway transaction witness \
  --tx-body-file tx.raw \
  --signing-key-file drep2.skey \
  --out-file drep2.witness
```
```shell
cardano-cli conway transaction witness \
  --tx-body-file tx.raw \
  --signing-key-file drep3.skey \
  --out-file drep3.witness
```

Assemble the tranaction with all the witnesses from previous step:

```shell
cardano-cli transaction assemble \
  --tx-body-file tx.raw \
  --witness-file  payment.witness \
  --witness-file  drep1.witness \
  --witness-file  drep2.witness \
  --witness-file  drep3.witness \
  --out-file tx.signed
```

Submit the transaction

```shell
cardano-cli conway transaction submit \
  --tx-file tx.signed
```

### Query the DRep state to confirm:

```shell
cardano-cli conway query drep-state \
  --drep-script-hash $(< drep-multisig.id)
```
```json
[
    [
        {
            "scriptHash": "d862ee2eb3ce246b23ff7e1f62ae0705013e793787485cb6e1845356"
        },
        {
            "anchor": null,
            "deposit": 2000000,
            "expiry": 270
        }
    ]
]
```

  </TabItem>
  <TabItem value="plutus-script">

## Register a Plutus script based DRep 

Writing the Plutus script is out of the scope of this tutorial. As an example of what can be done, Tomas Vellekop (@perturbing) wrote this [Plutus Script DRep
that can only vote 'YES'](https://github.com/perturbing/always-yes-drep) 

Once you have compiled the Plutus script, the process to register is very similar to Simple scripts.

### Prepare the DRep metadata file:

DReps have the option to include metadata in their registration certificate to convey their motivations and positions regarding the current and future state of the Cardano blockchain. Stakeholders looking to delegate their voting power can review this metadata to make informed decisions about whom to delegate their vote to. [CIP-119](https://cips.cardano.org/cip/CIP-0119) provides a specification for off-chain DReps metadata. 

To add metadata to the registration certificate, you need to provide an anchor, which is a URL pointing to the metadata payload, along with a hash of the metadata content.

In this example we use the [test vector of CIP119](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/test-vector.md). 

### Get the metadata hash:

Download the metadata from its URL:

```shell
wget https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0119/examples/drep.jsonld
```

Use cardano-cli or b2sum to get its hash:

```shell
cardano-cli conway governance drep metadata-hash \
  --drep-metadata-file drep.jsonld 

a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de
```

```shell 
b2sum -l 256 drep.jsonld 
a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de  drep.jsonld
```

### Generate the DRep ID:

This DRep will be registered on-chain as a script, therefore, the hash of the script will serve as the DRep ID. Calculate it with:

```shell
 cardano-cli hash script \
   --script-file alwaysVoteYesDrep.plutus \
   --out-file alwaysVoteYesDrep.id

```
```shell 
cat alwaysVoteYesDrep.id 
3b943c3e9598ef0e8d6bf504e7ddeee73232b1825380765c04e25055
```
### Generate the DRep registration certificate:

Registering a DRep requires a deposit, query the protocol parameters to find the amount:

```shell
drepDeposit=$(cardano-cli query protocol-parameters | jq .dRepDeposit)

echo $drepDeposit
500000000
```

Generate the registration certificate:

```shell
cardano-cli conway governance drep registration-certificate \
  --drep-script-hash "$(< alwaysVoteYesDrep.id)" \
  --key-reg-deposit-amt "$drepDeposit" \
  --out-file alwaysVoteYesDrep.cert
```
### Submit the Registration certificate in a transaction

Build the transaction, we need to provide a collateral and a redeemer value:

```shell
cardano-cli conway transaction build \
  --tx-in $(cardano-cli conway query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --tx-in-collateral $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --certificate-file alwaysVoteYesDrep.cert \
  --certificate-script-file alwaysVoteYesDrep.plutus \
  --certificate-redeemer-value {} \
  --change-address $(< payment.addr) \
  --out-file tx.raw
```

```shell
cardano-cli transaction sign \
  --signing-key-file payment.skey \
  --tx-body-file tx.raw \
  --out-file tx.signed
```
```shell
cardano-cli transaction submit --tx-file tx.signed
```



  </TabItem>
</Tabs>