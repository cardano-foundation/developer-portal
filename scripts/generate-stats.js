//
// Generates static/stats.json with aggregate site statistics.
//
// Exposes the builder tools count as a static JSON file so that other
// Cardano ecosystem sites (e.g. cardano.org) can consume it at build
// time without scraping.
//
// Command: yarn build-stats
//

const fs = require('fs');
const path = require('path');

const toolsPath = path.join(__dirname, '..', 'src', 'data', 'builder-tools', 'tools.js');
const outputPath = path.join(__dirname, '..', 'static', 'stats.json');

// One entry-level `title: "..."` line per catalogue entry, matched with the
// same pattern tools-routes uses (the plugin additionally dedupes slugs, so
// this count is the number of entries, not routes). The how-to comment block
// uses ` * ` line prefixes and is not counted.
let source;
try {
  source = fs.readFileSync(toolsPath, 'utf8');
} catch (e) {
  throw new Error(`generate-stats: could not read src/data/builder-tools/tools.js (${e.message})`, { cause: e });
}
const count = (source.match(/^[^\S\n]*title:\s*"(?:[^"\\]|\\.)*"/gm) || []).length;
if (count === 0) {
  throw new Error('generate-stats: counted 0 builder tools; the title-line pattern no longer matches tools.js');
}

const stats = {
  builderToolsCount: count,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2) + '\n');
console.log(`Generated stats.json with ${count} builder tools`);
