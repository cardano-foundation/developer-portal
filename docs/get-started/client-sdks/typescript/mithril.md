---
id: mithril
title: Mithril client - TypeScript SDK
sidebar_label: Mithril
description: TypeScript/JavaScript client library for leveraging Mithril multi-signature certification on Cardano via WebAssembly.
image: /img/og/og-developer-portal.png
---

![Mithril](/img/get-started/mithril/mithril-logo.svg)

## Introduction

Mithril is a stake-based multi-signature protocol that provides lightweight certification of Cardano blockchain data. The `@mithril-dev/mithril-client-wasm` package brings Mithril verification to JavaScript and TypeScript applications through WebAssembly, enabling trustless verification of transactions and stake distribution directly in the browser.

## Key features

- Verify Cardano transactions with cryptographic proofs
- Query certified Cardano and Mithril stake distributions

## Installation

```bash
npm install @mithril-dev/mithril-client-wasm
```

## Quick example

Retrieve and verify Mithril stake distribution on the `release-preprod` network:

```javascript
import initMithrilClient, {
  MithrilClient,
} from "@mithril-dev/mithril-client-wasm";

await initMithrilClient();

const client = new MithrilClient(
  "https://aggregator.release-preprod.api.mithril.network/aggregator",
  "5b3132372c37332c3132342c3136312c362c3133372c3133312c3231332c3230372c3131372c3139382c38352c3137362c3139392c3136322c3234312c36382c3132332c3131392c3134352c31332c3233322c3234332c34392c3232392c322c3234392c3230352c3230352c33392c3233352c34345d",
  { unstable: true }
);

const distributions = await client.list_mithril_stake_distributions();
const latest = await client.get_mithril_stake_distribution(
  distributions[0].hash
);

const certificate = await client.get_mithril_certificate(
  latest.certificate_hash
);
const verified = await client.verify_certificate_chain(certificate.hash);

const message = await client.compute_mithril_stake_distribution_message(
  latest
);
const isValid = await client.verify_message_match_certificate(
  message,
  verified
);

console.log("Stake distribution verified:", isValid);
```

## Resources

- [GitHub repository](https://github.com/input-output-hk/mithril/tree/main/mithril-client-wasm)
- [NPM package](https://www.npmjs.com/package/@mithril-dev/mithril-client-wasm)
- [API documentation](https://mithril.network/rust-doc/mithril_client_wasm/index.html)
- [Mithril documentation](https://mithril.network/doc/)
- [Full examples](https://github.com/input-output-hk/mithril/tree/main/examples)
