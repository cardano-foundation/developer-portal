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

// Wallet connection approach (exactly one).
export const Wallets = {
  "connect-with-wallet": { label: "Connect with Wallet" },
  mesh: { label: "Mesh (built-in)" },
  "server-signer": { label: "Server-side signer" },
};

export const FrameworkList = Object.keys(Frameworks);
export const SdkList = Object.keys(Sdks);
export const WalletList = Object.keys(Wallets);
