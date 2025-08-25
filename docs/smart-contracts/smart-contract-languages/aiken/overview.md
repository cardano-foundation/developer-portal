---
id: overview
title: Aiken
sidebar_label: Aiken Overview
description: Modern smart contract platform for Cardano
image: /img/aiken-logo.png
---

**Aiken** is the modern smart contract platform for Cardano, a pure functional programming language that's small, easy to learn, and built for robustness. Writing smart contracts should be easy and safe. With Aiken, you can get started in minutes, not days, and rapidly build confidence that your on-chain code does what's intended.

Trusted by many ecosystem builders, Aiken has become the preferred choice for production smart contract development on Cardano.

## A Language Built for Smart Contracts

Aiken brings strong static typing with inference, first-class functions, custom types, and modules. The language compiles directly to **Untyped Plutus Core (UPLC)**, Cardano's native smart contract execution format, giving you full access to the blockchain's capabilities.

:::tip Purpose-Built for Smart Contracts
Unlike many other languages adapted for blockchain use, Aiken was designed from the ground up for smart contract development. This focused approach means every feature serves the goal of writing secure, auditable on-chain code.
:::

## Modern Development Experience

The platform provides a **single toolchain with minimal configuration** that handles everything from compilation to testing. You get quick, friendly feedback with helpful error diagnostics that actually make sense, plus Language Server Protocol support for autocompletion and real-time error checking in VS Code, Zed, Vim/Neovim, and Emacs.

The built-in testing framework supports both unit tests and property-based testing. Execution cost evaluation and trace reporting help you optimize your contracts before deployment.

## Understanding the Architecture

:::note Haskell Not Required
A common misconception is that Cardano smart contracts must be written in Haskell. The reality is that Cardano's virtual machine executes **Untyped Plutus Core (UPLC)**, and Aiken compiles straight to UPLC—just like Plinth or Plutarch. Haskell is just one of several ways to generate UPLC, not a requirement.
:::

**Aiken focuses exclusively on on-chain validator scripts.** These define the logic that validates Cardano transactions. For off-chain stuff like building transactions, wallet integration, and UIs, you'll use other tools from the Cardano ecosystem.

## Getting Started

Install Aiken using `aikup`, the official installer and version manager:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'Homebrew', value: 'brew'},
    {label: 'Manual', value: 'manual'},
  ]}>
  <TabItem value="npm">

```bash title="Install via npm"
npm install -g @aiken-lang/aikup
```

  </TabItem>
  <TabItem value="brew">

```bash title="Install via Homebrew"
brew install aiken-lang/tap/aikup
```

  </TabItem>
  <TabItem value="manual">

```bash title="Manual installation"
# Download and run the installer script
curl -sSfL https://install.aiken-lang.org | bash
```

  </TabItem>
</Tabs>

## Next Steps

Visit **[aiken-lang.org](https://aiken-lang.org)** for the complete language guide, tutorials, and API documentation. The **[GitHub repository](https://github.com/aiken-lang/aiken)** contains examples and an active community of over 200 contributors.

- Be part of the journey and join our welcoming community on [TxPipe's Discord](https://discord.com/invite/RgHzxh92WH)
- Try out your smart contracts at [Aiken Playground](https://play.aiken-lang.org/)

### Examples

Visit [Awesome Aiken](https://github.com/aiken-lang/awesome-aiken#readme) repository to find a curated list of open-source projects using Aiken.

### Andamio

Continue with Aiken Project Based Learning that takes you from beginner to advanced Cardano smart contract development concepts.

| Course | Name | YouTube Video |
|--------|------|---------------|
| [**101**](https://app.andamio.io/course/db22e013578fcead6c2fed5446d61891ad31f3cb4955e88d980107e7/101) | Getting Started with Aiken | [Watch Video →](https://www.youtube.com/watch?v=4YRr8rAbFhU) |
| [**102**](https://app.andamio.io/course/db22e013578fcead6c2fed5446d61891ad31f3cb4955e88d980107e7/102) | Writing Your First Smart Contract | [Watch Video →](https://www.youtube.com/watch?v=LUNfi3-ep0I) |
| [**103**](https://app.andamio.io/course/db22e013578fcead6c2fed5446d61891ad31f3cb4955e88d980107e7/103) | Running Tests with Mock Transaction | [Watch Video →](https://www.youtube.com/watch?v=XpvuLxeWIiI) |
| [**201**](https://app.andamio.io/course/db22e013578fcead6c2fed5446d61891ad31f3cb4955e88d980107e7/201) | Writing Smart Contracts with Validation Logic | [Watch Video →](https://www.youtube.com/watch?v=Yi0vIqLV49w) |
| [**202**](https://app.andamio.io/course/db22e013578fcead6c2fed5446d61891ad31f3cb4955e88d980107e7/202) | Writing Smart Contracts with Validation Logic on Inputs | [Watch Video →](https://www.youtube.com/watch?v=SVhl5nJ_g74) |
| [**300**](https://app.andamio.io/course/db22e013578fcead6c2fed5446d61891ad31f3cb4955e88d980107e7/300) | Blueprint - Compile Scripts for DApp | [Watch Video →](https://www.youtube.com/watch?v=I8h2Wjc9CQM) |
| [**301**](https://app.andamio.io/course/db22e013578fcead6c2fed5446d61891ad31f3cb4955e88d980107e7/301) | Architecture for your Decentralized Application | [Watch Video →](https://www.youtube.com/watch?v=I8h2Wjc9CQM) |
| [**302**](https://app.andamio.io/course/db22e013578fcead6c2fed5446d61891ad31f3cb4955e88d980107e7/302) | Bad Contract Examples | [Watch Video →](https://www.youtube.com/watch?v=JgIhzix7rMo) |

### I Can Aiken (Book)

**[I Can Aiken](https://book.io/book/i-can-aiken/)** is an open-source developer’s guide to writing secure, modern blockchain scripts on Cardano using the Aiken language.  
Written by John Greene, the book is designed to be approachable for new developers while still offering depth for advanced readers.  

The book covers essential topics like:

- Fundamentals of Aiken
- Writing secure validator scripts
- Common smart contract patterns
- Vulnerabilities and design pitfalls to avoid
- Practical examples you can reuse and adapt

The project is open source and available in the [Cardano Academy GitHub repository](https://github.com/cardano-foundation/cardano-academy/tree/main/books).  
This makes it easy for the community to contribute improvements and for educators to integrate it into courses and workshops.

- Visit [Danolearn](https://danolearn.com/en/course/cardano-smart-contract-development-with-aiken-language-1366) for an interactive learning experience.

## Validator Types in Aiken

Aiken validators are identified by their function signatures, which determine what type of validator they are and map to ledger purposes defined in the [latest era](https://github.com/IntersectMBO/cardano-ledger/blob/master/eras/conway/impl/cddl-files/conway.cddl):

- `mint` → **Mint** (token creation/destruction)
- `spend` → **Spend** (UTXO consumption)  
- `withdraw` → **Reward** (stake reward withdrawal)
- `publish` → **Cert** (delegation/pools/DRep/committee certificates)
- `vote` → **Vote** (governance voting - Conway era)
- `propose` → **Propose** (governance proposals - Conway era)

## Development Workflow

:::note Development Steps

1. **Write your validator**: Define types and validation logic in `.ak` files
2. **Build**: Run `aiken build` to generate `plutus.json` with compiled scripts
3. **Use off-chain**: Import the compiled scripts in your off-chain application
4. **Parameterize if needed**: Apply parameters to scripts before deployment

:::

## Testing in Aiken

:::tip Testing in Aiken
Aiken provides first-class support for both unit tests and property-based [tests](https://aiken-lang.org/language-tour/tests). Tests run on the same virtual machine as your on-chain code and report CPU/memory costs, making them effective benchmarks. Tests must return `True` to pass.
:::
