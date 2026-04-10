//
// Generates static/stats.json with aggregate site statistics.
//
// Exposes the builder tools count as a static JSON file so that other
// Cardano ecosystem sites (e.g. cardano.org) can consume it at build
// time without scraping.
//
// Each builder tool requires exactly one image (enforced by validation.js),
// so counting images in the directory is a reliable proxy for the tool count.
//
// Command: yarn build-stats
//

const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'src', 'data', 'builder-tools', 'images');
const outputPath = path.join(__dirname, '..', 'static', 'stats.json');

const count = fs.readdirSync(imagesDir)
  .filter(f => /\.(png|jpe?g)$/i.test(f)).length;

const stats = {
  builderToolsCount: count,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2) + '\n');
console.log(`Generated stats.json with ${count} builder tools`);
