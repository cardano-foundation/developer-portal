---
id: ai-assisted-development
title: Cardano Dev Skills
sidebar_label: Code with AI
description: The go-to toolkit for building on Cardano with an AI coding agent. Focused skills for every stage of development, docs refreshed weekly, installed in two commands.
---

[Cardano Dev Skills](https://github.com/cardano-foundation/cardano-dev-skills) is the go-to toolkit for building on Cardano with a coding agent. It gives the agent a focused skill for each stage of development and bundled documentation from active Cardano projects, refreshed weekly, so the agent builds from current sources and moves faster than it would on training data alone. The skills are plain Markdown, and any coding agent that reads Markdown can use them.

:::tip[Install with one prompt]

Paste this into your coding agent:

```text title="prompt"
Walk me through installing Cardano Dev Skills:
https://github.com/cardano-foundation/cardano-dev-skills
```

:::

## Set it up in Claude Code

1. **Install Claude Code.** If it is not on your machine yet, the [quickstart](https://code.claude.com/docs/en/quickstart) takes a few minutes.

2. **Add the marketplace, then install the plugin.** In any Claude Code session:

   ```text title="Claude Code"
   /plugin marketplace add cardano-foundation/cardano-dev-skills
   /plugin install cardano-dev-skills@cardano-dev-skills
   ```

   Run the two commands in that order. Installing without adding the marketplace first can fail with an SSH permission error, even though the repository is public.

3. **Verify.** `/plugin list` shows `cardano-dev-skills` enabled. The plugin installs once and is active in every session, in any directory. Each new session now opens by reporting how fresh the bundled docs are:

   ```text title="session start"
   [Cardano Dev Skills] Docs loaded: 72 sources, 3925 files (updated 2d ago)
   ```

   Your counts and dates will differ as the sources refresh.

4. **Wire it into your project.** In the project you are working on:

   ```text title="Claude Code"
   /cardano-context
   ```

   This writes a small directive block into the project's `CLAUDE.md`, telling Claude to consult the bundled skills and docs before its training data. Claude Code reads `CLAUDE.md` on every turn, so the directive holds across sessions, and it travels with the repository when you commit it.

5. **Put it to work.** Typing `/` lists the skills the plugin added, one per workflow: `/scaffold-project`, `/write-validator`, `/debug-transaction` and the rest. Or start wide:

   ```text title="first prompt"
   Brainstorm a Cardano app with me, then walk me through building it.
   ```

   The agent reads the bundled sources as it works. If it answers Cardano questions from memory in some project, run `/cardano-context` there.

## Other agents

**Claude Cowork** uses the same plugin format. Open Customize, go to the Plugins tab, add a marketplace from the repository URL `https://github.com/cardano-foundation/cardano-dev-skills`, and install `cardano-dev-skills` once it syncs. The first sync pulls the full bundled docs, so it is not instant.

**Codex, and anything else that reads Markdown**: clone the repository and link the skills into your project, then point the file your agent reads at startup at them, the way `/cardano-context` does for Claude Code.

```bash
git clone https://github.com/cardano-foundation/cardano-dev-skills.git
cd your-project
ln -s ../cardano-dev-skills/skills .agents/skills
```

## What's inside

A skill is a focused workflow guide: scaffolding a project, writing a validator, building a transaction, debugging one that fails. Alongside the skills, the plugin bundles documentation from active Cardano projects, mirrored locally and auto-refreshed weekly. The scope is the developer toolchain, meaning SDKs, validator libraries, protocol specs and reference implementations, not the product docs of deployed apps. The full list of skills and sources is on the [Cardano Dev Skills site](https://cardano-foundation.github.io/cardano-dev-skills/).

## Going further

- SDKs and protocols ship their own AI context to layer on top: [Mesh AI](https://meshjs.dev/ai) for the Mesh API, [Masumi Skills](https://www.masumi.network/dev/masumi/documentation/integrations/masumi-skills) for Masumi's agent stack.
- An agent can also work against live chain state, reading your balances and drafting transactions you sign: [chain access over MCP](/docs/developers/curriculum/dapps/ai-agents/overview#chain-access-over-mcp).
- With the agent set up, [your first transaction](/docs/developers/curriculum/start-building/your-first-transaction) is the natural next build.
