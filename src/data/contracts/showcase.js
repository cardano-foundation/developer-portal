// ============================================================================
// Contracts - showcase data (component-facing surface)
// ============================================================================
// Shapes the raw contract entries for the listing component and re-exports the
// taxonomy. adapt() fills default onchain/offchain arrays and derives the
// "via <source>" label from the repo owner, keeping a single import surface for
// the page.
// ============================================================================

import {
  Contracts,
  SortedContracts,
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
} from "@site/src/data/contracts";

export {
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
};

// A SOURCE is a catalog this page aggregates contracts from. Keep the list small:
// it is the page's "aggregated from" identity (the header strip) and the per-card
// "via" line. Just a label and a url; the strip avatar is derived from the url.
const SOURCES = {
  monitoring: {
    label: "CF monitoring",
    url: "https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring",
  },
  meshjs: {
    label: "MeshJS",
    url: "https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src",
  },
  anastasia: {
    label: "Anastasia Labs",
    url: "https://github.com/Anastasia-Labs",
  },
  "awesome-aiken": {
    label: "awesome-aiken",
    url: "https://github.com/aiken-lang/awesome-aiken",
  },
};

// The strip avatar is the GitHub avatar of the url's owner (first path segment).
function avatarFor(url) {
  try {
    const owner = new URL(url).pathname.split("/").filter(Boolean)[0];
    return `https://github.com/${owner}.png?size=96`;
  } catch (e) {
    return null;
  }
}

// Resolve a contract's source id. The three catalog repos are detected from the
// repoUrl; any other entry must set `source` explicitly (the awesome-aiken
// projects do). An unrecognized contract throws at build, so nothing can quietly
// land in the wrong source.
function sourceId(contract) {
  if (contract.source) {
    if (!SOURCES[contract.source]) {
      throw new Error(
        `Contract "${contract.title}": unknown source "${contract.source}". ` +
          "Add it to SOURCES in src/data/contracts/showcase.js."
      );
    }
    return contract.source;
  }
  const url = contract.repoUrl || "";
  if (url.includes("/cardano-template-and-ecosystem-monitoring/")) return "monitoring";
  if (url.includes("/MeshJS/mesh/")) return "meshjs";
  if (url.includes("/Anastasia-Labs/")) return "anastasia";
  throw new Error(
    `Contract "${contract.title}": could not determine its source. Set "source" to one of: ` +
      `${Object.keys(SOURCES).join(", ")} (or add a new source to SOURCES).`
  );
}

// Distinct sources present, most-represented first. Powers the header strip.
export const ContractSources = (() => {
  const counts = new Map();
  for (const contract of Contracts) {
    const id = sourceId(contract);
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      id,
      count,
      label: SOURCES[id].label,
      url: SOURCES[id].url,
      avatar: avatarFor(SOURCES[id].url),
    }));
})();

function adapt(contract) {
  return {
    ...contract,
    onchain: contract.onchain || [],
    offchain: contract.offchain || [],
    source: SOURCES[sourceId(contract)].label,
  };
}

export const ContractShowcases = Contracts.map(adapt);
export const SortedContractShowcases = SortedContracts.map(adapt);
