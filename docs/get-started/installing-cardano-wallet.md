---
id: installing-cardano-wallet
title: Installing cardano-wallet
sidebar_label: Installing cardano-wallet
description: This guide shows how to build and install the cardano-wallet from the source-code for all major Operating Systems
image: ./img/og-developer-portal.png
--- 
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### Overview 

In this guide, we will show you how to compile and install `cardano-wallet` into your operating system of choice, directly from the source-code. This component provides a [CLI (Command Line Interface)](https://en.wikipedia.org/wiki/Command-line_interface) and [Web API](https://en.wikipedia.org/wiki/Web_API) for creating multiple **Cardano** wallets, sending transactions, getting transaction history details, wallet balances and more!

:::note

If you want to avoid compiling the binaries yourself, You can download the latest pre-built binaries of `cardano-wallet` from the links below. 

- [Linux](https://hydra.iohk.io/job/Cardano/cardano-wallet/cardano-wallet-linux64/latest)
- [MacOS](https://hydra.iohk.io/job/Cardano/cardano-wallet/cardano-wallet-macos64/latest)
- [Windows](https://hydra.iohk.io/job/Cardano/cardano-wallet/cardano-wallet-win64/latest)
  
This guide assumes you have installed `cardano-node` and `cardano-cli` into your system. If not you can refer to [Installing cardano-node](/docs/get-started/installing-cardano-node) guide for instructions on how to do that.

:::

:::important

You must connect your `cardano-node` to the `testnet` network and make sure it is fully synchronized. If you are not sure how to do that, It is recommended to read [Running cardano-node](running-cardano.md) guide before proceeding.

:::

### Choose your Platform

* [MacOS / Linux](#macos--linux)
* [Windows](#windows)

## MacOS / Linux

In this section, we will walk you through the process of downloading, compiling and installing `cardano-wallet` into your **Linux / MacOS** based operating system. 

#### Downloading & Compiling

We need to install stack, if we don't have it: 

```bash
curl -sSL https://get.haskellstack.org/ | sh
```

Check the version that has been installed:
```bash
stack --version
```

You should see something like this: 

```bash
Version 2.7.3, Git revision 7927a3aec32e2b2e5e4fb5be76d0d50eddcc197f x86_64 hpack-0.34.4
```

If you have followed the [Installing cardano-node](/docs/get-started/installing-cardano-node) guide, You should have the `$HOME/cardano-src` directory. If not, let's create a working directory to store the source-code and build for `cardano-wallet`.

```bash
mkdir -p $HOME/cardano-src
cd $HOME/cardano-src
```

Next we download the `cardano-wallet` source-code: 

```bash
git clone https://github.com/input-output-hk/cardano-wallet.git 
cd ./cardano-wallet/ 
```

Switch the repository to the latest tagged commit: 

```bash
TAG=$(git describe --tags --abbrev=0) && echo latest tag $TAG 
git checkout $TAG
```

:::important
You can check the latest available version / tag by visiting the `cardano-wallet` [Github Release](https://github.com/input-output-hk/cardano-wallet/releases) page. At the time of writing this, the current version is `v2021-11-11`. You can list all tags also with `git tag -l` command.
:::

#### Building and installing the node

We can now build `cardano-wallet` code to produce executable binaries.

```bash
stack build --test --no-run-tests
```

Install the newly built `cardano-wallet` binary to the `$HOME/.local/bin` directory:

```bash
stack install
```

Check the version that has been installed:

```bash
cardano-wallet version
```

You should see something like this: 

```bash
v2021-11-11 (git revision: dac16ba7e3bf64bf5474497656932fd342c3b720)
```

Congratulations, you have successfully installed `cardano-wallet` into your Linux/MacOS system! 🎉🎉🎉

## Windows

:::important
Currently, the **Windows** installation guide is still in-progress. In the meantime we recommend using [WSL (Windows Subsystem for Linux)](https://docs.microsoft.com/en-us/windows/wsl/) to get a Linux environment on-top of Windows. Once you have that installed you can use the [Linux](#linux) guide to install and run `cardano-node` within **WSL**.
:::
