/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo } from "react";

import styles from "./styles.module.css";
import clsx from "clsx";
import Image from "@theme/IdealImage";
import { Tags, TagList } from "../../../data/showcases";
import { sortBy } from "../../../utils/jsUtils";

function TagIcon({ label, description, icon }) {
  return (
    <span
      className={styles.tagIcon}
      // TODO add a proper tooltip
      title={`${label}: ${description}`}
      aria-label={`${label}: ${description}`}
    >
      {icon}
    </span>
  );
}

function ShowcaseCardTagIcons({ tags }) {
  const tagObjects = tags
    .map((tag) => ({ tag, ...Tags[tag] }))
    .filter((tagObject) => !!tagObject.icon);

  // Keep same order of icons for all tags
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );

  return tagObjectsSorted.map((tagObject, index) => (
    <TagIcon key={index} {...tagObject} />
  ));
}

const ShowcaseCard = memo(function ({ showcase }) {
  return (
    <div key={showcase.title} className="col col--4 margin-bottom--lg">
      <div className={clsx("card", styles.showcaseCard)}>
        <div className={clsx("card__image", styles.showcaseCardImage)}>
          <Image img={showcase.preview} alt={showcase.title} />
        </div>
        <div className="card__body">
          <div className="avatar">
            <div className="avatar__intro margin-left--none">
              <div className={styles.titleIconsRow}>
                <div className={styles.titleIconsRowTitle}>
                  <h4 className="avatar__name">{showcase.title}</h4>
                </div>
                <div className={styles.titleIconsRowIcons}>
                  <ShowcaseCardTagIcons tags={showcase.tags} />
                </div>
              </div>
              <small className="avatar__subtitle">{showcase.description}</small>
            </div>
          </div>
        </div>
        {(showcase.website || showcase.source) && (
          <div className="card__footer">
            <div className="button-group button-group--block">
              {showcase.website && (
                <a
                  className="button button--small button--secondary button--block"
                  href={showcase.website}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Website
                </a>
              )}
              {showcase.source && (
                <a
                  className="button button--small button--secondary button--block"
                  href={showcase.source}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Source
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ShowcaseCard;
