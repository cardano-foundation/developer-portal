---
id: metadata-server
title: Token Metadata Server
sidebar_label: Metadata server
description: Query human-readable metadata for Cardano native assets over the Token Metadata Server REST API (v2), covering both CIP-26 and CIP-68.
---

The **Token Metadata Server** is the read API for token metadata. Wallets, explorers, and dApps query it to turn an on-chain asset ID into a human-readable name, ticker, decimals, and logo. API v2 serves both **CIP-26** (the off-chain [registry](/docs/developers/curriculum/native-tokens/metadata-registry)) and **CIP-68** (on-chain datum) metadata through one interface, so a caller does not need to know which standard a token uses.

The API is at `https://tokens.cardano.org` and is subject to the [API Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/API_Terms_of_Use.md). The registry's [own documentation](https://cardano-foundation.github.io/cf-token-metadata-registry/) is the full reference, and each host serves its OpenAPI specification at `/apidocs`.

## Network environments

The Cardano Foundation runs the server for both mainnet and the preprod testnet, so you can resolve metadata while building and testing before going live.

| Network | Base URL | Server version | OpenAPI docs |
| --- | --- | --- | --- |
| Mainnet | `https://tokens.cardano.org` | 1.7.0 | [`/apidocs`](https://tokens.cardano.org/apidocs) |
| Mainnet | `https://v2.tokens.cardano.org` | 2.x | [`/apidocs`](https://v2.tokens.cardano.org/apidocs) |
| Preprod | `https://preprod.tokens.cardano.org` | 2.x | [`/apidocs`](https://preprod.tokens.cardano.org/apidocs) |

All three serve the same `/api/v2` endpoints and combine the two standards the same way:

- **CIP-68 (on-chain)** comes directly from the chain of that network. The preprod instance reads CIP-68 reference NFTs minted on preprod.
- **CIP-26 (off-chain)** comes from the [cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry) on mainnet, and from the [IOHK metadata-registry-testnet](https://github.com/input-output-hk/metadata-registry-testnet) on preprod.

The requests below call the mainnet 2.x host. To query preprod, use them with the preprod base URL.

## Server 2.x migration

The server is moving from version 1.7.0 to 2.x. Both versions serve the `/api/v2` endpoints on this page, and 2.x changes parts of the responses. The older `/metadata` endpoints keep their paths and their response format. Mainnet runs the two versions side by side so that you can test an integration before the switch:

- `https://tokens.cardano.org` stays on 1.7.0 for a grace period and then moves to 2.x. The date is in the note at the top of the [2.0.1 release notes](https://github.com/cardano-foundation/cf-token-metadata-registry/releases/tag/2.0.1).
- `https://v2.tokens.cardano.org` runs 2.x until then.
- Preprod runs 2.x only.

This page documents the 2.x responses. Two changes can break a client written for 1.7.0:

- `name` and `description` can be `null`. Server 1.7.0 answers `404` for a token without a name and a description. Server 2.x returns every indexed token, lists what is wrong with it in `validation_errors`, and sets `metadata.valid` to `true` only when that list is empty. Server 1.7.0 sets `valid` to `true` for any token with a name and a description. `validation=MANDATORY_ONLY` comes closest to the 1.7.0 behavior. It also hides some tokens that 1.7.0 returns, and a rich fungible token (label 444) can still have a `null` description, which CIP-68 allows.
- The CIP-26 logo in the `metadata` block is base64. Server 1.7.0 returns it hex-encoded. A CIP-68 logo is not re-encoded. One that is not a URI is returned as written with a validation error, where 1.7.0 returns `null`.

The release notes describe both changes under Breaking Changes. Until the switch, `https://tokens.cardano.org` also differs from this page in these ways:

- It returns no `type` and no `validation_errors`, adds a `metadata.empty` field, and ignores the `validation` parameter.
- It answers `400` to a `property` or `properties` filter that leaves out `name` or `description`.
- It answers `404` for CIP-68 rich fungible tokens (label 444) and for [programmable tokens](/docs/developers/curriculum/native-tokens/programmable-tokens) that have no CIP-26 or CIP-68 metadata.

If you run the server yourself, follow the [2.0.2 release notes](https://github.com/cardano-foundation/cf-token-metadata-registry/releases/tag/2.0.2). The upgrade from 1.x needs a full resync from an empty database.

## How priority and fallback work

When a token has metadata under both standards, the server returns one value per field and tells you its `source`. By default it prefers **CIP-68** (on-chain) for its decentralization, and falls back to CIP-26 field by field when CIP-68 is missing a value. Override this with the `query_priority` parameter.

## Fetch one subject

`GET /api/v2/subjects/{subject}`

`subject` is the asset identifier: the hex `policyId` concatenated with the hex asset name, for example `577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454`.

Query parameters:

- `property` (optional, repeatable): limit the response to specific fields, such as `name`, `ticker`, `decimals`. Omit to return all.
- `query_priority` (optional, `CIP_26` or `CIP_68`): which standard to prefer. Defaults to CIP-68 with fallback to CIP-26.
- `show_cips_details` (optional, default `false`): include the raw per-standard payloads.
- `validation` (optional, `ALL`, `MANDATORY_ONLY`, or `STRICT`, default `ALL`): which tokens to return. `ALL` returns every indexed token. `MANDATORY_ONLY` answers `404` for a token with an error in a mandatory field, and `STRICT` answers `404` for a token with any error. Under a `property` filter, only errors in the requested fields count.

```console
curl https://v2.tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454 | jq .
```

```json
{
  "subject": {
    "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
    "type": "NATIVE",
    "metadata": {
      "name": { "value": "FLDT", "source": "CIP_68" },
      "description": { "value": "The official token of FluidTokens, a leading DeFi ecosystem fueled by innovation and community backing.", "source": "CIP_68" },
      "ticker": { "value": "FLDT", "source": "CIP_68" },
      "decimals": { "value": 6, "source": "CIP_68" },
      "logo": { "value": "https://fluidtokens.com/fldt.png", "source": "CIP_68" },
      "url": { "value": "https://fluidtokens.com", "source": "CIP_26" },
      "version": { "value": 1, "source": "CIP_68" },
      "valid": true
    },
    "standards": null,
    "validation_errors": []
  },
  "queryPriority": ["CIP_68", "CIP_26"]
}
```

Here CIP-68 has priority, but because it carries no `url`, that one field is served from CIP-26.

`type` is `NATIVE` or, for a [CIP-113 programmable token](/docs/developers/curriculum/native-tokens/programmable-tokens), `PROGRAMMABLE`. A programmable token also carries its script information under `extensions.cip113`. `standards` is `null` unless you set `show_cips_details`.

`validation_errors` lists what the server found wrong with the token's metadata, and `metadata.valid` is `true` only when the list is empty. Under a `property` filter, both cover the requested fields only. Each entry names the `cip`, the `field_name`, its `field_category` (`MANDATORY` or `OPTIONAL`), a `code`, and an `error` message. The registry documents every code under [validation errors](https://cardano-foundation.github.io/cf-token-metadata-registry/concepts/validation-errors/).

### Fetch specific properties

```console
curl "https://v2.tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?property=name&property=ticker&property=decimals" | jq .
```

Fields you did not ask for come back as `null`.

### Force a single standard

```console
curl "https://v2.tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?query_priority=CIP_68" | jq .
```

### Inspect the raw per-standard payloads

`show_cips_details=true` returns the original CIP-26 and CIP-68 records side by side, including signatures. Useful when debugging a registration or comparing the two standards' raw formats.

```console
curl "https://v2.tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?show_cips_details=true" | jq .
```

## Fetch many subjects at once

`POST /api/v2/subjects/query` returns metadata for multiple subjects in one call. It takes the same `query_priority`, `show_cips_details`, and `validation` query parameters. The body holds a `subjects` array and an optional `properties` array. A token that `validation` leaves out is missing from the response.

```console
curl -H 'Content-Type: application/json' \
  -d '{"subjects": ["577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454", "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59"], "properties": ["name", "ticker"]}' \
  https://v2.tokens.cardano.org/api/v2/subjects/query | jq .
```

```json
{
  "subjects": [
    {
      "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
      "type": "NATIVE",
      "metadata": {
        "name": { "value": "FLDT", "source": "CIP_68" },
        "description": null,
        "ticker": { "value": "FLDT", "source": "CIP_68" },
        "decimals": null,
        "logo": null,
        "url": null,
        "version": null,
        "valid": true
      },
      "standards": null,
      "validation_errors": []
    },
    {
      "subject": "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59",
      "type": "NATIVE",
      "metadata": {
        "name": { "value": "HOSKY Token", "source": "CIP_26" },
        "description": null,
        "ticker": { "value": "HOSKY", "source": "CIP_26" },
        "decimals": null,
        "logo": null,
        "url": null,
        "version": null,
        "valid": true
      },
      "standards": null,
      "validation_errors": []
    }
  ],
  "queryPriority": ["CIP_68", "CIP_26"]
}
```

The second token has no CIP-68 record, so its fields fall back to CIP-26.

## Next steps

- [Register an entry](/docs/developers/curriculum/native-tokens/token-registry/register-an-entry): publish the CIP-26 metadata this server returns
- [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry): how CIP-25, CIP-26, CIP-27, and CIP-68 fit together
