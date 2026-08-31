// The /templates/<slug> route id: the examples/templates/<name> directory
// basename from an entry's repoPath. CommonJS on purpose: shared between the
// catalog and plugins/templates-routes (Node), so routes and lookups can't
// diverge.
function templateSlug(repoPath) {
  return String(repoPath).split("/").pop();
}

module.exports = { templateSlug };
