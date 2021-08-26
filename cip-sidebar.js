const fs = require("fs");
const cips = fs.readdirSync("./docs/cardano-improvement-proposals/");
const cipSidebar = cips.map(cip => `cardano-improvement-proposals/${cip.replace(".md", "")}`);
module.exports = cipSidebar;