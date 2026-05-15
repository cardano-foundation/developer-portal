---
id: installing-cardano-node
title: Installing cardano-node
sidebar_position: 2
description: How to get cardano-node and cardano-cli — pre-built binaries, Docker images, Nix builds, and cabal builds.
image: /img/og/og-getstarted-installing-cardano-node.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info version reference
This document was written in May 2026 for the current stable release **11.0.1**. 
Always check the [releases page](https://github.com/IntersectMBO/cardano-node/releases) for the latest version before installing.
:::


:::tip Cardano Node Course
For a comprehensive video course on the Cardano Node and CLI as an end user, stake pool operator, and governance actor, see the [Cardano Node Course](https://www.youtube.com/playlist?list=PLNEK_Ejlx3x2ut-Pq-hi0NFVsgKB3EddR).
:::

## Hardware requirements

| Network | CPU Cores | Free RAM | Free storage |
| :---: | :---: | :---: | :---: |
| Mainnet | 2 | 24GB | 300GB minimum (500GB+ recommended — chain grows over time) |
| Testnet | 2 | 4GB | 20GB |

Stake pool block producers should run Linux. The node runs on macOS and Windows but those platforms are not used in production.

## Installation

Choose whichever method fits your environment. For block producers, building from source lets you verify the binary matches the code.

---

<details>
<summary><strong>Release binaries</strong> — quickest, no build required</summary>

Each [GitHub release](https://github.com/IntersectMBO/cardano-node/releases) ships statically-linked tarballs for Linux amd64 and arm64, built by the same Nix musl pipeline as the Nix build below.

```bash
VERSION=11.0.1  # check releases page for latest
wget https://github.com/IntersectMBO/cardano-node/releases/download/${VERSION}/cardano-node-${VERSION}-linux.tar.gz
tar -xzf cardano-node-${VERSION}-linux.tar.gz -C ~/.local/
```

The tarball unpacks into `bin/` and `share/` (configuration files for mainnet, preprod, and preview). Ensure `~/.local/bin` is on your `$PATH`.

:::note Security consideration
Pre-built binaries require trusting the build pipeline. For block producers holding hot keys, many operators prefer building from source so they can verify the binary themselves. The Nix build below produces the same static artifacts reproducibly.
:::

</details>

---

<details>
<summary><strong>Docker / GHCR images</strong></summary>

Container images for `cardano-node`, `cardano-tracer`, and `cardano-submit-api` are published to the GitHub Container Registry:

```bash
VERSION=11.0.1  # check releases page for latest
docker pull ghcr.io/intersectmbo/cardano-node:${VERSION}
```

See the [cardano-node packages page](https://github.com/IntersectMBO/cardano-node/pkgs/container/cardano-node) for all available tags.

To build and load your own image from the upstream flake instead of pulling:

```bash
VERSION=11.0.1  # check releases page for latest
# Build the node image (outputs a tarball)
nix build github:IntersectMBO/cardano-node/${VERSION}#dockerImage/node
# Load it into Docker
docker load -i result
```

:::warning Security consideration
Docker images require trusting the build pipeline, the base image, and the container runtime. For block producers holding hot keys, many operators prefer building from source so they can verify the binary themselves — building the image yourself with `nix build` above produces a reproducible image from the same pipeline used for official releases. If you do run a containerised node, do not mount key files or any sensitive host paths into the container.
:::

</details>

---

<details>
<summary><strong>Build with Nix</strong> — recommended for operators who want a verified build</summary>

If you don't have Nix installed, use the [Determinate Systems installer](https://determinate.systems/posts/determinate-nix-installer/) — it enables flakes by default and handles uninstallation cleanly.

**Set up the IOG binary cache before building.** Without it, Nix will compile GHC and all Haskell dependencies from scratch, which can take many hours. Follow the [IOGX Nix setup guide](https://github.com/input-output-hk/iogx/blob/main/doc/nix-setup-guide.md).

Build the statically-linked musl release tarball directly from the upstream flake — no clone needed:

**x86_64 (amd64):**
```bash
VERSION=11.0.1  # check releases page for latest
nix build github:IntersectMBO/cardano-node/${VERSION}#hydraJobs.x86_64-linux.musl.cardano-node-linux
```

**aarch64 (arm64):**
```bash
VERSION=11.0.1  # check releases page for latest
nix build github:IntersectMBO/cardano-node/${VERSION}#hydraJobs.aarch64-linux.musl.cardano-node-linux
```

Replace `11.0.1` with the version you want. `result/` will contain a tarball with the same layout as the release binaries — extract it the same way:

```bash
tar -xzf result/*.tar.gz -C ~/.local/
```

### NixOS deployments

The flake exposes a `nixosModules.cardano-node` output for managing the node declaratively as a systemd service with all configuration in Nix. See [nix/nixos-module.nix](https://github.com/IntersectMBO/cardano-node/blob/master/nix/nixos-module.nix) for the available module options.

</details>

---

<details>
<summary><strong>Build with GHCup / cabal</strong> — for systems without Nix</summary>

Building with cabal requires manually installing several C libraries that Nix would otherwise handle. Use the Nix method unless you have a specific reason not to.

### System libraries

Check the [cardano-node repository](https://github.com/IntersectMBO/cardano-node) for the GHC and cabal versions required by the release you're building. For **11.0.1**: GHC `9.6.7`, cabal `3.12.1.0`.

<div class="tabsblock">
<Tabs>
  <TabItem value="ubuntu" label="Debian/Ubuntu" default>

```bash
sudo apt-get update -y
sudo apt-get install automake build-essential pkg-config libffi-dev libgmp-dev libssl-dev libncurses-dev libsystemd-dev zlib1g-dev make g++ tmux git jq wget libtool autoconf liblmdb-dev libsnappy-dev protobuf-compiler liburing-dev -y
```

  </TabItem>
  <TabItem value="fedora" label="Fedora / RHEL / CentOS">

```bash
sudo yum update -y
sudo yum install git gcc gcc-c++ tmux gmp-devel make tar xz wget zlib-devel libtool autoconf liburing-devel snappy-devel protobuf-compiler systemd-devel ncurses-devel ncurses-compat-libs which jq openssl-devel lmdb-devel -y
```

  </TabItem>
  <TabItem value="macos" label="macOS">

Install [Xcode Command Line Tools](https://developer.apple.com/xcode/features/) if you haven't already:

```bash
xcode-select --install
```

Install [Homebrew](https://brew.sh), then:

```bash
brew install jq libtool autoconf automake pkg-config openssl lmdb snappy protobuf
```

On Apple Silicon, also install LLVM (used by GHC as a backend):

```bash
brew install llvm
```

:::caution macOS OpenSSL location
Homebrew installs OpenSSL in a non-standard location. If you see `setup: Can't find OpenSSL library` when building, add these symlinks:

```bash
sudo mkdir -p /usr/local/opt/openssl
sudo ln -s /opt/homebrew/opt/openssl@3/lib /usr/local/opt/openssl/lib
sudo ln -s /opt/homebrew/opt/openssl@3/include /usr/local/opt/openssl/include
```
:::

  </TabItem>
  <TabItem value="windows" label="Windows MSYS2">

:::caution
Windows instructions may fall out of date. If something is off, please submit a PR.
:::

Install Git via [Chocolatey](https://community.chocolatey.org/) (`choco install git`) or [Scoop](https://scoop.sh) (`scoop install git`). Avoid Winget — it installs Git for Windows which runs in a separate environment from MSYS2 and causes confusion.

GHCup can install an MSYS2 environment automatically. Run this in PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force;[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;
try { & ([ScriptBlock]::Create((Invoke-WebRequest https://www.haskell.org/ghcup/sh/bootstrap-haskell.ps1 -UseBasicParsing))) -Interactive -DisableCurl -ExistingMsys2Dir C:\msys64 -Msys2Env CLANG64 } catch { Write-Error $_ }
```

Then install these packages in MSYS2 (prefix with `ghcup run --mingw-path --` if using GHCup's MSYS2):

```console
pacman -S autoconf autotools ca-certificates mingw-w64-clang-x86_64-toolchain mingw-w64-clang-x86_64-gmp mingw-w64-clang-x86_64-libtool mingw-w64-clang-x86_64-libffi mingw-w64-clang-x86_64-openssl mingw-w64-clang-x86_64-zlib mingw-w64-clang-x86_64-lmdb
```

:::info Pre-built C libraries for Windows
Downloading pre-built `sodium`, `secp256k1`, and `blst` from iohk-nix releases (as done in the [base CI action](https://github.com/input-output-hk/actions/blob/latest/base/action.yml)) is easier than building them yourself on Windows. Set these in your shell profile after downloading:

```bash
export PKG_CONFIG_PATH=/mingw64/opt/cardano/lib/pkgconfig:$PKG_CONFIG_PATH
export LD_LIBRARY_PATH=/mingw64/opt/cardano/bin:$LD_LIBRARY_PATH
export PATH=/mingw64/opt/cardano/bin:$PATH
```
:::

If you hit this linker error during `cabal build`:
```
ld.lld: error: undefined symbol: __local_stdio_printf_options
```
Comment out `extra-lib-dirs` and `extra-include-dirs` in `~/AppData/Roaming/cabal/config`. See [this issue](https://github.com/haskell/process/issues/340).

  </TabItem>
</Tabs>
</div>

### Installing GHCup, GHC, and cabal

Install [GHCup](https://www.haskell.org/ghcup/) using its installer, then install the required toolchain versions:

```bash
ghcup install ghc 9.6.7 --set
ghcup install cabal 3.12.1.0 --set
```

Verify you're using the GHCup-managed tools (not a system installation):

```bash
which cabal  # should return /home/<user>/.ghcup/bin/cabal
```

### C library dependencies

Cardano requires specific versions of `sodium`, `secp256k1`, and `blst`. Determine the correct versions from the node's own lock file:

```bash
CARDANO_NODE_VERSION='11.0.1'
IOHKNIX_VERSION=$(curl -s https://raw.githubusercontent.com/IntersectMBO/cardano-node/$CARDANO_NODE_VERSION/flake.lock | jq -r '.nodes.iohkNix.locked.rev')
```

:::caution
These three libraries must match the versions pinned in `iohkNix` for the specific node release. Wrong versions cause cryptographic failures at runtime.
:::

Create a working directory and build each library:

```bash
mkdir -p ~/src
cd ~/src
```

**sodium** (Cardano uses a custom fork with additional cryptographic functions):

```bash
SODIUM_VERSION=$(curl -s https://raw.githubusercontent.com/input-output-hk/iohk-nix/$IOHKNIX_VERSION/flake.lock | jq -r '.nodes.sodium.original.rev')
git clone https://github.com/intersectmbo/libsodium
cd libsodium && git checkout $SODIUM_VERSION
./autogen.sh && ./configure
make && sudo make install
cd ~/src
```

**secp256k1**:

```bash
SECP256K1_VERSION=$(curl -s https://raw.githubusercontent.com/input-output-hk/iohk-nix/$IOHKNIX_VERSION/flake.lock | jq -r '.nodes.secp256k1.original.ref')
git clone --depth 1 --branch ${SECP256K1_VERSION} https://github.com/bitcoin-core/secp256k1
cd secp256k1
./autogen.sh && ./configure --enable-module-schnorrsig --enable-experimental
make && sudo make install
cd ~/src
```

**blst**:

```bash
BLST_VERSION=$(curl -s https://raw.githubusercontent.com/input-output-hk/iohk-nix/$IOHKNIX_VERSION/flake.lock | jq -r '.nodes.blst.original.ref')
git clone --depth 1 --branch ${BLST_VERSION} https://github.com/supranational/blst
cd blst && ./build.sh
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
sudo cp bindings/blst_aux.h bindings/blst.h bindings/blst.hpp /usr/local/include/
sudo cp libblst.a /usr/local/lib
sudo chmod u=rw,go=r /usr/local/{lib/{libblst.a,pkgconfig/libblst.pc},include/{blst.{h,hpp},blst_aux.h}}
cd ~/src
```

Add the library paths to your shell profile (`~/.bashrc` or `~/.zshrc`) and reload it:

```bash
export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH"
```

:::tip Dynamic linker
On some distributions the node binary links against the right `libsodium.so` but the dynamic linker loads the wrong one at runtime. If you suspect this, check with `pldd` on the running process — if it shows the wrong library path, run `ldconfig`.
:::

### Building the node

```bash
VERSION=11.0.1  # check releases page for latest
cd ~/src
git clone https://github.com/intersectmbo/cardano-node.git
cd cardano-node
git switch -d tags/${VERSION}
```

Pin the GHC version to avoid accidentally using a system-installed GHC:

```bash
echo "with-compiler: ghc-9.6.7" >> cabal.project.local
```

On Apple Silicon, add these options before building:

```bash
echo "package trace-dispatcher" >> cabal.project.local
echo "  ghc-options: -Wwarn" >> cabal.project.local
echo "" >> cabal.project.local
echo "package HsOpenSSL" >> cabal.project.local
echo "  flags: -homebrew-openssl" >> cabal.project.local
echo "" >> cabal.project.local
```

Build:

```bash
cabal update
cabal build exe:cardano-node cardano-cli
```

Copy the built binaries to your `$PATH`:

```bash
mkdir -p ~/.local/bin
cp -p "$(cabal list-bin cardano-node)" ~/.local/bin/
cp -p "$(cabal list-bin cardano-cli)" ~/.local/bin/
```

We copy rather than use `cabal install` because `cabal install` strips the git revision from the binary, breaking `cardano-node --version` output.

Verify:

```bash
cardano-node --version
cardano-cli --version
```

:::note Ledger state snapshots on upgrade
If the ledger serialization format changed between versions, the node will delete snapshots in `db/ledger/` on first startup. Back those up before upgrading if you want to be able to roll back.
:::

</details>
