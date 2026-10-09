# Templates: where the data lives

The gallery at [developers.cardano.org/templates](https://developers.cardano.org/templates) is driven by
this data layer. The add-a-template guide (entry format, taxonomy, validation) lives in
`examples/templates/README.md`, next to the templates themselves.

- `src/data/templates/templates.js`, the entries: one per starter in `examples/templates/`.
- `src/data/templates/tags.js`, the taxonomy: `Frameworks`, `Sdks`, `Wallets`.
- `src/data/templates/validation.js`, build-time fail-fast checks.
- `src/data/templates/slug.js`, the `/templates/<slug>` derivation, shared with `plugins/templates-routes`
  so generated routes and detail-page lookups can't diverge.
- `src/data/templates/catalog.js`, the component-facing adapter: derives the slug, the scaffold command,
  and the GitHub URL from `repoPath`.
- `src/data/templates.js`, the entry point: validates every entry at build and exports the sorted list.
- `src/pages/templates/index.js`, the `/templates` page; `plugins/templates-routes/` generates a static
  `/templates/<slug>` route per entry, rendered by `src/components/TemplateDetail/`.

Data flow: `templates.js` (entries) -> `templates.js` entry point (validate + sort) -> `catalog.js`
(adapter) -> page.
