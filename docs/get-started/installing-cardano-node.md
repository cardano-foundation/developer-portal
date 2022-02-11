---
id: installing-cardano-node
title: Installing cardano-node and cardano-cli from source
sidebar_label: Installing cardano-node
description: This guide shows how to build and install the cardano-node and cardano-cli from the source-code for all major Operating Systems
image: ./img/og-developer-portal.png
--- 
import HydraBuildList from '@site/src/components/docs/HydraBuildList';

### Overview

This guide will show you how to compile and install the `cardano-node` and `cardano-cli` into your operating system of choice, directly from the source-code. It will enable you to interact with the **Cardano** blockchain, including but not limited to sending/receiving **transactions**, creating **NFTs**, posting transaction **metadata** into the blockchain, minting/burning **native tokens**, creating a **stake pool**, executing **smart contracts**, and so much more!

:::note
If you want to avoid compiling the binaries yourself, you can download the latest versions of `cardano-node` and `cardano-cli` from the links below.

<HydraBuildList
    latest="9116257"
    linux="9116140"
    macos="9116041"
    win64="9115926"/>

The components can be built and run on **Windows** and **MacOS**, but we recommend that stake pool operators use **Linux** in production to take advantage of the associated performance advantages.
:::

### Prerequisites

To set up the components, you will need:

* **Windows**, **MacOS**, or **Linux** for your operating system
* An Intel or AMD x86 processor with **two or more cores, at 1.6GHz or faster** (2GHz or faster for a stake pool or relay)  
* **12GB** of RAM and at least **30GB** of free disk space

:::note
If intending to connect to mainnet instance, the requirements for RAM and storage would increase beyond baselines above.
:::

### Choose your Platform

* [Linux](#linux)
* [MacOS](#macos)
* [Windows](#windows)


## Linux

In this section, we will walk you through the process of downloading, compiling, and installing `cardano-node` and `cardano-cli` into your **Linux-based** operating system. 

#### Installing Operating System dependencies

To download the source code and build it, you need the following packages and tools on your Linux system:

* the version control system `git`,
* the `gcc` C-compiler,
* C++ support for `gcc`,
* developer libraries for the arbitrary precision library `gmp`,
* developer libraries for the compression library `zlib`,
* developer libraries for `systemd`,
* developer libraries for `ncurses`,
* `ncurses` compatibility libraries,
* the Haskell build tool `cabal`,
* the GHC Haskell compiler (version `8.10.7` or above).

In Redhat, Fedora, and Centos:
```bash
sudo yum update -y
sudo yum install git gcc gcc-c++ tmux gmp-devel make tar xz wget zlib-devel libtool autoconf jq -y
sudo yum install systemd-devel ncurses-devel ncurses-compat-libs -y
```

For Debian/Ubuntu, use the following instead:
```bash
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install automake build-essential pkg-config libffi-dev libgmp-dev libssl-dev libtinfo-dev libsystemd-dev zlib1g-dev make g++ tmux git jq wget libncursesw5 libtool autoconf -y
```
If you are using a different flavor of Linux, you will need to use the correct package manager for your platform instead of `yum` or `apt-get`, and the names of the packages you need to install might differ.

#### Installing GHC and Cabal

The fastest way to install **GHC** (Glasgow Haskell Compiler) and **Cabal** (Common Architecture for Building Applications and Libraries) is to use [ghcup](https://www.haskell.org/ghcup).

Use the following command to install `ghcup`
```bash
curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
```
Please follow the instructions and provide the necessary input to the installer.

`Do you want ghcup to automatically add the required PATH variable to "/home/ubuntu/.bashrc"?` - (P or enter)

`Do you want to install haskell-language-server (HLS)?` - (N or enter)

`Do you want to install stack?` - (N or enter)

`Press ENTER to proceed or ctrl-c to abort.` (enter)

Once complete, you should have `ghc` and `cabal` installed to your system.


:::note
`ghcup` will try to detect your shell and ask you to add it to the environment variables. Please restart your shell/terminal after installing `ghcup`
:::

You can check if `ghcup` has been installed correctly by typing `ghcup --version` into the terminal. You should see something similar to the following: 

```
The GHCup Haskell installer, version v0.1.17.4
```

`ghcup` will install the latest stable version of `ghc`. However, as of the time of writing this, [Input-Output](https://iohk.io) recommends using `ghc 8.10.7`. So, we will use `ghcup` to install and switch to the required version. 

```bash
ghcup install ghc 8.10.7
ghcup set ghc 8.10.7
```

`ghcup` will install the latest stable version of `cabal`. However, as of the time of writing this, [Input-Output](https://iohk.io) recommends using `cabal 3.6.2.0`. So, we will use `ghcup` to install and switch to the required version.

```bash
ghcup install cabal 3.6.2.0
ghcup set cabal 3.6.2.0
```


Finally, we check if we have the correct `ghc` and `cabal` versions installed.

Check `ghc` version: 
```bash
ghc --version
```

You should see something like this: 
```
The Glorious Glasgow Haskell Compilation System, version 8.10.7
```

Check `cabal` version: 
```bash
cabal --version
```

You should see something like this: 

```
cabal-install version 3.6.2.0
compiled using version 3.6.2.0 of the Cabal library
```

:::important
Please confirm that the versions you have installed match the recommended versions above. If not, check if you have missed any of the previous steps.
:::

#### Downloading & Compiling

Let's create a working directory to store the source-code and builds for the components.

```bash
mkdir -p $HOME/cardano-src
cd $HOME/cardano-src
```
Next, we will download, compile and install `libsodium`.

```bash
git clone https://github.com/input-output-hk/libsodium
cd libsodium
git checkout 66f017f1
./autogen.sh
./configure
make
sudo make install
```

Then we will add the following environment variables to your shell profile. E.G `$HOME/.zshrc` or `$HOME/.bashrc` depending on what shell application you are using. Add the following to the bottom of your shell profile/config file so that the compiler can be aware that `libsodium` is installed on your system.

```bash
export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH"
```

Once saved, we will then reload your shell profile to use the new variables. We can do that by typing `source $HOME/.bashrc` or `source $HOME/.zshrc` (***depending on the shell application you use***).

Now we are ready to download, compile and install `cardano-node` and `cardano-cli`. But first, we have to make sure we are back at the root of our working directory:

```bash
cd $HOME/cardano-src
```

Download the `cardano-node` repository: 

```bash
git clone https://github.com/input-output-hk/cardano-node.git
cd cardano-node
git fetch --all --recurse-submodules --tags
```
Switch the repository to the latest tagged commit: 

```bash
git checkout $(curl -s https://api.github.com/repos/input-output-hk/cardano-node/releases/latest | jq -r .tag_name)
```

:::important
If upgrading an existing node, please ensure that you have read the [release notes on GitHub](https://github.com/input-output-hk/cardano-node/releases) for any changes.
:::

#### Configuring the build options

We explicitly use the `ghc` version that we installed earlier. This avoids defaulting to a system version of `ghc` that might be newer or older than the one you have installed.

```bash
cabal configure --with-compiler=ghc-8.10.7
```

If you are running non x86/x64 platform (eg. ARM) please install and configure LLVM with:
```bash
sudo apt install llvm-9
sudo apt install clang-9 libnuma-dev
sudo ln -s /usr/bin/llvm-config-9 /usr/bin/llvm-config
sudo ln -s /usr/bin/opt-9 /usr/bin/opt
sudo ln -s /usr/bin/llc-9 /usr/bin/llc
sudo ln -s /usr/bin/clang-9 /usr/bin/clang
```

#### Building and installing the node

We can now build the `Haskell-based` `cardano-node` to produce executable binaries.

```bash
cabal build cardano-node cardano-cli
```

Install the newly built node and CLI commands to the $HOME/.local/bin directory:

```bash
mkdir -p $HOME/.local/bin
cp -p "$(./scripts/bin-path.sh cardano-node)" $HOME/.local/bin/
cp -p "$(./scripts/bin-path.sh cardano-cli)" $HOME/.local/bin/
```

We have to add this line below our shell profile so that the shell/terminal can recognize that `cardano-node` and `cardano-cli` are global commands. (`$HOME/.zshrc` or `$HOME/.bashrc` ***depending on the shell application you use***)

```bash
export PATH="$HOME/.local/bin/:$PATH"
```

Once saved, reload your shell profile by typing `source $HOME/.zshrc` or `source $HOME/.bashrc` (***depending on the shell application you use***).

Check the version that has been installed:
```
cardano-cli --version
cardano-node --version
```

Congratulations, you have successfully installed Cardano components into your Linux system! 🎉🎉🎉

Next, we will talk about how to [run cardano-node](running-cardano.md).

## MacOS

In this section, we will walk you through the process of downloading, compiling, and installing `cardano-node` and `cardano-cli` into your **MacOS-based** operating system. 

#### Installing Operating System dependencies

To download the source code and build it, you need the following packages and tools on your MacOS system:

* [Xcode](https://developer.apple.com/xcode) - The Apple Development IDE and SDK/Tools
* [Xcode Command Line Tools](https://developer.apple.com/xcode/features/), you can install it by typing `xcode-select --install` in the terminal.
* [Homebrew](https://brew.sh) - The Missing Package Manager for MacOS (or Linux)

#### Installing Homebrew packages

For the `cardano-node` and `cardano-cli` components to compile properly, we will need to install some libraries via `brew`: 

```bash
brew install jq
brew install libtool
brew install autoconf
brew install automake
brew install pkg-config
```

#### You will need to install llvm in case you are using M1

```
brew install llvm
```

#### Installing GHC and Cabal

The fastest way to install **GHC** (Glassglow Haskell Compiler) and **Cabal** (Common Architecture for Building Applications and Libraries) is to use [ghcup](https://www.haskell.org/ghcup).

Use the following command to install `ghcup`
```bash
curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
```
Please follow the instructions and provide the necessary input to the installer.

`Do you want ghcup to automatically add the required PATH variable to "/home/ubuntu/.bashrc"?` - (P or enter)

`Do you want to install haskell-language-server (HLS)?` - (N or enter)

`Do you want to install stack?` - (N or enter)

`Press ENTER to proceed or ctrl-c to abort.` (enter)

Once complete, you should have `ghc` and `cabal` installed to your system.


:::note
`ghcup` will try to detect your shell and will ask you to add it to the environment variables. Please restart your shell/terminal after installing `ghcup`
:::

You can check if `ghcup` has been installed properly by typing `ghcup --version` into the terminal. You should see something similar to the following: 

```
The GHCup Haskell installer, version v0.1.17.4
```

`ghcup` will install the latest stable version of `ghc`. However, as of the time writing this, [Input-Output](https://iohk.io) recommends using `ghc 8.10.7`. So, we will use `ghcup` to install and switch to the required version. 

```bash
ghcup install ghc 8.10.7
ghcup set ghc 8.10.7
```

`ghcup` will install the latest stable version of `cabal`. However, as of the time of writing this, [Input-Output](https://iohk.io) recommends using `cabal 3.6.2.0`. So, we will use `ghcup` to install and switch to the required version.

```bash
ghcup install cabal 3.6.2.0
ghcup set cabal 3.6.2.0
```

Finally, we check if we have the correct `ghc` and `cabal` versions installed.

Check `ghc` version: 
```bash
ghc --version
```

You should see something like this: 
```
The Glorious Glasgow Haskell Compilation System, version 8.10.7
```

Check `cabal` version: 
```bash
cabal --version
```

You should see something like this: 

```
cabal-install version 3.6.2.0
compiled using version 3.6.2.0 of the Cabal library
```

:::important
Please confirm that the versions you have installed matches the recommended versions above. If not, check if you have missed any of the previous steps.
:::

#### Downloading & Compiling

Let's create a working directory to store the source-code and builds for the components.

```bash
mkdir -p $HOME/cardano-src
cd $HOME/cardano-src
```
Next, we will download, compile and install `libsodium`.

```bash
git clone https://github.com/input-output-hk/libsodium
cd libsodium
git checkout 66f017f1
./autogen.sh
./configure
make
sudo make install
```

Then we will add the following environment variables to your shell profile. E.G `$HOME/.zshrc` or `$HOME/.bashrc` depending on what shell application you are using. Add the following to the bottom of your shell profile/config file so the compiler can be aware that `libsodium` is installed on your system.

```bash
export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH"
```

If you installed llvm for M1, then you will need to add this too:

```bash
export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
```

:::note
llvm installation path might differs based on your installation, if you used default installation, it should be ok. Please check screen after you installed llvm to see this info, if you forgot or lost it, you can just reinstall llvm and then you will see them again.
:::

Once saved, we will then reload your shell profile to use the new variables. We can do that by typing `source $HOME/.bashrc` or `source $HOME/.zshrc` (***depending on the shell application you use***).

Now we are ready to download, compile and install `cardano-node` and `cardano-cli`. But first, we have to make sure we are back at the root of our working directory:

```bash
cd $HOME/cardano-src
```

Download the `cardano-node` repository: 

```bash
git clone https://github.com/input-output-hk/cardano-node.git
cd cardano-node
git fetch --all --recurse-submodules --tags
```
Switch the repository to the latest tagged commit: 

```bash
git checkout $(curl -s https://api.github.com/repos/input-output-hk/cardano-node/releases/latest | jq -r .tag_name)
```

:::important
If upgrading an existing node, please ensure that you have read the [release notes on GitHub](https://github.com/input-output-hk/cardano-node/releases) for any changes.
:::

##### Configuring the build options

We explicitly use the `ghc` version that we installed earlier. This avoids defaulting to a system version of `ghc` that might be newer or older than the one you have installed.

```bash
cabal configure --with-compiler=ghc-8.10.7
```

#### You will need to run following commands on M1, those commands will set some cabal related options before building

```
echo "package trace-dispatcher" >> cabal.project.local
echo "  ghc-options: -Wwarn" >> cabal.project.local
echo "" >> cabal.project.local
```

#### Building and installing the node
```bash
cabal build all
```

Install the newly built node and CLI to the $HOME/.local/bin directory:

```bash
mkdir -p $HOME/.local/bin
cp -p "$(./scripts/bin-path.sh cardano-node)" $HOME/.local/bin/
cp -p "$(./scripts/bin-path.sh cardano-cli)" $HOME/.local/bin/
```

We have to add this line below our shell profile so that the shell/terminal can recognize that `cardano-node` and `cardano-cli` are global commands. (`$HOME/.zshrc` or `$HOME/.bashrc` ***depending on the shell application you use***)

```bash
export PATH="$HOME/.local/bin/:$PATH"
```

Once saved, reload your shell profile by typing `source $HOME/.zshrc` or `source $HOME/.bashrc` (***depending on the shell application you use***).

Check the version that has been installed:
```
cardano-cli --version
cardano-node --version
```

Congratulations, you have successfully installed Cardano components into your MacOS system! 🎉🎉🎉

Next, we will talk about how to [run cardano-node](running-cardano.md).

## Windows

:::important
Currently, the **Windows** installation guide is still in progress. In the meantime, we recommend using [WSL (Windows Subsystem for Linux)](https://docs.microsoft.com/en-us/windows/wsl/) to get a Linux environment on top of Windows. Once installed, you can use the [Linux](#linux) guide to install and run `cardano-node` within **WSL**.
:::
