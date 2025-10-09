# Contributing to the Cardano Developer Portal

First of all, thank you for taking the time to contribute!🎉👍

## Quick Contributions (No Setup Required)

**Fix typos, update links, small edits:**

- Use GitHub's web editor directly on any file
- Click the pencil icon at the end of any page
- Make your changes and submit a pull request

**Report issues or suggest improvements:**

- [Create an issue](https://github.com/cardano-foundation/developer-portal/issues)
- [Start a discussion](https://github.com/cardano-foundation/developer-portal/discussions)

## Add Your Project or Tool

### Add to Project Showcase

- See inline instructions in [src/data/showcases.js](https://github.com/cardano-foundation/developer-portal/blob/staging/src/data/showcases.js)
- Requirements: Live on Cardano mainnet, functional product, stable domain
- Use the "Add Showcase" GitHub PR template

### Add to Builder Tools

- See inline instructions in [src/data/builder-tools.js](https://github.com/cardano-foundation/developer-portal/blob/staging/src/data/builder-tools.js)
- Requirements: Helps Cardano developers, stable domain, functional
- Use the "Add Builder Tool" GitHub PR template

## Local Development (Required for Projects/Tools)

**Installation** (see [README.md](README.md) for full setup):

```bash
# External contributors: fork the repo first, then clone your fork
git clone https://github.com/cardano-foundation/developer-portal.git
cd developer-portal
yarn install
yarn build  # Required at least once
yarn start  # Development server
```

**Before submitting:**

- Run `yarn build` (must complete without errors)
- Don't commit `yarn.lock` changes

## Content Guidelines

**Writing style:**

- Use clear, simple language
- Avoid claims like "the best", "the first", "the only"
- Focus on what your project does, not marketing claims

**Images:**

- Add screenshots/logos to appropriate `/src/data/` folder
- Use `require("./folder/image.png")` syntax

## Pull Request Process

1. **Use appropriate PR template** (showcase, builder tool, or standard change)
2. **Fill out the checklist** in the template
3. **Ensure `yarn build` succeeds** without errors
4. **Wait for review** (requires 3 approvals for showcase/tools)

## FAQ

**Q: I accidentally committed yarn.lock changes, how do I fix it?**  
A: First, restore the original yarn.lock using **one of these** (depending on your git setup):
- If you created your PR branch from staging: `git checkout staging -- yarn.lock`
- If you need it from your fork's origin: `git checkout origin/staging -- yarn.lock`  
- If you need it from the upstream repo: `git checkout upstream/staging -- yarn.lock`

Then commit the reversion: `git commit -m "revert yarn.lock to original state"`

## Need Help?

- **Questions:** [GitHub Discussions](https://github.com/cardano-foundation/developer-portal/discussions)
- **Issues:** [GitHub Issues](https://github.com/cardano-foundation/developer-portal/issues)  
- **Developer Community:** [Cardano Forum](https://forum.cardano.org/c/developers/29)

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - be respectful and collaborative.
