👋 Hello there! Welcome. Please follow the steps below to tell us about your contribution.

1. Please complete a Checklist
2. Fill in all sections of the template
3. Click "Create pull request"

## Checklist

 <-- Please fill the boxes with [x] before submitting a pull request --> 

- [ ] I have read the [Contributing Guidelines](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md).
- [ ] I have read the [Builder Tool Requirements](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md#adding-a-builder-tool)
- [ ] I have run `yarn build` after adding my changes **without getting any errors**.
- [ ] I have not committed any changes to `yarn.lock` (or have [removed these changes](https://github.com/cardano-foundation/developer-portal/blob/staging/CONTRIBUTING.md#faq)).

## Builder Tool addition

<-- Provide information for every bullet below. Category + properties must match your changes to tools.js (full definitions in src/data/builder-tools/tags.js). -->

* Title: *The project's own name, styled how the project styles it (don't add descriptors/parentheticals or re-case it)*
* Description: *One or two factual sentences ending with a period; no superlatives; say what it does and how it differs from similar tools*
* Category (pick exactly ONE): `smart-contracts` | `sdk` | `api` | `indexer` | `node` | `node-access` | `wallet` | `dev-env` | `testing` | `operations` | `governance` | `integration`
* Properties (language + interface):
  * Language: `typescript` `javascript` `python` `rust` `haskell` `java` `net` `golang` `scala` `c` `purescript` `elm` `php` `swift`
  * Interface: `rest` `graphql` `grpc` `websocket`
* Website: <link to the tool's home page>
* Repository: <link to your public source repo, or `null` for a closed/hosted service>
* Docs: <link to docs / get-started page, or `null`>
