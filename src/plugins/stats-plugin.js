const fs = require('fs');
const path = require('path');

/**
 * Docusaurus plugin that generates /stats.json at build time.
 *
 * The file exposes aggregate site statistics (e.g. builder-tools count)
 * so that external sites like cardano.org can fetch them without scraping.
 *
 * Currently the only data source is builder-tools, but the plugin is
 * designed to be extended with additional stats (e.g. documentation page
 * count) as needs arise.
 *
 * Why count image files instead of importing the tools array?
 * tools.js uses ES module syntax with webpack-style require() for images,
 * which cannot be evaluated in the plain Node.js context of postBuild.
 * Each builder tool requires exactly one image (enforced by validation.js),
 * so counting images in the directory is a reliable proxy.
 */
module.exports = function statsPlugin() {
  return {
    name: 'stats',
    async postBuild({ outDir }) {
      const imagesDir = path.join(__dirname, '../data/builder-tools/images');
      const count = fs.readdirSync(imagesDir)
        .filter(f => /\.(png|jpe?g)$/i.test(f)).length;

      fs.writeFileSync(
        path.join(outDir, 'stats.json'),
        JSON.stringify({
          builderToolsCount: count,
          generatedAt: new Date().toISOString(),
        }),
      );
    },
  };
};
