// Post-build patch for docusaurus-plugin-llms and `slug:` frontmatter.
//
// docusaurus-plugin-llms (v0.4.0) generates a raw `.md` sibling for each doc so that
// appending `.md` to a page URL returns its Markdown (used by the "Copy page" button and
// "View as Markdown" link in src/components/CopyMarkdownActions). For docs with `slug:`
// frontmatter it ignores `routeBasePath: 'docs'` and the slug's directory shape, so the file
// lands somewhere other than `<route>.md` and the fetch 404s. Two shapes are produced:
//
//   1. OUTSIDE build/docs at `build/<slug>.md`              (e.g. the IoT workshop overviews)
//   2. doubled UNDER build/docs at `build/docs/<slug>/<basename>.md`   (e.g. /operators/, /developers/)
//
// This script relocates those to the URL-aligned `build/docs/<slug>.md` and rewrites the
// matching URLs inside `llms.txt` / `llms-full.txt`. Slug docs are discovered by scanning
// frontmatter, so no path list needs maintaining. (Docs without `slug:` already emit at their
// route, since the curriculum folders carry no number prefixes.)
//
// Remove this script and its `build` step wiring once upstream honours routeBasePath + slug.
// Tracking issue: https://github.com/cardano-foundation/developer-portal/issues/1791

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const DOCS_BUILD = path.join(BUILD, 'docs'); // routeBasePath is the default 'docs'
const DOCS_SRC = path.join(ROOT, 'docs');

const warnings = [];
const warn = (msg) => warnings.push(msg);
const buildRel = (abs) => path.relative(BUILD, abs).split(path.sep).join('/');

// Collect every absolute `slug:` declared in the docs frontmatter, normalized to a path with
// no surrounding slashes (e.g. `operators`, `developers/curriculum/dapps/iot/the-basics`).
function collectSlugs(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSlugs(abs, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const fm = fs.readFileSync(abs, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fm) continue;
      const line = fm[1].split(/\r?\n/).find((l) => /^slug:\s*\//.test(l)); // absolute slugs only
      if (!line) continue;
      const value = line.replace(/^slug:\s*/, '').trim().replace(/^['"]|['"]$/g, ''); // drop key + quotes
      out.push(value.replace(/^\/+|\/+$/g, '')); // store without surrounding slashes
    }
  }
  return out;
}

function cleanupEmptyDirs(startAbs) {
  let dir = startAbs;
  while (dir.startsWith(BUILD) && dir !== BUILD) {
    if (!fs.existsSync(dir)) { dir = path.dirname(dir); continue; }
    if (fs.readdirSync(dir).length > 0) break;
    fs.rmdirSync(dir);
    dir = path.dirname(dir);
  }
}

// Point the plugin's llms.txt / llms-full.txt URLs at the relocated files. Each replacement
// is anchored right after the host (the `https://host` capture) so a short path can never
// match inside a longer URL.
function rewriteLlmsUrls(replacements) {
  for (const filename of ['llms.txt', 'llms-full.txt']) {
    const filePath = path.join(BUILD, filename);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [oldUrlPath, newUrlPath] of replacements) {
      const escaped = oldUrlPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const urlPattern = new RegExp('(https?://[^/\\s)]+)' + escaped + '(?=[):\\s]|$)', 'g');
      content = content.replace(urlPattern, '$1' + newUrlPath);
    }
    fs.writeFileSync(filePath, content);
  }
}

let moved = 0;
const replacements = []; // [oldUrlPath, newUrlPath] for llms.txt
for (const slug of collectSlugs(DOCS_SRC)) {
  const toAbs = path.join(DOCS_BUILD, slug + '.md');
  if (fs.existsSync(toAbs)) continue; // already aligned
  const fromAbs = [
    path.join(BUILD, slug + '.md'), // shape 1: outside build/docs
    path.join(DOCS_BUILD, slug, path.posix.basename(slug) + '.md'), // shape 2: doubled
  ].find((c) => fs.existsSync(c));
  if (!fromAbs) {
    warn(`No generated markdown found for slug "/${slug}/" (plugin output may have changed).`);
    continue;
  }
  const oldUrlPath = '/' + buildRel(fromAbs);
  fs.mkdirSync(path.dirname(toAbs), { recursive: true });
  fs.renameSync(fromAbs, toAbs);
  cleanupEmptyDirs(path.dirname(fromAbs));
  replacements.push([oldUrlPath, '/' + buildRel(toAbs)]);
  moved++;
}

rewriteLlmsUrls(replacements);

console.log(`[fix-llms-paths] Relocated ${moved} slug-affected .md file(s) and updated llms.txt`);
if (warnings.length) {
  console.warn(`[fix-llms-paths] ${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  - ${w}`);
}
