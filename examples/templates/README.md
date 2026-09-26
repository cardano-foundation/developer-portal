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

This is a curated set, not a catch-all. A template is the smallest app that does one thing correctly
and safely: a clean starting point, not a full product. Anything better suited to its own repository
belongs there. See the [examples README](../README.md) for the wider direction, including the planned
move to a dedicated templates repo if the catalog outgrows this one.

### Quality bar

A template must be correct and safe for what it does. Everything beyond that is named in its README,
not built.

**Required**

- A `ci` script (`npm run ci`) that type-checks and builds. CI runs `npm install && npm run ci` on
  every pull request that touches the template, and weekly for all of them. A linter is the
  developer's choice; keep one only if the framework ships it.
- No secret reaches the browser. A provider key stays behind a server route or is not used at all.
  `.env.example` holds placeholders only, and `.env` is git-ignored.
- ADA converts to exact lovelace: round, never truncate (`1.005 * 1e6` is `1004999.999…` in
  floating point).
- The network is explicit and defaults to a testnet. The recipient address and the wallet must match
  it (CIP-30 only tells mainnet from testnet, so the README says so), and mainnet asks for
  confirmation before signing.
- Errors reach the user, including a rejection in the wallet.
- Cardano SDKs, pre-1.0 packages, and anything the build config depends on (such as `next`) are
  pinned to exact versions; other dependencies use `^` ranges. No lockfile is committed: the
  developer's first `npm install` creates one, and the README says to commit it. `package.json`
  declares `engines`.
- A template that signs or moves funds says in its README what it can sign or send, which actions
  need the user's approval, and how to revoke access or rotate its keys. Nothing moves funds without
  a deliberate user action.
- The README says what the template does, how to run it, and lists under "Going to production" what
  it leaves out on purpose.

**Expected**

- TypeScript in strict mode.
- Network and provider settings in one config module.
- Basic accessibility: labelled inputs, a visible focus state, errors announced to screen readers.

**Out of scope**

These belong in the app a developer builds from the template. List them under "Going to production"
instead of building them:

- Test suites. The build and type-check are the bar.
- Rate limiting, authentication, monitoring, analytics.
- State-management libraries, UI kits, internationalisation.
- Cosmetic polish.
