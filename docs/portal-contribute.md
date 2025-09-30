---
id: portal-contribute
title: How to contribute to the developer portal
sidebar_label: How to contribute
description: How to contribute to the Cardano developer portal.
image: /img/og/og-developer-portal.png
---

:::tip Want to add your project or tool?
**Go to [CONTRIBUTING.md](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md)** to add projects to showcase or builder tools.
:::

This guide is for **content writers and developers** who want to work on documentation.

## Installation

**Requirements:**

- [Node.js](https://nodejs.org/en/download/) >= 18.0 (check with `node -v`)
- [Yarn](https://yarnpkg.com/en/) >= 1.20 (check with `yarn --version`)
- On macOS: Xcode and Command Line Tools

**Setup:**

```bash
# External contributors: fork the repo first, then clone your fork
git clone https://github.com/cardano-foundation/developer-portal.git
cd developer-portal
yarn install
yarn build  # Required at least once - pulls missing files
yarn start  # Development server at http://localhost:3000
```

:::info Development vs Production

- `yarn start` - Fast development with some limitations (blurry images, search issues)
- `yarn build` - Full production build required before submitting PRs

:::

## Project Structure

```bash
developer-portal/
├── docs/              # Documentation content (you'll edit these)
├── blog/              # Developer blog posts  
├── src/data/          # Project showcase and builder tools data
├── static/img/        # Images and assets
├── sidebars.js        # Navigation structure
└── docusaurus.config.js
```

**Key locations:**

- `/docs/` - All documentation content
- `/src/data/showcases.js` - Project showcase data
- `/src/data/builder-tools.js` - Developer tools data
- `/sidebars.js` - Controls documentation navigation

## Writing Content

**Formatting:** See [Style Guide](portal-style-guide.md) for Markdown syntax and Docusaurus components.

**Essential rules:**

- Use `## Level 2` headings as top-level (page title is auto-generated)
- Include frontmatter with `id`, `title`, `description`
- Test with `yarn build` before submitting

## Troubleshooting

### Node.js version error

**Problem:** `[ERROR] Minimum Node.js version not met`  
**Solution:** Use Node.js >= 18.0. Use `nvm use 18` if you have multiple versions.

### Sidebars loading error  

**Problem:** `[ERROR] Sidebars file failed to be loaded`  
**Solution:** Run `yarn build` first - this pulls missing auto-generated files.

### Token Registry error

**Problem:** `[ERROR] Sidebar category Token Registry has no subitem`  
**Solution:** Run `yarn build` first - same as above.

## FAQ

**Q: Should I commit yarn.lock changes?**  
A: No, never commit `yarn.lock` changes. This file is managed by maintainers.

**Q: How to ensure my PR won't break?**  
A: Always run `yarn build` successfully before submitting. It catches more issues than `yarn start`.

**Q: How do I fix committed yarn.lock?**  
A: Remove it with: `git checkout staging -- yarn.lock && git commit -m 'revert yarn.lock'`

## Review Process

- Pull requests need **3 reviewer approvals** for contributions
- Changes merge to **staging branch** first: [staging-dev-portal.netlify.app](https://staging-dev-portal.netlify.app)
- Production deployment happens separately (once per week)

## Getting Help

- **Technical issues:** [GitHub Issues](https://github.com/cardano-foundation/developer-portal/issues)
- **Content questions:** [GitHub Discussions](https://github.com/cardano-foundation/developer-portal/discussions)
- **Developer community:** [Cardano Forum](https://forum.cardano.org/c/developers/29)

---

## Why Contribute to the Developer Portal?

We wanted to build a developer portal as open and inclusive as Cardano. A portal that is in the hands of the Cardano community and can be constantly evolved by it.

### Build Your Reputation

Contributions to the developer portal will give your GitHub name and profile higher visibility as more and more people come across your work online. As visibility increases, so too will the reputation of your name and brand.

### Build Your Confidence  

Creating tutorials and showing fellow community members how to create will not only elevate your knowledge of your own skills and processes, but will also bestow you with greater confidence in your abilities as you interact with others.

Since everything is public, people typically pay greater attention to how well something is written or programmed. This will afford you with an invaluable set of eyes on your contributions that will serve as a crucial peer-reviewed tool to catch errors and refine your work.

### Build Your Resume

Each contribution you make acts as a precious notch on your belt towards career development or job searches within the Cardano ecosystem. It is also a way for people to find examples of your work and verify your abilities. By contributing to open source projects, you will not only gain a lot of valuable experience, but if your profile reaches a certain level of attention and recognition, you are also more likely to get professional opportunities further down the line.

## More Ways to Contribute

### Spread the Word

Often underestimated: spread the word. For example: if someone asks you for Cardano wallets, link to the [wallet showcase](https://developers.cardano.org/showcase?tags=wallet). If they want to know about Cardano block explorers, link to the [block explorer showcase](https://developers.cardano.org/showcase?tags=explorer).

### Create Issues

Creating an issue is the first step to improving the portal. You don't even have to do the improvement yourself. You can think of it as creating a topic in a forum.

An "issue" can be anything from a simple suggestion to a fully elaborated plan with many sub-items and tasks to check off. You can also open an issue to discuss things. Like a public task manager, people can assign tasks to themselves. [Create an issue now](https://github.com/cardano-foundation/developer-portal/issues)

If creating an issue in GitHub is too much for you, please consider opening a topic [on the Cardano Forum](https://forum.cardano.org/c/developers/29) with a title like "Developer Portal Suggestion: your suggestion".

### Improve Text Content

Fix typos and improve texts, especially if you are a native speaker and have strong writing skills.

### Create Graphics

If you are a talented graphic designer, you can improve various charts and diagrams. We should always use graphics that work well in both light mode and dark mode for the portal. You can also make one graphic for each.

### Participate in Discussions

If you think something is wrong or something fundamental should change, discussions are the appropriate start to find consensus. There are always [ongoing discussions](https://github.com/cardano-foundation/developer-portal/discussions) on how to handle or improve something. Please take part in them. Even if you are not a developer, your views are valuable.

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

If you have excellent technical understanding and mistakes catch your eye, you can review pull requests. You should have made contributions before and have a GitHub account with some reputation. [If you are unsure, just participate in the discussions.](#participate-in-discussions)

## Community Connection

### How to Connect with the Developer Community

Cardano developers and stake pool operators spread across many different platforms. [We aim to provide a complete overview.](/docs/get-started/cardano-developer-community)

If you are interested in connecting with people from the Developer Portal, [open a thread in the forum](https://forum.cardano.org/c/developers/29).

### Review Process Details

Pull requests must be approved by **three reviewers** to be merged. They are always merged into the **staging branch** first. [staging-dev-portal.netlify.app](https://staging-dev-portal.netlify.app) reflects the state of the current staging branch.

Later, the changes are pushed from staging to the main branch. This requires another pull request. (For this reason, there is always a small delay between staging and production).
