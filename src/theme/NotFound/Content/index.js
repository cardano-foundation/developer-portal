import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";

import styles from "./styles.module.css";

export default function NotFoundContent({ className }) {
  const { colorMode } = useColorMode();
  const logo = colorMode === "dark" ? "img/brand/cardano-white.svg" : "img/brand/cardano-black.svg";

  return (
    <main className={clsx(className, styles.notFound)}>
      <img
        className={styles.mark}
        src={useBaseUrl(logo)}
        alt="Cardano logo"
      />
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.copy}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <p className={styles.copyHint}>
        Try the search bar above or head back to familiar ground.
      </p>
      <div className={styles.chipRow}>
        <Link className="button button--primary" to="/">
          Go to Homepage
        </Link>
        <Link className="button button--outline button--primary" to="/docs/developers/">
          Browse Documentation
        </Link>
      </div>
    </main>
  );
}
