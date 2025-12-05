---
id: get-started
sidebar_position: 2
title: Get Started with Blockfrost
sidebar_label: Get started
description: Set up your Blockfrost account and create your first project.
image: /img/og/og-getstarted-blockfrost.png
---

Use the [hosted Blockfrost API](https://blockfrost.io/) by creating a free account at [blockfrost.io/auth/signin](https://blockfrost.io/auth/signin).

## Sign up

![Blockfrost.io landing page](/img/get-started/blockfrost/getting-started-1_frontend_landing.png)

## Create your project

After signing in, create your first project:

1. Click **+ ADD PROJECT**
2. Choose a project name
3. Select the network (mainnet, preprod, or preview)
4. Click **SAVE PROJECT**

![Add Blockfrost project](/img/get-started/blockfrost/getting-started-2_add_project.png)

You'll receive a unique `project_id` (API key) for accessing the API.

![Get Blockfrost project_id](/img/get-started/blockfrost/getting-started-3_get_api_key.png)

:::warning
Keep your `project_id` secret. Never commit it to public repositories or embed in client-side code. Use environment variables and store it in your backend to prevent unauthorized access. Ideally, set up your own application backend to store your `project_id` securely, avoiding potential leaks. Otherwise, unauthorized individuals could exploit your token.
:::

A project provides API access to a specific [network](https://blockfrost.dev/docs/start-building#available-networks). Each project has its own `project_id` for API authentication.

## Use SDKs

Blockfrost supports [15+ programming languages](https://blockfrost.dev/docs/sdks) with official SDKs:

- [blockfrost-js](https://github.com/blockfrost/blockfrost-js) - JavaScript/TypeScript
- [blockfrost-python](https://github.com/blockfrost/blockfrost-python) - Python
- [blockfrost-rust](https://github.com/blockfrost/blockfrost-rust) - Rust
- [blockfrost-go](https://github.com/blockfrost/blockfrost-go) - Go
- [blockfrost-haskell](https://github.com/blockfrost/blockfrost-haskell) - Haskell
- [blockfrost-java](https://github.com/blockfrost/blockfrost-java) - Java
- [blockfrost-kotlin](https://github.com/blockfrost/blockfrost-kotlin) - Kotlin
- [blockfrost-scala](https://github.com/blockfrost/blockfrost-scala) - Scala
- [blockfrost-swift](https://github.com/blockfrost/blockfrost-swift) - Swift
- [blockfrost-ruby](https://github.com/blockfrost/blockfrost-ruby) - Ruby
- [blockfrost-php](https://github.com/blockfrost/blockfrost-php) - PHP
- [blockfrost-elixir](https://github.com/blockfrost/blockfrost-elixir) - Elixir
- [blockfrost-dotnet](https://github.com/blockfrost/blockfrost-dotnet) - .NET
- [blockfrost-crystal](https://github.com/blockfrost/blockfrost-crystal) - Crystal
- [blockfrost-arduino](https://github.com/blockfrost/blockfrost-arduino) - Arduino

## Next steps

- [Explore Cardano APIs](/docs/get-started/infrastructure/api-providers/blockfrost/cardano-api) - Query blockchain data
- [Set up webhooks](/docs/get-started/infrastructure/api-providers/blockfrost/secure-webhooks) - Subscribe to blockchain events
- [Visit Blockfrost.dev](https://blockfrost.dev/) - API documentation and examples
