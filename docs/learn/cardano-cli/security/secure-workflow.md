---
id: secure-workflow
title: Secure Transaction Workflow
sidebar_label: Secure Transaction Workflow
description: Sign transactions and cold-key operations on an air-gapped machine — keeping private keys off the internet.
image: /img/og/og-security-secure-transaction-workflow.png
---

The core rule for all Cardano key operations is simple:

:::warning
Private keys — payment keys, cold keys, stake keys — must never exist on an internet-connected machine.
:::

This page describes the workflow pattern that enforces that rule: build transactions on an online machine, sign on the air-gapped machine, submit from the online machine. The signing key never moves; only unsigned and signed transaction files cross the boundary.

## The three-step pattern

```
Online machine          Air-gapped machine       Online machine
─────────────          ─────────────────        ─────────────
query + build   ──►    review + sign     ──►    submit
(unsigned tx)          (signed tx)
```

1. **Build** — on your online node, query the chain and build an unsigned transaction. No key required.
2. **Sign** — transfer the unsigned transaction to the air-gapped machine via a dedicated USB drive. Inspect it, then sign it with the private key.
3. **Submit** — transfer the signed transaction back to the online machine and submit.

The private key never leaves the air gap. The online machine never sees a signed transaction until after signing.

## Before you start

Set these environment variables on your online node so you don't have to repeat them on every command:

```bash
export CARDANO_NODE_SOCKET_PATH=/run/cardano/node.socket
export CARDANO_NODE_NETWORK_ID=mainnet   # or 1 for preprod, 2 for preview
```

For your air-gapped environment options, see [Air Gap Environment](/docs/learn/educational-resources/air-gap).

## Transfer media

Keep a dedicated USB drive for moving transaction files. Format it on the air-gapped machine before first use. Use exFAT or FAT32 for compatibility between Linux and other systems.

**Never put keys on this drive.** Keys live on the air-gapped machine's encrypted volume. The USB drive carries only:
- Unsigned transaction files (`.raw`) going **in** to the air gap
- Signed transaction files (`.signed`) coming **out** of the air gap
- Public keys and addresses (safe to copy in either direction)
- Protocol parameters and UTxO data going **in**

## Key generation

You can generate keys in two ways: random key generation (simpler, no mnemonic) or mnemonic-based derivation (recoverable from a seed phrase). Both methods should be run **on the air-gapped machine**.

### Random key generation (cardano-cli)

```bash
# Payment key pair
cardano-cli address key-gen \
    --verification-key-file payment.vkey \
    --signing-key-file payment.skey

# Stake key pair
cardano-cli stake-address key-gen \
    --verification-key-file stake.vkey \
    --signing-key-file stake.skey
```

Back up the `.skey` files to at least two independent encrypted locations. If they are lost, there is no recovery path.

### Mnemonic-based derivation

Deriving keys from a mnemonic means your keys can be re-derived from the seed phrase at any time, and the keys are compatible with Daedalus, Lace, Eternl, and other Cardano wallets.

:::danger
Never store your mnemonic on a cloud server, in email, or in any internet-connected storage. Treat it with the same care as the signing keys themselves — the mnemonic is the master secret from which all keys can be re-derived.
:::

#### cardano-signer — derive keys directly to .skey/.vkey files

[cardano-signer](https://github.com/gitmachtl/cardano-signer) produces cardano-cli-compatible `.skey`/`.vkey` files directly from a mnemonic and a named derivation path:

```bash
# Generate new mnemonic and derive payment keys in one step
cardano-signer keygen --path payment \
    --out-skey payment.skey \
    --out-vkey payment.vkey \
    --out-mnemonics phrase.prv

# Or derive from an existing mnemonic
cardano-signer keygen --path payment \
    --mnemonics "word1 word2 ... word24" \
    --out-skey payment.skey \
    --out-vkey payment.vkey

# Stake key
cardano-signer keygen --path stake \
    --mnemonics "word1 word2 ... word24" \
    --out-skey stake.skey \
    --out-vkey stake.vkey

# Pool cold key
cardano-signer keygen --path pool \
    --mnemonics "word1 word2 ... word24" \
    --out-skey cold.skey \
    --out-vkey cold.vkey \
    --out-id pool.id
```

Named paths (`payment`, `stake`, `pool`, `drep`, `cc-cold`, `cc-hot`, `calidus`) expand to the standard BIP44/CIP derivation paths automatically.

#### cardano-addresses — wallet-compatible key and address derivation

[cardano-addresses](https://github.com/IntersectMBO/cardano-addresses) is the lower-level pipeline used by wallets. Use it when you need full BIP44 address derivation or want to generate addresses compatible with a specific account index or address index:

```bash
# Generate a 24-word mnemonic
cardano-address recovery-phrase generate --size 24 > phrase.prv

# Derive root key
cardano-address key from-recovery-phrase Shelley < phrase.prv > root.xsk

# Derive payment verification key (account 0, address 0)
cardano-address key child 1852H/1815H/0H/0/0 < root.xsk \
    | cardano-address key public --with-chain-code > addr.xvk

# Derive stake verification key
cardano-address key child 1852H/1815H/0H/2/0 < root.xsk \
    | cardano-address key public --with-chain-code > stake.xvk

# Generate a base address (payment + staking, mainnet)
cardano-address address payment --network-tag mainnet < addr.xvk \
    | cardano-address address delegation $(cat stake.xvk) > base.addr
```

The resulting `base.addr` is identical to the address that Daedalus/Lace would show for account 0, address 0 when restoring the same mnemonic.

## Payment transaction

### 1. Build (online machine)

```bash
# Get current UTxO for your payment address
cardano-cli query utxo --address $(cat payment.addr)

# Build the unsigned transaction — transaction build handles fee calculation automatically
cardano-cli conway transaction build \
    --tx-in <TXHASH>#<TXIX> \
    --tx-out <DESTINATION_ADDRESS>+<LOVELACE> \
    --change-address $(cat payment.addr) \
    --out-file tx.raw
```

Copy `tx.raw` to the USB drive.

### 2. Sign (air-gapped machine)

Mount the USB drive and inspect the transaction before signing:

```bash
cardano-cli conway transaction view --tx-file tx.raw
```

Verify the outputs match what you intended. Then sign:

```bash
cardano-cli conway transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --out-file tx.signed
```

Copy `tx.signed` to the USB drive. Unmount and remove the drive.

### 3. Submit (online machine)

```bash
cardano-cli conway transaction submit --tx-file tx.signed
```

Verify on a [block explorer](/docs/get-started/networks/explorers).

## Cold key operations

Pool registration, re-registration, and retirement all follow the same pattern but require the cold key (`cold.skey`) for signing and may require additional files on the air-gapped machine.

The full procedures are documented in:
- [Registering a Pool](/docs/operate-a-stake-pool/block-producer/register-stake-pool) — pool registration certificate and delegation certificate
- [Key Generation](/docs/operate-a-stake-pool/block-producer/block-producer-keys) — KES rotation and op cert issuance
- [Deployment](/docs/operate-a-stake-pool/block-producer/deployment) — securely transferring credentials to the block producer

## Governance voting

Constitutional Committee members and SPO voting operations also follow this pattern:

1. Build the vote transaction on an online machine (or use a governance tool)
2. Transfer to the air-gapped machine for signing with the cold key or CC hot key
3. Submit the signed transaction

See [SPO Governance](/docs/operate-a-stake-pool/governance/spo-governance) for the full voting workflow.

## Extended signing with cardano-signer

[cardano-signer](https://github.com/gitmachtl/cardano-signer) handles signing operations that go beyond plain transactions. All of these should be run on the **air-gapped machine** when they involve a private key.

### CIP-8 message signing (identity proof)

Governance tools, dApps, and explorer profiles often ask you to prove ownership of a key by signing a challenge message. This uses the CIP-8 COSE_Sign1 format:

```bash
cardano-signer sign --cip8 \
    --data "I am the operator of this pool" \
    --secret-key stake.skey \
    --address $(cat stake.addr) \
    --json
```

The `--address` flag causes cardano-signer to verify that the key actually belongs to that address before signing, catching key/address mismatches.

### Governance metadata signing (CIP-100/108/119)

SPOs, DReps, and Constitutional Committee members publishing rationale documents or poll responses must sign the JSON-LD metadata file. cardano-signer adds the author signature directly to the document:

```bash
# Sign a governance metadata document (e.g., rationale, DRep statement, SPO statement)
# On air-gapped machine
cardano-signer sign --cip100 \
    --data-file governance-metadata.jsonld \
    --secret-key stake.skey \
    --author-name "My Pool Name" \
    --out-file governance-metadata-signed.jsonld
```

Verify the signatures before publishing:

```bash
cardano-signer verify --cip100 \
    --data-file governance-metadata-signed.jsonld \
    --json
```

The signed file is the one you upload as the governance anchor document and hash for on-chain submission.

### Calidus key registration (CIP-88v2)

[Calidus keys](../../../../operate-a-stake-pool/operator-tools/calidus-keys) are hot keys that prove you control a pool without exposing the cold key. Registration requires a cold-key signature, so it must be done on the air-gapped machine:

```bash
# 1. Generate the Calidus hot key (on air-gapped machine)
cardano-signer keygen --path calidus \
    --out-skey calidus.skey \
    --out-vkey calidus.vkey \
    --out-id calidus.id

# 2. Generate the CIP-88v2 registration metadata (cold key signs for the calidus key)
cardano-signer sign --cip88 \
    --calidus-public-key calidus.vkey \
    --secret-key cold.skey \
    --json-extended \
    --out-file calidus-registration.json \
    --out-cbor calidus-registration.cbor
```

Copy `calidus-registration.cbor` to the online machine and submit it as transaction metadata. The `calidus.skey` stays on the air-gapped machine; `calidus.vkey` and `calidus.id` can be copied anywhere and used freely as a hot key.

## Key backup

Your private keys should be encrypted at rest on the air-gapped machine. Keep at minimum two independent encrypted backups in separate physical locations. See [Air Gap Environment — key storage](/docs/learn/educational-resources/air-gap) for recommended practices.
