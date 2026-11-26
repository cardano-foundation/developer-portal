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
// frontmatter, so no path list needs maintaining.
//
// It also handles number prefixes. Docusaurus drops them from the URL
// (`9-frontend-integration.md` is served at `/frontend-integration/`), but the plugin keeps
// them in the file name. Such a file moves to the unnumbered path, but only when the page is
// there: a doc whose `id:` keeps the number (the IoT workshops) keeps it in its URL too.
// Pages are found as `<route>/index.html`, which relies on `trailingSlash: true`.
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

// Every .md file under `dir`.
function listMarkdown(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdown(abs);
    return entry.name.endsWith('.md') ? [abs] : [];
  });
}

const hasPage = (mdAbs) => fs.existsSync(path.join(mdAbs.replace(/\.md$/, ''), 'index.html'));
const withoutNumbers = (rel) => rel.replace(/(^|\/)\d+[-_.]+/g, '$1');

// [where the plugin wrote it, where its page is] for every numbered doc served without its
// number. Read from the sources, so a rerun after the move finds the same pairs.
function numberedDocs() {
  return listMarkdown(DOCS_SRC)
    .map((abs) => path.relative(DOCS_SRC, abs).split(path.sep).join('/'))
    .map((rel) => [path.join(DOCS_BUILD, rel), path.join(DOCS_BUILD, withoutNumbers(rel))])
    .filter(([from, to]) => from !== to && !hasPage(from) && hasPage(to));
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

function main() {
  if (!fs.existsSync(BUILD)) {
    throw new Error('no build/ directory; run `yarn build` first (this script patches the built site)');
  }
  let moved = 0;
  const replacements = []; // [oldUrlPath, newUrlPath] for llms.txt
  for (const slug of collectSlugs(DOCS_SRC)) {
    const toAbs = path.join(DOCS_BUILD, slug + '.md');
    const candidates = [
      path.join(BUILD, slug + '.md'), // shape 1: outside build/docs
      path.join(DOCS_BUILD, slug, path.posix.basename(slug) + '.md'), // shape 2: doubled
    ];
    const fromAbs = candidates.find((c) => fs.existsSync(c));
    if (fromAbs) {
      fs.mkdirSync(path.dirname(toAbs), { recursive: true });
      fs.renameSync(fromAbs, toAbs);
      cleanupEmptyDirs(path.dirname(fromAbs));
      moved++;
    } else if (!fs.existsSync(toAbs)) {
      warn(`No generated markdown found for slug "/${slug}/" (the doc may be excluded from llms generation, or the plugin's output shape changed).`);
      continue;
    }
    // Rewrite both possible old URLs whether the move happened this run or an
    // earlier one, so an interrupted run heals on the next pass; a pattern no
    // longer present in llms.txt simply matches nothing.
    for (const c of candidates) replacements.push(['/' + buildRel(c), '/' + buildRel(toAbs)]);
  }

  for (const [fromAbs, toAbs] of numberedDocs()) {
    if (fs.existsSync(fromAbs)) {
      fs.mkdirSync(path.dirname(toAbs), { recursive: true });
      fs.renameSync(fromAbs, toAbs);
      cleanupEmptyDirs(path.dirname(fromAbs));
      moved++;
    }
    replacements.push(['/' + buildRel(fromAbs), '/' + buildRel(toAbs)]);
  }

  // Any .md left without a page would make its "Copy page" button 404.
  for (const file of listMarkdown(DOCS_BUILD)) {
    if (file !== path.join(DOCS_BUILD, 'index.md') && !hasPage(file)) {
      warn(`${buildRel(file)} has no page at its path, so "Copy page" would 404.`);
    }
  }

  rewriteLlmsUrls(replacements);

  console.log(`[fix-llms-paths] Relocated ${moved} .md file(s) and updated llms.txt`);
  if (warnings.length) {
    console.warn(`[fix-llms-paths] ${warnings.length} warning(s):`);
    for (const w of warnings) console.warn(`  - ${w}`);
    // A warning means llms.txt would ship stale URLs; fail the build instead.
    process.exitCode = 1;
  }
}

try {
  main();
} catch (err) {
  console.error('[fix-llms-paths]', err);
  process.exitCode = 1;
}
