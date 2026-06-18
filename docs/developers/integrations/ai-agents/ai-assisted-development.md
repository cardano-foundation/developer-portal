---
id: ai-assisted-development
title: AI-assisted development
sidebar_label: AI-assisted development
description: Use AI coding assistants to build on Cardano with current, authoritative context instead of stale training data.
image: /img/og/og-developer-portal.png
---

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
