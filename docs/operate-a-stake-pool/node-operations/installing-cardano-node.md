---
id: installing-cardano-node
title: Getting cardano-node and cardano-cli
sidebar_label: Installing cardano-node
sidebar_position: 2
description: This guide shows how to build and install the cardano-node and cardano-cli from the source-code for all major Operating Systems
image: /img/og/og-getstarted-installing-cardano-node.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Getting `cardano-node`

Binaries for the **latest** version of the node may be downloaded from the [cardano-node GitHub Releases](https://github.com/intersectmbo/cardano-node/releases) page.

Alternatively, one can build `cardano-node` from source code locally.

## Building from source

The preferred way of building `cardano-node` is via Nix, but the node is
buildable also using standard Haskell tools after setting up the building
environment.

### Hardware requirements

To set up your platform, you will need:


| Network | CPU Cores | Free RAM | Free storage | OS for Passive Node | OS for Stake pool |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Mainnet | 2 | 24GB | 300GB of free storage (350GB recommended for future growth) | Linux / Windows / MacOS | Linux |
| Testnet | 2 | 4GB | 20GB | Linux / Windows / MacOS | Linux |

### Building via Nix

Having [Git](https://git-scm.com/) and [Nix](https://nixos.org/download/) installed on your system, run the following command to get a built `cardano-node`:

```bash
git clone https://github.com/IntersectMBO/cardano-node
cd cardano-node
git tag | sort -V
git switch -d tags/<TAGGED VERSION>
nix build .#cardano-node
```

Alternatively you can build a node without manually cloning the repository with:

```bash
nix build github:IntersectMBO/cardano-node/<TAGGED VERSION>
```

Consider setting up the IOG binary cache in order to avoid building the universe locally on your machine. See the [IOGX](https://github.com/input-output-hk/iogx/blob/main/doc/nix-setup-guide.md) template documentation for more information.

### Building via `cabal`

To download the source code and build it, you need the following packages and
tools on your system:

* the version control system `git`,
* a C and C++ compiler, either `gcc` or `clang`,
* developer libraries for:
  * the arbitrary precision library `gmp`,
  * the compression library `zlib`,
  * the service manager `systemd`,
  * the TUI library `ncurses`,
  * the key-value database `lmdb`,
  * the cryptographic suite `openssl`,
* `ncurses` compatibility libraries,
* the Haskell build tool `cabal` (`3.10.2.0` or above),
* the GHC Haskell compiler (version `9.6.7` or above).

#### System libraries

<div class="tabsblock">
<Tabs>
  <TabItem value="ubuntu" label="Debian/Ubuntu" default>
    ```bash
    sudo apt-get update -y
    sudo apt-get install automake build-essential pkg-config libffi-dev libgmp-dev libssl-dev libncurses-dev libsystemd-dev zlib1g-dev make g++ tmux git jq wget libtool autoconf liblmdb-dev -y
    ```
  </TabItem>
  <TabItem value="fedora" label="Fedora, RedHat or CentOS">
    ```bash
    sudo yum update -y
    sudo yum install git gcc gcc-c++ tmux gmp-fdevel make tar xz wget zlib-devel libtool autoconf -y
    sudo yum install systemd-devel ncurses-devel ncurses-compat-libs which jq openssl-devel lmdb-devel -y
    ```
  </TabItem>
  <TabItem value="macos" label="MacOS">
     You'll need the following packages and tools on your MacOS system:

     * [Xcode](https://developer.apple.com/xcode) - The Apple Development IDE and SDK/Tools
     * [Xcode Command Line Tools](https://developer.apple.com/xcode/features/), you can install it by typing `xcode-select --install` in the terminal.
     * [Homebrew](https://brew.sh) - The Missing Package Manager for MacOS (or Linux)

     Then using homebrew install the following:

     ```bash
     brew install jq libtool autoconf automake pkg-config openssl
     ```

     You will need to install llvm in case you are using M1

     ```
     brew install llvm@13
     ```
  </TabItem>
  <TabItem value="windows" label="Windows MSYS2">
  :::caution
  These instructions might fall out of date unnoticed given the fact that the user base on Windows is small. If you find something is off, please submit a PR.
  :::

  Git can be installed via [chocolatey](https://community.chocolatey.org/) (via `choco install git`) or [Scoop](https://scoop.sh) (via `scoop install git`).

  :::caution
  Using [Winget](https://winget.run/) will install [Git for Windows](https://gitforwindows.org/) which might be confusing as it works in an environment separate from MSYS2. It is perfectly possible to use this git but things can become confusing.
  :::

  The rest of the libraries will be installed inside MSYS2, for whichever [environment](https://www.msys2.org/docs/environments/) you choose to use. As GHC on Windows switched to `clang` it seems acceptable to recommend using `CLANG64` environment, but others might also work.

  GHCup offers installing a MSYS2 environment local to the Haskell installation, just by running the command on [GHCup's front page](https://www.haskell.org/ghcup/). It also can work with an existing system-wide [MSYS2](https://www.msys2.org/) installation if using the following command (just adding a couple of parameters to the invocation of the bootstrap script. If you installed it somewhere else than `C:\msys64` modify the parameter accordingly):

  ```powershell
  Set-ExecutionPolicy Bypass -Scope Process -Force;[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;
  try { & ([ScriptBlock]::Create((Invoke-WebRequest https://www.haskell.org/ghcup/sh/bootstrap-haskell.ps1 -UseBasicParsing))) -Interactive -DisableCurl -ExistingMsys2Dir C:\msys64 -Msys2Env CLANG64 } catch { Write-Error $_ }
  ```

  Once an MSYS2 environment is installed we should install the following packages via `pacman` (note that you will have to prefix the `pacman` invocation with `ghcup run --mingw-path --` if using the GHCup MSYS2):

  ```console
  pacman -S autoconf autotools ca-certificates mingw-w64-clang-x86_64-toolchain mingw-w64-clang-x86_64-gmp mingw-w64-clang-x86_64-libtool mingw-w64-clang-x86_64-libffi mingw-w64-clang-x86_64-openssl mingw-w64-clang-x86_64-zlib mingw-w64-clang-x86_64-lmdb
  ```

  </TabItem>
</Tabs>

</div>


#### Installing the Haskell environment

The recommended way to install the Haskell tools is via [GHCup](https://www.haskell.org/ghcup/). Its installation script will guide you through the installation, and warn you about packages that you have to make sure are installed in the system (the ones described on the step above). Check [this page](https://www.haskell.org/ghcup/install/) for further explanation on the installation process.

:::caution
On Windows, we discussed how to install GHCup in the step above, depending on how you want to install MSYS2.
:::

Once GHCup is installed, open a new terminal (to get an updated environment) and run:

```bash
ghcup install --set ghc 9.6.7
ghcup install --set cabal 3.12.1.0
```

Alternatively, with `ghcup tui` you can pick the specific versions of the tools that you want to install, in particular you should have installed and set:
- `cabal >= 3.12.1.0`
- `GHC >= 9.6.7`

To check that you will use the GHCup tools (and not any other installation on the system), you can execute

```bash
which cabal
```

and it should return a path of this shape: `/home/<user>/.ghcup/bin/cabal`.

#### Dependencies required to be at specific versions

:::info
Pre-built libraries can be downloaded from iohk-nix releases, following what is done [in the base CI Github Action](https://github.com/input-output-hk/actions/blob/latest/base/action.yml).

In particular for Windows this is probably the easiest method. Note you will need to set these variables in your `.bashrc` or whatever you use to source your shell:

```bash
export PKG_CONFIG_PATH=/mingw64/opt/cardano/lib/pkgconfig:$PKG_CONFIG_PATH
export LD_LIBRARY_PATH=/mingw64/opt/cardano/bin:$LD_LIBRARY_PATH
export PATH=/mingw64/opt/cardano/bin:$PATH
```
:::

Decide which version of Cardano Node you will be installing.
A list of available tags is available at: https://github.com/IntersectMBO/cardano-node/tags.
Set the environment variable to the tag you selected (or use `master` for the latest unstable version):
```bash
CARDANO_NODE_VERSION='10.3.1'
IOHKNIX_VERSION=$(curl https://raw.githubusercontent.com/IntersectMBO/cardano-node/$CARDANO_NODE_VERSION/flake.lock | jq -r '.nodes.iohkNix.locked.rev')
echo "iohk-nix version: $IOHKNIX_VERSION"
```
The variable `IOHKNIX_VERSION` will be used going forward to retrieve the correct versions of `sodium`, `secp256k1` and `blst`.

:::caution
Make sure that `secp256k1`, `sodium` and `blst` versions match flake input version in [`iohkNix`](https://github.com/input-output-hk/iohk-nix/blob/master/flake.nix#L14) for a particular node version used.
:::

##### Installing "sodium"

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

##### Installing `secp256k1`

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

##### Installing `blst`

Find out the correct `blst` version:
```bash
BLST_VERSION=$(curl https://raw.githubusercontent.com/input-output-hk/iohk-nix/$IOHKNIX_VERSION/flake.lock | jq -r '.nodes.blst.original.ref')
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

#### Installing the node
##### Downloading the source code for cardano-node

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
git tag | sort -V
git switch -d tags/<TAGGED VERSION>
```

##### Configuring the build options

We explicitly use the GHC version that we installed earlier.  This avoids defaulting to a system version of GHC that might be different than the one you have installed.

```bash
echo "with-compiler: ghc-9.6.7" >> cabal.project.local
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

:::caution

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

:::

##### Building and installing the node

Build the node and CLI with `cabal`:


```bash
cabal update
cabal build exe:cardano-node
cabal build exe:cardano-cli
```

:::caution
On Windows, should you run into an error like this one when building:
```
ld.lld: error: undefined symbol: __local_stdio_printf_options
>>> referenced by libHSprocess-1.6.25.0-4d1c620770857b639d352d5e988299133f830295.a(runProcess.o):(swprintf_s)
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

You should comment out `extra-lib-dirs` and `extra-include-dirs` in `~/AppData/Roaming/cabal/config`. See [this ticket](https://github.com/haskell/process/issues/340) for an example.
:::

Install the newly built node and CLI commands to the `~/.local/bin` directory:

```bash
mkdir -p ~/.local/bin
cp -p "$(cabal list-bin cardano-node)" ~/.local/bin/
cp -p "$(cabal list-bin cardano-cli)" ~/.local/bin/
```
**Note:** If cardano-cli does not build with 'cabal build all', run 'cabal build cardano-cli'.
**Note:** `~/.local/bin` should be in the `$PATH`.

Note, we avoid using `cabal install` because that method prevents the installed binaries from reporting
the git revision with the `--version` switch.

Check the version that has been installed:

```bash
cardano-node --version
cardano-cli --version
```

Repeat the above process when you need to update to a new version.

**Note:** If serialization of the ledger state changed, snapshots in your `db/ledger` folder will be deleted by the node on startup. Consider backing those up before starting a new version of the node.
