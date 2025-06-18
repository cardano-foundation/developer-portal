--- 
id: cardano-token-registry-server
title: Cardano Token Registry Server
sidebar_label: Token Registry Server
description: The Cardano Token Registry provides a means to register either on-chain or off-chain token metadata that can map to on-chain identifiers. 
image: /img/og/og-developer-portal.png 
sidebar_position: 4
--- 

# Cardano Token Metadata Server (API v2)

The Cardano Token Metadata Server provides a robust API for querying metadata associated with **fungible** Cardano native assets, enabling wallets, explorers, and decentralized applications (dApps) to retrieve human-readable information about tokens. With the release of API v2, the server now supports both **CIP-26** (off-chain metadata) and **CIP-68** (on-chain metadata) standards, offering a unified interface for accessing metadata regardless of the standard used by a token.

The API is accessible at `https://tokens.cardano.org` and is subject to the [API Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/API_Terms_of_Use.md). The OpenAPI documentation is available at [https://tokens.cardano.org/apidocs](https://tokens.cardano.org/apidocs), providing detailed specifications for endpoints, parameters, and response formats.

## Key Features of API v2

- **Dual Standard Support**: Retrieves metadata for tokens using CIP-26 (off-chain, stored in the Cardano Token Registry) or CIP-68 (on-chain, stored in datums).
- **Priority Parameter**: Allows developers to specify a preferred metadata standard (`cip26` or `cip68`) when a token implements both, with automatic fallback to the alternative standard if the preferred one is unavailable.
- **RESTful Interface**: Exposes a simple, query-based API for fetching metadata by asset identifiers (policy ID and asset name).
- **Validation and Security**: Ensures metadata integrity through signed submissions (CIP-26) and on-chain validation (CIP-68).
- **Scalability**: Designed to handle high query volumes, supporting ecosystem tools like wallets and marketplaces.

## API Endpoints

The primary endpoint for querying metadata is: `GET /api/v2/subjects/{subject}`

- **subject**: The asset identifier, typically a concatenation of the `policyID` and `assetName` (hex-encoded). For example, `577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454`.

### Query Parameters

- **property** (optional): the list of properties to be returned in the response, if none specified, all properties will be returned. Example: `name`, `ticker`, `decimals`
- **query_priority** (optional, list): Specifies the preferred metadata standard. Accepted values:
  - `CIP_26`: Prioritizes CIP-26 off-chain metadata from the Cardano Token Registry.
  - `CIP_68`: Prioritizes CIP-68 on-chain metadata records.
  - Default: If not specified, the API prioritizes CIP-68 (on-chain) metadata for its decentralization benefits but falls back to CIP-26 if CIP-68 is unavailable.
- **show_cips_details** (optional, default to false): whether all the CIP specific properties should be returned in the response.

### Example Request

To query metadata for an asset with a preference for CIP-68:

`curl https://tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454 | jq .`


**Response**:

```json
{
  "subject": {
    "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
    "metadata": {
      "name": {
        "value": "FLDT",
        "source": "CIP_68"
      },
      "description": {
        "value": "The official token of FluidTokens, a leading DeFi ecosystem fueled by innovation and community backing.",
        "source": "CIP_68"
      },
      "ticker": {
        "value": "FLDT",
        "source": "CIP_68"
      },
      "decimals": {
        "value": 6,
        "source": "CIP_68"
      },
      "logo": {
        "value": "https://fluidtokens.com/fldt.png",
        "source": "CIP_68"
      },
      "url": {
        "value": "https://fluidtokens.com",
        "source": "CIP_26"
      },
      "version": {
        "value": 1,
        "source": "CIP_68"
      }
    }
  },
  "queryPriority": [
    "CIP_68",
    "CIP_26"
  ]
}
```

In this example you can see how, although `CIP_68` has higher priority, the missing `CIP_68` `url` property, was served from the metadata of the `CIP_26` standard.

Some additional examples are:

#### Only fetch specific properties

In this examples we're only requesting three properties to be returned by the api: `name`, `ticker` and `decimals`.

`curl https://tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?property=name&property=ticker&property=decimals | jq .`

**Response**:

```json
{
  "subject": {
    "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
    "metadata": {
      "name": {
        "value": "FLDT",
        "source": "CIP_68"
      },
      "ticker": {
        "value": "FLDT",
        "source": "CIP_68"
      },
      "decimals": {
        "value": 6,
        "source": "CIP_68"
      }
    }
  },
  "queryPriority": [
    "CIP_68",
    "CIP_26"
  ]
}
```

#### Set specific standard priority

In the following request we force only `CIP_68` metadata to be returned.

`curl https://tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?query_priority=CIP_68 | jq .`

**Response**:

```json
{
  "subject": {
    "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
    "metadata": {
      "name": {
        "value": "FLDT",
        "source": "CIP_68"
      },
      "description": {
        "value": "The official token of FluidTokens, a leading DeFi ecosystem fueled by innovation and community backing.",
        "source": "CIP_68"
      },
      "ticker": {
        "value": "FLDT",
        "source": "CIP_68"
      },
      "decimals": {
        "value": 6,
        "source": "CIP_68"
      },
      "logo": {
        "value": "https://fluidtokens.com/fldt.png",
        "source": "CIP_68"
      },
      "version": {
        "value": 1,
        "source": "CIP_68"
      }
    }
  },
  "queryPriority": [
    "CIP_68"
  ]
}
```

#### Request CIP specific payloads

In the following request we ask CIP specific payloads to be returned. This could be useful to dev which want to experiment with the standards original format or want to access raw metadata.

`curl https://tokens.cardano.org/api/v2/subjects/577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454?show_cips_details=true | jq .`

**Response**:

```json
{
  "subject": {
    "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
    "metadata": {
      "name": {
        "value": "FLDT",
        "source": "CIP_68"
      },
      "description": {
        "value": "The official token of FluidTokens, a leading DeFi ecosystem fueled by innovation and community backing.",
        "source": "CIP_68"
      },
      "ticker": {
        "value": "FLDT",
        "source": "CIP_68"
      },
      "decimals": {
        "value": 6,
        "source": "CIP_68"
      },
      "logo": {
        "value": "https://fluidtokens.com/fldt.png",
        "source": "CIP_68"
      },
      "url": {
        "value": "https://fluidtokens.com",
        "source": "CIP_26"
      },
      "version": {
        "value": 1,
        "source": "CIP_68"
      }
    },
    "standards": {
      "cip26": {
        "additionalProperties": {},
        "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
        "name": {
          "signatures": [
            {
              "signature": "7d60c3cf6d4bb1c24524ac6196e578218aea93d06211efbad2a101520de0c80ca918760700abdabdaf7c642c3f77cad84df52805d4cf83867ebebb21e9f2270f",
              "publicKey": "7dd9b482adb784a26182f5c15daaca2f1c3d599f8fc75151cf8e0bb6db337441"
            }
          ],
          "sequenceNumber": 0,
          "value": "FLDT"
        },
        "description": {
          "signatures": [
            {
              "signature": "3651d72a8e6a73807cd98efbecb379164d90a6aef7aee67024fea074daf3fc07854266cf2739d07d022b07178d734cac7aa93214cd9f637d6c22bf5f46070303",
              "publicKey": "7dd9b482adb784a26182f5c15daaca2f1c3d599f8fc75151cf8e0bb6db337441"
            }
          ],
          "sequenceNumber": 0,
          "value": "The official token of FluidTokens, a leading DeFi ecosystem fueled by innovation and community backing."
        },
        "url": {
          "signatures": [
            {
              "signature": "92066554cfabf75ad833f59241c49150ad6306f5b3bfc903db703b9405c7d516a398f7f7c67223e8888af2e8494c235cbd4d61a2d609c6a23f29f7e4a7f31609",
              "publicKey": "7dd9b482adb784a26182f5c15daaca2f1c3d599f8fc75151cf8e0bb6db337441"
            }
          ],
          "sequenceNumber": 0,
          "value": "https://fluidtokens.com"
        },
        "ticker": {
          "signatures": [
            {
              "signature": "02c44481d0f213b279e73c63ba044076543d865cb6e07eee22239d63137e99607cb9f89aafe6e82eb4d4c18f3bc96c2882b65fcca106575aee4570cce2a6a609",
              "publicKey": "7dd9b482adb784a26182f5c15daaca2f1c3d599f8fc75151cf8e0bb6db337441"
            }
          ],
          "sequenceNumber": 0,
          "value": "FLDT"
        },
        "decimals": {
          "signatures": [
            {
              "signature": "29254d4fb82aa268d39c3472ae0e761c38871adb4dfe9b34ea2503c1cd5a4a008ba92d9f02c062d576d7a2ce70d17e514bedc884acd818802ebc8855febdde09",
              "publicKey": "7dd9b482adb784a26182f5c15daaca2f1c3d599f8fc75151cf8e0bb6db337441"
            }
          ],
          "sequenceNumber": 0,
          "value": 6
        },
        "logo": {
          "signatures": [
            {
              "signature": "b8e2546d098e494502247e2862e990805210568ae0a01dc3a62daa2bdba73275956f09e847edc16bf160734f94fdae139ef0b500c0b35d8aacfce0c17d7bb706",
              "publicKey": "7dd9b482adb784a26182f5c15daaca2f1c3d599f8fc75151cf8e0bb6db337441"
            }
          ],
          "sequenceNumber": 0,
          "value": "iVBORw0KGgoAAAANSUhEUgAAAWUA .... truncated .... Cw5BA9AAAAAElFTkSuQmCC"
        }
      },
      "cip68": {
        "decimals": 6,
        "description": "The official token of FluidTokens, a leading DeFi ecosystem fueled by innovation and community backing.",
        "logo": "https://fluidtokens.com/fldt.png",
        "name": "FLDT",
        "ticker": "FLDT",
        "version": 1
      }
    }
  },
  "queryPriority": [
    "CIP_68",
    "CIP_26"
  ]
}
```

## API Endpoints - Bulk fetch

The endpoint for bulk querying metadata is: `POST /api/v2/subjects/query`. It allows to fetch metadata for multiple subjects at once.

### Query Parameters

- **query_priority** (optional, list): Specifies the preferred metadata standard. Accepted values:
  - `CIP_26`: Prioritizes CIP-26 off-chain metadata from the Cardano Token Registry.
  - `CIP_68`: Prioritizes CIP-68 on-chain metadata records.
  - Default: If not specified, the API prioritizes CIP-68 (on-chain) metadata for its decentralization benefits but falls back to CIP-26 if CIP-68 is unavailable.
- **show_cips_details** (optional, default to false): whether all the CIP specific properties should be returned in the response.


### Example Request

This is an example of a bulk call for two tokens, but for only two properties `name` and `ticker` just to keep the response small.

Note how the api automatically fallbacks to `CIP_26` if `CIP_68` standard is missing.

`curl -H 'Content-Type: application/json' -d'{"subjects": ["577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454", "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59"], "properties":["name", "ticker"]}' https://tokens.cardano.org/api/v2/subjects/query | jq .`

**Response**:

```json
{
  "subjects": [
    {
      "subject": "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454",
      "metadata": {
        "name": {
          "value": "FLDT",
          "source": "CIP_68"
        },
        "ticker": {
          "value": "FLDT",
          "source": "CIP_68"
        }
      }
    },
    {
      "subject": "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59",
      "metadata": {
        "name": {
          "value": "HOSKY Token",
          "source": "CIP_26"
        },
        "ticker": {
          "value": "HOSKY",
          "source": "CIP_26"
        }
      }
    }
  ],
  "queryPriority": [
    "CIP_68",
    "CIP_26"
  ]
}
```