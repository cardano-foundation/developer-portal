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

[Cardano Dev Skills](https://github.com/cardano-foundation/cardano-dev-skills) is the go-to plugin for this today. It bundles authoritative Cardano documentation and behavioral "skills" for AI coding agents, refreshed weekly from upstream project repositories, so your assistant answers from current sources rather than guessing from training data.

It ships:

- **Developer skills** for common workflows: writing validators, building transactions, governance, optimization, and debugging.
- **Bundled documentation** pulled from active Cardano projects and auto-refreshed weekly.
- **Hooks** that make the agent consult the bundled context before falling back on its training data.

Its scope is the developer toolchain (SDKs, validator libraries, design patterns, language tooling, protocol specs, and reference implementations), not the product docs of specific deployed apps.

### Use it with Claude Code

```bash
/plugin marketplace add cardano-foundation/cardano-dev-skills
```

Then run `/cardano-context` once per project to wire the directive into your `CLAUDE.md`. For other agents, clone the repo and symlink the skills into your project's `.agents/skills` directory. See the [repository](https://github.com/cardano-foundation/cardano-dev-skills) for the full list of skills and setup details.

## Layer Mesh's AI context on top

Cardano Dev Skills covers the toolchain broadly. Once you've settled on Mesh, you can layer Mesh's own AI context on top to go deep on the Mesh API: correct method ordering, transaction patterns, and Aiken-to-MeshTxBuilder mapping.

**Mesh Agent Skills** ship deep knowledge of the SDK across three skills: `mesh-transaction` (MeshTxBuilder, minting, Plutus spending, staking, governance, Aiken integration), `mesh-wallet` (browser and headless wallets, CIP-30, CIP-8 signing), and `mesh-core-cst` (CBOR serialization, Plutus data conversion, `applyParamsToScript`). The CLI auto-detects your installed AI tools and drops the skills in the right place:

```bash
npx skills add MeshJS/skills
```

**Mesh MCP server** gives your assistant real-time access to Mesh docs and code generation in VS Code, Cursor, or Claude Desktop. With the `claude` CLI:

```bash
claude mcp add-json mesh-mcp '{
  "command": "npx",
  "args": ["-y", "meshjs-mcp"],
  "env": {
    "API_KEY": "your-api-key",
    "MODEL": "your-preferred-model"
  }
}'
```

**llms.txt** is the universal option: paste `https://meshjs.dev/llms.txt` into any assistant (Cursor's doc sources, Windsurf, ChatGPT, Claude) for a single, current file of the full Mesh API and examples.

## Next steps

- [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction): build, sign, and submit a payment on testnet, then read it back from the chain
