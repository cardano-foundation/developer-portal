---
id: yaci-devkit
title: Introduction to Yaci DevKit
sidebar_label: yaci-devkit
description: Yaci DevKit offers a customizable Cardano devnet that quickly launches and resets via the Yaci CLI, enabling faster iterations for developers.
---

[Yaci DevKit](https://devkit.yaci.xyz/introduction) offers a customizable Cardano devnet that quickly launches and resets via the Yaci CLI, enabling faster iterations for developers.

## Overview

Yaci DevKit is a comprehensive development toolkit that provides a complete Cardano blockchain environment for testing and development purposes. It's designed to help developers build, test, and iterate on Cardano applications quickly and efficiently.

## Key Features

- **Yaci Store**: Lightweight indexer using H2 database for fast blockchain data access
- **Yaci Viewer**: Browser-based transaction interface for exploring blockchain data
- **Flexible Configurations**: Customizable block times, epochs, and network parameters
- **Service Integration**: Seamlessly integrates with **Ogmios** and **Kupo**
- **API Compatibility**: Provides essential Blockfrost API compatibility required by SDKs for transaction building and submission.
- **Easy Deployment**: Easily deployable with Docker Compose for quick setup

## Distribution Types

### 1. Docker Distribution (Recommended)

The Docker distribution includes all required components and provides a full installation via Docker Compose. This is the easiest way to get started with Yaci DevKit.

- Complete solution with all components
- Easy setup with Docker Compose
- Perfect for local development

### 2. Yaci CLI Zip (Non-Docker)

The ZIP distribution includes only the Yaci CLI and allows selective downloading of components as needed. This option is ideal for users who prefer a non-Docker setup or require more control over individual components.

- Standalone ZIP containing Yaci CLI
- Selective component downloads via Yaci CLI
- No container dependencies

**Supported Environments:**

- Linux x64
- macOS arm64

### 3. NPM Distribution

The NPM distribution offers an alternative installation method, especially beneficial for CI/CD pipelines and automated testing environments.
It includes the Yaci CLI non-Docker zip bundle and enables straightforward installation via NPM.

Supported environments include: Linux x64, MacOS arm64

- Easy NPM package installation
- Ideal for automated testing
- Seamless CI/CD pipeline integration

**Supported Environments:**

- Linux x64
- macOS arm64

## Getting Started

### Setup

- [Docker Setup](https://devkit.yaci.xyz/getting-started/docker) - Installation method
- [Zip Setup](https://devkit.yaci.xyz/getting-started/zip) - Non-Docker installation
- [NPM Setup](https://devkit.yaci.xyz/getting-started/npm) - NPM package installation

### Commands

- [Yaci CLI Commands](https://devkit.yaci.xyz/commands) - Learn about available CLI commands

## Resources

- [Presenting yaci-devkit](https://www.youtube.com/watch?v=lY7Ceuyc5qw) - An introduction to yaci-devkit in Developer Office Hours
- [Presenting yaci-store](https://www.youtube.com/watch?v=9hAdqcFR_k0&t=1063s) - An introduction to yaci-store in Developer Office Hours
