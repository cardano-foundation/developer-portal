import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import {
  useDocsSidebar,
  useSidebarBreadcrumbs,
} from "@docusaurus/plugin-content-docs/client";
const ONBOARDING_SIDEBAR = "onboardingSidebar";

import styles from "./styles.module.css";

// The categories a reader moves through in order, and what one page in each
// is called. Everything is read from the sidebar, so the position stays right
// when a lecture is added or moved in sidebars.js.
const TRACKS = {
  Tutorial: { one: "step", many: "steps" },
  Beginner: { one: "lecture", many: "lectures" },
  Intermediate: { one: "lecture", many: "lectures" },
  Advanced: { one: "lecture", many: "lectures" },
};

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// A bar above an onboarding page: which track it belongs to, and where in
// that track the reader is. Renders nothing outside the onboarding sidebar.
export default function OnboardingTrack() {
  const sidebar = useDocsSidebar();
  const crumbs = useSidebarBreadcrumbs();
  if (sidebar?.name !== ONBOARDING_SIDEBAR || !crumbs) return null;

  const trackIndex = crumbs.findLastIndex(
    (item) => item.type === "category" && TRACKS[item.label]
  );
  if (trackIndex === -1) return null;

  const track = crumbs[trackIndex];
  const words = TRACKS[track.label];
  const total = track.items.length;
  const current = crumbs[trackIndex + 1];
  const position = current ? track.items.indexOf(current) : -1;

  let where;
  if (position === -1) {
    where = `${total} ${words.many}`;
  } else {
    where = `${capitalise(words.one)} ${position + 1} of ${total}`;
    if (current.type === "category") where += `: ${current.label}`;
  }

  return (
    <nav className={styles.track} aria-label={`${track.label} progress`}>
      <Link to={track.href} className={clsx("monoKicker", styles.trackName)}>
        {track.label}
      </Link>
      <span className={clsx("monoKicker", styles.where)}>{where}</span>
      {position !== -1 && (
        <span className={styles.bar} aria-hidden="true">
          <span
            className={styles.fill}
            style={{ width: `${((position + 1) / total) * 100}%` }}
          />
        </span>
      )}
    </nav>
  );
}
