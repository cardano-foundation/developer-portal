---
id: delegate to a drep
sidebar_label: Delegate votes to a DRep
title: Delegate votes to a Delegated Representative (DRep)
sidebar_position: 2
description: How to delegate votes to a DRep.
keywords: [Governance, DREP, Delegat votes, Delegated representative, CIP1694]
---

Delegating your voting power to a Delegate Representative (DRep) operates much like delegating your stake to a stake pool. Voting power delegation involves the issuance of a delegation certificate from your stake credential to the chosen DRep. Just as with stake delegation, the process of delegating votes to a DRep does not entail relinquishing control of your funds. Instead, the vote delegation certificate grants the selected DRep permission to vote on your behalf.

In addition to the registered DReps, the system features a couple of default voting options:

* --always-abstain: this option signals your intention not to participate in the voting procedures, indicating a choice to abstain from the voting process

* --always-no-confidence: this option signifies your lack of trust in the current constitutional committee, indicating a vote of no confidence in their decisions

### Prerequisites

* Payment keys and address with funds
* [Registered stake address](docs/get-started/cardano-cli/get-started/stakeaddress-registration.md)
* DRep ID (key hash or script hash) of a registered DRep.

## Generating the vote delegation certificate

### Generate the vote delegation certificate.

* Delegating to the `--always-abstain` default voting option:

```shell
cardano-cli conway stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --always-abstain \
  --out-file vote-deleg.cert
```

* Delegating to the `--always-no-confidence` default voting option: 

```shell
cardano-cli conway stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --always-no-confidence \
  --out-file vote-deleg.cert
```

* Delegating to a **key-based** registered DRep:

```shell
cardano-cli conway stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --drep-key-hash $(< drep.id) \
  --out-file vote-deleg.cert
```
* Delegating to a **script-based** (i.e. multisignature) registered DRep:

```shell
cardano-cli conway stake-address vote-delegation-certificate \
--stake-verification-key-file stake.vkey \
--drep-script-hash $(< drep-multisig.id) \
--out-file vote-deleg.cert
```

### Submitting the certificate in a transaction

* Build:

```
cardano-cli conway transaction build \
--tx-in $(cardano-cli query utxo --address $(< payment.addr) --testnet-magic 4 --out-file  /dev/stdout | jq -r 'keys[0]') \
--change-address $(< payment.addr) \
--certificate-file vote-deleg.cert \
--witness-override 2 \
--out-file tx.raw
```

* Sign with payment and stake keys:

```
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

* Submit:

```
cardano-cli conway transaction submit \
--tx-file tx.signed
```