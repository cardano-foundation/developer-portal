---
id: ctf
title: Cardano Capture The Flag (CTF)
sidebar_label: Capture the Flag (CTF)
description: Learn smart contract security through hands-on vulnerability exploitation in the Cardano CTF game.
---

## Cardano CTF: Learn Security by Breaking Things

The Cardano Capture The Flag (CTF) is an interactive security game where developers exploit purposely vulnerable smart contracts to learn about common security issues and prevention techniques. The game is completely open-source and designed for developers, auditors, and security researchers.

### What You'll Learn

- **Smart Contract Vulnerabilities**: Hands-on experience with real Cardano security issues
- **Aiken Development**: Read and write smart contracts using Aiken
- **Off-chain integration**: Build the exploit transactions in TypeScript with Lucid Evolution
- **Security Mindset**: Think like an attacker to build more secure contracts

### How It Works

Each level presents a vulnerable smart contract with a sample interaction. Your goal is to:

1. Analyze the contract code for security flaws
2. Develop an exploit to drain funds or break the contract
3. Test locally, then execute on Cardano testnet
4. Learn the vulnerability and prevention techniques

Challenges progress from basic to advanced, covering the most critical smart contract security issues on Cardano.

### Where to start: the Banking Series

If you are new to Cardano security, begin with the **Banking Series**: 14 levels (0 to 13) that grow a deliberately simple bank, deposit and withdrawal, into a real protocol one vulnerability at a time. It is the gentler on-ramp, and each level's fix sets up the next level's flaw, which is exactly how real protocols evolve.

The progression is worth seeing as a whole:

- **Levels 0-1** are pure code smells: missing checks that would be bugs in any language.
- **Levels 2-4** introduce UTxO thinking, where account-based assumptions stop translating.
- **Levels 5-7** use tokens for authentication and teach that a token's security is its minting and movement, not its existence.
- **Levels 8-9** bring [double satisfaction](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/double-satisfaction), including the case where you play both sides yourself.
- **Level 10** is a refactor pitfall: a check that was obviously necessary early on gets lost when a feature is added.
- **Levels 11-13** are off-chain signature "cheques", walking three distinct ways to get signature verification wrong (binding the signer, preventing replay, and signing every security-relevant field).

Once the bank stops surprising you, the **original series** (multi-validator protocols, complex transaction construction, deep UTxO specifics) is the full-complexity challenge. Every vulnerability here maps to the [vulnerability reference](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/overview).

### Get Started

**Repository**: [cardano-ctf](https://github.com/Invariant-0/cardano-ctf) (open-source, GPL-3.0)

1. Clone the repository
2. Follow the setup instructions in the README (Node.js and Yarn, Aiken, and a Blockfrost key for the Preview testnet)
3. Start with the Banking Series level 0 and work your way up, editing the off-chain script to exploit each validator

**Community**: Join the [Discord server](https://discord.com/invite/5XVW2MUdWu) to discuss solutions and get help.

**Hints & Solutions**: Need a nudge in the right direction? Check out the [Cardano CTF Hints and Solutions blog](https://medium.com/@invariant0/cardano-ctf-hints-and-solutions-e3991ce6a944) with spoiler-free hints and detailed solution explanations for all challenges.
