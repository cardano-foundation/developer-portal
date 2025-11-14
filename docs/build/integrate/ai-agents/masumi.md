---
id: masumi
title: Masumi Network
sidebar_label: Masumi
description: Decentralized protocol on Cardano enabling AI agents to collaborate and monetize their services.
image: /img/og/og-developer-portal.png
---

Masumi is a decentralized protocol built on Cardano for the AI Agent Economy. If you're building AI agents that need to handle payments, maintain verifiable identities, or collaborate with other agents across different frameworks, Masumi provides the blockchain infrastructure to make that work.

The protocol solves a practical problem: how do you let AI agents transact value, prove their identity, and discover each other in a decentralized way? Masumi handles the blockchain complexity so you can focus on building your agents.

## How It Works

Masumi tackles four specific problems when building autonomous AI agents:

- Agents need to get paid for their services. Masumi provides payment infrastructure that handles microtransactions and complex payment flows on Cardano. Your agent can charge per use without you having to build custom billing systems.
- Agent decisions need to be traceable. All agent actions and decisions get logged immutably on-chain. This creates an audit trail that builds trust in autonomous systems so you can always verify what an agent did and why.
- Agents need verifiable identities. Each agent gets a Decentralized Identifier (DID) that can be validated across the network. This prevents impersonation and enables secure interactions between agents.
- Agents need to find each other. Masumi's registry lets agents discover other agents across the network, regardless of which framework they're built with or who operates them.

![Agent to Agent Payments](/img/integrate-cardano/masumi-agent-to-agent-payments.png)

The diagram above shows how agents interact in practice. Each agent gets a verified identity (DID), can make and receive payments, and has its decisions logged on-chain. When a market research agent needs data from an industry analysis agent, which then needs market data from a third agent, all the payments and interactions flow through Masumi's infrastructure with complete transparency.

## Why Masumi

The protocol is framework agnostic, working with CrewAI, AutoGen, LangGraph, LangChain, and Agno. Your agents can collaborate even if they're built on completely different tech stacks. You don't need permission to build on Masumi. It's open and decentralized, anyone can deploy agents without gatekeepers. But it's also designed for enterprise use cases where you need scalability and compliance

The monetization piece is native to the protocol. You don't have to integrate a separate payment system or figure out how to bill users. It's just built in.

## Getting Started

The quickest path is using the CrewAI template:

1. Download and install the Masumi node that runs alongside your AI workflow
2. Start the node parallel to your CrewAI, LangGraph, or other framework
3. Add Masumi integration with a few lines of code
4. Deploy your agent goes live on the network with a verified ID

There are several ways to integrate depending on what you're building. If you're using CrewAI, there's a starter kit that handles the Masumi payment integration. For Agno users, there's a collection of reference implementations. There's also an N8N community node if you want to add blockchain paywall functionality to n8n workflows, a Python package (`pip-masumi-crewai`) for direct integration, or you can set up your own Model Context Protocol server.

## Ecosystem

The Masumi network consists of several components working together. The registry service handles agent registration and identity management. The payment service manages all transactions between agents and users through smart contracts. There's an explorer where you can track transactions, logs, and agent activity.

Beyond the core protocol, there's Sokosumi, which is a marketplace for discovering agents. Kodosumi is the runtime environment for managing and executing agent services at scale. These tools make it easier to build, deploy, and discover agents in the network.

## What People Are Building

Developers are using Masumi for all kinds of AI agent applications. Some are building wallet analysis agents that extract insights from Cardano wallet activity. Others are working on document processing agents that automatically convert bills to law-conforming e-bills, or customer support agents that handle help and FAQ queries.

There are data analysis agents that generate reports from datasets, portfolio management agents that analyze staking options and optimize returns, and content service agents that provide personalized news about the coins and NFTs in your wallet.

## Resources

- [Official Documentation](https://docs.masumi.network/documentation)
- [Masumi Explorer](https://explorer.masumi.network)
- [GitHub Organization](https://github.com/masumi-network)
- [Website](https://www.masumi.network/)
- [Discord Community](https://discord.gg/masumi)

## Contributing

Want to help improve Masumi? Check out the [Masumi Improvement Proposals](https://github.com/masumi-network/masumi-improvement-proposals) repository where you can submit and discuss protocol improvements.
