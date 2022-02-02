/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {memo, forwardRef} from 'react';
import clsx from 'clsx';
import Image from '@theme/IdealImage';
import Link from '@docusaurus/Link';

import styles from './styles.module.css';
import Tooltip from '../ShowcaseTooltip/index';
import {
  Tags,
} from '../../../data/builder-tools';
import Fav from '../../../svg/fav.svg'

const TagComp = forwardRef(
  ({label, color, description}, ref) => (
    <li className={styles.tag} title={description}>
      <span className={styles.textLabel}>{label.toLowerCase()}</span>
      <span className={styles.colorLabel} style={{backgroundColor: color}} />
    </li>
  ),
);

function ShowcaseCardTag({tags}) {
  const tagObjects = tags.map((tag) => ({tag, ...Tags[tag]}));

  return (
    <>
      {tagObjects.map((tagObject, index) => {
        const id = `showcase_card_tag_${tagObject.tag}`;

        return (
          <Tooltip
            key={index}
            text={tagObject.description}
            anchorEl="#__docusaurus"
            id={id}>
            <TagComp key={index} {...tagObject} />
          </Tooltip>
        );
      })}
    </>
  );
}

const ShowcaseCard = memo((user) => (
  <li  className="card shadow--md">
    <div className={clsx('card__image', styles.showcaseCardImage)}>
      <Image img={user.showcase.preview} alt={user.showcase.title} />
    </div>
    <div className="card__body">
      <div className={clsx(styles.showcaseCardHeader)}>
        <h4 className={styles.showcaseCardTitle}>
          <Link href={user.showcase.website}>
            {user.showcase.title}
          </Link>
        </h4>
        {user.showcase.tags.includes('featured') && (
          <Fav svgClass={styles.svgIconFavorite} size="small" />
        )}
        {user.showcase.website && (
          <Link
            href={user.showcase.website}
            className={clsx(
              'button button--secondary button--sm',
              styles.showcaseCardSrcBtn,
            )}
            >
            Source
          </Link>
        )}
      </div>
      <p className={styles.showcaseCardBody}>{user.showcase.description}</p>
    </div>
    <ul className={clsx('card__footer', styles.cardFooter)}>
      <ShowcaseCardTag tags={user.showcase.tags} />
    </ul>
  </li>
));

export default ShowcaseCard;
