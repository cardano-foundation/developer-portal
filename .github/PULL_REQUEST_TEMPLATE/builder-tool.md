Thanks for contributing a tool. Complete the checklist, fill in every field below, and create the pull request.

## Checklist

<!-- Fill the boxes with [x] before submitting a pull request -->

- [ ] I have read the [Contributing Guidelines](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md).
- [ ] I have read the [Builder Tool Requirements](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md#adding-a-builder-tool).
- [ ] I have run `yarn build` after adding my changes **without getting any errors**.
- [ ] I have not committed any changes to `yarn.lock` (or have [removed these changes](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md#faq)).

## Builder Tool addition

<!-- Provide information for every bullet below. Category + properties must match your changes to tools.js. The valid values are defined in src/data/builder-tools/tags.js (the source of truth); field conventions are in CONTRIBUTING.md#adding-a-builder-tool. -->

* Title: *The project's own name, styled how the project styles it (don't add descriptors/parentheticals or re-case it)*
* Description: *One or two factual sentences ending with a period; no superlatives; say what it does and how it differs from similar tools*
* Category: *exactly ONE id from [`tags.js`](https://github.com/cardano-foundation/developer-portal/blob/staging/src/data/builder-tools/tags.js)*
* Properties: *language + interface ids from [`tags.js`](https://github.com/cardano-foundation/developer-portal/blob/staging/src/data/builder-tools/tags.js)*
* Website: <link to the tool's home page>
* Repository: <link to your public source repo, or `null` for a closed/hosted service>
* Docs: <link to docs / get-started page, or `null`>
