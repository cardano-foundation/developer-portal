/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useHistory, useLocation } from "@docusaurus/router";

import {prepareUserState} from '../../../pages/tools/index';

import styles from "./styles.module.css";
import clsx from "clsx";

export const Operator = "ALL" | "LATEST";

export const OperatorQueryKey = "projects";

export function readLatestOperator(search) {
  return new URLSearchParams(search).get(OperatorQueryKey) ?? "ALL";
}

export default function ShowcaseLatestToggle() {
  const id = "showcase_filter_toggle_latest";
  const location = useLocation();
  const history = useHistory();
  const [operator, setOperator] = useState(false);

  useEffect(() => {
    setOperator(readLatestOperator(location.search) === "LAST");
  }, [location]);

  const toggleOperator = useCallback(() => {
    setOperator((o) => !o);
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete(OperatorQueryKey);
    if (!operator) {
      searchParams.append(OperatorQueryKey, operator ? "ALL" : "LAST");
    }
    history.push({
      ...location,
      search: searchParams.toString(),
      state: prepareUserState(),
    });
  }, [operator, location, history]);

  return (
    <div>
      <input
        type="checkbox"
        id={id}
        className={styles.screenReader}
        onChange={toggleOperator}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            toggleOperator();
          }
        }}
        checked={!operator}
      />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={id} className={clsx(styles.checkboxLabel, "shadow--md")}>
        <span className={styles.checkboxLabelOr}>LAST</span>
        <span className={styles.checkboxLabelALL}>ALL</span>
      </label>
    </div>
  );
}
