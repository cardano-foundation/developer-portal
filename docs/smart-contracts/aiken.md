---
id: aiken
title: Aiken
sidebar_label: Aiken
description: Modern smart contract platform for Cardano
image: /img/aiken-logo.png
---

**Aiken** is the modern smart contract platform for Cardano, a pure functional programming language that's small, easy to learn, and built for robustness. Writing smart contracts should be easy and safe. With Aiken, you can get started in minutes, not days, and rapidly build confidence that your on-chain code does what's intended.

Trusted by many ecosystem builders, Aiken has become the preferred choice for production smart contract development on Cardano.

## A Language Built for Smart Contracts

Aiken brings strong static typing with inference, first-class functions, custom types, and modules. The language compiles directly to **Untyped Plutus Core (UPLC)**, Cardano's native smart contract execution format, giving you full access to the blockchain's capabilities.

Unlike many other languages adapted for blockchain use, Aiken was designed from the ground up for smart contract development. This focused approach means every feature serves the goal of writing secure, auditable on-chain code.

## Modern Development Experience

The platform provides a **zero-configuration development environment** with one capable tool that handles everything from compilation to testing. You get quick, friendly feedback with helpful error diagnostics that actually make sense, plus Language Server Protocol support for autocompletion and real-time error checking in VS Code, Zed, Vim/Neovim, and Emacs.

The built-in testing framework supports both unit tests and property-based testing. Execution cost evaluation and trace reporting help you optimize your contracts before deployment.

## Understanding the Architecture

A common misconception is that Cardano smart contracts must be written in Haskell. The reality is that Cardano’s virtual machine executes **Untyped Plutus Core (UPLC)**, and Aiken compiles straight to UPLC—just like Plinth or Plutarch. Haskell is just one of several ways to generate UPLC, not a requirement.

**Aiken focuses exclusively on on-chain validator scripts.** These define the logic that validates Cardano transactions. For off-chain components like transaction building, wallet integration, and user interfaces, you'll use other technologies alongside Cardano's ecosystem of libraries and SDKs.

## Getting Started

Install Aiken using `aikup`, the official installer and version manager:

```bash
# npm
npm install -g @aiken-lang/aikup

# Homebrew  
brew install aiken-lang/tap/aikup

# Direct install (Linux/macOS)
curl --proto '=https' --tlsv1.2 -LsSf https://install.aiken-lang.org | sh

# Windows
powershell -c "irm https://windows.aiken-lang.org | iex"
```

## Next Steps

### Learning Platforms

Ready to start building with Aiken?

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

### Resources

Visit **[aiken-lang.org](https://aiken-lang.org)** for the complete language guide, tutorials, and API documentation. The **[GitHub repository](https://github.com/aiken-lang/aiken)** contains examples and an active community of over 200 contributors.

Visit [Danolearn](https://danolearn.com/en/course/cardano-smart-contract-development-with-aiken-language-1366) for an interactive learning experience.

### Examples

Visit [Awesome Aiken](https://github.com/aiken-lang/awesome-aiken#readme) repository to find a curated list of open-source projects using Aiken.
