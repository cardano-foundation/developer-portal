import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

import SiteHero from "@site/src/components/Layout/SiteHero";
import TemplatesTabs from "@site/src/components/TemplatesTabs";

import styles from "./styles.module.css";

// The band shared by /templates and /templates/contracts.
//
// The two routes are one tabbed surface, so the band has to keep the same
// height across the switch or it grows and shrinks under the tabs. Reserving
// the description's line count is what guarantees that. Matching the two
// strings line for line would also work today, but it breaks silently the
// next time either line is edited.
//
// Two lines is what the longer of the two wraps to just above the mobile
// breakpoint, where the band is narrowest and the copy tallest. Keeping both
// descriptions short enough to hold that is what keeps the band compact: a
// third reserved line would add roughly 40px of empty band at every width.
const SUBTITLE_LINES = 2;

// The same artwork the builder tools browse page leads with. Templates and
// tools are the two browse surfaces and read as a pair, so they share it.
const ARTWORK = "/img/hero/spheres.webp";

// `meta` is the page's own metadata line under the tabs. Both routes pass one:
// the row is part of what keeps the two bands the same height, so a page
// without anything to say there would leave a visible gap.
export default function TemplatesHero({ title, description, meta }) {
  return (
    <SiteHero
      title={title}
      description={description}
      artwork={useBaseUrl(ARTWORK)}
      subtitleLines={SUBTITLE_LINES}
    >
      <TemplatesTabs />
      <div className={styles.meta}>{meta}</div>
    </SiteHero>
  );
}
