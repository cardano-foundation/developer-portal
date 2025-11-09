---
id: scalus
title: Scalus
sidebar_label: Scalus (Scala)
description: Scalus
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Scalus](https://scalus.org/) is a development platform for building decentralized applications (DApps) on the Cardano blockchain. It provides a unified environment where developers can write both on-chain smart contracts and off-chain logic using Scala 3 - a modern, expressive, and type-safe functional programming language.

## Meet Scalus

- Write Cardano smart contracts in Scala 3 that compile to UPLC
- Maintain fine-grained control over generated on-chain code with [advanced optimisations](https://scalus.org/docs/advanced/macros)
- Build and evaluate transactions off-chain
- Integrate on-chain and off-chain components in your full-stack application
- Test your entire application with unit, integration, and property-based tests
- Debug your solution on a testnet
- Build and deploy production-ready application to mainnet
- Enjoy a modern development experience with excellent IDE support, and the [extensive Scala](https://index.scala-lang.org/) & JVM ecosystems.

Say goodbye to juggling multiple languages, libraries, and tools—meet Scalus, a development platform made for professionals and businesses who want to get things done.

## Getting Started

This guide will help you set up your development environment and get your first Scalus Validator.

### Install Scala on your computer

We recommend using Scala Installer - [Coursier](https://get-coursier.io/docs/cli-overview), that ensures that a JVM and standard Scala tools are installed on your system.

<Tabs
defaultValue="macos-brew"
values={[
{label: 'macOS - Brew', value: 'macos-brew'},
{label: 'macOS', value: 'macos'},
{label: 'Linux', value: 'linux'},
{label: 'Windows', value: 'windows'},
]}>

<TabItem value="macos-brew">

Homebrew based installation:

```sh copy
brew install coursier && coursier setup
```

</TabItem>
<TabItem value="macos">

On the Apple Silicon (M1, M2, …) architecture:

```sh copy
curl -fL https://github.com/VirtusLab/coursier-m1/releases/latest/download/cs-aarch64-apple-darwin.gz | gzip -d > cs && chmod +x cs && (xattr -d com.apple.quarantine cs || true) && ./cs setup
```

Otherwise, on the x86-64 architecture:

```sh copy
curl -fL https://github.com/coursier/coursier/releases/latest/download/cs-x86_64-apple-darwin.gz | gzip -d > cs && chmod +x cs && (xattr -d com.apple.quarantine cs || true) && ./cs setup
```

</TabItem>
<TabItem value="linux">

On the x86-64 architecture:

```sh copy
curl -fL https://github.com/coursier/coursier/releases/latest/download/cs-x86_64-pc-linux.gz | gzip -d > cs && chmod +x cs && ./cs setup
```

Otherwise, on the ARM64 architecture:

```sh copy
curl -fL https://github.com/VirtusLab/coursier-m1/releases/latest/download/cs-aarch64-pc-linux.gz | gzip -d > cs && chmod +x cs && ./cs setup
```

</TabItem>
<TabItem value="windows">Download and execute [the Scala installer for Windows](https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-win32.zip) based on Coursier, and follow the on-screen
instructions.</TabItem>
</Tabs>

Coursier will install Scala compiler, Command line tool: [Scala CLI](https://scala-cli.virtuslab.org/), Build tool: [sbt](https://www.scala-sbt.org/), REPL: [Ammonite](https://ammonite.io/) and Code formatter: [Scalafmt](https://scalameta.org/scalafmt/).

### Get your first Scalus Validator

```sh copy
sbt new scalus3/hello.g8
```

This ran the template scalus3/hello.g8 using [Giter8](https://www.foundweekends.org/giter8/). Let's take a look at what just got generated:

```ansi
validator/
├── HelloCardano.scala        # Simple validator
├── HelloCardano.test.scala   # Simple tests
├── project.scala             # Project configuration
└── README.md
```

### Test

Run unit tests (MUnit, ScalaTest and ScalaCheck):

```sh copy
scala-cli test hello
```

All is good if you see the following output:

```sh
validator.HelloCardanoSpec:
    + Hello Cardano 0.385s
```

## Configure IDE

Setting up a productive development environment will significantly improve your Scala/Scalus development experience.
Scala offers wide range of IDE support, the most popular are IntelliJ and VSCode.

<Tabs
defaultValue="intellij"
values={[
{label: 'IntelliJ', value: 'intellij'},
{label: 'VS Code', value: 'vscode'},
{label: 'Others', value: 'others'},
]}>
<TabItem value="intellij">

  1. Install IntelliJ IDEA (Community or Ultimate edition) from the [JetBrains website](https://www.jetbrains.com/idea/download/)
  2. Install the Scala plugin:
     - Go to **Settings/Preferences → Plugins → Marketplace**
     - Search for "Scala" and install the plugin
     - Restart IntelliJ IDEA when prompted
  {/*(https://www.jetbrains.com/help/idea/discover-intellij-idea-for-scala.html) */}
  3. Open your Scalus project:
     - Select **File → Open** and navigate to your project directory
     - Choose Import as sbt project when prompted
</TabItem>

<TabItem value="vscode">
  1. Install [Visual Studio Code](https://code.visualstudio.com/Download) from the official website.
  2. Install the Metals extension from [the Marketplace](https://marketplace.visualstudio.com/items?itemName=scalameta.metals)
  3. Open your Scalus project folder:
     - Select **File → Open Folder** and navigate to your project directory.
  4. Metals should activate and begin importing the project automatically.
</TabItem>

<TabItem value="others">
Metals is most commonly used with VS Code, but it's also available for Emacs, Vim, Sublime Text, Helix as [documented](https://scalameta.org/metals/docs/#editor-support).
</TabItem>

</Tabs>

```js filename="HelloCardano.scala" copy showLineNumbers
import scalus.*
import scalus.builtin.Data
import scalus.ledger.api.v3.{PubKeyHash, TxInfo, TxOutRef}
import scalus.prelude.*
import scalus.prelude.Option.Some
import scalus.prelude.Prelude.*

/** This validator demonstrates two key validation checks:
* 1. It verifies that the transaction is signed by the owner's public key hash (stored in the datum)
* 2. It confirms that the redeemer contains the exact string "Hello, Cardano!"
* 
* Both conditions must be met for the validator to approve spending the UTxO.
  */

@Compile
object HelloCardano extends Validator:
    override def spend(
        datum: Option[Data],
        redeemer: Data,
        tx: TxInfo,
        sourceTxOutRef: TxOutRef
    ): Unit = 
        val Some(ownerData) = datum: @unchecked
        val owner = ownerData.to[PubKeyHash]
        val signed = tx.signatories.contains(owner)
        require(signed, "Must be signed")
        val saysHello = redeemer.to[String] == "Hello, Cardano!"
        require(saysHello, "Invalid redeemer")
```

## Support

- Further [documentation](https://scalus.org/)
- You can ask questions on Scalus Discord: https://discord.gg/ygwtuBybsy