---
id: delegate-to-stake-pool
title: Delegating stake to a stake pool
sidebar_label: Delegate to a stake pool
sidebar_position: 4
description: How to delegate stake to a stake pool.
keywords: [cardano-cli, cli, delegation, delegate, stake, stake addresses, cardano-node, transactions]
---

## Delegating stake to a stake pool

Delegating your stake to a stake pool is the simplest method to engage with the protocol. By delegating your stake, you empower the stake pool to generate blocks on your behalf, which, in turn, accrues rewards for you. Rewards are automatically paid by the protocol at the start of every epoch to all pool members who contributed to block production.  

:::note
In Cardano, delegating to a stake pool doesn't necessitate locking your funds or transferring control over them. Delegation remains non-custodial, ensuring you retain full control of your ada throughout the process.  
:::

### Create a delegation certificate

To delegate your stake to a stake pool, you need to create a **stake delegation certificate**. `cardano-cli` offers a simple way to create one, you'll find the corresponding command under `cardano-cli conway stake-address`:

```shell
cardano-cli conway stake-address
Usage: cardano-cli conway stake-address 
                                          ( key-gen
                                          | key-hash
                                          | build
                                          | registration-certificate
                                          | deregistration-certificate
                                          | stake-delegation-certificate
                                          | stake-and-vote-delegation-certificate
                                          | vote-delegation-certificate
                                          | registration-and-delegation-certificate
                                          | registration-and-vote-delegation-certificate
                                          | registration-stake-and-vote-delegation-certificate
                                          )

  Stake address commands.

```

To produce a delegation certificate, your stake address must already be registered on the chain, as outlined in the documentation on [registering the stake address](./stake-address-registration). Additionally, you need to know the pool ID to which you will delegate.

```shell
cardano-cli conway stake-address stake-delegation-certificate \
--stake-verification-key-file stake.vkey \
--stake-pool-id pool17navl486tuwjg4t95vwtlqslx9225x5lguwuy6ahc58x5dnm9ma \
--out-file delegation.cert
```

This is how it looks like, the 'cborHex' field encodes your stake address and the target stake pool:

```shell
cat delegation.cert
{
    "type": "CertificateShelley",
    "description": "Stake Delegation Certificate",
    "cborHex": "83028200581c521da955ad8f24bdff8d3cb8f5a155c49870037019fcdf20949e7e5e581cf4facfd4fa5f1d245565a31cbf821f3154aa1a9f471dc26bb7c50e6a"
}
```

### Build, sign, and submit the transaction with the certificate

After generating the delegation certificate, you need to submit it to the chain in a transaction. To familiarize yourself with transactions, refer to the [simple transactions](./simple-transactions) documentation. You can use either `build` or `build-raw`; the example below uses `build`.

This type of transaction requires signatures from both `payment.skey` and `stake.skey`, making the transaction slightly larger due to the two signatures. Consequently, it incurs a slightly higher fee. To help the build command accurately calculate transaction fees, you must use the `--witness-override 2` flag:

```
cardano-cli conway transaction build \
--tx-in $(cardano-cli query utxo --address $(< payment.addr) --out-file  /dev/stdout | jq -r 'keys[0]') \
--change-address $(< payment.addr) \
--certificate-file delegation.cert \
--witness-override 2 \
--out-file tx.raw
```

```
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

```
cardano-cli conway transaction submit \
--tx-file tx.signed 
```

For a quick overview of how stake delegation and rewards distribution work at the protocol level, see :


![delegation cycle](/img/cli/delegationcycle.gif).
