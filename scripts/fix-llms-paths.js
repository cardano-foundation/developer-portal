// Post-build patch for docusaurus-plugin-llms slug bug.
//
// docusaurus-plugin-llms v0.4.0 generates `.md` siblings at paths derived from
// `slug:` frontmatter, but doesn't account for `routeBasePath: 'docs'`. So for
// docs with `slug:`, appending `.md` to the rendered URL returns 404 because
// the file lives at a different path than the page.
//
// This script moves the misplaced `.md` files to their URL-aligned location
// and rewrites the URLs inside `llms.txt` and `llms-full.txt`.
//
// Remove this script and its `build` step wiring once upstream is fixed.
// Tracking issue: https://github.com/cardano-foundation/developer-portal/issues/1791

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');

// Each entry: [pluginOutputPath, urlAlignedPath] relative to build/
//
// Two patterns produce misaligned `.md`:
//   (1) `slug:` frontmatter — page URL differs from source path.
//   (2) Filename matches parent dir name (e.g. `foo/bar/bar.md`) —
//       Docusaurus collapses the URL to `/docs/foo/bar/`.
//
// Update if you add new docs of either pattern and the plugin is still
// broken upstream.
const moves = [
  // (1) slug: frontmatter
  ['learn/core-concepts.md',                                          'docs/learn/core-concepts.md'],
  ['docs/operate-a-stake-pool/operate-a-stake-pool.md',               'docs/operate-a-stake-pool.md'],
  ['docs/governance/governance.md',                                   'docs/governance.md'],
  ['governance/cardano-governance/governance-model.md',               'docs/governance/cardano-governance/governance-model.md'],
  ['governance/cardano-governance/submitting-governance-actions.md',  'docs/governance/cardano-governance/submitting-governance-actions.md'],
  ['governance/cardano-governance/constitutional-committee-guide.md', 'docs/governance/cardano-governance/constitutional-committee-guide.md'],
  ['governance/cardano-governance/governance-actions.md',             'docs/governance/cardano-governance/governance-actions.md'],
  ['smart-contracts/lessons.md',                                      'docs/smart-contracts/lessons.md'],
  ['docs/get-started/get-started.md',                                 'docs/get-started.md'],
  // (2) filename matches parent dir name
  ['docs/governance/cardano-governance/cardano-governance.md',     'docs/governance/cardano-governance.md'],
  ['docs/learn/cardano-cli/simple-scripts/simple-scripts.md',      'docs/learn/cardano-cli/simple-scripts.md'],
  ['docs/learn/cardano-cli/native-assets/native-assets.md',        'docs/learn/cardano-cli/native-assets.md'],
  ['docs/learn/cardano-cli/plutus-scripts/plutus-scripts.md',      'docs/learn/cardano-cli/plutus-scripts.md'],
];

function moveFile(fromAbs, toAbs) {
  if (!fs.existsSync(fromAbs)) {
    throw new Error(`Expected plugin output missing: ${path.relative(ROOT, fromAbs)} — plugin behavior may have changed, update scripts/fix-llms-paths.js`);
  }
  if (fs.existsSync(toAbs)) {
    throw new Error(`Destination already exists: ${path.relative(ROOT, toAbs)}`);
  }
  fs.mkdirSync(path.dirname(toAbs), { recursive: true });
  fs.renameSync(fromAbs, toAbs);
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

function rewriteLlmsTxt(replacements) {
  for (const filename of ['llms.txt', 'llms-full.txt']) {
    const filePath = path.join(BUILD, filename);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [oldUrlPath, newUrlPath] of replacements) {
      // URLs in llms.txt look like https://developers.cardano.org/learn/core-concepts.md
      // Replace by suffix match so we don't have to hardcode the host.
      const oldSuffix = '/' + oldUrlPath;
      const newSuffix = '/' + newUrlPath;
      // Escape regex metachars in the suffix
      const escaped = oldSuffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      content = content.replace(new RegExp(escaped + '(?=[):\\s])', 'g'), newSuffix);
    }
    fs.writeFileSync(filePath, content);
  }
}

function main() {
  let moved = 0;
  for (const [from, to] of moves) {
    const fromAbs = path.join(BUILD, from);
    const toAbs = path.join(BUILD, to);
    moveFile(fromAbs, toAbs);
    cleanupEmptyDirs(path.dirname(fromAbs));
    moved++;
  }
  rewriteLlmsTxt(moves);
  console.log(`[fix-llms-paths] Moved ${moved} slug-affected .md files to URL-aligned paths and updated llms.txt`);
}

main();
