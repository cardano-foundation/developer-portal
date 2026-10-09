// The /tools/<slug> route id, derived from the tool title. CommonJS on
// purpose: plugins/tools-routes runs in Node and can't import the ESM
// modules, so this is the one implementation both it and the catalog share,
// and routes and lookups can't diverge.
function slugify(title) {
  return String(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = { slugify };
