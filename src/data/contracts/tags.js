// ============================================================================
// Contracts taxonomy
// ============================================================================
// A contract is filtered by three facets: the use-case category (exactly one),
// the on-chain language(s) it is written in, and the off-chain language(s) that
// drive it. On-chain and off-chain are multi-valued; a single use case often
// ships several implementations.
// ============================================================================

// On-chain validator language (a contract may ship more than one).
export const OnchainLangs = {
  aiken: { label: "Aiken" },
  scalus: { label: "Scalus" },
};

// Off-chain transaction-building language / SDK (a contract may ship several).
export const OffchainLangs = {
  meshjs: { label: "MeshJS" },
  evolution: { label: "Evolution" },
  pycardano: { label: "PyCardano" },
  ccl: { label: "CCL Java" },
  blaze: { label: "Blaze" },
};

// Use-case category (exactly one per contract).
export const Categories = {
  basics: { label: "Basics" },
  payments: { label: "Payments" },
  tokens: { label: "Tokens & NFTs" },
  defi: { label: "DeFi" },
  identity: { label: "Identity" },
  data: { label: "Data" },
  access: { label: "Access & upgrades" },
};

export const OnchainList = Object.keys(OnchainLangs);
export const OffchainList = Object.keys(OffchainLangs);
export const CategoryList = Object.keys(Categories);
