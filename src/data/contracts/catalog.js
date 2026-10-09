// ============================================================================
// Contracts - catalog (component-facing surface)
// ============================================================================
// Shapes the raw contract entries for the listing component and re-exports the
// taxonomy. adapt() fills default onchain/offchain arrays and resolves the
// "via <credit>" label: the source label (see sources.js) when the entry came
// from a listed source, otherwise the standalone contract's own repo owner.
// ============================================================================

import {
  Contracts,
  SortedContracts as RawSortedContracts,
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
} from "@site/src/data/contracts";
import { SOURCES, MAX_SOURCE_AVATARS } from "./sources";

export {
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
  MAX_SOURCE_AVATARS,
};

// Standalone contracts (no `source`) are credited by their repo owner, taken
// straight from the repoUrl (no display-name overrides; none are needed yet).
function makerLabelFor(url) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean)[0] || "unknown";
  } catch (e) {
    return "unknown";
  }
}

// Distinct sources present, in SOURCES declaration (editorial) order. Powers the
// header strip; the first few show as avatars, the rest fold into the count.
// Only contracts with a source are counted; standalone ones (no source) are skipped.
// `avatar` is the source's self-hosted local icon (null for overflow-only sources).
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
      avatar: SOURCES[id].icon || null,
    }));
})();

// A source shown as an avatar but missing a local icon would render a broken
// strip image silently; fail the build instead. Only the first MAX_SOURCE_AVATARS
// render as avatars — the rest fold into the text-only "+N more" overflow.
// Runs at module load (production build).
for (const source of ContractSources.slice(0, MAX_SOURCE_AVATARS)) {
  if (!source.avatar) {
    throw new Error(
      `ContractSources["${source.id}"] is shown in the avatar strip but has no local icon. ` +
        `Add an \`icon\` in sources.js or move it past the first ${MAX_SOURCE_AVATARS}.`
    );
  }
}

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

export const SortedContracts = RawSortedContracts.map(adapt);
