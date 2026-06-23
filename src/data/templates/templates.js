// ============================================================================
// dApp starter templates surfaced at /templates
// ============================================================================
// Append an entry to add a template. Full guide: examples/templates/README.md.
// The slug, the "Use this template" command, and the GitHub URL are all derived
// from repoPath in showcase.js; never hardcode them. Validation runs at build
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
//   useCases       (required) one or more ids from UseCases (tags.js)
//   screenshot     (optional) "/img/template-previews/<name>.png"; placeholder if omitted
//   maintainerPick (optional) boolean; picks sort first and get a badge
//
// Last-inserted entries read as the newest.
// ============================================================================

export const Templates = [
  {
    title: "Evolution + Vite + React",
    description:
      "Connect a wallet, read the balance, and send ADA. A Vite + React starter built on the Evolution SDK.",
    screenshot: "/img/template-previews/evolution-vite-react.png",
    repoPath: "examples/templates/evolution-vite-react",
    framework: "vite-react",
    sdk: "evolution",
    wallet: "connect-with-wallet",
    useCases: ["starter", "payments"],
    maintainerPick: true,
  },
  {
    title: "Mesh + Next.js",
    description:
      "Connect a wallet, read the balance, and send ADA. A Next.js starter built on Mesh.",
    screenshot: "/img/template-previews/mesh-nextjs.png",
    repoPath: "examples/templates/mesh-nextjs",
    framework: "nextjs",
    sdk: "mesh",
    wallet: "mesh",
    useCases: ["starter", "payments"],
    maintainerPick: true,
  },
];
