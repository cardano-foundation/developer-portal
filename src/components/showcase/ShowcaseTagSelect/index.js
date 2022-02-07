/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useState, useEffect, forwardRef } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { toggleListItem } from "@site/src/utils/jsUtils";
import {prepareUserState} from '../../../pages/tools/index';
import Tags from "@site/src/data/showcases";

import styles from "./styles.module.css";

const TagQueryStringKey = "tags";

export function readSearchTags(search) {
  return new URLSearchParams(search).getAll(TagQueryStringKey);
}

function replaceSearchTags(search, newTags) {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
}

const ShowcaseTagSelect = forwardRef(
  ({ id, icon, label, tag, ...rest }, ref) => {
    const location = useLocation();
    const history = useHistory();
    const [selected, setSelected] = useState(false);

    useEffect(() => {
      const tags = readSearchTags(location.search);
      setSelected(tags.includes(tag));
    }, [tag, location]);

    const toggleTag = useCallback(() => {
      const tags = readSearchTags(location.search);
      const newTags = toggleListItem(tags, tag);
      const newSearch = replaceSearchTags(location.search, newTags);
      history.push({
        ...location,
        search: newSearch,
        state: prepareUserState(),
      });
    }, [tag, location, history]);
    return (
      <>
        <input
          type="checkbox"
          id={id}
          className={styles.screenReader}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              toggleTag();
            }
          }}
          onFocus={(e) => {
            if (e.relatedTarget) {
              e.target.nextElementSibling?.dispatchEvent(
                new KeyboardEvent("focus")
              );
            }
          }}
          onBlur={(e) => {
            e.target.nextElementSibling?.dispatchEvent(
              new KeyboardEvent("blur")
            );
          }}
          onChange={toggleTag}
          checked={selected}
          {...rest}
        />
        <label htmlFor={id} className={styles.checkboxLabel}>
          {label}
          {icon}
        </label>
      </>
    );
  }
);

export default ShowcaseTagSelect;
