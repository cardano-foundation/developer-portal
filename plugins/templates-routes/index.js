//
// Custom Docusaurus plugin: registers a static route at /templates/<slug> for
// every dApp starter template. Mirrors plugins/tools-routes: it only needs
// slugs, so it reads src/data/templates/templates.js as TEXT and extracts each
// entry's repoPath, then derives the slug from the basename. The TemplateDetail
// component resolves the full template object from the showcase adapter (webpack
// context) by slug at render time.
//

const fs = require("fs");
const path = require("path");

// MUST byte-match templateSlug() in src/data/templates/showcase.js: the slug is
// the examples/templates/<name> directory basename.
function slugFor(repoPath) {
  return String(repoPath).split("/").pop();
}

module.exports = function templatesRoutesPlugin(context) {
  return {
    name: "templates-routes",

    async loadContent() {
      const templatesPath = path.join(
        context.siteDir,
        "src/data/templates/templates.js"
      );
      const source = fs.readFileSync(templatesPath, "utf8");
      // Entry repoPaths only: line-leading horizontal whitespace + `repoPath: "..."`.
      // The how-to comment block uses ` * ` line prefixes and won't match.
      const repoPathRegex = /^[^\S\n]*repoPath:\s*"((?:[^"\\]|\\.)*)"/gm;
      const slugs = [];
      const seen = new Set();
      let m;
      while ((m = repoPathRegex.exec(source)) !== null) {
        const repoPath = m[1].replace(/\\"/g, '"');
        const slug = slugFor(repoPath);
        if (!slug || seen.has(slug)) {
          if (slug && seen.has(slug)) {
            // eslint-disable-next-line no-console
            console.warn(`[templates-routes] duplicate slug "${slug}" - skipping`);
          }
          continue;
        }
        seen.add(slug);
        slugs.push(slug);
      }
      return slugs;
    },

    async contentLoaded({ content, actions }) {
      const { addRoute, createData } = actions;
      const baseUrl = context.baseUrl;
      for (const slug of content) {
        const dataFile = await createData(
          `template-detail-${slug}.json`,
          JSON.stringify(slug)
        );
        addRoute({
          path: `${baseUrl}templates/${slug}`,
          component: "@site/src/components/TemplateDetail",
          modules: { slug: dataFile },
          exact: true,
        });
      }
    },
  };
};
