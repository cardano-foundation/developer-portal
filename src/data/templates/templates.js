// ============================================================================
// dApp starter templates surfaced at /templates
// ============================================================================
// Append an entry to add a template. Full guide: examples/templates/README.md.
// The slug, the "Use this template" command, and the GitHub URL are all derived
// from repoPath in catalog.js; never hardcode them. Validation runs at build
// (this file -> validation.js) and fail-fasts on missing or invalid fields.
//
// Fields:
//   title          (required) display name
//   description    (required) one sentence
//   repoPath       (required) "examples/templates/<name>"; the runnable project,
//                             and the source of the slug + command + GitHub URL
//   framework      (required) one id from Frameworks (tags.js)
//   sdk            (required) one id from Sdks (tags.js)
//   wallet         (required) one id from Wallets (tags.js)
//   maintainerPick (optional) boolean; picks sort first and get a badge
//
// Last-inserted entries read as the newest.
// ============================================================================

export const Templates = [
  {
    title: "Evolution",
    description:
      "Connect a wallet, read the balance, and send ADA. A Vite + React starter built on the Evolution SDK.",
    repoPath: "examples/templates/evolution-vite-react",
    framework: "vite-react",
    sdk: "evolution",
    wallet: "connect-with-wallet",
    maintainerPick: true,
  },
  {
    title: "Mesh",
    description:
      "Connect a wallet, read the balance, and send ADA. A Next.js starter built on Mesh.",
    repoPath: "examples/templates/mesh-nextjs",
    framework: "nextjs",
    sdk: "mesh",
    wallet: "mesh",
    maintainerPick: true,
  },
  {
    title: "x402 Agentic Payments",
    description:
      "An API that charges per request and an agent that pays for it, via the x402 standard on Cardano preprod.",
    repoPath: "examples/templates/x402-express",
    framework: "node",
    sdk: "x402",
    wallet: "server-signer",
    maintainerPick: true,
  },
];
