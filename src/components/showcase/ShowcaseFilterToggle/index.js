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

export const Operator = "OR" | "AND";

export const OperatorQueryKey = "operator";

export function readOperator(search) {
  return new URLSearchParams(search).get(OperatorQueryKey) ?? "AND";
}

export default function ShowcaseFilterToggle() {
  const id = "showcase_filter_toggle";
  const location = useLocation();
  const history = useHistory();
  const [operator, setOperator] = useState(false);

  useEffect(() => {
    setOperator(readOperator(location.search) === "OR");
  }, [location]);

  const toggleOperator = useCallback(() => {
    setOperator((o) => !o);
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete(OperatorQueryKey);
    if (!operator) {
      searchParams.append(OperatorQueryKey, operator ? "AND" : "OR");
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
        <span className={styles.checkboxLabelOr}>OR</span>
        <span className={styles.checkboxLabelAnd}>AND</span>
      </label>
    </div>
  );
}
