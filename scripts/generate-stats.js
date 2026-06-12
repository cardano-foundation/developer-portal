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

// One entry-level `title:` line (4-space indent) per tool; the how-to comment
// block uses a ` * ` prefix and is not counted.
const count = (fs.readFileSync(toolsPath, 'utf8').match(/^ {4}title: "/gm) || []).length;

const stats = {
  builderToolsCount: count,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2) + '\n');
console.log(`Generated stats.json with ${count} builder tools`);
