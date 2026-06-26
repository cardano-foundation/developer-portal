import React from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import clsx from "clsx";

import styles from "./styles.module.css";

const TABS = [
  { label: "App starters", to: "/templates" },
  { label: "Contracts", to: "/templates/contracts" },
];

// Normalize a pathname to compare against a tab target, ignoring trailing
// slashes and any site baseUrl prefix. SSR-safe: useLocation works on the
// server too, so no window access is needed.
function pathEndsWith(pathname, target) {
  const trim = (s) => s.replace(/\/+$/, "");
  return trim(pathname) === trim(target) || trim(pathname).endsWith(trim(target));
}

export default function TemplatesTabs() {
  const { pathname } = useLocation();

  // Order matters: the contracts route is more specific, so check it first.
  const activeTo = pathEndsWith(pathname, "/templates/contracts")
    ? "/templates/contracts"
    : "/templates";

  return (
    <nav className={styles.tabs} aria-label="Templates sections">
      {TABS.map((tab) => {
        const isActive = tab.to === activeTo;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={clsx(styles.tab, isActive && styles.tabActive)}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
