import React from "react";
import Link from "@docusaurus/Link";
import ExternalArrow from "@site/src/components/ExternalArrow";
import { linkPropsFor, isExternalHref } from "@site/src/utils/externalLink";

import styles from "./styles.module.css";

// The ecosystem audit the open-space badges cite. Every card that lists gaps
// credits it with the report sections they come from.
export const ALPHAGROWTH_REPORT =
  "https://blue-careful-catshark-349.mypinata.cloud/ipfs/bafybeibw2hkvqy7bjb3j2rvirhexgf42prquwm4ci4qpcjk2zox7n3axpa";

function InlineLink({ href, children }) {
  return (
    <Link to={href} {...linkPropsFor(href)}>
      {children}
      {isExternalHref(href) && <ExternalArrow />}
    </Link>
  );
}

// One "what to build" card: what the category is, projects live on Cardano
// today, and the open spaces the AlphaGrowth audit found in it. `live` is a
// list of { label, href }; `gaps` a list of labels; `sections` the report
// sections those gaps come from.
export default function BuildIdea({
  title,
  description,
  live = [],
  gaps = [],
  sections,
}) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {live.length > 0 && (
        <p className={styles.live}>
          <span className={styles.label}>Live on Cardano: </span>
          {live.map(({ label, href: liveHref }, i) => (
            <React.Fragment key={label}>
              {i > 0 && ", "}
              <InlineLink href={liveHref}>{label}</InlineLink>
            </React.Fragment>
          ))}
        </p>
      )}
      {gaps.length > 0 && (
        <div className={styles.gaps}>
          <span className={styles.label}>Open spaces</span>
          <ul className={styles.badges}>
            {gaps.map((gap) => (
              <li key={gap} className="badge badge--secondary">
                {gap}
              </li>
            ))}
          </ul>
          {sections && (
            <p className={styles.source}>
              Not observed in production, per{" "}
              <InlineLink href={ALPHAGROWTH_REPORT}>
                AlphaGrowth's ecosystem audit
              </InlineLink>{" "}
              (§{sections}).
            </p>
          )}
        </div>
      )}
    </article>
  );
}
