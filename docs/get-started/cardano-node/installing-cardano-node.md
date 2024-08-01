---
id: installing-cardano-node
title: Installing cardano-node and cardano-cli from source
sidebar_label: Installing cardano-node
sidebar_position: 2
description: This guide shows how to build and install the cardano-node and cardano-cli from the source-code for all major Operating Systems
image: /img/og/og-getstarted-installing-cardano-node.png
---
# Installing the node from source

The **latest** version of the node may be downloaded from the [cardano-node GitHub Releases](https://github.com/intersectmbo/cardano-node/releases) page.

## Prerequisites

To set up your platform, you will need:


| Network | CPU Cores | Free RAM | Free storage | OS for Pasive Node | OS for Stake pool |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Mainnet | 2 | 24GB | 150GB of free storage (250GB recommended for future growth) | Linux / Windows** / MacOS | Linux |
| Testnet | 2 | 4GB | 20GB | Linux / Windows** / MacOS | Linux |

****Note** If you are building on Windows, we recommend using WSL2 under Windows 10 as this provides a development and execution environment that is very similar to Ubuntu.


## System dependencies installation

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
sudo yum install git gcc gcc-c++ tmux gmp-devel make tar xz wget zlib-devel libtool autoconf -y
sudo yum install systemd-devel ncurses-devel ncurses-compat-libs which jq openssl-devel lmdb-devel -y
```

For Debian/Ubuntu:

```bash
sudo apt-get update -y
sudo apt-get install automake build-essential pkg-config libffi-dev libgmp-dev libssl-dev libtinfo-dev libsystemd-dev zlib1g-dev make g++ tmux git jq wget libncursesw5 libtool autoconf liblmdb-dev -y
```

Possible issue with `pkg-config`:

`pkgconf` 1.9.5 (which is default in `Fedora 39` and `Rawhide`) produces output unreadable by `cabal`, which results in an errors like:

```
conflict: pkg-config package libsodium-any, not found in the pkg-config database
```

despite having `libsodium` installed in the system.

The possible solutions to this problem are:

- to upgrade `pkgconf` to version 2 by building it from source:
  ```
  yum update -y && \
  yum install git diffutils gcc gcc-c++ tmux gmp-devel make tar xz wget zlib-devel libtool autoconf -y && \
  mkdir -p /root/src/ && cd /root/src && \
  curl -O https://distfiles.ariadne.space/pkgconf/pkgconf-2.0.3.tar.xz && \
  tar -xvf pkgconf-2.0.3.tar.xz && \
  cd pkgconf-2.0.3 && \
  ./configure && make && make install && \
  ```

- to use `cabal` version (higher than `3.10.2.0`) that have these changes already integrated:
  - [Try each pkg-config query separatedly](https://github.com/haskell/cabal/pull/9134)
  - [fix pkgconf 1.9 --modversion regression](https://github.com/haskell/cabal/pull/9391)


Optional dependencies that may be required: llvm libnuma-dev

If you are using a different flavor of Linux, you will need to use the correct package manager for your platform instead of `yum` or `apt-get`, and the names of the packages you need to install might differ.

For MacOS:

You'll need the following packages and tools on your MacOS system:

* [Xcode](https://developer.apple.com/xcode) - The Apple Development IDE and SDK/Tools
* [Xcode Command Line Tools](https://developer.apple.com/xcode/features/), you can install it by typing `xcode-select --install` in the terminal.
* [Homebrew](https://brew.sh) - The Missing Package Manager for MacOS (or Linux)

Then using homebrew install the following:

```bash
brew install jq libtool autoconf automake pkg-config openssl
```
### You will need to install llvm in case you are using M1

```
brew install llvm@13
```

## Installing the Haskell environment

The recommended way to install the Haskell tools is via [GHCup](https://www.haskell.org/ghcup/). Its installation script will guide you through the installation, and warn you about packages that you have to make sure are installed in the system (the ones described on the step above). Check [this page](https://www.haskell.org/ghcup/install/) for further explanation on the installation process.

Once GHCup is installed, open a new terminal (to get an updated environment) and run:

```bash
ghcup install ghc 8.10.7
ghcup install cabal 3.8.1.0
ghcup set ghc 8.10.7
ghcup set cabal 3.8.1.0
```

Alternatively, with `ghcup tui` you can pick the specific versions of the tools that you want to install, in particular you should have installed and set:
- `cabal >= 3.8.1.0`
- `GHC >= 8.10.7`

To check that you will use the GHCup tools (and not any other installation on the system), you can execute

```bash
which cabal
```

and it should return a path of this shape: `/home/<user>/.ghcup/bin/cabal`.

## Installing dependencies

Decide which version of Cardano Node you will be installing. 
A list of available tags is available at: https://github.com/IntersectMBO/cardano-node/tags.
Set the environment variable to the tag you selected (or use `master` for the latest unstable version):
```bash
CARDANO_NODE_VERSION='8.7.3'
IOHKNIX_VERSION=$(curl https://raw.githubusercontent.com/IntersectMBO/cardano-node/$CARDANO_NODE_VERSION/flake.lock | jq -r '.nodes.iohkNix.locked.rev')
echo "iohk-nix version: $IOHKNIX_VERSION"
```
The variable `IOHKNIX_VERSION` is used to retrieve the correct versions of `sodium`, `secp256k1` and `blst`.

>[!CAUTION]
>
>Make sure that `secp256k1`, `sodium` and `blst` versions match flake input version in [`iohkNix`](https://github.com/input-output-hk/iohk-nix/blob/master/flake.nix#L14) for a particular node version used.
>

### Installing `sodium`

Cardano uses a custom fork of `sodium` which exposes some internal functions
and adds some other new functions. This fork lives in
[https://github.com/intersectmbo/libsodium](https://github.com/intersectmbo/libsodium).
Users need to install that custom version of `sodium` with the following steps.

Create a working directory for your builds:
```bash
mkdir -p ~/src
cd ~/src
```

Find out the correct `sodium` version for your build:
```bash
SODIUM_VERSION=$(curl https://raw.githubusercontent.com/input-output-hk/iohk-nix/$IOHKNIX_VERSION/flake.lock | jq -r '.nodes.sodium.original.rev')
echo "Using sodium version: $SODIUM_VERSION"
```

Download and install `sodium`:
```bash
: ${SODIUM_VERSION:='dbb48cc'}
git clone https://github.com/intersectmbo/libsodium
cd libsodium
git checkout $SODIUM_VERSION
./autogen.sh
./configure
make
make check
sudo make install
```

Add the following to your `~/.bashrc` file and source it (or re-open the terminal):
```bash
export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH"
```

For some distributions you will also need to configure the dynamic linker.  If
the executable is linked with the right `libsodium.so` file (which you can
check by running `ldd`), the running binary might still use the wrong library.
You can check this by running `pldd`. If the `pldd` shows that the running executable
is using the wrong library, run `ldconfig`.

#### Using the ported `c` code for development
>[!WARNING]
>The ported `c` code should not be used to run the node, and should only be
used for development purposes.

In order to avoid having to install the custom version of libsodium for development
purposes, `cardano-crypto-praos` defines a `cabal` flag that makes use of C code located
[here](https://github.com/input-output-hk/cardano-base/tree/master/cardano-crypto-praos/cbits).

The C code is merely a port of the bits missing in a normal `libsodium`
installation. To enable this code, one has to add the following code in the
`cabal.project.local` file:
```bash
package cardano-crypto-praos
  flags: -external-libsodium-vrf
```

For this to work, `libsodium` has to be in the system. For Ubuntu, this is achieved by:
```bash
sudo apt install libsodium-dev
```

### Installing `secp256k1`


Find out the correct `secp256k1` version:
```bash
SECP256K1_VERSION=$(curl https://raw.githubusercontent.com/input-output-hk/iohk-nix/$IOHKNIX_VERSION/flake.lock | jq -r '.nodes.secp256k1.original.ref')
echo "Using secp256k1 version: ${SECP256K1_VERSION}"
```

Download and install `secp256k1`:
```bash
: ${SECP256K1_VERSION:='v0.3.2'}
git clone --depth 1 --branch ${SECP256K1_VERSION} https://github.com/bitcoin-core/secp256k1
cd secp256k1
./autogen.sh
./configure --enable-module-schnorrsig --enable-experimental
make
make check
sudo make install
```

### Installing `blst`

Find out the correct `blst` version:
```bash
BLST_VERSION=$(curl https://raw.githubusercontent.com/input-output-hk/iohk-nix/master/flake.lock | jq -r '.nodes.blst.original.ref')
echo "Using blst version: ${BLST_VERSION}"
```

Download and install `blst` so that `cardano-base` can pick it up (assuming that `pkg-config` is installed):
```bash
: ${BLST_VERSION:='v0.3.11'}
git clone --depth 1 --branch ${BLST_VERSION} https://github.com/supranational/blst
cd blst
./build.sh
cat > libblst.pc << EOF
prefix=/usr/local
exec_prefix=\${prefix}
libdir=\${exec_prefix}/lib
includedir=\${prefix}/include

Name: libblst
Description: Multilingual BLS12-381 signature library
URL: https://github.com/supranational/blst
Version: ${BLST_VERSION#v}
Cflags: -I\${includedir}
Libs: -L\${libdir} -lblst
EOF
sudo cp libblst.pc /usr/local/lib/pkgconfig/
sudo cp bindings/blst_aux.h bindings/blst.h bindings/blst.hpp  /usr/local/include/
sudo cp libblst.a /usr/local/lib
sudo chmod u=rw,go=r /usr/local/{lib/{libblst.a,pkgconfig/libblst.pc},include/{blst.{h,hpp},blst_aux.h}}
```

## Installing the node
### Downloading the source code for cardano-node

Create a working directory for your builds:
```bash
mkdir -p ~/src
cd ~/src
```

Download the Cardano node sources:
```bash
git clone https://github.com/intersectmbo/cardano-node.git
```

Change the working directory to the downloaded source code folder:
```bash
cd cardano-node
```


Check out the latest version of cardano-node (choose the tag with the highest version number: ``TAGGED-VERSION``):
```bash
git fetch --all --recurse-submodules --tags
git tag | sort -V
git checkout tags/<TAGGED VERSION>
```

### Configuring the build options

We explicitly use the GHC version that we installed earlier.  This avoids defaulting to a system version of GHC that might be different than the one you have installed.

```bash
echo "with-compiler: ghc-8.10.7" >> cabal.project.local
```

You will need to run following commands on M1, those commands will set some cabal related options before building
```bash
echo "package trace-dispatcher" >> cabal.project.local
echo "  ghc-options: -Wwarn" >> cabal.project.local
echo "" >> cabal.project.local

echo "package HsOpenSSL" >> cabal.project.local
echo "  flags: -homebrew-openssl" >> cabal.project.local
echo "" >> cabal.project.local
```

More recent versions of MacOS seems to install openssl in a different location than expected by default. If you have installed openssl via homebrew and encounter the following build error:

```bash
Failed to build HsOpenSSL-0.11.7.2. The failure occurred during the configure
step.
[1 of 1] Compiling Main (...)
Linking .../dist-newstyle/tmp/src-75805/HsOpenSSL-0.11.7.2/dist/setup/setup ...
Configuring HsOpenSSL-0.11.7.2...
setup: Can’t find OpenSSL library
```

You'll most likely need to add relevant symlinks as follows:
```
sudo mkdir -p /usr/local/opt/openssl
sudo ln -s /opt/homebrew/opt/openssl@3/lib /usr/local/opt/openssl/lib
sudo ln -s /opt/homebrew/opt/openssl@3/include /usr/local/opt/openssl/include
```

This is a wart of the `HsOpenSSL` library wrapper, and using classic methods such as setting `LDFLAGS` & `CPPFLAGS`, or using `--extra-include-dirs` and `--extra-lib-dirs` won't work properly.

### Building and installing the node

Build the node and CLI with `cabal`:

```bash
cabal update
cabal build all
cabal build cardano-cli
```

Install the newly built node and CLI commands to the `~/.local/bin` directory:

```bash
mkdir -p ~/.local/bin
cp -p "$(./scripts/bin-path.sh cardano-node)" ~/.local/bin/
cp -p "$(./scripts/bin-path.sh cardano-cli)" ~/.local/bin/
```
**Note:** If cardano-cli does not build with 'cabal build all', run 'cabal build cardano-cli'.
**Note:** `~/.local/bin` should be in the `$PATH`.

Note, we avoid using `cabal install` because that method prevents the installed binaries from reporting
the git revision with the `--version` switch.

Check the version that has been installed:

```bash
cardano-cli --version
```

Repeat the above process when you need to update to a new version.


**Note:** It might be necessary to delete the `db`-folder \(the database-folder\) before running an updated version of the node.