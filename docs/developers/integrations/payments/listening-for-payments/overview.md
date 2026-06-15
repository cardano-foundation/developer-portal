---
id: overview
title: Listening for ada payments
sidebar_label: Overview
description: Learn different approaches to detect and confirm ada payments in your Cardano applications.
image: /img/og/og-developer-portal.png
---

## Introduction

Listening for payments is a fundamental requirement for many Cardano applications. Whether you're building an e-commerce platform, payment gateway, donation system, or any service accepting ada, you need a reliable way to detect when payments arrive at specific addresses.

## Use Cases

Common scenarios where payment detection is essential:

- **E-commerce & Online Shops** - Confirm customer payments before fulfilling orders
- **Payment Gateways** - Process ada transactions for merchants
- **Donation Platforms** - Track and acknowledge contributions
- **Subscription Services** - Verify recurring payments
- **Vending Machines & IoT** - Automated payment confirmation
- **Event Ticketing** - Confirm ticket purchases
- **Gaming & In-App Purchases** - Validate in-game transactions

## How It Works

The basic payment detection flow:

1. **Generate payment address** - Create or retrieve a unique address for the transaction
2. **Display to customer** - Show address (often as QR code) for payment
3. **Monitor blockchain** - Periodically check the address for incoming transactions
4. **Verify amount** - Confirm received amount matches expected payment
5. **Complete transaction** - Fulfill order/service once payment is confirmed

![Payment Flow](/img/integrate-cardano/ada-online-shop.png)

## Approaches

There are three ways to detect payments, from the fastest to set up to the most self-hosted:

- **[Point of sale (Blockfrost)](/docs/developers/integrations/payments/listening-for-payments/point-of-sale)**: **recommended.** A production-ready React app that queries the chain through the Blockfrost API, with no infrastructure to run. The fastest path to accepting payments.

For teams that run their own infrastructure:

- **[cardano-wallet](/docs/developers/integrations/payments/listening-for-payments/cardano-wallet)**: monitor addresses through the cardano-wallet REST API (requires a running node + wallet service).
- **[cardano-cli](/docs/developers/integrations/payments/listening-for-payments/cardano-cli)**: query UTXOs directly with `cardano-cli` (requires a running node; the lowest-level, most operationally heavy option).

If you're not sure, start with the Blockfrost point-of-sale guide.
