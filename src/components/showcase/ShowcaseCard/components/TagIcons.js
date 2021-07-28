import React from 'react'
import { Tags, TagList } from "../../../../data/showcases";
import { sortBy } from "../../../../utils/jsUtils";
import styles from "../styles.module.css";

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

export default ShowcaseCardTagIcons;