# Contributing to the Cardano Developer Portal

Contributions generally fall into three categories: fixing content (typos, broken links, outdated information), adding developer tools to the [Builder Tools](https://developers.cardano.org/tools/) showcase, and writing new documentation or tutorials.

For small fixes, you can always use the GitHub web editor directly on any file or click the pencil icon at the bottom on portal pages without any setup.

For anything that needs a local build, see the [local development setup](./README.md#contribute) in the README.

## Adding a builder tool

This is the most common external contribution. You'll add an image, a tool entry, and open a PR:

1. Place your tool's logo or screenshot (PNG or JPG) in `src/data/builder-tools/images/`.
2. Edit `src/data/builder-tools/tools.js` and add your entry at the **end** of the `Showcases` array:
   ```js
   {
     title: "Your Tool Name",
     description: "What it does",
     preview: require("./images/your-tool-name.png"),
     website: "https://your-tool.com",
     getstarted: "https://docs.your-tool.com/getting-started", // or null
     tags: ["relevant", "tags"],  // see tags.js for the full list
   }
   ```
3. Run `yarn build` and confirm it passes with no errors.
4. Open a pull request using the "Add Builder Tool" template. Builder tool PRs require 3 approvals.

Don't add the `favorite` tag yourself. Check `src/data/builder-tools/tags.js` for available tags. For a full walkthrough, see the [portal contribution guide](https://developers.cardano.org/docs/portal-contribute/).

## Before you open a PR

- Run `yarn build` and make sure it passes. It checks for broken links and validates builder tool entries.
- Don't commit `yarn.lock`. It's gitignored. If you accidentally commit it, see the FAQ below.
- Follow the [style guide](https://developers.cardano.org/docs/portal-style-guide/). Write clearly, describe what your project does, skip the marketing language.

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
