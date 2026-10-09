// ============================================================================
// Templates - catalog (component-facing surface)
// ============================================================================
// Shapes the raw template entries for the listing + detail components: derives
// the slug, the "Use this template" command, and the GitHub source URL from
// repoPath, and re-exports the taxonomy. Keeping the command in one derived
// field means a future create-cardano-dapp CLI is a one-line swap here.
// ============================================================================

import {
  Templates as RawTemplates,
  SortedTemplates as RawSortedTemplates,
  Frameworks,
  Sdks,
  Wallets,
  FrameworkList,
  SdkList,
  WalletList,
} from "@site/src/data/templates";

export {
  Frameworks,
  Sdks,
  Wallets,
  FrameworkList,
  SdkList,
  WalletList,
};

const REPO = "cardano-foundation/developer-portal";

// Slug derivation lives in ./slug.js, shared with plugins/templates-routes.
import { templateSlug } from "./slug";

function gigetCommand(template) {
  return `npx giget@latest gh:${REPO}/${template.repoPath} my-app`;
}

function githubUrl(template) {
  return `https://github.com/${REPO}/tree/staging/${template.repoPath}`;
}

function adapt(template) {
  return {
    ...template,
    slug: templateSlug(template.repoPath),
    command: gigetCommand(template),
    githubUrl: githubUrl(template),
  };
}

// `Templates` keeps insertion order (drives "recently added" / NEW).
// `SortedTemplates` is maintainer-picks-first then alphabetical.
export const Templates = RawTemplates.map(adapt);
export const SortedTemplates = RawSortedTemplates.map(adapt);

// Slugs are React keys and detail-route ids (derived in ./slug.js, shared
// with plugins/templates-routes); a folder-basename collision would silently
// drop a route, so fail the build instead of shipping a 404. Mirrors the
// slug-uniqueness guard in src/data/contracts.js.
const templateSlugs = Templates.map((t) => t.slug);
const duplicateTemplateSlug = templateSlugs.find(
  (slug, i) => templateSlugs.indexOf(slug) !== i
);
if (duplicateTemplateSlug) {
  throw new Error(
    `Duplicate template slug "${duplicateTemplateSlug}"; template folder basenames must be unique.`
  );
}
