---
id: audit-your-node
title: Audit your node
sidebar_label: Audit your node
description: "Stake pool guide: Audit your node configuration with a script"
image: ../img/og/og-developer-portal.png
---

In order to check if your node configuration is correct, you can run an audit script that checks SecOps basic settings, and Cardano node compliance (topology, version, key files...)

## What the script does :

The script runs several checks on your Cardano stake pool node. It works on various types of Cardano installation (CNODE Guild Operatos, Coincashew, others...).
Configuration files and services are parsed and analysed by the script :

**Cardano compliance**

- New 9.1.0 Cardano-Node version requirement for Chang hardfork
- Cardano-node latest version verification
- Cardano bootstrap check
- Environment Variables
- Systemd cardano-node file verification and parsing
- Cardano startup script verification and parsing
- Node operation mode (Block Producer ? Relay ?)
- Topology mode (p2p enabled)
- Topology configuration file parsing and compliance checks
- Cardano security checks (hot keys permissions, cold keys detection)
- KES keys rotation alert

**Security and system checks**

- SSHD hardening
- Null passwords check
- Important services running (ufw, fail2ban, ntp server...)
- Firewalling rules extract
- sysctl.conf hardening check

Please note that this script is only intended to help you identify configuration and basic security issues. It does not guarantee that your server is fully protected.

## Pre-Requisites :

1- The script is 100% shell bash. It works on Linux systems.

2- cardano-node up and running. You can setup a Cardano node with :
- Coincashew guide : https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node)
- CNODE (Guild-Operators) : https://cardano-community.github.io/guild-operators/
- Developper Portal guide : https://developers.cardano.org/docs/operate-a-stake-pool/

3- Several bash commands are necessary (tput, date, grep, awk, jq). A check is performed when the script starts.

4- cardano-cli is also used for KES key rotate check.

## How to use :

### Download the script and make it executable :

The script can be found on this [GitHub repository](https://github.com/Kirael12/cardano-node-audit)

You can directly download the repository from your Cardano Nodes :

```bash
wget --show-progress -q https://github.com/Kirael12/cardano-node-audit/releases/latest/download/audit-cardano-node.sh
chmod +x audit-cardano-node.sh
```

### Run the script

The script must be ran with sudo and the -E option, to include your environment variables.

```bash
sudo -E ./audit-cardano-node.sh
```

A selection menu allow you to select your Cardano installation type. You can also choose to perform Security Checks only.
You can then choose to export the results to a file.

## Results

It takes around 20 seconds for the script to complete. You'll get information about your node and will immediately be able to check whether your configuration is good or not, and make appropriate changes.

