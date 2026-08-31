# dApp starter templates

Runnable Cardano dApp starters, surfaced as a browsable gallery at
[developers.cardano.org/templates](https://developers.cardano.org/templates). Each one is a
self-contained project that connects a wallet, reads a balance, and sends ADA, so a developer can
scaffold a working app in one command and build from there.

Scaffold any template into a new folder:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/<name> my-app
```

## Adding a template

Four steps. The data layer that powers the gallery lives in `src/data/templates/`.

1. **Add the project.** Drop a self-contained app at `examples/templates/<name>/`. It must
   `npm install` and run on its own (no reaching back into the repo root), and `npm run build` must
   pass. If it needs build-config workarounds, document them in the template's own README, the way
   `evolution-vite-react` and `mesh-nextjs` do.
2. **Register it.** Append an entry to `src/data/templates/templates.js` (field reference below).
3. **Extend the taxonomy if needed.** If your `framework`, `sdk`, or `wallet` is not already in
   `src/data/templates/tags.js`, add it there first. The build validation lists the allowed values if
   you miss this.
4. **Validate.** Run `yarn build`. A fail-fast check catches missing or invalid fields and points at
   the problem. Then eyeball `/templates` and `/templates/<name>`.

You never hardcode the slug, the scaffold command, or the GitHub link. All three are derived from
`repoPath` in `src/data/templates/catalog.js`.

## Entry reference

```js
{
  // Required
  title: "Mesh + Next.js",                          // display name
  description: "Connect a wallet, read the balance...", // one sentence
  repoPath: "examples/templates/mesh-nextjs",       // the project folder; drives slug + command + URL
  framework: "nextjs",                              // one id from Frameworks (tags.js)
  sdk: "mesh",                                       // one id from Sdks (tags.js)
  wallet: "mesh",                                    // one id from Wallets (tags.js)

  // Optional
  maintainerPick: true,                             // omit for false; picks sort first and get a badge
}
```

- `framework`, `sdk`, and `wallet` must use ids that exist in `tags.js`. The gallery's
  filters are built from that taxonomy.
- `maintainerPick` marks a curated, featured template. Leave it off for community submissions unless a
  maintainer is featuring it.

## What belongs here

This is a curated set, not a catch-all. A template should be canonical, maintained, and reliable for
newcomers: a clean starting point, not a full product. Anything better suited to its own repository
belongs there. See the [examples README](../README.md) for the wider direction, including the planned
move to a dedicated templates repo if the catalog outgrows this one.
