---
id: node-installation-process
title: Cardano Node Installation process (Environment Setup)
sidebar_label: Cardano Node Installation process
description: Cardano Node Installation process (Environment Setup)
image: ../img/og-developer-portal.png
---
The Cardano node is the core component that underpins the Cardano network. Ultimately, a blockchain network is just a collection of interconnected nodes, all working together to validate transactions and blocks by means of consensus. The definition of consensus for any given network varies, but for the Cardano network it’s defined by the [Ouroboros](introduction-to-cardano#understanding-consensus) protocol.

In this section, we will walk you through the process of downloading, compiling, and installing `cardano-node` and `cardano-cli` into your **Linux-based** operating system.

:::note
Refer to the official document [Installing the node from source](https://github.com/input-output-hk/cardano-node-wiki/wiki/install) in case of difficulties.
:::

## Installing Operating System dependencies

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
sudo apt-get install automake build-essential curl pkg-config libffi-dev libgmp-dev libssl-dev libtinfo-dev libsystemd-dev zlib1g-dev make g++ tmux git jq wget libncursesw5 libtool autoconf -y
```
If you are using a different flavor of Linux, you will need to use the correct package manager for your platform instead of `yum` or `apt-get`, and the names of the packages you need to install might differ.

## Installing GHC and Cabal

A popular way to install **GHC** (Glasgow Haskell Compiler) and **Cabal** (Common Architecture for Building Applications and Libraries) is to use [ghcup](https://www.haskell.org/ghcup).

Use the following command to install `ghcup`
```bash
curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
```
Please follow the instructions and provide the necessary input to the installer.

`Do you want ghcup to automatically add the required PATH variable to "/home/ubuntu/.bashrc"?` - (P or enter)

`Do you want to install haskell-language-server (HLS)?` - (N or enter)

`Do you want to enable better integration of stack with GHCup?` - (N or enter)

`Press ENTER to proceed or ctrl-c to abort.` (enter)

Once complete, you should have `ghc` and `cabal` installed to your system.


:::note
`ghcup` will try to detect your shell and ask you to add it to the environment variables. Please restart your shell/terminal after installing `ghcup` or apply them in your current terminal session by typing
:::

```bash
source $HOME/.bashrc
```

You can check if `ghcup` has been installed correctly by typing `ghcup --version` into the terminal. You should see something similar to the following:

```
ghcup --version

The GHCup Haskell installer, version v0.1.18.0
```

`ghcup` will install the latest stable version of `ghc`. However, as of the time of writing this, [Input-Output](https://iohk.io) recommends using `ghc 8.10.7`. So, we will use `ghcup` to install and switch to the required version.

```bash
ghcup install ghc 8.10.7
ghcup set ghc 8.10.7
```

`ghcup` will install the latest stable version of `cabal`. However, as of the time of writing this, [Input-Output](https://iohk.io) recommends using `cabal 3.6.2.0`. So, we will use `ghcup` to install and switch to the required version.

```bash
ghcup install cabal 3.8.1.0
ghcup set cabal 3.8.1.0
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

## Downloading & Compiling

Let's create a working directory to store the source-code and builds for the components.

```bash
mkdir -p $HOME/cardano-src
cd $HOME/cardano-src
```
Next, we will download, compile and install `libsodium`.

```bash
git clone https://github.com/IntersectMBO/libsodium
cd libsodium
git checkout dbb48cc
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

We need to install secp256k1 which is required from `cardano-node` version `1.35.0` onward:

Download and install libsecp256k1:
```bash
cd $HOME/cardano-src
git clone https://github.com/bitcoin-core/secp256k1
cd secp256k1
git checkout ac83be33
./autogen.sh
./configure --enable-module-schnorrsig --enable-experimental
make
make check
sudo make install
sudo ldconfig
```

Now we are ready to download, compile and install `cardano-node` and `cardano-cli`. But first, we have to make sure we are back at the root of our working directory:

```bash
cd $HOME/cardano-src
```

Download the `cardano-node` repository:

```bash
git clone https://github.com/IntersectMBO/cardano-node.git
cd cardano-node
git fetch --all --recurse-submodules --tags
```
Switch the repository to the latest tagged commit:

```bash
git checkout $(curl -s https://api.github.com/repos/IntersectMBO/cardano-node/releases/latest | jq -r .tag_name)
```

:::important
If upgrading an existing node, please ensure that you have read the [release notes on GitHub](https://github.com/IntersectMBO/cardano-node/releases) for any changes.
:::

## Configuring the build options

We explicitly use the `ghc` version that we installed earlier. This avoids defaulting to a system version of `ghc` that might be newer or older than the one you have installed.

```bash
cabal update
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

## Building and installing the node

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

## References
- [Building cardano-node from source with cabal](https://github.com/input-output-hk/cardano-node-wiki/wiki/install)
- [Building cardano-node from source with Nix](https://github.com/input-output-hk/cardano-node-wiki/wiki/building-the-node-using-nix)

