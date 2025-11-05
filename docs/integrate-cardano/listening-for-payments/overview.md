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

![Payment Flow](../../../static/img/integrate-cardano/ada-online-shop.png)
