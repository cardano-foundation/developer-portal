import React from 'react'
import styles from "../styles.module.css";
import ShowcaseCardTagIcons from './TagIcons';


const ShowcaseBody = ({tags,title,description}) => (
  <div className="card__body">
  <div className="avatar">
    <div className="avatar__intro margin-left--none">
      <div className={styles.titleIconsRow}>
        <div className={styles.titleIconsRowTitle}>
          <h4 className="avatar__name">{title}</h4>
        </div>
        <div className={styles.titleIconsRowIcons}>
          <ShowcaseCardTagIcons tags={tags} />
        </div>
      </div>
      <small className="avatar__subtitle">{description}</small>
    </div>
  </div>
</div>
)

export default ShowcaseBody;