# Contributing to the Cardano Developer Portal

Contributions generally fall into three categories: fixing content (typos, broken links, outdated information), adding developer tools to [Builder Tools](https://developers.cardano.org/tools/), and writing new documentation or tutorials.

For small fixes, you can always use the GitHub web editor directly on any file or click the pencil icon at the bottom on portal pages without any setup.

For anything that needs a local build, see the [local development setup](./README.md#local-development-setup) in the README.

## Adding a builder tool

This is the most common external contribution. You add a tool entry and open a PR:

1. Edit `src/data/builder-tools/tools.js` and add your entry at the **end** of the `BuilderTools` array:
   ```js
   {
     title: "Your Tool Name",
     description: "One or two factual sentences, no superlatives.",
     category: "sdk",                 // exactly one, see tags.js
     properties: ["typescript"],      // language + interface, see tags.js
     website: "https://your-tool.com",
     repository: "https://github.com/owner/repo", // public repo, or null
     docs: "https://docs.your-tool.com/getting-started", // or null
   }
   ```
2. Run `yarn build` and confirm it passes with no errors (it validates your entry).
3. Open a pull request using the "Add Builder Tool" template. Builder tool PRs require 3 approvals.

Field conventions:

- **Title**: the project's own name, styled how the project styles it (e.g. lowercase `cardano-cli`, `gOuroboros`). No descriptors, parentheticals, or re-casing.
- **Description**: one or two factual sentences, sentence case, ending with a period. No superlatives. Say what the tool does and how it differs from similar tools rather than restating its name.
- **Category**: exactly one, from the 12 defined in `src/data/builder-tools/tags.js`. For tools that read, serve, or index chain data, or run/talk to a node, the [data & node category layers](https://developers.cardano.org/docs/contribute/portal-contribute/#how-the-data--node-categories-relate) explain which layer to pick.
- **Properties**: the language(s) the tool is written in, plus its interface (`rest` / `graphql` / `grpc` / `websocket`) where relevant — all defined in `tags.js`.
- **Repository**: a public source repo adds an "Open Source" badge and a GitHub link; hosted or closed services use `null`.
- Don't set `maintainerPick` yourself (maintainers choose those).

For what belongs in the directory and how tools are curated, see the [portal contribution guide](https://developers.cardano.org/docs/contribute/portal-contribute/).

## Adding a template or contract

Two more curated surfaces live under [/templates](https://developers.cardano.org/templates): runnable dApp starter templates (in this repo under `examples/templates/`, registered in `src/data/templates/`) and the contract library (a use-case index in `src/data/contracts/`). Each has its own README with the exact steps: [`examples/templates/README.md`](./examples/templates/README.md) and [`src/data/contracts/README.md`](./src/data/contracts/README.md). Both are validated by `yarn build` and follow the same review process as builder tools.

## Before you open a PR

- Run `yarn build` and make sure it passes. It checks for broken links and validates builder tool entries.
- Don't include `yarn.lock` changes in your PR. We pin it as a baseline; if some slipped in, see the FAQ below.
- Follow the [style guide](https://developers.cardano.org/docs/contribute/portal-style-guide/). Write clearly, describe what your project does, skip the marketing language.

## FAQ

**Q: I accidentally committed yarn.lock changes, how do I fix it?**

Restore the original yarn.lock using **one of these** (depending on your git setup):
- If you created your PR branch from staging: `git checkout staging -- yarn.lock`
- If you need it from your fork's origin: `git checkout origin/staging -- yarn.lock`
- If you need it from the upstream repo: `git checkout upstream/staging -- yarn.lock`

Then commit the reversion: `git commit -m "revert yarn.lock to original state"`

## Getting help

If you're stuck or unsure where something belongs, ask in [GitHub Discussions](https://github.com/cardano-foundation/developer-portal/discussions) or [open an issue](https://github.com/cardano-foundation/developer-portal/issues). The [Cardano Forum](https://forum.cardano.org/c/developers/29) is also a good place to float ideas.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
