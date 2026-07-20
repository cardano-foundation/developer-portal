// Dev-only shim for @docusaurus/plugin-google-gtag.
//
// The gtag plugin's route handler calls `window.gtag(...)` on every client-side
// navigation, but the gtag script is only injected in production builds. In
// `docusaurus start` (dev) `window.gtag` is therefore undefined and navigation
// throws "window.gtag is not a function". Define a no-op when one isn't already
// present — in production the real gtag is defined in <head> first, so this is a
// no-op there and never overrides real analytics.
if (typeof window !== "undefined" && typeof window.gtag !== "function") {
  window.gtag = function gtag() {};
}

export {};
