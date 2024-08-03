---
id: constitutional committee
sidebar_label: Constitutional committee
title: Constitutional committee
sidebar_position: 3
description: How to generate credentials as Constiutional Committee Member
keywords: [Governance, constitutional committee, committee, credentials, CIP1694]
---

## Committee member cold credentials

Individuals or entities nominated as committee members must generate a *cold* credential, which can be either a public key (Ed25519) or a script. This cold credential serves as the primary identifier and is used to authorize a *hot* credential, which is used for voting.

The term 'cold' emphasizes that this credential is stored in a secure, offline environment, such as safeguarded USB drives, isolated computing machines, or other devices deliberately formatted and disconnected from the internet for enhanced security. Conversely, the term 'hot' indicates that this credential is slightly more exposed, as it is more frequently used for signing votes. New hot credentials can be authorized at any point, where a new authorization certificate overrides the previous one. 

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="key-based"
  values={[
    {label: 'Key-based', value: 'key-based'},
    {label: 'Simple script', value: 'simple-script'},
    {label: 'Plutus script', value: 'plutus-script'},
  ]}>
  <TabItem value="key-based">

The most basic setup for a Constiutional Committee member is using Ed25519 keys. An Ed25519 key pair includes a private key and its corresponding public key. The private key is utilized to create digital signatures, while the public key is employed to verify those signatures. On this setup. the constitutional committee member would generate two sets of keys: *cold* and *hot* and issue an authorizaton certificate to link them.

### Generate cold key pair:
```
cardano-cli conway governance committee key-gen-cold \
    --cold-verification-key-file cc-cold.vkey \
    --cold-signing-key-file cc-cold.skey
```
As usual, the ed25519 keys are wrapped on a text envelope:

```
{
    "type": "ConstitutionalCommitteeColdVerificationKey_ed25519",
    "description": "Constitutional Committee Cold Verification Key",
    "cborHex": "58201e2c2038e3466fdc7b8e1b302b15db28427adb5467b9df09e736e713d7371d04"
}
```
```
{
    "type": "ConstitutionalCommitteeColdSigningKey_ed25519",
    "description": "Constitutional Committee Cold Signing Key",
    "cborHex": "5820ffafa2978add44508e2d9d704faf54bccd41fad5f5c312b268c48d32a99c1099"
}
```
### Generate the cold verification key hash:

```
cardano-cli conway governance committee key-hash \
    --verification-key-file cc-cold.vkey > cc-key.hash
```

```
cat cc-key.hash
89181f26b47c3d3b6b127df163b15b74b45bba7c3b7a1d185c05c2de
```

The key hash (or script hash) is what identifies the CC member on-chain and would be typically used in the **update committee** governance 
action that attempts to add or remove CC members.

Members of the Interim Constitutional Committee are required to share their Cold key hash or Cold script hash to be added to the Conway genesis file. 

### Generate Hot key pair:

After the Chang hardfork, members of the Interim Constitutional Committee are required to generate a _hot key pair_ (or hot script) and
submit an _Authorization Certificate_. This also applies to new Committee members appointed after the interim phase.

To generate a hot key-pair run the follwing command:

```
cardano-cli conway governance committee key-gen-hot \
    --verification-key-file cc-hot.vkey \
    --signing-key-file cc-hot.skey
```

Hot keys are also ed25519 keys wrapped on a text envelope:

```
{
    "type": "ConstitutionalCommitteeHotVerificationKey_ed25519",
    "description": "Constitutional Committee Hot Verification Key",
    "cborHex": "5820d206b8619a933a099e3190afe0a81cb485af66c3d9297f4b109da507ad5259c0"
}
```
```
{
    "type": "ConstitutionalCommitteeHotSigningKey_ed25519",
    "description": "Constitutional Committee Hot Signing Key",
    "cborHex": "5820727625958a2b484d6797cb00079cdf71199555ce1db67bd1a868665bac1099c8"
}
```

### Generate the Authorization Certificate:

The _Authorization Certificate_ allows the hot credential to act on behalf of the cold credential by signing transactions where votes are cast. If the 
*hot* credential is compromised at any point, the committee member must generate a new one and issue a new Authorization Certificate. A new Authorization Certificate registered on-chain overrides the previous one, effectively invalidating any votes signed by the old hot credential. This applies only to actions that have not yet been ratified. Actions that have been already ratified or enacated by the old hot credential are not affected.


```
cardano-cli conway governance committee create-hot-key-authorization-certificate \
    --cold-verification-key-file cc-cold.vkey \
    --hot-verification-key-file cc-hot.vkey \
    --out-file cc-authorization.cert
```

```
cat cc-authorization.cert 

{
    "type": "CertificateConway",
    "description": "Constitutional Committee Hot Key Registration Certificate",
    "cborHex": "830e8200581cb3745a0b5231017ab5c02ad45b55f4d50940fb127120455bcaedd53a8200581cdeaf2ae047657b1ad4094bb99664d160a7cd8c539b1ed3d44ffb8de9"
}
```

### Submit the authorization certificate in a transaction:

```
cardano-cli conway transaction build \
  --tx-in "$(cardano-cli query utxo --address "$(< payment.addr)" --output-json | jq -r 'keys[0]')" \
  --change-address payment.addr \
  --certificate-file cc-authorization.cert \
  --witness-override 2 \
  --out-file tx.raw
```
```
cardano-cli conway transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file cc-cold.skey \
  --out-file tx.signed
```
```
cardano-cli conway transaction submit \
  --tx-file tx.signed
```

  </TabItem>
  <TabItem value="simple-script">

Constitutional Committee members comprising multiple individuals can opt for a multisignature setup using simple scripts.

There are multiple possible setups, in this example we show how [Simple scripts](docs/get-started/cardano-cli/simple-scripts/simple-scripts.md) can be used for both the *cold* and the *hot* credentials. 

Assume Alice, Bob and Carol form an organization "ABC" and the community wishes to appoint "ABC" as a Constitutional Committee member. 

### Generate keys for the cold credential: 

Alice, Bob, and Carol need to generate a key-pair for the multisignature cold credential.

Alice: 

```shell
cardano-cli conway governance committee key-gen-cold \
    --cold-verification-key-file alice-cold.vkey \
    --cold-signing-key-file alice-cold.skey
```

Bob:

```shell
cardano-cli conway governance committee key-gen-cold \
    --cold-verification-key-file bob-cold.vkey \
    --cold-signing-key-file bob-cold.skey
```
Carol:

```shell
cardano-cli conway governance committee key-gen-cold \
    --cold-verification-key-file carol-cold.vkey \
    --cold-signing-key-file carol-cold.skey
```

### Get verification key hashes:

To generate a multisignature script, Alice, Bob, and Carol need to obtain their verification key hashes:

```shell
cardano-cli conway governance committee key-hash --verification-key-file alice-cold.vkey 
8d6ae7ddc48e434d28ee36985043a180a98e8566e1d83cfe79a35270

cardano-cli conway governance committee key-hash --verification-key-file bob-cold.vkey 
6689c9c9749266c2470ff49ee115a6e040e0a97042f1982c3de52f25

cardano-cli conway governance committee key-hash --verification-key-file carol-cold.vkey 
da1a4d13a1c951f30a7efb4dac2b4c1f603f4eabbfa0ecc7f361bfc1

```
### Create the multisignature cold script: 

Create the multisignature `cold.script` file using the simple scrypt syntax. In this example we use the `atLeast` type, so that 2 out of the 3 keys are required for the script to evaluate to true. To learn more about simple scripts read [this article](docs/get-started/cardano-cli/simple-scripts/simple-scripts.md)

```
cat cold.script

{
  "type": "atLeast",
  "required": 2,
  "scripts":
  [
    {
      "type": "sig",
      "keyHash": "dd690145e402d3f275fe8c980b2476af5f89cb5e933eb28e3a473959"
    },
    {
      "type": "sig",
      "keyHash": "a49778c69b5f78e7677dedf962c63509ba3e8405078ac37b6d87fb85"
    },
    {
      "type": "sig",
      "keyHash": "770fed404cd3693d5ccafa65ab4e3fed09f6d9f9f72196e3be9d4ab9"
    },
  ]
}
```

### Calculate the script hash:

The governance action that proposes "ABC" organization as a Committee Memeber needs to reference their cold script hash. They can obtain it with:

```
cardano-cli hash script --script-file cold.script 
ad31d247bb2549db98020c5a6331732ebe559ad85b5768abbda3eb0d
```

### Generate keys for the hot credential:

If ratified, "ABC" will need to generate a *Hot* credential and an Authorization certificate. Alice, Bob and Carol can follow the exact same workflow from above: Generate Ed25519 key pair for each member, and create a multisignature simple script. 

Alice:

```
cardano-cli conway governance committee key-gen-hot \
  --verification-key-file alice-hot.vkey \
  --signing-key-file alice-hot.skey
```
Bob:

```
cardano-cli conway governance committee key-gen-hot \
  --verification-key-file bob-hot.vkey \
  --signing-key-file bob-hot.skey
```

Carol:

```
cardano-cli conway governance committee key-gen-hot \
  --verification-key-file carol-hot.vkey \
  --signing-key-file carol-hot.skey
```
### Get the hot key hashes:

```
cardano-cli conway governance committee key-hash --verification-key-file alice-hot.vkey
d775c28b6635d6eaecdc149f490f27d651ff4a10e2f37d60dfb23f11

cardano-cli conway governance committee key-hash --verification-key-file bob-hot.vkey
7be259f2b92d9587c3f0fddfa7ebdd19ad5b8e0f82e0a17166186001

cardano-cli conway governance committee key-hash --verification-key-file carol-hot.vkey
643f4e3d521675e199e38a6904038057252507fd69b97b9f181912b1
```

### Create the multisignature hot script:

```
cat hot.script

{
  "type": "atLeast",
  "required": 2,
  "scripts":
  [
    {
      "type": "sig",
      "keyHash": "d775c28b6635d6eaecdc149f490f27d651ff4a10e2f37d60dfb23f11"
    },
    {
      "type": "sig",
      "keyHash": "7be259f2b92d9587c3f0fddfa7ebdd19ad5b8e0f82e0a17166186001"
    },
    {
      "type": "sig",
      "keyHash": "643f4e3d521675e199e38a6904038057252507fd69b97b9f181912b1"
    }
  ]
}
```

### Calculate the hot script hash:

```
cardano-cli hash script --script-file hot.script 
f5d42214cb2625cfc34e5c0cfb1daceee44a4a3c2e6807ab67cd6adb
```

### Issue the authorization certificate

The _Authorization Certificate_ allows the hot credential to act on behalf of the cold credential by signing transactions where votes are cast. If the 
*hot* credential is compromised at any point, the committee member must generate a new one and issue a new Authorization Certificate. A new Authorization Certificate registered on-chain overrides the previous one, effectively invalidating any votes signed by the old hot credential. This applies only to actions that have not yet been ratified. Actions that have been already ratified or enacated by the old hot credential are not affected.

```
cardano-cli conway governance committee create-hot-key-authorization-certificate \
--cold-script-hash ad31d247bb2549db98020c5a6331732ebe559ad85b5768abbda3eb0d \
--hot-script-hash f5d42214cb2625cfc34e5c0cfb1daceee44a4a3c2e6807ab67cd6adb \
--out-file cc-authorization.cert
```

### Submit the authorization certificate in a transaction

Build the transaction:
```
cardano-cli conway transaction build \
  --tx-in "$(cardano-cli query utxo --address "$(< payment.addr)" --output-json | jq -r 'keys[0]')" \
  --change-address "$(< payment.addr)" \
  --certificate-file cc-authorization.cert \
  --certificate-script-file cold.script \
  --witness-override 4 \
  --out-file tx.raw

>Estimated transaction fee: Coin 190933
```

Witness the transaction with the payment key:

```shell
cardano-cli conway transaction witness \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file payment.witness
```

Alice witnesses the transaction:

```shell
cardano-cli conway transaction witness \
  --tx-body-file tx.raw \
  --signing-key-file alice-cold.skey \
  --out-file alice.witness
```

Bob witnesses the transaction:

```shell
cardano-cli conway transaction witness \
  --tx-body-file tx.raw \
  --signing-key-file bob-cold.skey \
  --out-file bob.witness
```

Carol witnesses the transaction:

```shell
cardano-cli conway transaction witness \
  --tx-body-file tx.raw \
  --signing-key-file carol-cold.skey \
  --out-file carol.witness
```

Assemble the tranaction with all the witnesses from previous step:

```shell
cardano-cli transaction assemble \
  --tx-body-file tx.raw \
  --witness-file  payment.witness \
  --witness-file  alice.witness \
  --witness-file  bob.witness \
  --witness-file  carol.witness \
  --out-file tx.signed
```

Submit the transaction 

```shell
cardano-cli conway transaction submit \
  --tx-file tx.signed
```


  </TabItem>
  <TabItem value="plutus-script">

:::info
Please go to [Credential Manager](https://credential-manager.readthedocs.io/en/latest/index.html) 

It is a suite of Plutus scripts and tools for managing credentials with an X.509 certificate chain, ensuring secure access and operations within the Cardano blockchain for key management and security best practices.
:::
  </TabItem>
</Tabs>

