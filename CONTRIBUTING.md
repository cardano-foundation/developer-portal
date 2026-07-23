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

Don't set `maintainerPick` yourself (maintainers choose those). Categories and properties are defined in `src/data/builder-tools/tags.js`. For the full guide, including what belongs here and how tools are curated, see the [portal contribution guide](https://developers.cardano.org/docs/contribute/portal-contribute/).

## Embedding code from real examples

When a tutorial shows code, embed it from a real, runnable example under `examples/` instead of pasting a copy into the page. That way the snippet on the page is the exact code that gets built and tested, so it can't drift out of date.

Mark the part of the file you want to show with plain `// #region NAME` / `// #endregion NAME` comments. They're just comments, so the example still runs and is still tested:

```ts
// example source file
export function build() {
  // #region build
  const tx = new Transaction();
  tx.sendLovelace(address, "2000000");
  // #endregion build
  return tx;
}
```

Then pull that region into an `.mdx` page with the `extractRegion` helper. The file is imported as raw text via `raw-loader`, and `extractRegion` returns the lines between the markers (trimmed, with indentation normalized):

```mdx
import CodeBlock from "@theme/CodeBlock";
import extractRegion from "@site/src/utils/extractRegion";
import Source from "!!raw-loader!@site/examples/path/to/file.ts";

<CodeBlock language="ts">{extractRegion(Source, "build")}</CodeBlock>
```

If the named region doesn't exist, the build fails with `extractRegion: region "..." not found`, so a renamed or deleted region is caught at build time rather than silently showing nothing.

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
