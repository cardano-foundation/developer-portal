---
id: overview
title: AI agents on Cardano
sidebar_label: Overview
description: Autonomous AI agents that hold a wallet, pay per request over x402, and prove their identity on Cardano, with Masumi as the agent-economy protocol.
---

This section is about **autonomous agents**: AI systems that act on-chain themselves, holding a wallet and sending transactions without a human in the loop. For the agent that writes Cardano code with you, see [Cardano Dev Skills](/docs/developers/curriculum/start-building/ai-assisted-development) instead.

An autonomous agent is software that works toward a goal on its own. Putting one on Cardano means giving it the ability to move value and record decisions on a ledger no single party controls, which is what makes automated trading, treasury management, governance participation, or paid agent-to-agent services possible without a trusted intermediary.

## What an on-chain agent needs

Whatever framework the agent is built in (CrewAI, LangGraph, Agno, or your own), the wallet and signing are ordinary SDK work: it holds keys and builds, signs, and submits transactions with the same mechanics as [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet) and [Transaction building](/docs/developers/curriculum/start-building/transaction-building), driven from code instead of a UI. Paying and getting paid is the x402 standard: a per-request price over plain HTTP, with no account or API key. The agent-economy layer on top of that, identity, escrowed payments, and discovery, is [Masumi](/docs/developers/curriculum/dapps/ai-agents/masumi), and its escrow is native to Cardano's x402 scheme.

[Agentic commerce on Cardano](/x402) puts the whole picture together, with runnable templates. The Masumi page covers the agent-economy layer in depth.

## Chain access over MCP

An agent can also work with your chain state rather than its own. Over the [Model Context Protocol](https://modelcontextprotocol.io), a Cardano MCP server exposes tools the agent calls to read balances and addresses and to draft transactions. The rule that matters: the agent proposes and you sign. A well-designed server hands back an unsigned transaction for your wallet to review through the same [CIP-30](/docs/developers/curriculum/dapps/connect-a-wallet#what-cip-30-gives-you) boundary a dApp uses, and your signing keys never reach the model or the server. Treat a server that can move funds without your approval as a custodial service, and weigh it accordingly. Implementations move quickly, so browse the current ones, and check each one's source and the tools it exposes, in [Builder Tools](/tools).
