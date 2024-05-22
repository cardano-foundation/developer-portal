---
id: register drep
sidebar_label: Register as a DRep
title: Registering as delegate representative (DReps)
sidebar_position: 1
description: How to register as a delegate representative
keywords: [Governance, DREP, Delegate representative, CIP1694]
---

Delegate representatives (DReps) serve as the community's spokesperson, actively participating in voting on governance actions and advocating for the community's collective interests. DReps hold significant responsibilities in the governance process, voting on important system updates. Approval depends on the governance action type and requires a majority vote from the corresponding governance bodies.

To register as a DRep, follow the steps below.

## Generate DRep keys: 

```shell
cardano-cli conway governance drep key-gen \
--verification-key-file drep.vkey \
--signing-key-file drep.skey
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

## Generate a DRep ID:

```shell
cardano-cli conway governance drep id \
  --drep-verification-key-file drep.vkey \
  --out-file drep.id
```
```shell
drep124w9k5ml25kcshqet8r3g2pwk6kqdhj79thg2rphf5u5urve0an
```

Some workflows may require the use of the hexadecimal version of the DRep ID:

```shell
cardano-cli conway governance drep id \
  --drep-verification-key-file drep.vkey \
  --output-format hex
```
```shell
687c9849e1792f9b43d2a78153c412406950ee0c6f2b417226da9dcc
```

## Generate the registration certificate:

* Using the `drep.vkey` file:

```shell
cardano-cli conway governance drep registration-certificate \
--drep-verification-key-file drep.vkey \
--key-reg-deposit-amt $(cardano-cli conway query gov-state | jq -r .currentPParams.dRepDeposit) \
--out-file drep-reg.cert 
```

* Using the DRep verification key:

```shell
cardano-cli conway governance drep registration-certificate \
--drep-verification-key "$(cat drep.vkey | jq -r .cborHex | cut -c 5-)" \
--key-reg-deposit-amt $(cardano-cli conway query gov-state | jq -r .currentPParams.dRepDeposit) \
--out-file drep-reg.cert 
````

* Using the DRep ID:

```shell
cardano-cli conway governance drep registration-certificate \
--drep-key-hash $(cat drep.id) \
--key-reg-deposit-amt $(cardano-cli conway query gov-state | jq -r .currentPParams.dRepDeposit) \
--out-file drep-reg.cert 
```

Any of the above methods produces `drep-reg.cert `:

```json
{
    "type": "CertificateShelley",
    "description": "DRep Key Registration Certificate",
    "cborHex": "84108200581c555c5b537f552d885c1959c714282eb6ac06de5e2aee850c374d394e00f6"
}
```

## Submit a certificate in a transaction:

Build the transaction:

```shell
cardano-cli conway transaction build \
--witness-override 2 \
--tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file  /dev/stdout | jq -r 'keys[0]') \
--change-address $(cat payment.addr) \
--certificate-file drep-reg.cert  \
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

## Query the DRep state to confirm:

```shell
cardano-cli conway query drep-state  --all-dreps


cardano-cli conway query drep-state --drep-key-hash 687c9849e1792f9b43d2a78153c412406950ee0c6f2b417226da9dcc --testnet-magic 4
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


