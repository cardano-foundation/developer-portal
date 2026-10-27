import React from "react";
import clsx from "clsx";
import styles from "../styles.module.css";

/* The worked example from CIP-0113 ("Address Derivation", preview), shown
   for the staking-key derivation. Header, payment and stake parts were
   decoded from the bech32 strings, so each one matches its address byte
   for byte. */
const BASE_HASH = "f2182b00a37bd746e20575c9af01ab31312213514cd31e872e0a2a3e";
const STAKE_KEY = "7350def5f1aa50624fbaf6ac0f4f6ab36de826867b4ed20fe7a8dfea";
const USER_ADDRESS =
  "addr_test1qra006fdksqadv3z09a8lqf4aw8n62nmgkra9narr683x9rn2r00tud22p3ylwhk4s85764ndh5zdpnmfmfqleagml4qkhan0d";
const TOKEN_ADDRESS =
  "addr_test1zreps2cq5daaw3hzq46untcp4vcnzgsn29xdx8589c9z50nn2r00tud22p3ylwhk4s85764ndh5zdpnmfmfqleagml4qe650tm";

function short(hash) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export default function AddressAnatomy() {
  return (
    <figure className={styles.anatomy}>
      <figcaption className={styles.widgetLabel}>Address anatomy · preview</figcaption>

      <div>
        <span className={styles.anatomyKicker}>Your wallet address</span>
        <code className={styles.anatomyAddress}>{USER_ADDRESS}</code>
        <div className={styles.anatomyKeys}>
          <span className={clsx(styles.anatomyKey, styles.anatomyKeyOn)}>
            staking key <code>{short(STAKE_KEY)}</code>
          </span>
        </div>
      </div>

      <span className={styles.anatomyDown} aria-hidden="true">
        ↓
      </span>

      <div className={styles.anatomyParts}>
        <div className={clsx(styles.anatomyPart, styles.anatomyPartFixed)}>
          <span className={styles.anatomyKicker}>Payment credential</span>
          <code>{short(BASE_HASH)}</code>
          <span className={styles.anatomyNote}>
            <code>programmableLogicBase</code>, the same for every holder
          </span>
        </div>
        <span className={styles.anatomyPlus} aria-hidden="true">
          +
        </span>
        <div className={clsx(styles.anatomyPart, styles.anatomyPartOwner)}>
          <span className={styles.anatomyKicker}>Stake credential</span>
          <code>{short(STAKE_KEY)}</code>
          <span className={styles.anatomyNote}>your staking key: you own and sign</span>
        </div>
      </div>

      <span className={styles.anatomyDown} aria-hidden="true">
        ↓
      </span>

      <div>
        <span className={styles.anatomyKicker}>Your programmable token address</span>
        <code className={styles.anatomyAddress}>{TOKEN_ADDRESS}</code>
      </div>
    </figure>
  );
}
