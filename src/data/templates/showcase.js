// ============================================================================
// Templates - showcase data (component-facing surface)
// ============================================================================
// Shapes the raw template entries for the listing + detail components: derives
// the slug, the "Use this template" command, and the GitHub source URL from
// repoPath, and re-exports the taxonomy. Keeping the command in one derived
// field means a future create-cardano-dapp CLI is a one-line swap here.
// ============================================================================

import {
  Templates,
  SortedTemplates,
  UseCases,
  Frameworks,
  Sdks,
  Wallets,
  UseCaseList,
  FrameworkList,
  SdkList,
  WalletList,
} from "@site/src/data/templates";

export {
  UseCases,
  Frameworks,
  Sdks,
  Wallets,
  UseCaseList,
  FrameworkList,
  SdkList,
  WalletList,
};

const REPO = "cardano-foundation/developer-portal";

// "NEW" badge + "Recently added" use the last N entries in insertion order.
export const RECENT_TEMPLATES_COUNT = 4;

// Slug = the examples/templates/<name> directory. MUST byte-match slugFor() in
// plugins/templates-routes/index.js so detail routes line up.
export function templateSlug(template) {
  return template.repoPath.split("/").pop();
}

function gigetCommand(template) {
  return `npx giget@latest gh:${REPO}/${template.repoPath} my-app`;
}

function githubUrl(template) {
  return `https://github.com/${REPO}/tree/staging/${template.repoPath}`;
}

function adapt(template) {
  return {
    ...template,
    slug: templateSlug(template),
    command: gigetCommand(template),
    githubUrl: githubUrl(template),
  };
}

// `TemplateShowcases` keeps insertion order (drives "recently added" / NEW).
// `SortedTemplateShowcases` is maintainer-picks-first then alphabetical.
export const TemplateShowcases = Templates.map(adapt);
export const SortedTemplateShowcases = SortedTemplates.map(adapt);
