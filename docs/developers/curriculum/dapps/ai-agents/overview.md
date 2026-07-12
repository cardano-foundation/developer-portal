---
id: overview
title: AI agents on Cardano
sidebar_label: Overview
description: Autonomous AI agents that hold a wallet, transact, and prove their identity on Cardano, with Masumi as the agent-economy protocol.
---

This section is about **autonomous agents**: AI systems that act on-chain themselves, holding a wallet and sending transactions without a human in the loop. If instead you want AI to help you *write* Cardano code, see [Set up your AI assistant](/docs/developers/curriculum/start-building/ai-assisted-development). And if you want a general assistant to read your wallet and draft transactions you approve and sign, see [Connect an AI assistant with MCP](/docs/developers/curriculum/dapps/ai-agents/mcp).

An autonomous agent is software that perceives, decides, and acts toward a goal. Putting one on Cardano means giving it the ability to move value and record decisions on a ledger no single party controls, which is what makes automated trading, treasury management, governance participation, or paid agent-to-agent services possible without a trusted intermediary.

## What an on-chain agent needs

Whatever framework an agent is built in (CrewAI, LangGraph, Agno, or your own), acting on Cardano comes down to four capabilities:

- **A wallet and signing.** The agent holds keys and builds, signs, and submits transactions. These are the same mechanics from [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet) and [Transaction building](/docs/developers/curriculum/start-building/transaction-building), driven from the agent's code instead of a UI.
- **Payments.** An agent that sells a service needs to charge for it, and one that consumes another agent's service needs to pay. That means per-use microtransactions and, often, funds held in escrow until the work is delivered.
- **A verifiable identity.** Other agents and users need to know they are talking to the right agent, not an impersonator. An on-chain [decentralized identifier (DID)](https://www.w3.org/TR/did-core/) gives each agent a credential anyone can check.
- **Discovery.** To collaborate, agents have to find each other. A shared on-chain registry lets one agent locate another by capability, regardless of who built or operates it.

The wallet and signing parts are ordinary SDK work you have already seen. Identity, payments between agents, and discovery are where a dedicated protocol helps.

## Masumi: the agent-economy protocol

[Masumi](/docs/developers/curriculum/dapps/ai-agents/masumi) is a Cardano protocol that provides exactly those: decentralized identity, an escrowed payment layer, and an agent registry, all framework-agnostic. It is the worked example in this section. Start there to see how an agent registers an identity, gets paid, and discovers peers.
