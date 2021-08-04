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
import ShowcaseFooter from './components/ShowcaseFooter'
import ShowcaseBody from "./components/ShowcaseBody";



const ShowcaseCard = memo(function ({ showcase }) {
  const showFooter = showcase.getstarted || showcase.website || showcase.source
  return (
    <div key={showcase.title} className="col col--4 margin-bottom--lg">
      <div className={clsx("card", styles.showcaseCard)}>
        <div className={clsx("card__image", styles.showcaseCardImage)}>
          <Image img={showcase.preview} alt={showcase.title} />
        </div>
        <ShowcaseBody {...showcase}/>
        {showFooter && <ShowcaseFooter {...showcase}/>}
      </div>
    </div>
  );
});

export default ShowcaseCard;
