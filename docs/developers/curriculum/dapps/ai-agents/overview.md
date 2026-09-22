---
id: overview
title: AI agents on Cardano
sidebar_label: Overview
description: Autonomous AI agents that hold a wallet, pay per request over x402, and prove their identity on Cardano, with Masumi as the agent-economy protocol.
---

This section is about **autonomous agents**: AI systems that act on-chain themselves, holding a wallet and sending transactions without a human in the loop. For the agent that writes Cardano code with you, see [Cardano Dev Skills](/docs/developers/curriculum/start-building/ai-assisted-development) instead.

An autonomous agent is software that works toward a goal on its own. Putting one on Cardano means giving it the ability to move value and record decisions on a ledger no single party controls, which is what makes automated trading, treasury management, governance participation, or paid agent-to-agent services possible without a trusted intermediary.

## What an on-chain agent needs

Whatever framework an agent is built in (CrewAI, LangGraph, Agno, or your own), acting on Cardano comes down to four capabilities:

- **A wallet and signing.** The agent holds keys and builds, signs, and submits transactions. These are the same mechanics from [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet) and [Transaction building](/docs/developers/curriculum/start-building/transaction-building), driven from the agent's code instead of a UI.
- **Payments.** An agent that sells a service needs to charge for it, and one that consumes another agent's service needs to pay. On Cardano this is the x402 standard: the agent pays a per-request price over plain HTTP, with no account or API key. [Agentic commerce on Cardano](/x402) has the full picture and runnable templates.
- **A verifiable identity.** Other agents and users need to know they are talking to the right agent, not an impersonator. An on-chain [decentralized identifier (DID)](https://www.w3.org/TR/did-core/) gives each agent a credential anyone can check.
- **Discovery.** To collaborate, agents have to find each other. A shared on-chain registry lets one agent locate another by capability, regardless of who built or operates it.

The wallet and signing parts are ordinary SDK work you have already seen. Identity, escrowed payments, and discovery are where a dedicated protocol helps.

## Masumi: the agent-economy protocol

[Masumi](/docs/developers/curriculum/dapps/ai-agents/masumi) is a Cardano protocol that provides exactly those: decentralized identity, an escrowed payment layer, and an agent registry, all framework-agnostic. It is the worked example in this section. Start there to see how an agent registers an identity, gets paid, and discovers peers.

## Chain access over MCP

An agent can also work with your chain state rather than its own. Over the [Model Context Protocol](https://modelcontextprotocol.io), a Cardano MCP server exposes tools the agent calls to read balances and addresses and to draft transactions. The rule that matters: the agent proposes and you sign. A well-designed server hands back an unsigned transaction for your wallet to review through the same [CIP-30](/docs/developers/curriculum/dapps/connect-a-wallet#what-cip-30-gives-you) boundary a dApp uses, and your signing keys never reach the model or the server. Treat a server that can move funds without your approval as a custodial service, and weigh it accordingly. Implementations move quickly, so browse the current ones, and check each one's source and the tools it exposes, in [Builder Tools](/tools).
