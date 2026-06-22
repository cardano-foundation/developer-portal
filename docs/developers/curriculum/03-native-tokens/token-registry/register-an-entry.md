---
id: register-an-entry
title: Register an entry
sidebar_label: Register an entry
description: Prepare, submit, update, and remove a Cardano Token Registry (CIP-26) metadata entry with token-metadata-creator.
image: /img/og/og-developer-portal.png
---

This guide covers the full lifecycle of a **CIP-26** registry entry: preparing it with `token-metadata-creator`, submitting it as a pull request, and later updating or removing it. For what the registry is and when to use it instead of CIP-68, see [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry).

## Before you start

You should already have minted a native asset (see [Mint a fungible token](/docs/developers/curriculum/native-tokens/mint-fungible)) and have:

- The **policy ID** and **asset name** of your token.
- The **monetary policy script** (native script) or the **Plutus script** that hashes to that policy ID.
- The **signing key(s)** that control the policy.
- The `token-metadata-creator` tool, from [offchain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools).

## Entry fields

Each entry is a single JSON file describing one asset:

| Field | Required | Description |
| --- | --- | --- |
| `subject` | Required | The base16 `policyId` concatenated with the base16 asset name, all lowercase. If the asset name is empty, the subject is just the policy ID. |
| `name` | Required | Human-readable name shown in interfaces. |
| `description` | Required | Human-readable description. |
| `policy` | Optional | The CBOR of the monetary policy script, used to verify ownership. Optional for Plutus scripts, where verification uses your trusted keys instead. |
| `ticker` | Optional | Short ticker symbol. |
| `url` | Optional | An HTTPS URL related to the token. |
| `logo` | Optional | A PNG logo encoded as a byte string. |
| `decimals` | Optional | How many decimal places wallets should display. Omitted means zero. |

Only `subject` is unique, because it is derived from the on-chain asset ID. Names and tickers are **not** validated for collisions, so do not rely on them being one of a kind. For the full field reference and signing options, see [offchain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools).

## Prepare your entry

The example below uses `policyId = baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f` and `assetName = "myassetname"`.

### 1. Generate the subject

Base16-encode the asset name and concatenate it onto the policy ID:

```console
$ echo -n "myassetname" | xxd -ps
6d7961737365746e616d65
```

`baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65`

The subject string must be all lowercase. For a **Plutus** policy, get the policy ID with `cardano-cli transaction policyid --script-file <my_minting_script.plutus>`.

### 2. Initialize a draft

```console
token-metadata-creator entry --init baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65
```

This writes a draft JSON file named after your subject.

### 3. Add the required fields

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
  --name "My Gaming Token" \
  --description "A currency for the Metaverse." \
  --policy policy.json
```

`policy.json` is the monetary policy script that hashes to your policy ID. Omit `--policy` for a Plutus-script policy.

### 4. Add optional fields

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
  --ticker "TKN" \
  --url "https://example.com" \
  --logo "icon.png" \
  --decimals 4
```

### 5. Sign

Sign with the key(s) that control your policy: the policy signing key for a native script, or the trusted key(s) you manage for a Plutus script. A single key signs all fields at once here. See [offchain-metadata-tools](https://github.com/input-output-hk/offchain-metadata-tools) for multi-key options.

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 -a policy.skey
```

### 6. Finalize

```console
token-metadata-creator entry baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 --finalize
```

This runs validations and produces the finalized file, ready to submit.

## Submit your entry

Submissions are pull requests against [cardano-foundation/cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry), and must follow these rules:

1. A single commit off the **master** branch of the registry.
2. Add or modify exactly one file in the [`mappings/`](https://github.com/cardano-foundation/cardano-token-registry/tree/master/mappings) folder. Split multiple mappings across multiple pull requests.
3. The file name must equal the entry's `subject`, all lowercase.
4. A single entry may be at most 370 KB.

Then fork the repository, add your finalized file, and open a pull request:

```console
$ git clone git@github.com:<your-username>/cardano-token-registry
$ cd cardano-token-registry
$ cp /path-to/baa83...d65.json mappings/
$ git add mappings/baa83...d65.json
$ git commit -m "My Gaming Token"
$ git push origin HEAD
```

[Open a pull request from your fork.](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork) Once the automated checks pass and a maintainer reviews it, the entry is merged subject to the [Registry Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/Registry_Terms_of_Use.md). It can take a few hours after merge before the API serves the entry.

## Update an entry

Updating reuses the same flow with one critical addition: **increment the `sequenceNumber`** of every field you change, before signing. The signature covers the sequence number, so it must be bumped first or the update is rejected.

1. Start from your existing draft, or recreate it with `token-metadata-creator`.
2. Edit the values you want to change.
3. Increment `sequenceNumber` on each changed field.
4. Re-sign and finalize.
5. Open a new pull request.

A field that has been updated once looks like this in the finalized file (note `sequenceNumber` is now `1`):

```json
"description": {
  "signatures": [
    { "publicKey": "04a72e...", "signature": "50e867..." }
  ],
  "sequenceNumber": 1,
  "value": "My new description."
}
```

## Remove an entry

There is no delete command. To retract an entry you update it, setting `name` and `description` to `VOID`, and title the pull request to make the deletion request explicit. The verification is the same as any update (you sign with the policy key), which is what stops anyone from deleting someone else's entry. After the maintainers verify it, they remove the file.

```console
token-metadata-creator entry <subject> --name "VOID" --description "VOID"
token-metadata-creator entry <subject> -a policy.skey
token-metadata-creator entry <subject> --finalize
```

Increment the `sequenceNumber` on `name` and `description` as with any update.

## Troubleshooting

**Are names and tickers unique?** No. Only `subject` is unique, because it is the on-chain asset ID. Names and tickers are not validated for collisions.

**My asset is on a testnet.** The Cardano Token Registry is for **mainnet** assets only. For preview or preprod assets, register with the [IOHK metadata-registry-testnet](https://github.com/input-output-hk/metadata-registry-testnet), and query the preprod metadata server at `https://preprod.tokens.cardano.org` (see [Token Metadata Server](/docs/developers/curriculum/native-tokens/token-registry/metadata-server)).

**My pull request was closed.** Pull requests that fail the automated checks are closed after a while. Open the **Checks** tab and read the failing test for the reason. A pull request can also be rejected even when checks pass if it breaks the [Registry Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/Registry_Terms_of_Use.md). For questions about a submission, contact tokenregistry@cardanofoundation.org.

**My pull request has not merged yet.** Review is done by humans, oldest first, and well-formed pull requests that pass every check are processed first. Make sure your checks are green (a red mark links to the failing detail) and be patient.
