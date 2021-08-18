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
- [Windows](https://hydra.iohk.io/job/Cardano/cardano-wallet/cardano-wallet-macos64/latest)
  
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

If you have followed the [Installing cardano-node](/docs/get-started/installing-cardano-node) guide, You should have the `~/cardano-src` directory. If not, let's create a working directory to store the source-code and build for `cardano-wallet`.

```bash
mkdir -p ~/cardano-src
cd ~/cardano-src
```

Next we download the `cardano-wallet` source-code: 

```bash
git clone https://github.com/input-output-hk/cardano-wallet.git
cd cardano-wallet
git fetch --all --recurse-submodules --tags
```

Switch the repository to the latest tagged commit: 

```bash
git checkout tags/v2021-05-26
```

:::important
You can check the latest available version / tag by visiting the `cardano-wallet` [Github Release](https://github.com/input-output-hk/cardano-wallet/releases) page. At the time of writing this, the current version is `v2021-05-26`.
:::

#### Configuring the build options

We explicitly use the `ghc` version that we installed earlier. This avoids defaulting to a system version of `ghc` that might be newer or older than the one you have installed.

```bash
cabal configure --with-compiler=ghc-8.10.4 --constraint="random<1.2"
```

#### Building and installing the node

We can now build `cardano-wallet` code to produce executable binaries.

```bash
cabal build all
```
Install the newly built `cardano-wallet` binary to the `~/.local/bin` directory:
<Tabs
  defaultValue="macos"
  values={[
    {label: 'MacOS', value: 'macos' },
    {label: 'Linux', value: 'linux' }
  ]}>
<TabItem value="macos">

###### MacOS
```bash
cp -p "dist-newstyle/build/x86_64-osx/ghc-8.10.4/cardano-wallet-2021.5.26/x/cardano-wallet/build/cardano-wallet/cardano-wallet" ~/.local/bin/
```

</TabItem>

<TabItem value="linux">

###### Linux
```bash
cp -p "dist-newstyle/build/x86_64-linux/ghc-8.10.4/cardano-wallet-2021.5.26/x/cardano-wallet/build/cardano-wallet/cardano-wallet" ~/.local/bin/
```

</TabItem>

</Tabs>


Check the version that has been installed:
```
cardano-wallet version
```

You should see something like this: 

```
2021.5.26 (git revision: 7426ccc17ecffcc112abf5e8382bcb89cb24f771)
```

Congratulations, you have successfully installed `cardano-wallet` into your Linux system! 🎉🎉🎉

## Windows

:::important
Currently, the **Windows** installation guide is still in-progress. In the meantime we recommend using [WSL (Windows Subsystem for Linux)](https://docs.microsoft.com/en-us/windows/wsl/) to get a Linux environment on-top of Windows. Once you have that installed you can use the [Linux](#linux) guide to install and run `cardano-node` within **WSL**.
:::
