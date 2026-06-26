---
id: ai-assisted-development
title: Set up your AI assistant
sidebar_label: Set up your AI assistant
description: Use AI coding assistants to build on Cardano with current, authoritative context instead of stale training data.
image: /img/og/og-developer-portal.png
---

If you build with an AI coding assistant, this is a quick, optional setup step worth doing now: it pays off across every module that follows.

AI coding assistants are fast, but their training data on Cardano drifts: APIs change, libraries get renamed, and patterns evolve faster than models are retrained. The fix is to give your assistant current, authoritative context.

## Cardano Dev Skills

[Cardano Dev Skills](https://github.com/cardano-foundation/cardano-dev-skills) is the go-to option for this today. It works with any AI coding agent that reads Markdown, bundling authoritative Cardano documentation and behavioral "skills" refreshed weekly from upstream project repositories, so your assistant answers from current sources rather than guessing from training data.

It ships:

- **Developer skills** for common workflows: writing validators, building transactions, governance, optimization, and debugging.
- **Bundled documentation** pulled from active Cardano projects and auto-refreshed weekly.
- **Hooks** that make the agent consult the bundled context before falling back on its training data.

Its scope is the developer toolchain (SDKs, validator libraries, design patterns, language tooling, protocol specs, and reference implementations), not the product docs of specific deployed apps.

### Add it to your agent

The skills are plain Markdown, so any agent that reads Markdown can use them. In Claude Code, add it from the plugin marketplace:

```bash
/plugin marketplace add cardano-foundation/cardano-dev-skills
```

Then run `/cardano-context` once per project to wire the directive into your `CLAUDE.md`. For Codex or other agents, clone the repo and symlink the skills into your project's `.agents/skills` directory, or point the agent at the Markdown directly. See the [repository](https://github.com/cardano-foundation/cardano-dev-skills) for the full list of skills and setup details.

## Going deeper on a specific SDK

Start with Cardano Dev Skills. It aggregates context across the whole toolchain, so for most work it's all you need, and it stays tool-agnostic while you're still deciding how to build.

Once you've committed to a specific SDK, that SDK may ship its own AI context you can add on top, for depth on its API: correct method ordering, transaction patterns, and framework-specific mappings. [Mesh](https://meshjs.dev/ai) is the most developed example today:

- **Agent Skills**: `npx skills add MeshJS/skills` installs deep SDK knowledge across `mesh-transaction` (MeshTxBuilder, minting, Plutus spending, staking, governance), `mesh-wallet` (CIP-30 and headless wallets, CIP-8 signing), and `mesh-core-cst` (CBOR and Plutus data serialization). The CLI detects your installed AI tools and drops the skills in the right place.
- **MCP server**: the [`meshjs-mcp`](https://meshjs.dev/ai/mcp) server gives your assistant real-time access to Mesh docs and code generation in VS Code, Cursor, or Claude Desktop.
- **llms.txt**: paste [`https://meshjs.dev/llms.txt`](https://meshjs.dev/llms.txt) into any assistant for a single, current file of the full Mesh API.

Reach for these only when you're working in Mesh and want more than Cardano Dev Skills already gives you.

## Next steps

- [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction): build, sign, and submit a payment on testnet, then read it back from the chain
