---
id: 01-gathering-data
title: Gathering Data
sidebar_label: 01 - Gathering Data
description: APIs and endpoints used by the Cardano Ticker - Koios for stake balance, MinSwap for token prices, Cexplorer for NFT floors, plus production alternatives.
---

Before we build the ticker, walk through the APIs it consumes: wallet contents, token prices, NFT floors.

:::warning Educational use only
The endpoints below are for educational use. Some are not officially supported by their providers. For production, use official (mostly paid) APIs or build your own.
:::

## Checking your wallet

You already know several ways to fetch wallet data from earlier in this section:

- [Koios](/docs/developers/curriculum/dapps/iot/read-and-output/01-fetch-wallet-balance) or [Blockfrost](/docs/developers/curriculum/dapps/iot/read-and-output/01-fetch-wallet-balance) - Workshop 02.
- Mesh SDK - [Workshop 03: Build your own API](/docs/developers/curriculum/dapps/iot/input-and-write/02-build-your-own-api).
- On-chain explorers like [CardanoScan](https://cardanoscan.io/), [Cexplorer](https://cexplorer.io/), [Adastat](https://adastat.net/), [pool.pm](https://pool.pm/) - paste your address.
- Wallet extensions - [Yoroi](https://yoroi-wallet.com/), [Eternl](https://eternl.io/), [Vespr](https://vespr.xyz/), [Begin](https://begin.is/).

The next sections add token prices and NFT floors on top.

## Fetching from MinSwap

[MinSwap](https://minswap.org/) is a DEX on Cardano. Its [Aggregator API](https://docs.minswap.org/developer/aggregator-api) has an endpoint that returns every token in a wallet, with prices for the tokens MinSwap trades:

```
https://agg-api.minswap.org/aggregator/wallet?address=[WALLETADDRESS]&amount_in_decimal=true
```

Replace `[WALLETADDRESS]` with your wallet address. With `amount_in_decimal=true`, amounts come back in whole units, ADA instead of lovelace. The response is JSON, shown here with three of its entries:

```json
{
  "wallet": "addr1...",
  "ada": "9.173282",
  "minimum_lovelace": "2.845947",
  "balance": [
    {
      "asset": {
        "token_id": "lovelace",
        "logo": "https://asset-logos.minswap.org/lovelace",
        "ticker": "ADA",
        "is_verified": true,
        "project_name": "Cardano",
        "price_by_ada": 1,
        "decimals": 6
      },
      "amount": "9.173282"
    },
    {
      "asset": {
        "token_id": "3e4be1669f4e0f92f3e6421307ba24e31fc192029268ecb4242a5abb537461726368204d696e657220233030383038"
      },
      "amount": "1"
    },
    {
      "asset": {
        "token_id": "3d77d63dfa6033be98021417e08e3368cc80e67f8d7afa196aaa0b3953746172636820546f6b656e",
        "logo": "https://asset-logos.minswap.org/3d77d63dfa6033be98021417e08e3368cc80e67f8d7afa196aaa0b3953746172636820546f6b656e",
        "ticker": "STRCH",
        "is_verified": true,
        "price_by_ada": 1.3539651837524176e-8,
        "price_by_usd": 2.802707930367504e-9,
        "project_name": "STRCH",
        "decimals": 0
      },
      "amount": "100000000"
    }
  ],
  "amount_in_decimal": true
}
```

Tokens that MinSwap prices carry a `ticker`, `decimals` and `price_by_ada`, and current responses also include `price_by_usd`, though MinSwap's published schema doesn't list it. NFTs come back with only a `token_id` and an `amount` of `"1"`. The first 56 characters of `token_id` are the policy ID, which the NFT floor lookup below needs.

For USD values from the documented fields, fetch the ADA price and multiply it by `price_by_ada`:

```
https://agg-api.minswap.org/aggregator/ada-price?currency=usd
```

```json
{ "currency": "usd", "value": { "change_24h": 0.39, "price": 0.207 } }
```

The wallet endpoint has no 24-hour change per token. MinSwap's [public API](https://docs.minswap.org/developer/minswap-apis) reports `price_change_24h` per asset if you want that figure on the ticker.

## Fetching from JPG.store (no longer)

[JPG.store](https://www.jpg.store/) is an NFT marketplace on Cardano. Unfortunately they've locked down their API since this workshop was written - no public or paid endpoints are available anymore.

## Cexplorer.io for NFT floors

[Cexplorer.io](https://cexplorer.io/) saves the day with a free tier. Sign up, click your wallet address (top right) to reach your profile, click the **API** tab, and create a new project to get an API key.

Cexplorer also ships a Node.js SDK at [github.com/vellum-labs/cexplorer-api](https://github.com/vellum-labs/cexplorer-api/tree/main/packages/cexplorer-api).

We'll use it to fetch floor prices for NFT collections via:

```
https://api-mainnet-stage.cexplorer.io/v1/policy/detail?id=[POLICYID]
```

Replace `[POLICYID]` with the collection's policy ID. Example response:

```json
{
  "license": "private/dev usage only.",
  "code": 200,
  "data": {
    "id": "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a",
    "policy": {
      "mintc": 320782,
      "stats": null,
      "script": {
        "json": {
          "type": "sig",
          "keyHash": "4da965a049dfd15ed1ee19fba6e2974a0b79fc416dd1796a1f97f5e1"
        },
        "type": "timelock"
      },
      "quantity": 310506,
      "last_mint": "2025-12-01T08:58:06",
      "first_mint": "2021-12-14T16:00:24"
    },
    "collection": {
      "url": "adahandle",
      "name": "ADA Handle",
      "stats": {
        "floor": 5000000,
        "owners": 66766,
        "volume": 612934424304312,
        "royalties": {
          "rate": 0.02,
          "address": "addr1qye59j5vquaprdmxf0gs2y3n20necqg3dnzxty23x07u7awkchm0w43pg2uczh4vcvdr59teny2996rq4tmq2umjyqvqlhm7d2"
        }
      }
    }
  },
  "tokens": 4,
  "ex": 0.0174,
  "debug": false
}
```

The ticker uses the collection name, owners, volume, and floor (in lovelace).

:::info API key required
Include your API key in the `api-key` request header. Without it you'll get 401 Unauthorized or empty data. The free tier has rate limits.
:::

## Other APIs

For production tickers, consider a dedicated price API:

- **[Charli3](https://charli3.io/)** - a Cardano oracle / API provider with historical and live token prices, free + paid tiers. [Token API](https://charli3.io/api).

## Next steps
You now have all the data the ticker needs. The next lesson assembles it into a multi-screen TFT display.

## Further Resources

- [MinSwap](https://minswap.org/) - Cardano DEX.
- [Cexplorer.io](https://cexplorer.io/) - explorer + free-tier API.
- [JPG.store](https://www.jpg.store/) - NFT marketplace.
- [Charli3](https://charli3.io/) - oracle / token-price API.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/04-cardano-ticker/gathering-data) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-04](https://github.com/CardanoThings/Workshops/tree/main/Workshop-04).*
