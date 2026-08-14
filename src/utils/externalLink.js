/* Props that make a link open an external target in a new tab, matching the ↗
   affordance rendered next to external labels.
 *
 * `noopener` is what actually matters: without it the opened page gets a
 * window.opener handle back into this one. `noreferrer` rides along because
 * every call site here already paired them.
 *
 * Takes the href so callers can spread it unconditionally over links whose
 * destination may be internal, where it returns nothing and the router
 * handles the navigation as usual.
 */
export function externalLinkProps(href) {
  return href ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

/* Unconditional form, for links that are always external. */
export const EXTERNAL_LINK_PROPS = { target: "_blank", rel: "noopener noreferrer" };
