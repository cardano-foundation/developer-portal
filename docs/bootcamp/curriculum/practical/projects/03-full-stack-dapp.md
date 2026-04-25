---
title: Full-Stack Sponsored dApp
description: Build a complete full-stack Cardano application with smart contracts, social login, transaction sponsorship, and optional Hydra Layer 2 integration.
displayed_sidebar: bootcampSidebar
slug: 03-full-stack-dapp
---


# Project #03: Full-Stack Sponsored dApp (Capstone)

**Difficulty:** Expert | **Lessons:** 1–10

Build a complete full-stack Cardano application that combines smart contracts, a web frontend, social login, and transaction sponsorship.

## Choose Your Application

Pick one of the following ideas (or propose your own):
- **Sponsored NFT Marketplace**: Users mint and trade NFTs without holding ADA
- **Donation Platform**: Users donate to verified causes with on-chain receipts
- **Ticket System**: Event organizers issue NFT tickets, attendees claim with social login

## Requirements

Regardless of the application chosen, your project must include:

### 1. Smart Contract

At least one Aiken validator deployed to preprod with:
- Full test suite passing via `aiken check`
- Blueprint used for off-chain code generation

### 2. NextJS Frontend

A web application with:
- Wallet-as-a-Service integration (social login via UTXOS or similar provider)
- A clean UI where users can interact with your smart contract
- Transaction status feedback (pending, submitted, confirmed)

### 3. Transaction Sponsorship

A server-side sponsorship flow where:
- Users pay zero fees for at least one transaction type
- API keys and signing keys are kept server-side
- The Blockfrost proxy pattern from Lesson 10 is used

### 4. Hydra Integration (Bonus)

:::info
This section is optional bonus credit.
:::

For extra credit, add a Layer 2 component:
- Use Hydra for a high-frequency interaction (rapid voting, game moves, or batch processing)
- Demonstrate the open, transact, close lifecycle
- Show final settlement on Layer 1

## Skills Demonstrated

- Full Mesh SDK proficiency (Lessons 1–2)
- Smart contract development and testing (Lessons 3–5)
- Blueprint-driven off-chain code (Lesson 6)
- Application-level contract patterns (Lessons 7–8)
- Layer 2 scaling with Hydra (Lesson 9)
- Web3 services and user onboarding (Lesson 10)
