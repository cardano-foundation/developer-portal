---
id: portal-contribute
title: How to contribute to the developer portal
sidebar_label: How to contribute
description: How to contribute to the Cardano developer portal.
---

We wanted to build a developer portal as open and inclusive as Cardano - a portal in the hands of the Cardano community that can be constantly evolved by it.

## Why Contribute?

### Build Your Resume

Each contribution you make acts as a precious notch on your belt towards career development or job searches within the Cardano ecosystem. It is also a way for people to find examples of your work and verify your abilities. By contributing to open source projects, you will not only gain a lot of valuable experience, but if your profile reaches a certain level of attention and recognition, you are also more likely to get professional opportunities further down the line.

### Build Your Reputation

Contributions to the developer portal will give your GitHub name and profile higher visibility as more and more people come across your work online. As visibility increases, so too will the reputation of your name and brand.

### Build Your Confidence

Creating tutorials and showing fellow community members how to create will not only elevate your knowledge of your own skills and processes, but will also bestow you with greater confidence in your abilities as you interact with others.

Since everything is public, people typically pay greater attention to how well something is written or programmed. This will afford you with an invaluable set of eyes on your contributions that will serve as a crucial peer-reviewed tool to catch errors and refine your work.

## Quick Contributions

**Fix typos, update links, small edits:**

- Use GitHub's web editor directly on any file
- Click the pencil icon ("Edit this page") at the end of any page
- Make your changes and submit a pull request

**Report issues or suggest improvements:**

- [Create an issue](https://github.com/cardano-foundation/developer-portal/issues) - Anything from a simple suggestion to a fully elaborated plan. You can think of it as creating a topic in a forum.
- [Start a discussion](https://github.com/cardano-foundation/developer-portal/discussions) - Appropriate for finding consensus on fundamental changes
- [Share on the Cardano Forum](https://forum.cardano.org/c/developers/29) - For those who prefer forum discussions

**Spread the word:**

- Link to the [Cardano Apps](https://cardano.org/apps/) when someone asks about projects built on Cardano
- Share the [Builder Tools](https://developers.cardano.org/tools) page with developers looking for SDKs and libraries

## Add Your Tool

### General Submitter Requirements

**For all tool submissions:**

- Your GitHub account ideally should have some contribution history or be known in the Cardano community
- Brand new GitHub accounts may face additional scrutiny
- All submissions must pass `yarn build` without errors before submission

### Add to Builder Tools

Builder Tools is a curated directory, not a database. The goal is to keep it as useful as possible for any Cardano developer, which sometimes means maintainers declining a tool that works but isn't the right fit yet. The points below are what maintainers look for, not a checklist you tick to earn a spot.

It's a list of things you build Cardano applications *with*: SDKs and libraries, APIs and providers, indexers and data infrastructure, node and operations tooling, wallets and connectivity, developer environments, and testing tools. End-user applications (wallets as products, dApps, DEXes, marketplaces, games) belong on [cardano.org/apps](https://cardano.org/apps/), not here.

Mostly it comes down to signal. A tool that's genuinely useful, novel, or has gained real community adoption usually carries enough signal for maintainers to recognize it and say yes. A tool that works but hasn't found meaningful adoption, or isn't yet relied on by larger projects and applications, often hasn't generated that signal. That's not a no forever; things stand the test of time, so keep iterating and traction tends to show.

Cardano is a vast sea of open-source repositories that work together, and a directory listing every one-off tool would point developers in every direction at once. So if you've built something niche for a specific workflow, the strongest move is often to contribute it into one of the established repositories already serving that domain, where it reaches more developers and is maintained alongside the rest. A tool built for one specific need, even a quick one-off that does exactly what it claims, isn't always enough on its own.

Open source is encouraged (set `repository`); hosted and closed services are welcome too (`repository: null`).

**Step-by-Step Process:**

1. **Add your tool entry**
   - Edit: `src/data/builder-tools/tools.js`
   - Add your entry to the **END** of the BuilderTools array
   - Use this format:

   ```javascript
   {
     title: "Your Tool Name",
     description: "Brief description of what your tool does",
     category: "sdk",                // exactly ONE — see Categories in tags.js
     properties: ["typescript"],     // language + interface facets — see tags.js
     website: "https://your-tool.com",
     repository: "https://github.com/owner/repo", // public source repo, or null
     docs: "https://docs.your-tool.com/getting-started", // or null if no docs
   }
   ```

2. **Choose a category and properties**

   **Important:**
   - **Title**: use the project's own name, styled how the project styles it (e.g. lowercase `cardano-cli`, `gOuroboros`). Do not add descriptors or parentheticals, or re-case it for uniformity.
   - **Description**: one or two factual sentences, sentence case, ending with a period. No superlatives. Describe what the tool does and how it differs from similar tools (its language/interface), rather than restating its name.
   - Pick exactly **one** primary `category` that best describes what the tool *is*. The 12 categories live in `src/data/builder-tools/tags.js`. If the tool reads, serves, or indexes chain data, or runs/talks to a node, see "How the data & node categories relate" below to pick the right layer.
   - `properties` = the language(s) the tool is written in, plus its interface (`rest` / `graphql` / `grpc` / `websocket`) where relevant.
   - Open source is encouraged: set `repository` to your public repo (it adds an "Open Source" badge + a GitHub link on the tool's page). Hosted/closed services are welcome too — use `null`.
   - Do NOT set `maintainerPick` yourself (maintainers choose those).

3. **Test your submission**
   - Run `yarn build` (must complete without errors)
   - Check that your tool displays correctly

4. **Submit your pull request**
   - Use the "Add Builder Tool" GitHub PR template
   - Fill out the checklist in the template

### How the data & node categories relate

If your tool reads, serves, or indexes chain data, or runs/talks to a node, it sits at one layer of a stack. Pick the layer the tool *operates at*:

- **`node` (Nodes & Clients)** - the node software itself: run or be a node (a full node, an alternative client implementation, an L2 node).
- **`node-access` (Node Access & RPC)** - talk to a node: RPC bridges and protocol libraries that expose a node you run.
- **`indexer` (Indexers & Data)** - self-host a queryable store: ingest chain data and serve it back (full indexers, lightweight indexes, data nodes, streaming pipelines).
- **`api` (APIs & Providers)** - hosted: a managed endpoint you call, with no infrastructure to run.

`sdk` (SDKs & Libraries) sits across the top: a library that wraps the `node-access` / `indexer` / `api` layers so you build from code.

Rules of thumb: do you call a hosted endpoint (`api`) or run it yourself (`indexer`)? Does the tool build its own queryable data store (`indexer`) or just relay the node's protocol (`node-access`)? Is it the node itself (`node`) or something that talks to one (`node-access`)?

### Curation and removal

The list is curated and pruned, not append-only, so it stays useful over time. Maintainers remove a tool when it stops serving developers. What usually prompts that:

- the website is down, or the source repository is archived or unreachable,
- a long stretch (roughly two years or more) with no commits, releases, or community activity and no sign of life,
- it's been superseded by a better-maintained tool for the same job,
- a hosted service that's been discontinued,
- an end-user application that belongs on [cardano.org/apps](https://cardano.org/apps/),
- or it no longer meets a basic quality and trust bar.

These are signals, not a scorecard. Maintainers weigh them with judgment and often talk through borderline cases. A removed tool can come back any time through the normal submission, which is also a good moment to refresh its information; a past listing isn't a fast-track.

### Maintainer picks

A few tools carry a maintainer pick (the star): a steer toward what a developer should reach for in a given area today. It's a curated call, not a popularity contest.

- It leans on signals (registry downloads, recent activity, maintenance, real-world fit) weighed with judgment. Stars alone mislead; a legacy tool often out-stars its maintained successor.
- Roughly one clear leader per category, a couple more where it's genuinely warranted, and none where nothing stands out.
- Maintainers choose the picks, so don't set `maintainerPick` on your own submission.

If you think something deserves a pick, open an issue and make the case: which category it leads, and why.

### FAQ

**Q: I don't know how to use GitHub or run `yarn build`. Can I still contribute?**

A: Yes! You can:

- [Open an issue](https://github.com/cardano-foundation/developer-portal/issues) with your tool details and someone from the community can help
- [Start a discussion](https://github.com/cardano-foundation/developer-portal/discussions) to get guidance
- Let the community know about your contribution idea in [the forum](https://forum.cardano.org/c/developers/cardano-projects/151)

**Q: How long does it take for my tool to be approved?**

A: Pull requests require **3 reviewer approvals**. This typically takes a few days to a week, depending on reviewer availability. After approval, changes are merged to the **staging branch** first (visible at [staging-dev-portal.netlify.app](https://staging-dev-portal.netlify.app)), then later pushed to production. This process causes a small delay between staging and production deployment.

**Q: Can I update my tool information later?**

A: Yes! Submit a new pull request with the updates to your tool entry.

**Q: Why was my tool rejected?**

A: Common reasons for rejection include:

- **Domain issues** - Using temporary hosting domains, URL shorteners, or unstable domains
- **New GitHub account** - Submitter account lacks contribution history or community recognition
- **Incomplete submission** - Missing required fields, broken links, or build errors
- **Marketing-focused description** - Using claims like "the best," "the first," or "the only"
- **Out of scope, or not enough signal yet** - an end-user app (belongs on cardano.org/apps), or a tool that works but hasn't yet found the adoption that earns a spot. This isn't a permanent no; tools can earn a place as they gain traction.

If your submission was rejected, reviewers will typically provide specific feedback in the pull request comments.

**Q: Should I commit yarn.lock changes?**

A: No, never commit `yarn.lock` changes. This file is managed by maintainers. If you accidentally committed it, remove it with: `git checkout staging -- yarn.lock && git commit -m 'revert yarn.lock'`

For more details on the GitHub workflow, see [CONTRIBUTING.md](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md).

## Add a dApp Template or Contract

Two more curated surfaces live under [/templates](https://developers.cardano.org/templates):

- **App starters** are runnable front-end dApp projects you scaffold in one command. To add one, follow [`examples/templates/README.md`](https://github.com/cardano-foundation/developer-portal/blob/staging/examples/templates/README.md).
- **The contract library** is a use-case index (escrow, vesting, HTLC...) that links out to on-chain and off-chain implementations. To add an entry, follow [`src/data/contracts/README.md`](https://github.com/cardano-foundation/developer-portal/blob/staging/src/data/contracts/README.md).

Both are curated like Builder Tools: canonical and maintained, pointing at the established source rather than forking code into the portal. Each entry is validated by `yarn build`, and the same submitter requirements and review process above apply.

## Contributing Documentation

For **content writers and developers** who want to work on documentation, blog posts, or improve existing content.

### Local Development Setup

**Requirements:**

- [Node.js](https://nodejs.org/en/download/) >= 20.0 (check with `node -v`)
- [Yarn](https://yarnpkg.com/en/) >= 1.20 (check with `yarn --version`)
- On macOS: Xcode and Command Line Tools

**Setup:**

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-github-username>/developer-portal.git
cd developer-portal
yarn install
yarn build  # Required at least once - pulls missing files
yarn start  # Development server at http://localhost:3000
```

:::info Development vs Production

- `yarn start` - Fast development with some limitations (blurry images, search issues)
- `yarn build` - Full production build required before submitting PRs

:::

### Project Structure

```bash
developer-portal/
├── docs/              # Documentation content (you'll edit these)
├── blog/              # Developer blog posts
├── src/data/          # Builder tools data
├── static/img/        # Images and assets
├── sidebars.js        # Navigation structure
└── docusaurus.config.js
```

**Key locations:**

- `/docs/` - All documentation content
- `/src/data/builder-tools/tools.js` - Developer tools data
- `/sidebars.js` - Controls documentation navigation

### Writing Content

**Formatting:** See [Style Guide](portal-style-guide.md) for Markdown syntax and Docusaurus components.

**Essential rules:**

- Use `## Level 2` headings as top-level (page title is auto-generated)
- Include frontmatter with `id`, `title`, `description`
- Test with `yarn build` before submitting

### Troubleshooting

**Node.js version error:** `[ERROR] Minimum Node.js version not met`
**Solution:** Use Node.js >= 20.0. Use `nvm use 20` if you have multiple versions.

**Sidebars loading error:** `[ERROR] Sidebars file failed to be loaded`
**Solution:** Run `yarn build` first - this pulls missing auto-generated files.

**Token Registry error:** `[ERROR] Sidebar category Token Registry has no subitem`
**Solution:** Run `yarn build` first - same as above.

## More Ways to Contribute

### Improve Text Content

Fix typos and improve texts, especially if you are a native speaker and have strong writing skills.

### Create Graphics

If you are a talented graphic designer, you can improve various charts and diagrams. We should always use graphics that work well in both light mode and dark mode for the portal. You can also make one graphic for each.

### Blog Contributions

When contributing blog posts, please follow these guidelines:

**Tag naming conventions:**

- Use lowercase tags only (e.g., `ai`, `defi`, `dex`, `dao`)
- Tags must be defined in `blog/tags.yml` before use
- Check existing tags in `blog/tags.yml` before adding new ones

**Truncation markers:**

- Most blog posts should include `<!-- truncate -->` markers for better previews
- **Exception:** Posts tagged with `media` (short video content) should NOT include truncation markers to preserve video visibility in blog listings

### Review Pull Requests

If you have excellent technical understanding and mistakes catch your eye, you can review pull requests. You should have made contributions before and have a GitHub account with some reputation. If you are unsure about if you are a good fit, participating in the active discussions that take place in developer portal github issues/pull requests is always a good place to start to have your name visible.

## Getting Help

- **Technical issues:** [GitHub Issues](https://github.com/cardano-foundation/developer-portal/issues)
- **Content questions:** [GitHub Discussions](https://github.com/cardano-foundation/developer-portal/discussions)
- **Developer community:** [Cardano Forum](https://forum.cardano.org/c/developers/29)
- **Connect with developers:** [Developer community overview](/docs/community/cardano-developer-community)
