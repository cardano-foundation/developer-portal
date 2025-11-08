---
id: portal-contribute
title: How to contribute to the developer portal
sidebar_label: How to contribute
description: How to contribute to the Cardano developer portal.
image: /img/og/og-developer-portal.png
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

- Link to the [wallet showcase](https://developers.cardano.org/showcase?tags=wallet) when someone asks about Cardano wallets
- Link to the [block explorer showcase](https://developers.cardano.org/showcase?tags=explorer) when they want to know about explorers

## Add Your Project or Tool

### General Submitter Requirements

**For all submissions (projects and tools):**

- Your GitHub account ideally should have some contribution history or be known in the Cardano community
- Brand new GitHub accounts may face additional scrutiny
- All submissions must pass `yarn build` without errors before submission

### Add to Project Showcase

The project showcase is where users discover what can be built on Cardano. It should feature quality projects that demonstrate the ecosystem's capabilities.

**Philosophy:** The showcase is designed to help newcomers to the Cardano ecosystem see what's possible today. We focus on live, functional products on mainnet - not promises, pre-sales, or coming soon pages. We're not trying to map out a future ecosystem, but rather showcase the present reality of what's been built.

**Project Requirements:**

- Live on Cardano mainnet
- Functional product with real use case (not just a concept or idea)
- Stable domain (no temporary/test domains, URL shorteners, or app store links)
- Clear description without marketing claims like "the best", "the first", "the only"
- Must provide unique value distinct from existing showcase items
- Must have sufficient community reputation

**Step-by-Step Process:**

1. **Prepare your project image**
   - Create a PNG or JPG file
   - Name it descriptively (e.g., `your-project-name.png`)

2. **Add your image to the repository**
   - Place it in: `src/data/showcase/your-project-name.png`

3. **Add your project entry**
   - Edit: `src/data/showcases.js`
   - Add your entry to the **END** of the Showcases array
   - Use this format:

   ```javascript
   {
     title: "Your Project Name",
     description: "Brief description of what your project does (avoid 'best/first/only' claims)",
     preview: require("./showcase/your-project-name.png"),
     website: "https://your-project.com",
     source: "https://github.com/your-org/your-project", // or null if not open-source
     tags: ["relevant", "tags"], // see available tags in the file
   }
   ```

4. **Select appropriate tags**

   Available tags include: `wallet`, `dex`, `oracle`, `bridge`, `lending`, `governance`, `marketplace`, `game`, `nftproject`, `educational`, and more.

   **Important:**
   - Do NOT add the `favorite` tag yourself
   - Check `src/data/showcases.js` for the complete list of available tags
   - If your project is open-source, include `opensource` tag AND provide the `source` URL

5. **Test your submission**
   - Run `yarn build` (must complete without errors)
   - Check that your project displays correctly

6. **Submit your pull request**
   - Use the "Add Showcase" GitHub PR template
   - Fill out the checklist in the template

### Add to Builder Tools

Builder tools help Cardano developers build applications. This includes SDKs, libraries, APIs, CLI tools, and other developer tools.

**Tool Requirements:**

- Provides actual value to Cardano developers (SDKs, libraries, APIs, CLI tools, development services)
- Stable domain (no temporary/test domains like random Netlify or Vercel subdomains)
- Functional and accessible
- Clear documentation or getting started guide

**Step-by-Step Process:**

1. **Prepare your tool image**
   - Create a PNG or JPG file
   - Name it descriptively (e.g., `your-tool-name.png`)

2. **Add your image to the repository**
   - Place it in: `src/data/builder-tools/images/your-tool-name.png`

3. **Add your tool entry**
   - Edit: `src/data/builder-tools/tools.js`
   - Add your entry to the **END** of the Showcases array
   - Use this format:

   ```javascript
   {
     title: "Your Tool Name",
     description: "Brief description of what your tool does",
     preview: require("./images/your-tool-name.png"),
     website: "https://your-tool.com",
     getstarted: "https://docs.your-tool.com/getting-started", // or null if no docs
     tags: ["relevant", "tags"], // see available tags in tags.js
   }
   ```

4. **Select appropriate tags**

   **Important:**
   - Do NOT add the `favorite` tag yourself
   - Check `src/data/builder-tools/tags.js` for the complete list of available tags
   - Use multiple relevant tags to help developers find your tool

5. **Test your submission**
   - Run `yarn build` (must complete without errors)
   - Check that your tool displays correctly

6. **Submit your pull request**
   - Use the "Add Builder Tool" GitHub PR template
   - Fill out the checklist in the template

### FAQ

**Q: I don't know how to use GitHub or run `yarn build`. Can I still contribute?**

A: Yes! You can:

- [Open an issue](https://github.com/cardano-foundation/developer-portal/issues) with your project details and someone from the community can help
- [Start a discussion](https://github.com/cardano-foundation/developer-portal/discussions) to get guidance
- Let the community know about your contribution idea in [the forum](https://forum.cardano.org/c/developers/cardano-projects/151)

**Q: How long does it take for my project to be approved?**

A: Pull requests require **3 reviewer approvals**. This typically takes a few days to a week, depending on reviewer availability. After approval, changes are merged to the **staging branch** first (visible at [staging-dev-portal.netlify.app](https://staging-dev-portal.netlify.app)), then later pushed to production. This process causes a small delay between staging and production deployment.

**Q: Can I update my project information later?**

A: Yes! Submit a new pull request with the updates to your project entry.

**Q: My project isn't live on mainnet yet. Can I still add it?**

A: No, showcase projects must be live and functional on Cardano mainnet. However, you can add it once it launches!

**Q: Why was my project or tool rejected?**

A: Common reasons for rejection include:

- **Project not live on mainnet** - Only functional, live products are accepted
- **Insufficient unique value** - Project doesn't provide distinct value compared to existing showcase items
- **Domain issues** - Using temporary hosting domains, URL shorteners, or unstable domains
- **New GitHub account** - Submitter account lacks contribution history or community recognition
- **For NFT projects** - Not meeting criteria for exceptional utility or CNFT Award recognition
- **Incomplete submission** - Missing required fields, broken links, or build errors
- **Marketing-focused description** - Using claims like "the best," "the first," or "the only"

If your submission was rejected, reviewers will typically provide specific feedback in the pull request comments.

**Q: Should I commit yarn.lock changes?**

A: No, never commit `yarn.lock` changes. This file is managed by maintainers. If you accidentally committed it, remove it with: `git checkout staging -- yarn.lock && git commit -m 'revert yarn.lock'`

For more details on the GitHub workflow, see [CONTRIBUTING.md](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md).

## Contributing Documentation

For **content writers and developers** who want to work on documentation, blog posts, or improve existing content.

### Local Development Setup

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

### Project Structure

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
**Solution:** Use Node.js >= 18.0. Use `nvm use 18` if you have multiple versions.

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
- **Connect with developers:** [Developer community overview](/docs/get-started/cardano-developer-community)
