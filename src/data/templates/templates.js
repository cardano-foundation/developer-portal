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
//   detail         (optional) overrides for the detail page when the generic
//                             wallet-extension + `npm run dev` walkthrough does
//                             not fit. { guide, prereqs, steps, after }: guide,
//                             prereqs and after are sentence segments (strings
//                             mixed with { label, to } internal or
//                             { label, href } external links); steps is
//                             [{ lead: segments, code? }] and renders after the
//                             shared scaffold step.
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
    title: "x402 Express Starter",
    description:
      "An API that charges per request and an agent that pays for it, via the x402 standard on Cardano preprod.",
    repoPath: "examples/templates/x402-express",
    framework: "node",
    sdk: "x402",
    wallet: "server-signer",
    maintainerPick: true,
    detail: {
      guide: [
        "New to x402 on Cardano? The ",
        { label: "x402 page", to: "/x402" },
        " has the full picture.",
      ],
      prereqs: [
        "You need Node.js 20+ and a free ",
        { label: "Blockfrost", href: "https://blockfrost.io" },
        " project id. No browser wallet is needed, the starter generates its own.",
      ],
      steps: [
        {
          lead: ["Install dependencies, then generate a preprod wallet:"],
          code: "cd my-app\nnpm install\ncp .env.example .env\nnpm run wallet",
        },
        {
          lead: [
            "Copy the mnemonic into .env, set your Blockfrost project id and a seller address, and fund the printed address at the ",
            {
              label: "preprod faucet",
              href: "https://docs.cardano.org/cardano-testnets/tools/faucet",
            },
            ".",
          ],
        },
        {
          lead: ["Run it, in two terminals:"],
          code: "npm run facilitator\nnpm run demo",
        },
      ],
      after: [
        "The agent pays the route and the terminal prints the receipt with an explorer link. Expect 20 to 60 seconds for on-chain confirmation.",
      ],
    },
  },
  {
    title: "x402 Next.js Paywall",
    description:
      "Payment-gated Next.js API routes with a CIP-30 browser paywall, via the x402 standard on Cardano preprod.",
    repoPath: "examples/templates/x402-next",
    framework: "nextjs",
    sdk: "x402",
    wallet: "browser-wallet",
    maintainerPick: true,
    detail: {
      guide: [
        "New to x402 on Cardano? The ",
        { label: "x402 page", to: "/x402" },
        " has the full picture.",
      ],
      prereqs: [
        "You need Node.js 20+, a free ",
        { label: "Blockfrost", href: "https://blockfrost.io" },
        " project id, and a CIP-30 wallet extension such as Eternl or Lace, set to preprod and funded from the ",
        {
          label: "preprod faucet",
          href: "https://docs.cardano.org/cardano-testnets/tools/faucet",
        },
        ". The wallet is what pays in the browser.",
      ],
      steps: [
        {
          lead: [
            "Install dependencies, then set a seller address and your Blockfrost project id in .env:",
          ],
          code: "cd my-app\nnpm install\ncp .env.example .env",
        },
        {
          lead: ["Start the local facilitator and the dev server, in two terminals:"],
          code: "npm run facilitator\nnpm run dev",
        },
        {
          lead: ["Open http://localhost:3002 and pay a route from your wallet."],
        },
      ],
      after: [
        "Two priced routes come wired: 1 tADA on /api/message and 0.10 tUSDM on /api/message-usdm. Expect 20 to 60 seconds for on-chain confirmation.",
      ],
    },
  },
];
