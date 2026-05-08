---
id: deployment
title: Block Producer Deployment
sidebar_label: Deployment
description: Issue the operational certificate and securely transfer credentials from your air-gapped machine to the block producer.
image: ../img/og-developer-portal.png
---

:::info version reference
This document was written in May 2026 with reference to cardano-node and cardano-cli v11
:::

This page covers issuing the operational certificate and securely moving credentials from your air-gapped machine to the block producer. Complete [Key Generation](/docs/operate-a-stake-pool/block-producer/block-producer-keys) first.

:::note Configuration management is out of scope
This page describes manual deployment steps suitable for a single operator managing a small number of nodes. Production operators running larger infrastructures typically manage configuration with dedicated tooling — [cardano-parts](https://github.com/input-output-hk/cardano-parts) (IOG's own Nix-based deployment framework), [sops-nix](https://github.com/Mic92/sops-nix) or [sops](https://github.com/getsops/sops) for secret management, Ansible, Puppet, or similar. Those workflows are out of scope here; consult the relevant project documentation.
:::

## Issue the operational certificate

The op cert is signed on the air-gapped machine using the cold key. You need the KES verification key — where it comes from depends on your setup:

- **Standard setup** — `kes.vkey` was generated in [Key Generation](/docs/operate-a-stake-pool/block-producer/block-producer-keys#step-1--generate-all-keys-on-the-air-gapped-machine)
- **KES agent** — export it from the running agent: see [KES Agent — key generation workflow](/docs/operate-a-stake-pool/block-producer/kes-agent#key-generation-workflow)

On your **air-gapped machine**, using the KES period calculated in [Step 2 of Key Generation](/docs/operate-a-stake-pool/block-producer/block-producer-keys#step-2--determine-the-current-kes-period):

```bash
cardano-cli node issue-op-cert \
  --kes-verification-key-file kes.vkey \
  --cold-signing-key-file cold.skey \
  --operational-certificate-issue-counter cold.counter \
  --kes-period <KES_PERIOD> \
  --out-file node.cert
```

## Securely transfer credentials to the block producer

The following files must be copied from the air-gapped machine to the block producer:

| File | Required without KES agent | Required with KES agent |
|------|:-:|:-:|
| `node.cert` | ✓ | ✓ |
| `vrf.skey` | ✓ | ✓ |
| `kes.skey` | ✓ | — (agent holds it) |

The cold key (`cold.skey`) and counter (`cold.counter`) **stay on the air-gapped machine**.

### Transfer methods

**Encrypted USB stick**

Write the credential files to a USB stick encrypted with LUKS or VeraCrypt. Mount it on the block producer, copy the files, then unmount and wipe the stick.

**magic-wormhole**

[magic-wormhole](https://github.com/magic-wormhole/magic-wormhole) transfers files end-to-end encrypted using a short human-pronounceable code. No shared secrets or SSH keys required. This is suitable for transfers between networked machines (e.g. a build host to the block producer), not from a true air-gapped machine:

```bash
# on the sending machine
wormhole send node.cert vrf.skey kes.skey

# on the block producer
wormhole receive <CODE>
```

**sops / age**

Encrypt the files with [age](https://github.com/FiloSottile/age) before moving them, using the block producer's public key:

```bash
# on the block producer — generate a key pair once and store securely
install -d -m 700 /root/.age
age-keygen -o /root/.age/key.txt
# copy the public key (printed to stdout) to the air-gapped machine

# on the air-gapped machine — encrypt
tar czf - node.cert vrf.skey kes.skey | age -r <BP_PUBLIC_KEY> -o credentials.tar.gz.age

# on the block producer — decrypt
sudo mkdir -p /run/secrets
age -d -i /root/.age/key.txt credentials.tar.gz.age | sudo tar xz -C /run/secrets/
```

[sops](https://github.com/getsops/sops) is a higher-level option that integrates with age, PGP, or cloud KMS and works well if you manage server secrets in a git repository.

## Set file permissions

```bash
sudo chown cardano:cardano /run/secrets/{node.cert,vrf.skey,kes.skey}
sudo chmod 400 /run/secrets/{vrf.skey,kes.skey}
```

## Configure the systemd unit

Add the credential flags to the `ExecStart` line in `/etc/systemd/system/cardano-node.service`:

```ini
ExecStart=/usr/local/bin/cardano-node run \
  --config        /etc/cardano/config.json \
  --topology      /etc/cardano/topology.json \
  --database-path /var/lib/cardano/db \
  --socket-path   /run/cardano/node.socket \
  --host-addr     0.0.0.0 \
  --port          6000 \
  --shelley-kes-key                 /run/secrets/kes.skey \
  --shelley-vrf-key                 /run/secrets/vrf.skey \
  --shelley-operational-certificate /run/secrets/node.cert
```

If using the KES agent, replace `--shelley-kes-key /run/secrets/kes.skey` with `--shelley-kes-agent-socket /run/kes-agent/service.socket`.

Reload and start:

```bash
sudo systemctl daemon-reload
sudo systemctl restart cardano-node
```

## Block producer topology

The block producer must not be reachable from the public internet. Its topology connects only to your own relays, with ledger peer discovery disabled:

```json
{
  "localRoots": [
    {
      "accessPoints": [
        { "address": "YOUR-RELAY-1-IP", "port": 3001 },
        { "address": "YOUR-RELAY-2-IP", "port": 3001 }
      ],
      "advertise": false,
      "hotValency": 2,
      "warmValency": 2,
      "trustable": false
    }
  ],
  "bootstrapPeers": null,
  "publicRoots": [],
  "useLedgerAfterSlot": -1
}
```
