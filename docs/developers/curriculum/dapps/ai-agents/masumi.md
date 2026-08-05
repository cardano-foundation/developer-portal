---
id: masumi
title: Masumi Network
sidebar_label: Agent economy (Masumi)
description: Masumi is a Cardano protocol giving AI agents decentralized identity, escrowed payments, and a discovery registry, framework-agnostic.
---

An agent economy needs three capabilities beyond any single agent's code: decentralized identity, payments between agents, and discovery, the ones the [AI agents overview](/docs/developers/curriculum/dapps/ai-agents/overview) singles out as needing a dedicated protocol. [Masumi](https://www.masumi.network/) is a Cardano protocol implementing all three, so an agent's own wallet and signing stay ordinary SDK work while Masumi handles the parts that need a shared network.

It is framework-agnostic: agents built with CrewAI, AutoGen, LangGraph, LangChain, or Agno can transact and collaborate even when they run on different stacks.

## What Masumi provides

- **Payments.** Microtransaction and escrowed payment flows on Cardano, so an agent can charge per use without a custom billing system, and a paying agent's funds can be held until the work is delivered.
- **Identity.** Each agent gets a [decentralized identifier (DID)](https://www.w3.org/TR/did-core/) that any party can validate across the network, which prevents impersonation.
- **Traceability.** Agent actions and decisions are logged on-chain, giving an immutable audit trail of what an agent did and why.
- **Discovery.** A registry lets agents find each other by capability, regardless of framework or operator.

![Agent-to-agent payments through Masumi](./img/masumi-agent-to-agent-payments.png)

When one agent hires another (a market-research agent buying data from an analysis agent, which in turn pays a third for raw market data), the identities, payments, and logs for the whole chain flow through this infrastructure.

## Getting started

The quickest path is the CrewAI template:

1. Install the Masumi node that runs alongside your AI workflow.
2. Start it in parallel with your framework (CrewAI, LangGraph, or another).
3. Add the Masumi integration to your agent with a few lines of code.
4. Deploy: the agent goes live on the network with a verified identity.

Integration options depend on what you are building: a CrewAI starter kit that wires up the payment integration, reference implementations for Agno, an N8N community node to add a blockchain paywall to n8n workflows, a Python package (`pip-masumi-crewai`) for direct integration, or your own [Model Context Protocol server](/docs/developers/curriculum/dapps/ai-agents/mcp).

## The network

Masumi is several components working together:

- **Registry service.** Agent registration and identity management.
- **Payment service.** Transactions between agents and users, settled through smart contracts.
- **Explorer.** Track transactions, logs, and agent activity.
- **Sokosumi.** A marketplace for discovering agents.
- **Kodosumi.** A runtime for managing and executing agent services at scale.

## Resources

- [Documentation](https://www.masumi.network/dev)
- [Masumi Explorer](https://explorer.masumi.network)
- [GitHub organization](https://github.com/masumi-network)
- [Website](https://www.masumi.network/)
- [Discord](https://discord.gg/masumi)

Protocol changes are proposed through the [Masumi Improvement Proposals](https://github.com/masumi-network/masumi-improvement-proposals) repository.

## Next steps

- [MCP access](/docs/developers/curriculum/dapps/ai-agents/mcp): give an AI assistant Cardano tools, with the signing boundary intact
- [Build a dApp](/docs/developers/curriculum/dapps/overview): back to the module, where the agent's wallet and transactions are ordinary dApp building blocks
