---
title: Token-Gated Voting
description: Build a voting system on Cardano where only governance token holders can cast votes, using Aiken smart contracts and the Mesh SDK.
displayed_sidebar: bootcampSidebar
slug: 01-token-gated-voting
---

# Project #01: Token-Gated Voting

**Difficulty:** Intermediate | **Lessons:** 1–6

Build a voting system where only holders of a specific governance token can cast votes on proposals.

## Requirements

### 1. Governance Token Minting Policy

Write an Aiken minting validator that allows a designated admin to mint a fixed supply of governance tokens under a single policy ID.

### 2. Voting Validator

Write an Aiken spending validator that:
- Accepts a vote (yes/no) as the redeemer
- Verifies the transaction includes at least one governance token in the inputs
- Stores the vote tally in the datum (total yes votes, total no votes)
- Prevents double voting by requiring a unique voter signature per proposal

### 3. Contract Tests

Write test cases using `aiken check` covering:
- Successful vote with governance token
- Rejected vote without governance token
- Rejected double vote from the same key

### 4. Off-Chain Code

Using the Mesh SDK:
- Interpret the Plutus blueprint to generate TypeScript types
- Build transactions to create a proposal, cast votes, and read results
- Provide a runnable script that demonstrates the full flow on preprod

## Skills Demonstrated

- Wallet setup and transaction building (Lesson 1)
- Token minting with native/Plutus scripts (Lessons 2–3)
- Aiken validator development (Lesson 3)
- Contract testing with mocktail (Lesson 4)
- Blueprint interpretation and off-chain code (Lesson 6)
