import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

//
// This component:
// wrap components in a background style that can be selected
// most of the time you do not want to put a <BackgroundWrapper> as a child of <BoundaryBox>
// while it is usually fine to have a <BoundaryBox as a child of a <BackgroundWrapper>

export default function BackgroundWrapper({ children, backgroundType }) {


  // this version of the BackgroundWrapper only uses the ada background
  // see https://cardano.org/docs/components/background-wrapper for details
  let wrapperClassName = styles.backgroundAda;
 
  return <div className={wrapperClassName}>{children}</div>;
}
