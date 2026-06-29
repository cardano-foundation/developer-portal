---
id: metadata-server
title: Token Metadata Server
sidebar_label: Metadata server
description: Query human-readable metadata for Cardano native assets over the Token Metadata Server REST API (v2), covering both CIP-26 and CIP-68.
image: /img/og/og-developer-portal.png
---

The **Token Metadata Server** is the read API for token metadata. Wallets, explorers, and dApps query it to turn an on-chain asset ID into a human-readable name, ticker, decimals, and logo. API v2 serves both **CIP-26** (the off-chain [registry](/docs/developers/curriculum/native-tokens/metadata-registry)) and **CIP-68** (on-chain datum) metadata through one interface, so a caller does not need to know which standard a token uses.

The API is at `https://tokens.cardano.org` and is subject to the [API Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/API_Terms_of_Use.md). Full OpenAPI specifications are at [tokens.cardano.org/apidocs](https://tokens.cardano.org/apidocs).

## Network environments

The Cardano Foundation runs the server for both mainnet and the preprod testnet, so you can resolve metadata while building and testing before going live.

| Network | Base URL | OpenAPI docs |
| --- | --- | --- |
| Mainnet | `https://tokens.cardano.org` | [`/apidocs`](https://tokens.cardano.org/apidocs) |
| Preprod | `https://preprod.tokens.cardano.org` | [`/apidocs`](https://preprod.tokens.cardano.org/apidocs) |

Both expose the same v2 surface and combine the two standards the same way:

- **CIP-68 (on-chain)** comes directly from the chain of that network. The preprod instance reads CIP-68 reference NFTs minted on preprod.
- **CIP-26 (off-chain)** comes from the [cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry) on mainnet, and from the [IOHK metadata-registry-testnet](https://github.com/input-output-hk/metadata-registry-testnet) on preprod.

To query preprod, use the requests below with the preprod base URL.

## How priority and fallback work

When a token has metadata under both standards, the server returns one value per field and tells you its `source`. By default it prefers **CIP-68** (on-chain) for its decentralization, and falls back to CIP-26 field by field when CIP-68 is missing a value. Override this with the `query_priority` parameter.

## Fetch one subject

`GET /api/v2/subjects/{subject}`

`subject` is the asset identifier: the hex `policyId` concatenated with the hex asset name, for example `577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454`.

Query parameters:

- `property` (optional, repeatable): limit the response to specific fields, such as `name`, `ticker`, `decimals`. Omit to return all.
- `query_priority` (optional, `CIP_26` or `CIP_68`): which standard to prefer. Defaults to CIP-68 with fallback to CIP-26.
- `show_cips_details` (optional, default `false`): include the raw per-standard payloads.

```console
curl https://tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454 | jq .
```

```json
{
  "subject": {
    "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
    "metadata": {
      "name": { "value": "FLDT", "source": "CIP_68" },
      "description": { "value": "The official token of FluidTokens.", "source": "CIP_68" },
      "ticker": { "value": "FLDT", "source": "CIP_68" },
      "decimals": { "value": 6, "source": "CIP_68" },
      "logo": { "value": "https://fluidtokens.com/fldt.png", "source": "CIP_68" },
      "url": { "value": "https://fluidtokens.com", "source": "CIP_26" },
      "version": { "value": 1, "source": "CIP_68" }
    }
  },
  "queryPriority": ["CIP_68", "CIP_26"]
}
```

Here CIP-68 has priority, but because it carries no `url`, that one field is served from CIP-26.

### Fetch specific properties

```console
curl "https://tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?property=name&property=ticker&property=decimals" | jq .
```

### Force a single standard

```console
curl "https://tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?query_priority=CIP_68" | jq .
```

### Inspect the raw per-standard payloads

`show_cips_details=true` returns the original CIP-26 and CIP-68 records side by side, including signatures. Useful when debugging a registration or comparing the two standards' raw formats.

```console
curl "https://tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?show_cips_details=true" | jq .
```

## Fetch many subjects at once

`POST /api/v2/subjects/query` returns metadata for multiple subjects in one call. It takes the same `query_priority` and `show_cips_details` parameters, plus a `subjects` array and an optional `properties` array in the body.

```console
curl -H 'Content-Type: application/json' \
  -d '{"subjects": ["577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454", "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59"], "properties": ["name", "ticker"]}' \
  https://tokens.cardano.org/api/v2/subjects/query | jq .
```

```json
{
  "subjects": [
    {
      "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
      "metadata": {
        "name": { "value": "FLDT", "source": "CIP_68" },
        "ticker": { "value": "FLDT", "source": "CIP_68" }
      }
    },
    {
      "subject": "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59",
      "metadata": {
        "name": { "value": "HOSKY Token", "source": "CIP_26" },
        "ticker": { "value": "HOSKY", "source": "CIP_26" }
      }
    }
  ],
  "queryPriority": ["CIP_68", "CIP_26"]
}
```

The second token has no CIP-68 record, so its fields fall back to CIP-26.

## Next steps

- [Register an entry](/docs/developers/curriculum/native-tokens/token-registry/register-an-entry): publish the CIP-26 metadata this server returns
- [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry): how CIP-25, CIP-26, CIP-27, and CIP-68 fit together
