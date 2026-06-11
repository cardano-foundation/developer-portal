import React, { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import clsx from "clsx";

import {
  readSearchTags,
  replaceSearchTags,
} from "@site/src/components/showcase/ShowcaseTagSelect";
import Tooltip from "@site/src/components/showcase/ShowcaseTooltip/index";
import InfoDot from "@site/src/components/showcase/InfoDot";
import { Categories } from "@site/src/data/builder-tools/tags";

import styles from "./styles.module.css";

// Tool-flavored intents. Each maps to a single domain category. Clicking a chip
// applies that category as a filter (and toggles off if already active).
const INTENTS = [
  { id: "smart-contracts", tags: ["smart-contracts"], label: "Write smart contracts" },
  { id: "sdk", tags: ["sdk"], label: "Build transactions" },
  { id: "api", tags: ["api"], label: "Query the chain" },
  { id: "indexer", tags: ["indexer"], label: "Index on-chain data" },
  { id: "node", tags: ["node"], label: "Run a node" },
  { id: "wallet", tags: ["wallet"], label: "Integrate a wallet" },
  { id: "operations", tags: ["operations"], label: "Operate a pool" },
];

function arraysEqualUnordered(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export default function IntentChips() {
  const location = useLocation();
  const history = useHistory();

  const activeId = useMemo(() => {
    const currentTags = readSearchTags(location.search);
    return INTENTS.find((i) => arraysEqualUnordered(currentTags, i.tags))?.id;
  }, [location.search]);

  const applyIntent = useCallback(
    (intent) => {
      const isActive = intent.id === activeId;
      const search = replaceSearchTags(
        location.search,
        isActive ? [] : intent.tags
      );
      history.push({ ...location, search });
    },
    [activeId, location, history]
  );

  return (
    <section className={styles.intentSection} aria-labelledby="tools-intent-title">
      <div className="container">
        <h2 id="tools-intent-title" className={styles.intentTitle}>
          I want to
        </h2>
        <ul className={styles.intentList}>
          {INTENTS.map((intent) => {
            const isActive = intent.id === activeId;
            const hint = Categories[intent.tags[0]]?.description;
            return (
              <li key={intent.id} className={styles.intentItem}>
                <Tooltip
                  text={hint || ""}
                  id={`intent_${intent.id}`}
                  anchorEl="#__docusaurus"
                >
                  <button
                    type="button"
                    onClick={() => applyIntent(intent)}
                    className={clsx(styles.intentChip, {
                      [styles.intentChipActive]: isActive,
                    })}
                    aria-pressed={isActive}
                  >
                    {intent.label}
                    <InfoDot />
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
