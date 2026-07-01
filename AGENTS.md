# AGENTS.md — AI agent guide for the Cardano Developer Portal

> Use **yarn**, not npm, for all dependency and script management. Requires **Node 22** (see `.nvmrc`).

This file gives AI coding agents (and their operators) the context to contribute correctly to the Cardano Developer Portal (`developers.cardano.org`), a [Docusaurus](https://docusaurus.io/) site. Read it before making changes. Human contributors should start with [README.md](./README.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Scope and intent
- Prefer small, reviewable, single-purpose PRs. Keep diffs minimal; do not bundle cosmetic churn with a fix.
- For non-trivial changes, open an issue or discussion first.
- This repo is documentation, a developer curriculum, and a curated list of builder tools. It is **not** a place for marketing copy.
- All PRs target the `staging` branch. Maintainers merge `staging` into `main` for production periodically.

---

## Project philosophy
- **Community-owned:** the portal is maintained by the Cardano community, not a single entity.
- **Incremental:** prefer small, continuous changes over large rewrites.
- **Discussion first:** align on non-trivial changes before implementing them.

---

## Essential resources
- **[README.md](./README.md)** — overview and local setup.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — contribution workflow (fixing content, adding builder tools, writing docs).
- **[Style guide](https://developers.cardano.org/docs/contribute/portal-style-guide/)** (`docs/contribute/portal-style-guide.md`) — the editorial voice. Mandatory for content and UI copy.
- **`src/data/builder-tools/tags.js`** — the builder-tools taxonomy (categories, languages, interfaces). The source of truth for valid tool metadata.

---

## Repository map
- `docs/` — content: `developers/` (the curriculum), `operators/`, `community/`, `contribute/`.
- `blog/` — the developer blog.
- `src/`
  - `pages/` — standalone React pages (for example `talent/`, `tools/`).
  - `data/` — site data: `builder-tools/` (`tools.js` entries + `tags.js` taxonomy + validation), `navbar.js`, `redirects.js`, `templates/`, `contracts/`.
  - `components/`, `theme/`, `css/`, `utils/`, `svg/` — UI.
- `static/` — static assets. **Self-host images here** (see guardrails).
- `plugins/` — custom Docusaurus plugins (`tools-routes`, `templates-routes`).
- `scripts/` — build helpers (`generate-stats.js`, `fix-llms-paths.js`).
- Config: `docusaurus.config.js` (site), `netlify.toml` (redirects + security headers), `searchconfig.json` (Algolia crawler), `.nvmrc` (Node version).

---

## Quickstart
[Fork the repo](https://github.com/cardano-foundation/developer-portal/fork), then:
```sh
git clone https://github.com/<your-github-username>/developer-portal.git
cd developer-portal
yarn install
yarn start          # dev server on localhost:3000
yarn build          # production build; also runs the quality gates below
```
See `package.json` > `scripts` for the rest.

---

## Quality gates (before every PR)
`yarn build` must pass. It is not just a build, it is the gate:
- **Builder tools are validated.** `src/data/builder-tools.js` runs `ensureBuilderToolValid` on every entry, so a malformed tool (bad category or property, missing field) fails the build.
- **Broken internal links throw.** `onBrokenLinks: "throw"` and `onBrokenMarkdownLinks: "throw"` in `docusaurus.config.js` mean a broken internal link fails the build.
- Do not commit incidental `yarn.lock` changes (it is a pinned baseline; see the CONTRIBUTING FAQ).
- CI runs the same `yarn build` on every PR.

---

## Common tasks
- **Add a builder tool:** append an entry to the end of the `BuilderTools` array in `src/data/builder-tools/tools.js`; pick exactly one `category` and the `properties` (language and interface) from `src/data/builder-tools/tags.js`; run `yarn build`; open a PR with the **Add Builder Tool** template. These PRs require **3 approvals**. Do not set `maintainerPick` (maintainers choose those).
- **Edit or add a doc:** files live under `docs/…`. Use relative links to other docs and canonical paths (`/docs/contribute/…`, not redirect aliases). `yarn build` catches broken links.
- **Add a redirect:** add an entry to `src/data/redirects.js`, following the style of existing entries. The site uses `trailingSlash: true`; verify the redirect resolves after `yarn build`.
- **Add an image:** put it under `static/img/` and reference it as `/img/…`. External image hosts are blocked by the CSP (see guardrails).

---

## Hard guardrails (don'ts)
- **Do not change security headers or CSP** (`netlify.toml`), **analytics** (the gtag config in `docusaurus.config.js`), or **CI** (`.github/workflows/`, the `yarn-build` action) without maintainer sign-off and a stated reason. These are runtime and security sensitive, and are not build-tested.
- **Do not use external image hosts.** The CSP `img-src` is an allowlist; hosts like `raw.githubusercontent.com` and `shields.io` are blocked and break on deploy. Self-host under `static/img/`.
- **Do not set `maintainerPick`** on builder tools.
- **Do not mass-reformat** or make wide refactors without an explicit OK. Keep diffs surgical.
- **No secrets or real keys** in code, config, or examples.
- **No marketing or promo language.** State what something is and who it is for, then stop.

---

## Pull requests
- Target `staging`.
- Use the PR template chooser: open a PR and pick **Add Builder Tool** or **Update documentation or Fix a Bug** (the default `PULL_REQUEST_TEMPLATE.md` links to both via `?template=`).
- Write a plain, direct description: what is broken or changing, the fix, and how it is verified. Link the related issue. No filler.
- Builder-tool PRs require 3 approvals; other PRs follow branch protection.

---

## Content and editorial
- **Voice:** confident, direct, useful. Follow the [style guide](https://developers.cardano.org/docs/contribute/portal-style-guide/). No marketing fluff, no defensive framing.
- **Language:** US English.
- **Claims:** link a source for factual or technical claims; do not assert unverifiable things.
- **Links:** use canonical `/docs/contribute/…` paths, not redirect aliases.

---

## Best practices for AI agents
- **Search first:** check existing issues, discussions, and code for prior art before adding new patterns.
- **Reuse:** match existing conventions and utilities rather than inventing new ones.
- **Verify, do not assume:** reproduce a bug before "fixing" it; verify a claim (a live check or a doc) before asserting it.
- **Minimal diffs:** change only what the task needs.
- **Transparent PRs:** describe changes and link related issues or discussions.

---

## Need help?
- [GitHub Discussions](https://github.com/cardano-foundation/developer-portal/discussions) for questions and ideas.
- [CONTRIBUTING.md](./CONTRIBUTING.md) for process details.
