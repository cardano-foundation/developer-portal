/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo, forwardRef } from "react";
import clsx from "clsx";
import Image from "@theme/IdealImage";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import Tooltip from "../ShowcaseTooltip/index";
import { useLocation } from "@docusaurus/router";
import { Tags as ToolsTags } from "../../../data/builder-tools";
import { Tags as ShowcaseTags } from "../../../data/showcases";
import Fav from "../../../svg/fav.svg";

const TagComp = forwardRef(({ label, color, description }, ref) => (
  <li className={styles.tag} title={description}>
    <span className={styles.textLabel}>{label.toLowerCase()}</span>
    <span className={styles.colorLabel} style={{ backgroundColor: color }} />
  </li>
));

function ShowcaseCardTag({ tags }) {
  const location = useLocation();
  const selectedTags = location.pathname.includes("tools")
    ? ToolsTags
    : ShowcaseTags;
  const tagObjects = tags.map((tag) => ({ tag, ...selectedTags[tag] }));

  return (
    <>
      {tagObjects.map((tagObject, index) => {
        const id = `showcase_card_tag_${tagObject.tag}`;

        return (
          <Tooltip
            key={index}
            text={tagObject.description}
            anchorEl="#__docusaurus"
            id={id}
          >
            <TagComp key={index} {...tagObject} />
          </Tooltip>
        );
      })}
    </>
  );
}

const ShowcaseCard = memo((card) => (
  <li className="card shadow--md">
    <div className={clsx("card__image", styles.showcaseCardImage)}>
      <Image img={card.showcase.preview} alt={card.showcase.title} />
    </div>
    <div className="card__body">
      <div className={clsx(styles.showcaseCardHeader)}>
        <h4 className={styles.showcaseCardTitle}>
          <Link href={card.showcase.website}>{card.showcase.title}</Link>
        </h4>
        {card.showcase.tags.includes("favorite") && (
          <Fav className={styles.svgIconFavorite} size="small" />
        )}
        {card.showcase.getstarted && (
          <Link
            href={card.showcase.getstarted}
            className={clsx(
              "button button--secondary button--sm",
              styles.showcaseCardSrcBtn
            )}
          >
            Get Started
          </Link>
        )}
        {card.showcase.source && (
          <Link
            href={card.showcase.source}
            className={clsx(
              "button button--secondary button--sm",
              styles.showcaseCardSrcBtn
            )}
          >
            Source
          </Link>
        )}
      </div>
      <p className={styles.showcaseCardBody}>{card.showcase.description}</p>
    </div>
    <ul className={clsx("card__footer", styles.cardFooter)}>
      <ShowcaseCardTag tags={card.showcase.tags} />
    </ul>
  </li>
));

export default ShowcaseCard;
