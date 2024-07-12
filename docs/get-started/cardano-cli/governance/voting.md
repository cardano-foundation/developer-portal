---
id: submit votes
sidebar_label: Voting 
title: Submitting votes as DRep, Stake pool or Constitutional Committee member
sidebar_position: 5
description: How to vote on governance actions 
keywords: [Governance, constitutional committee, committee, credentials, CIP1694]
---


Delegating votes to a Delegated Representative (DRep) operates much like delegating your stake to a stake pool. Vote delegation involves the issuance of a delegation certificate from your stake credential to the chosen DRep. Just as with stake delegation, the process of delegating votes to a DRep does not entail relinquishing control of your funds. Instead, the vote delegation certificate grants the selected DRep permission to vote on your behalf.

In addition to the registered DReps, the system features two pre-defined voting options:

* --abstain: this option signals your intention not to participate in the voting procedures, indicating a choice to abstain from the voting process

* --no-confidence: this option signifies your lack of trust in the current constitutional committee, indicating a vote of no confidence in their decisions

### Prerequisites

* Payment keys and address with funds
* Stake key
* Default SanchoNet DRep selection: `--always-abstain` or `--always-no-confidence`
* SanchoNet DRep ID (key hash or script hash) of a registered DRep. See [useful cli queries](queries.mdx)
* A SanchoNet node

### Generating the vote delegation certificate

1. Generate the vote delegation certificate.

* Delegating to the `--always-abstain` default DRep:

```shell
cardano-cli conway stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --always-abstain \
  --out-file vote-deleg.cert
```

* Delegating to the `--always-no-confidence` default DRep: 

```shell
cardano-cli conway stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --always-no-confidence \
  --out-file vote-deleg.cert
```

* Delegating to a **key-based** registered SanchoNet DRep:

```shell
cardano-cli conway stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --drep-key-hash $(cat drep.id) \
  --out-file vote-deleg.cert
```
* Delegating to a **script-based** (i.e. multisignature) registered SanchoNet DRep:

```
cardano-cli conway stake-address vote-delegation-certificate \
--stake-verification-key-file stake.vkey \
--drep-script-hash $(cat drep-multisig.id) \
--out-file vote-deleg.cert
```

### Submitting the certificate in a transaction

1. Submit the vote delegation certificate in a transaction.

* Build:

```
cardano-cli conway transaction build \
--testnet-magic 4 \
--witness-override 2 \
--tx-in $(cardano-cli query utxo --address $(cat payment.addr) --testnet-magic 4 --out-file  /dev/stdout | jq -r 'keys[0]') \
--change-address $(cat payment.addr) \
--certificate-file vote-deleg.cert \
--out-file tx.raw
```

* Sign with payment and stake keys:

```
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file stake.skey \
--testnet-magic 4 \
--out-file tx.signed
```

* Submit:

```
cardano-cli conway transaction submit \
--testnet-magic 4 \
--tx-file tx.signed
```
