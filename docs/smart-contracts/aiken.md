---
id: aiken
title: Aiken
sidebar_label: Aiken
description: The modern smart contract platform for Cardano
image: /img/aiken-logo.png
---
# Aiken

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

## Resources

Visit **[aiken-lang.org](https://aiken-lang.org)** for the complete language guide, tutorials, and API documentation. The **[GitHub repository](https://github.com/aiken-lang/aiken)** contains examples and an active community of over 200 contributors.