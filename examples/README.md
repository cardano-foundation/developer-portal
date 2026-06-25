# Examples

Runnable, self-contained code that lives in the repo alongside the documentation it supports.
These are not documentation pages; Docusaurus does not serve this folder to readers. It is the
working source behind the portal: code you can clone, run, and learn from, kept in the same place
as the rest of what a Cardano developer needs.

Keeping the canonical, working code here, next to the docs that explain it, lets the portal cover
building on Cardano in one place rather than pointing elsewhere.

## Structure

Each example is a self-contained project. It carries its own dependencies (`package.json`,
`aiken.toml`, or whatever the stack requires) and its own run steps, and it runs without reaching
back into the repo root. This keeps each example easy to maintain in isolation and easy to copy
out, and it leaves future options open (see below) without committing to any of them now.

## What's here

- `bootcamp/`: companion code for the bootcamp lessons, one folder per lesson
  (`01-wallet-send-lovelace` through `10-web3-services`). Each folder backs a lesson in the docs
  and runs on its own.
- `templates/`: runnable dApp starter templates, one per SDK (`evolution-vite-react`,
  `mesh-nextjs`). Each is the same minimal app, connect a wallet, show the balance, send ADA,
  and backs the [Build your first dApp](https://developers.cardano.org/docs/developers/curriculum/dapps/your-first-dapp)
  walkthrough. Start a project from one with `giget` (see Direction below).

More categories will be added over time.

## Direction

This folder is intended to grow into the home for practical, runnable material for Cardano
developers:

- Workshop materials referenced by content in the portal.
- More starter templates for common stacks (the first two, Evolution + Vite and Mesh + Next.js, are in
  `templates/`); for example an x402 starter, or other client SDKs and frameworks.
- A curated catalog of canonical get-started projects, surfaced the same way as builder tools.

Templates live as self-contained subdirectories (for example `examples/templates/<name>/`).
A project is started from one with `giget` or `degit`, which fetch a single subdirectory from a
repository:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/<name> my-app
```

A "Use this template" control on a future templates listing (the builder tools pattern) would
surface this command. GitHub's built-in "Use this template" only works on whole repositories, not
a subfolder, so it is not used here.

Hosting templates in this repo is the zero-setup starting point. The tradeoff is that `giget` and
`degit` download the whole-repo tarball to extract one subdirectory, and template versioning, CI,
and contributions share the docs repo. If that cost grows, or templates need independent releases
or their own build checks (see issue #1738), they can move to a dedicated
`cardano-foundation/templates` repo using the same command with a different path. The bootcamp
examples stay here regardless, since they are documentation companions rather than templates.

## Curation

This folder is curated, not a catch-all. What lives here should be canonical, maintained, and
reliable for newcomers. Content is selected deliberately rather than added by default; anything
better suited to its own repository belongs there.

## Maintenance

Examples are verified manually for now. Automated checks that keep them working as the protocol
and tooling evolve are a planned next step, tracked as part of the broader onboarding work
in #1738.
