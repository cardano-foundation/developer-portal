import React from "react";
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

/* In bech32 the stake credential fills the same 45 characters of both
   addresses, between the payment part and the 6-character checksum. */
const STAKE_START = 57;
const STAKE_END = 102;

function short(hash) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function Address({ label, value }) {
  return (
    <div>
      <span className={styles.anatomyKicker}>{label}</span>
      <code className={styles.anatomyAddress}>
        {value.slice(0, STAKE_START)}
        <mark className={styles.anatomyStake}>{value.slice(STAKE_START, STAKE_END)}</mark>
        {value.slice(STAKE_END)}
      </code>
    </div>
  );
}

export default function AddressAnatomy() {
  return (
    <figure className={styles.anatomy}>
      <figcaption className={styles.widgetLabel}>
        Address anatomy · CIP-113 example on Preview
      </figcaption>

      <Address label="Your wallet address" value={USER_ADDRESS} />
      <Address label="Your smart wallet address" value={TOKEN_ADDRESS} />

      <dl className={styles.anatomyLegend}>
        <div>
          <dt>
            <mark className={styles.anatomyStake}>Stake credential</mark>{" "}
            <code>{short(STAKE_KEY)}</code>
          </dt>
          <dd>Your staking key. It is the same in both addresses, so you own and sign.</dd>
        </div>
        <div>
          <dt>
            Payment credential <code>{short(BASE_HASH)}</code>
          </dt>
          <dd>
            In the smart wallet address it is <code>programmableLogicBase</code>, the same script for
            every holder.
          </dd>
        </div>
      </dl>
    </figure>
  );
}
