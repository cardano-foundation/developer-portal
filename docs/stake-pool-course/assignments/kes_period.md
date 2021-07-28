---
id: kes_period
title:  KES Periods
sidebar_label:  KES periods
description: "Stake pool course: KES period assignment." 
image: ./img/og-developer-portal.png
---

To create an operational certificate for a block-producing node, you need to create a _KES key pair_.

Here "KES" stands for _**K**ey **E**volving **S**ignature_, which means that after a certain _period_, the key will _evolve_ to a new key and discard its old version. This is useful, because it means that even if an attacker compromises the key and gets access to the signing key, he can only use that to sign blocks _from now on_, but not blocks dating from _earlier periods_, making it impossible for the attacker to rewrite history.

Unfortunately, there is a catch: A KES key can only evolve for a certain number of periods and becomes useless afterwards. This means that before that number of periods has passed, the node operator has to generate a new KES key pair, issue a new operational node certificate with that new key pair and restart the node with the new certificate.

In order to find out how long one period is and for how long a key can evolve, we can look into the _genesis file_. If that file is called `shelley_testnet-genesis.json`, we can type

```
cat shelley_testnet-genesis.json | grep KES

> "slotsPerKESPeriod": 3600,
> "maxKESEvolutions": 120,
```

and we see that in this example, the key will evolve after each period of 3600 slots and that it can evolve 120 times before it needs to be renewed.

Before we can create an operational certificate for our node, we need to figure out the start of the KES validity period, i.e. which KES evolution period we are in. We check the current slot \(assuming our relay node socket file is at `~/cardano-node/relay/db/node.socket`\):

```
export CARDANO_NODE_SOCKET_PATH=~/cardano-node/relay/db/node.socket
cardano-cli shelley query tip --testnet-magic 1097911063

{
    "blockNo": 27470,
    "headerHash": "bd954e753c1131a6cb7ab3a737ca7f78e2477bea93db54511cedefe8899ebed0",
    "slotNo": 656260
}
```

In this example, we are currently in slot 656260, and we know from the genesis file that one period lasts for 3600 slots. So we calculate the current period by

```
expr 656260 / 3600
> 182
```

With this we are able to generate an operational certificate for our stake pool (assuming the same file names as [here](../handbook/generate-stake-pool-keys)):

```
cardano-cli shelley node issue-op-cert \
    --kes-verification-key-file kes.vkey \
    --cold-signing-key-file cold.skey \
    --operational-certificate-issue-counter cold.counter \
    --kes-period 182 \
    --out-file node.cert
```
