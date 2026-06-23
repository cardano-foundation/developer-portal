// ============================================================================
// Templates taxonomy
// ============================================================================
// A template is filtered by four facets: what you build (useCases, multi),
// the Framework, the SDK, and the Wallet integration. Mirrors the filter
// groups on comparable template galleries, written in plain developer terms.
// ============================================================================

// What you can build with it (a template can carry several).
export const UseCases = {
  starter: { label: "Starter", description: "A minimal end-to-end app to build from.", color: "#16A085" },
  payments: { label: "Payments", description: "Send and receive ADA or native assets.", color: "#4ECDC4" },
  nft: { label: "NFT", description: "Mint, display, or trade native tokens and NFTs.", color: "#E1B12c" },
  defi: { label: "DeFi", description: "Swaps, lending, and other on-chain finance.", color: "#FF6B6B" },
  auth: { label: "Auth", description: "Wallet-based sign-in and identity.", color: "#673AB7" },
};

// Frontend framework the template is built on (exactly one).
export const Frameworks = {
  "vite-react": { label: "Vite + React" },
  nextjs: { label: "Next.js" },
};

// Cardano SDK the template builds transactions with (exactly one).
export const Sdks = {
  evolution: { label: "Evolution" },
  mesh: { label: "Mesh" },
};

// Wallet connection approach (exactly one).
export const Wallets = {
  "connect-with-wallet": { label: "Connect with Wallet" },
  mesh: { label: "Mesh (built-in)" },
};

export const UseCaseList = Object.keys(UseCases);
export const FrameworkList = Object.keys(Frameworks);
export const SdkList = Object.keys(Sdks);
export const WalletList = Object.keys(Wallets);
