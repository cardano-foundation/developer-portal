import React from "react";
import styles from "./styles.module.css";

export default function openStickyButton() {
  return (
    <div>
      <button className={`${styles.iconBtn} ${styles.addBtn}`}>
        <div className={styles.addIcon}></div>
        <a
          className={styles.btnText}
          href="https://developers.cardano.org/docs/portal-contribute/"
          target="_blank"
        >
          <span className={styles.btnSpan}>CONTRIBUTE NOW</span>
        </a>
      </button>
    </div>
  );
}
