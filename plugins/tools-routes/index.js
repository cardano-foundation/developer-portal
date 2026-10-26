//
// Custom Docusaurus plugin: registers a static route at /tools/<slug> for every
// builder tool. src/data/builder-tools/tools.js is an ES module (the site bundle
// imports it), so Node can't `require` it. It holds plain data only, no imports,
// so the plugin evaluates the array in a sandbox instead. Keep it that way: an
// import or require() in tools.js breaks this loader. The ToolDetail component
// resolves the full tool object from the catalog by slug at render time.
//

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const sharp = require("sharp");

// Shared with src/data/builder-tools/catalog.js, so a generated route and
// ToolDetail's lookup can't diverge.
const { slugify } = require("../../src/data/builder-tools/slug");

// Screenshot files live in static/ and are referenced from tools.js by path.
// validation.js checks the entry shape in the bundle, but only Node can see
// the files, so existence and size are checked here, in start and build alike.
// Target: 2048px wide at most, WebP quality 80 (cwebp -q 80 -m 6 in.png -o out.webp).
const SCREENSHOT_MAX_BYTES = 500 * 1024;

function loadTools(toolsPath) {
  let source;
  try {
    source = fs.readFileSync(toolsPath, "utf8");
  } catch (e) {
    throw new Error(
      `tools-routes: could not read src/data/builder-tools/tools.js (${e.message})`,
      { cause: e }
    );
  }
  const code = source.replace(/^export const BuilderTools\s*=/m, "BuilderTools =");
  const sandbox = {};
  try {
    vm.runInNewContext(code, sandbox, { filename: toolsPath });
  } catch (e) {
    throw new Error(
      `tools-routes: could not evaluate tools.js, it must stay plain data (${e.message})`,
      { cause: e }
    );
  }
  if (!Array.isArray(sandbox.BuilderTools) || sandbox.BuilderTools.length === 0) {
    throw new Error("tools-routes: tools.js no longer exports a BuilderTools array");
  }
  return sandbox.BuilderTools;
}

// Checks each referenced file and returns its pixel size, which ToolDetail sets
// on the <img> so the page doesn't shift when a lazy screenshot loads.
async function measureScreenshots(siteDir, tool, problems) {
  const sizes = [];
  for (const shot of tool.screenshots || []) {
    const file = path.join(siteDir, "static", shot.src);
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (!stat) {
      problems.push(`${tool.title}: ${shot.src} is missing from static/`);
      sizes.push(null);
      continue;
    }
    if (stat.size > SCREENSHOT_MAX_BYTES) {
      problems.push(
        `${tool.title}: ${shot.src} is ${Math.round(stat.size / 1024)} KB, the limit is ${SCREENSHOT_MAX_BYTES / 1024} KB`
      );
    }
    const { width, height } = await sharp(file).metadata();
    sizes.push({ width, height });
  }
  return sizes;
}

module.exports = function toolsRoutesPlugin(context) {
  return {
    name: "tools-routes",

    async loadContent() {
      const tools = loadTools(
        path.join(context.siteDir, "src/data/builder-tools/tools.js")
      );
      const routes = [];
      const seen = new Set();
      const problems = [];
      for (const tool of tools) {
        const slug = slugify(tool.title);
        if (!slug || seen.has(slug)) {
          if (slug && seen.has(slug)) {
            // eslint-disable-next-line no-console
            console.warn(`[tools-routes] duplicate slug "${slug}", skipping`);
          }
          continue;
        }
        seen.add(slug);
        const screenshotSizes = await measureScreenshots(
          context.siteDir,
          tool,
          problems
        );
        routes.push({ slug, screenshotSizes });
      }
      if (problems.length > 0) {
        throw new Error(`tools-routes: screenshot problems:\n- ${problems.join("\n- ")}`);
      }
      return routes;
    },

    async contentLoaded({ content, actions }) {
      const { addRoute, createData } = actions;
      const baseUrl = context.baseUrl;
      for (const { slug, screenshotSizes } of content) {
        const slugFile = await createData(
          `tool-detail-${slug}.json`,
          JSON.stringify(slug)
        );
        const sizesFile = await createData(
          `tool-detail-${slug}-screenshots.json`,
          JSON.stringify(screenshotSizes)
        );
        addRoute({
          path: `${baseUrl}tools/${slug}`,
          component: "@site/src/components/ToolDetail",
          modules: { slug: slugFile, screenshotSizes: sizesFile },
          exact: true,
        });
      }
    },
  };
};
