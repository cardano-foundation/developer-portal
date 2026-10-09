// ============================================================================
// Templates taxonomy
// ============================================================================
// A template is filtered by three facets: the Framework, the SDK, and the
// Wallet integration. Mirrors the filter groups on comparable template
// galleries, written in plain developer terms.
// ============================================================================

// Frontend framework the template is built on (exactly one).
export const Frameworks = {
  "vite-react": { label: "Vite + React" },
  nextjs: { label: "Next.js" },
  node: { label: "Node.js" },
};

// Cardano SDK the template builds transactions with (exactly one).
export const Sdks = {
  evolution: { label: "Evolution" },
  mesh: { label: "Mesh" },
  x402: { label: "x402" },
};

// Wallet connection approach (exactly one). Two values on purpose: the axis
// that is orthogonal to the SDK column is where signing happens, not which
// wrapper library sits over CIP-30 (that story lives in the SDK tag and the
// description).
export const Wallets = {
  "browser-wallet": { label: "Browser wallet (CIP-30)" },
  "server-signer": { label: "Server-side signer" },
};

export const FrameworkList = Object.keys(Frameworks);
export const SdkList = Object.keys(Sdks);
export const WalletList = Object.keys(Wallets);
