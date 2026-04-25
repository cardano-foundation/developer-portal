---
title: Peer-to-Peer Escrow
description: Build an escrow smart contract on Cardano with multi-party signing, time-based disputes, and on-chain state tracking using Aiken and Mesh SDK.
displayed_sidebar: bootcampSidebar
slug: 02-escrow-marketplace
---

# Project #02: Peer-to-Peer Escrow with Dispute Resolution

**Difficulty:** Advanced | **Lessons:** 1–8

Build an escrow smart contract where a buyer locks funds, a seller delivers, and an independent mediator resolves disputes.

## Requirements

### 1. Escrow Validator

Write an Aiken spending validator with three possible outcomes:
- **Release**: Buyer signs to release funds to the seller
- **Refund**: Seller signs to refund funds to the buyer
- **Dispute**: If neither party acts within a configurable timeout period, the mediator can arbitrate and send funds to either party

### 2. Withdraw-Zero Shared Validation

Use the withdraw-zero pattern (Lesson 5) to centralize common checks (valid signatures, timeout logic) in a withdrawal validator, reducing script size across the release, refund, and dispute paths.

### 3. State Tracking

Use an oracle-style datum (inspired by Lesson 8) to track the escrow state on-chain:
- `Created`: funds locked, awaiting delivery
- `Delivered`: seller claims delivery, awaiting buyer confirmation
- `Resolved`: funds released to the appropriate party

### 4. Contract Tests

Write comprehensive tests covering:
- Successful release by buyer after delivery
- Successful refund by seller before delivery
- Timeout-triggered mediator resolution
- Rejected release without buyer signature
- Rejected dispute before timeout expires

### 5. Off-Chain Code

Provide runnable scripts for the full lifecycle:
- Create an escrow (lock funds with datum specifying buyer, seller, mediator, timeout)
- Mark as delivered (seller updates state)
- Release funds (buyer confirms)
- Dispute resolution (mediator acts after timeout)

## Skills Demonstrated

- Transaction building and multi-party signing (Lessons 1–2)
- Aiken validator with complex redeemer logic (Lesson 3)
- Thorough contract testing (Lesson 4)
- Withdraw-zero pattern for shared validation (Lesson 5)
- Blueprint interpretation (Lesson 6)
- Time-based unlock logic (Lesson 7)
- On-chain state management with datums (Lesson 8)
