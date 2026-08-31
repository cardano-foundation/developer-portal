//
// Custom Docusaurus plugin: registers a static route at /tools/<slug> for every
// builder tool. The plugin only needs slugs, so it reads src/data/builder-tools/tools.js
// as TEXT and extracts the entry titles (it can't `require` that module — it contains
// webpack `require(png)` image refs). The ToolDetail component resolves the full tool
// object from the showcase adapter (webpack context) by slug at render time.
//

const fs = require("fs");
const path = require("path");

// MUST byte-match slugify() in src/data/builder-tools/showcase.js, otherwise
// ToolDetail won't find the tool for a generated route.
function slugify(title) {
  return String(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = function toolsRoutesPlugin(context) {
  return {
    name: "tools-routes",

    async loadContent() {
      const toolsPath = path.join(
        context.siteDir,
        "src/data/builder-tools/tools.js"
      );
      let source;
      try {
        source = fs.readFileSync(toolsPath, "utf8");
      } catch (e) {
        throw new Error(
          `tools-routes: could not read src/data/builder-tools/tools.js (${e.message})`,
          { cause: e }
        );
      }
      // Entry titles only: line-leading horizontal whitespace + `title: "..."`.
      // The how-to comment block uses ` * ` line prefixes and won't match.
      const titleRegex = /^[^\S\n]*title:\s*"((?:[^"\\]|\\.)*)"/gm;
      const slugs = [];
      const seen = new Set();
      let m;
      while ((m = titleRegex.exec(source)) !== null) {
        const title = m[1].replace(/\\"/g, '"');
        const slug = slugify(title);
        if (!slug || seen.has(slug)) {
          if (slug && seen.has(slug)) {
            // eslint-disable-next-line no-console
            console.warn(`[tools-routes] duplicate slug "${slug}" — skipping`);
          }
          continue;
        }
        seen.add(slug);
        slugs.push(slug);
      }
      if (slugs.length === 0) {
        throw new Error(
          "tools-routes: found no tool entries in tools.js; the entry pattern no longer matches"
        );
      }
      return slugs;
    },

    async contentLoaded({ content, actions }) {
      const { addRoute, createData } = actions;
      const baseUrl = context.baseUrl;
      for (const slug of content) {
        const dataFile = await createData(
          `tool-detail-${slug}.json`,
          JSON.stringify(slug)
        );
        addRoute({
          path: `${baseUrl}tools/${slug}`,
          component: "@site/src/components/ToolDetail",
          modules: { slug: dataFile },
          exact: true,
        });
      }
    },
  };
};
