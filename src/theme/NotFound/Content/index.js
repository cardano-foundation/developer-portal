import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";

export default function NotFoundContent({ className }) {
  const { colorMode } = useColorMode();
  const logo = colorMode === "dark" ? "img/cardano-white.svg" : "img/cardano-black.svg";

  return (
    <main
      className={clsx(className)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "60vh",
        padding: "2rem",
        animation: "fadeInUp 600ms backwards",
      }}
    >
      <img
        src={useBaseUrl(logo)}
        alt="Cardano logo"
        style={{ width: 56, height: 56, opacity: 0.1, marginBottom: "0.5rem" }}
      />
      <span
        style={{
          fontSize: "7rem",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: "var(--ifm-color-primary)",
          opacity: 0.15,
          userSelect: "none",
        }}
      >
        404
      </span>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "-0.5rem", marginBottom: "0.75rem" }}>
        Page Not Found
      </h1>
      <p style={{
        maxWidth: 420,
        color: "var(--ifm-color-emphasis-700)",
        fontSize: "1.05rem",
        lineHeight: 1.6,
        marginBottom: "0.5rem",
      }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <p style={{
        color: "var(--ifm-color-emphasis-700)",
        fontSize: "0.9rem",
        marginBottom: "2rem",
      }}>
        Try the search bar above or head back to familiar ground.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="button button--primary button--lg" to="/">
          Go to Homepage
        </Link>
        <Link className="button button--secondary button--lg" to="/docs/get-started/">
          Browse Documentation
        </Link>
      </div>
    </main>
  );
}
