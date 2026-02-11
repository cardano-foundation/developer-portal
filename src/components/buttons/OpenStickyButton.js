import React from "react";
import styles from "./styles.module.css";

export default function OpenStickyButton() {
  return (
    <a href="/docs/portal-contribute">
      <button className={`${styles.iconBtn} ${styles.addBtn}`}>
        <div className={styles.addIcon}></div>
        <div className={styles.btnText}>
          <span className={styles.btnSpan}>CONTRIBUTE NOW</span>
        </div>
      </button>
    </a>
  );
}
