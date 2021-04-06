---
id: submit-entry-to-cardano-token-registry
title: Step-By-Step Guide (Linux / Mac OS)
---

## How to Submit Metadata Mappings to the Cardano Token Registry

This article outlines the steps required to create a metadata mapping for a native token, and submit it to the Cardano Token Registry. The Cardano Token Registry currently supports mappings for Native Tokens only.

:::note
Note that this article assumes you have already created a native token with associated policy script, **PolicyID**, private key that you used to sign, etc. If you need to create a native token, please follow the steps of [Minting A New Native Asset](https://developers.cardano.org/en/development-environments/native-tokens/working-with-multi-asset-tokens/) example.
:::


## Mapping Definition

A mapping is the association of  a unique on-chain identifier with a set of  human-readable attributes. As a user, you generate a mapping file (JSON format), containing the mapping itself and the relevant cryptographic setup validating that you are the person who minted that token. That file can then be sent out to the registry for review and inclusion.

## Native Asset Identification

An asset is uniquely identified by an **assetID**, which is a pair of both the **PolicyID** and the asset name.

The **PolicyID** is the unique identifier associated with a minting policy, which determines whether a transaction is allowed to mint or burn a particular token.

The **PolicyID** is computed by applying a hash function to the policy itself (the monetary script). A **PolicyID** can have multiple asset names, so different policies can use the same asset names for different assets. Assets with the same **assetID** are fungible with each other, and are not fungible with assets that have a different **assetID**.

The **AssetName** is an immutable property to distinguish different assets within the same policy.

Adding to the Registry

1. Create your native token
2. Prepare JSON mapping file for submission
3. Creating the Pull Request (PR)

### Creating your Native Token

Native tokens is an accounting system defined as part of the cryptocurrency ledger that enables tokens to be tracked, sent, and received within the Cardano blockchain. After the steps in [Minting A New Native Asset](https://developers.cardano.org/en/development-environments/native-tokens/working-with-multi-asset-tokens/), you will have the policy script, associated private key/s, **PolicyID** and **AssetName**, which are requirements for preparing your JSON mapping file.


### Prepare JSON Mapping File for Submission

Use the [cardano-metadata-submitter](https://github.com/input-output-hk/cardano-metadata-submitter) tool to prepare a JSON mapping file for submission. This can be done manually if you are able to compile the cryptographic primitives yourself, but it is recommended that you use the cardano-metadata-submitter tool.

By creating a mapping file, you effectively create a record that maps human-readable content to the unique token identifier of the tokens you have minted, such as:

* **Name -** Required - What is your token name? Non unique / Doesn’t have to be the same as the **AssetName**.
* **Description -** Required - A short explanation about your token,
* **Ticker -** Optional - Non unique, limit 4 characters,
* **URL -** Optional - Site to be associated with that token,
* **Logo -** Optional  - Associated logo to be picked up by the wallets displaying your token.

#### Example for Creating a Mapping File

To create a new entry, you must first obtain your metadata subject. The subject is defined as the concatenation of the base16-encoded **PolicyID** and base16-encoded **AssetName** of your asset.

This example uses the following native asset:
```
Baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f.myassetname
```

#### 1) Encode your **assetName** with base16:
```
echo -n "myassetname" | xxd -ps
6d7961737365746e616d65
```

#### 2) Concatenate the **PolicyID** with the base16-encoded **assetName** to obtain the 'subject' for your entry:
```
baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65
```

#### 3) Initiate a draft file using the ‘subject’ value:
```
cardano-metadata-submitter --init baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65
```

#### 4) Add the required fields:
```
cardano-metadata-submitter baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
--name "My Gaming Token" \
--description "A currency for the Metaverse." \
--policy policy.json
```

If desired, add optional fields:
```
cardano-metadata-submitter baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 \
  --ticker "TKN" \
  --url "https://finalfantasy.fandom.com/wiki/Gil" \
  --logo "icon.png"
```

#### 5) Sign your file

This is important as the signature will be used and compared with the signature from the asset policy forging script. This step validates the original monetary script and generates signatures for each mapping in the JSON file:
```
cardano-metadata-submitter baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 -a policy.skey
```

#### 6) Finalize your Submission
```
cardano-metadata-submitter baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65 --finalize
```


You’re now ready to submit your mapping file to the [Cardano Token Registry](https://github.com/cardano-foundation/cardano-token-registry).

### Pull Request and Validation Process

The final step is to submit the mapping to the registry. This is done by submitting a Pull Request to the Cardano Foundation’s [Token Registry repository](https://github.com/cardano-foundation/cardano-token-registry).

Please see below for general steps, check the [Wiki](https://github.com/cardano-foundation/cardano-token-registry/wiki) or FAQs or more information.

#### Fork and clone the repo

[Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) your own copy of [cardano-foundation/cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry) to your account.

Then clone a local copy:
```
git clone git@github.com:<your-github-username>/cardano-token-registry
cd cardano-token-registry
```

#### Add the mapping to /mappings/ folder
```
cp /path-to-your-file/baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65.json mappings/
```

#### Commit to the repo
```
git add registry/baa836fef09cb35e180fce4b55ded152907af1e2c840ed5218776f2f6d7961737365746e616d65.json
git commit -m "Your Token Name"
git push submission HEAD
```

#### Make a Pull request

Create a [pull request from your fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork).

:::note
From here you will see your PR show up in Github - Foundation registry operators will review it for well formedness, proper content and to see how it fared with the automated tests - it might be that you are asked to modify some items, that it gets rejected - or even merged! You’ll be notified through Github/email and can add to the comments or see what is happening. The wiki should help guide you through the specific steps - do ask or raise issues in the repository if you get stuck.
:::
