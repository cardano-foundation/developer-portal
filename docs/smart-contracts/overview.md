---
id: overview
slug: /smart-contracts/
title: Smart Contracts
sidebar_label: Overview
description: Learn how to create smart contracts on Cardano.
image: ./img/og-developer-portal.png
--- 

![Smart Contracts](../../static/img/card-smart-contracts-title.svg)

## What are smart contracts?
Smart contracts are automated digital agreements that are programmed. They are self-executing, incorruptible, and unalterable. They do not require any actions or the presence of third parties. 

## Two worlds of smart contracts
We can break smart contracts and financial transactions down into two worlds: 

In one world, you want to send some notion of value between one actor (or group of actors) to another actor (or a group of actors). There has to be a representation of that value, the terms and conditions behind it, and an event to trigger it. This is what we call a financial contract and best implemented with a domain-specific language. This world has nothing to do with replacing a big company or this common notion that we might have with dapps.

In the other world, you want to write programs, maybe even replace a large company, perhaps solve something smaller. Those applications consist of a triangle:

- The client - this is what runs on your computer.
- The server - this is what runs on someone's server (or multiple servers).
- The smart contract - the piece of the code that actually runs decentralized.

## Programming languages
- [Marlowe](marlowe) - a domain-specific language, it covers the world of financial contracts.
- [Plutus](plutus) - a platform to write full applications that interact with the Cardano blockchain. 
