// ============================================================================
// Contracts - showcase data (component-facing surface)
// ============================================================================
// Shapes the raw contract entries for the listing component and re-exports the
// taxonomy. adapt() fills default onchain/offchain arrays and resolves the
// "via <credit>" label: the source label (see sources.js) when the entry came
// from a listed source, otherwise the standalone contract's own repo owner.
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
import { SOURCES } from "./sources";

export {
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
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

// Standalone contracts (no `source`) are credited by their repo owner, taken
// straight from the repoUrl (no display-name overrides; none are needed yet).
function makerLabelFor(url) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean)[0] || "unknown";
  } catch (e) {
    return "unknown";
  }
}

// A source url that can't yield an avatar would render a broken strip image
// silently; fail the build instead. Runs at module load (production build).
for (const [id, source] of Object.entries(SOURCES)) {
  if (!avatarFor(source.url)) {
    throw new Error(
      `SOURCES["${id}"]: url "${source.url}" does not resolve to a GitHub avatar.`
    );
  }
}

// Distinct sources present, in SOURCES declaration (editorial) order. Powers the
// header strip; the first few show as avatars, the rest fold into the count.
// Only contracts with a source are counted; standalone ones (no source) are skipped.
export const ContractSources = (() => {
  const counts = new Map();
  for (const contract of Contracts) {
    // Standalone contracts (no source) are credited by maker, not shown here.
    if (!contract.source) continue;
    counts.set(contract.source, (counts.get(contract.source) || 0) + 1);
  }
  return Object.keys(SOURCES)
    .filter((id) => counts.has(id))
    .map((id) => ({
      id,
      count: counts.get(id),
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
    // "via <credit>": the source label when it came from a listed source,
    // otherwise the standalone contract's own repo owner.
    credit: contract.source
      ? SOURCES[contract.source].label
      : makerLabelFor(contract.repoUrl),
  };
}

export const SortedContractShowcases = SortedContracts.map(adapt);
