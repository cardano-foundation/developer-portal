import isInternalUrl from "@docusaurus/isInternalUrl";

/* Props that make a link open in a new tab, matching the ↗ affordance
   rendered next to external labels. For targets that are always external.
 *
 * `noopener` is what actually matters: without it the opened page gets a
 * window.opener handle back into this one. `noreferrer` rides along because
 * every call site here already paired them.
 */
export const EXTERNAL_LINK_PROPS = { target: "_blank", rel: "noopener noreferrer" };

/* Whether the href leaves the site. */
export function isExternalHref(href) {
  return Boolean(href) && !isInternalUrl(href);
}

/* Spreadable unconditionally over links whose destination may be internal:
   an external href gets the new-tab props, anything else gets nothing and
   the router handles the navigation as usual. */
export function linkPropsFor(href) {
  return isExternalHref(href) ? EXTERNAL_LINK_PROPS : {};
}
