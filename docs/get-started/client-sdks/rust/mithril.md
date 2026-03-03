---
id: mithril
title: Mithril client - Rust SDK
sidebar_label: Mithril
description: Rust client library for leveraging Mithril multi-signature certification on Cardano.
image: /img/og/og-developer-portal.png
---

![Mithril](/img/get-started/mithril/mithril-logo.svg)

## Introduction

Mithril is a stake-based multi-signature protocol that provides lightweight certification of Cardano blockchain data. The `mithril-client` Rust crate enables trustless verification of certified data — transactions, stake distributions, and database snapshots — backed by the collective signatures of Cardano stake pool operators.

## Key features

- Download and verify Cardano database snapshots for fast node bootstrap
- Verify Cardano transactions with cryptographic proofs
- Query certified Cardano and Mithril stake distributions

## Installation

```bash
cargo add mithril-client
```

:::tip
Mithril client is asynchronous. You will need a runtime such as [tokio](https://crates.io/crates/tokio).
:::

## Quick example

Verify Cardano transactions on `release-preprod` network:

```rust
use mithril_client::{ClientBuilder, MessageBuilder, MithrilResult};

#[tokio::main]
async fn main() -> MithrilResult<()> {
    let client = ClientBuilder::aggregator(
        "https://aggregator.release-preprod.api.mithril.network/aggregator",
        "5b3132372c37332c3132342c3136312c362c3133372c3133312c3231332c3230372c3131372c3139382c38352c3137362c3139392c3136322c3234312c36382c3132332c3131392c3134352c31332c3233322c3234332c34392c3232392c322c3234392c3230352c3230352c33392c3233352c34345d",
    )
    .build()?;

    let proof = client
        .cardano_transaction()
        .get_proofs(&["f9b5221b3ead45d46c0ecae6bee18a0746c5694d0285281cca1b651bce5f49a5"])
        .await?;
    let verified = proof.verify()?;

    let certificate = client
        .certificate()
        .verify_chain(&proof.certificate_hash)
        .await?;

    let message = MessageBuilder::new()
        .compute_cardano_transactions_proofs_message(&certificate, &verified);
    assert!(certificate.match_message(&message));

    Ok(())
}
```

## Resources

- [GitHub repository](https://github.com/input-output-hk/mithril/tree/main/mithril-client)
- [Crates.io](https://crates.io/crates/mithril-client)
- [Rust API documentation](https://mithril.network/rust-doc/mithril_client/index.html)
- [Mithril documentation](https://mithril.network/doc/)
- [Full examples](https://github.com/input-output-hk/mithril/tree/main/examples)
