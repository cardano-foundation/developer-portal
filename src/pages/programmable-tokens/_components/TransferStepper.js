import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from "../styles.module.css";

/* One transfer, told as what each script enforces. The scripts do not
   call each other: each requires the next one to run in the same
   transaction, and the ledger runs all of them. Source: CIP-0113,
   "Transfer" and "Architecture: Delegation Pattern". */
const CHECKS = [
  {
    title: "No way around the checks",
    body: "The token sits at one shared script address, so moving it always runs the checks below.",
    by: "programmableLogicBase",
  },
  {
    title: "The right checks run",
    body: "The transaction declares a transfer, so the transfer checks must run in it too.",
    by: "programmableLogicGlobal",
  },
  {
    title: "Owner signed, tokens stay in custody",
    body: "Alice signed, and every Token output lands in a smart wallet: 40 for Bob, 60 back to Alice.",
    by: "transfer delegate",
  },
  {
    title: "The issuer's rule",
    body: "Whatever the token's module requires. In this example: Alice is not on the issuer's denylist.",
    failBody: "In this example, Alice is on the issuer's denylist. This script fails.",
    by: "Token transfer logic",
  },
];

const STEP_MS = 700;

export default function TransferStepper() {
  const [denied, setDenied] = useState(false);
  /* -1: idle; 0..3: checking that script; 4: done. */
  const [phase, setPhase] = useState(-1);
  const timer = useRef(null);

  const failAt = denied ? CHECKS.length - 1 : -1;
  const stopped = failAt !== -1 && phase >= failAt;
  const done = phase >= CHECKS.length || stopped;
  const accepted = done && !stopped;

  useEffect(() => {
    if (phase < 0 || done) return undefined;
    timer.current = setTimeout(() => setPhase(p => p + 1), STEP_MS);
    return () => clearTimeout(timer.current);
  }, [phase, done]);

  function send() {
    clearTimeout(timer.current);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase(still ? (denied ? failAt : CHECKS.length) : 0);
  }

  function toggle(e) {
    clearTimeout(timer.current);
    setDenied(e.target.checked);
    setPhase(-1);
  }

  function stateOf(i) {
    if (phase < i) return "idle";
    if (i === failAt) return "fail";
    if (phase === i && !done) return "active";
    return "pass";
  }

  /* Token position on the track: at Alice, over the card being checked,
     or at Bob. */
  const tokenAt = phase < 0 ? 0 : accepted ? 100 : ((Math.min(phase, 3) + 0.5) / 4) * 100;

  let result = "";
  if (phase >= 0 && !done) result = "Checking…";
  if (accepted) result = "Accepted. Every check passed, and Bob receives 40 Token.";
  if (stopped) result = "Rejected. One failed check invalidates the whole transaction, so nothing moves.";

  return (
    <div className={styles.stepper}>
      <div className={styles.stepperTop}>
        <button type="button" className="button button--primary" onClick={send}>
          Send 40 Token to Bob
        </button>
        <label className={styles.switch}>
          <input type="checkbox" checked={denied} onChange={toggle} />
          <span className={styles.switchTrack} aria-hidden="true" />
          Alice is on the denylist
          <span className={styles.exampleTag}>example rule</span>
        </label>
      </div>

      <div className={styles.route} aria-hidden="true">
        <span className={styles.routeEnd}>Alice</span>
        <span className={styles.routeTrack}>
          <span
            className={clsx(styles.routeToken, stopped && styles.routeTokenStopped)}
            style={{ left: `${tokenAt}%` }}
          />
        </span>
        <span className={clsx(styles.routeEnd, accepted && styles.routeEndOn)}>
          Bob{accepted && " +40 Token"}
        </span>
      </div>

      <ol className={styles.checkRow}>
        {CHECKS.map((c, i) => {
          const state = stateOf(i);
          return (
            <li
              key={c.title}
              className={clsx(
                styles.checkCard,
                state === "active" && styles.checkActive,
                state === "pass" && styles.checkPass,
                state === "fail" && styles.checkFail,
              )}
            >
              <span className={styles.checkMark} aria-hidden="true">
                {state === "pass" ? "✓" : state === "fail" ? "✕" : i + 1}
              </span>
              <h4>{c.title}</h4>
              <p>{state === "fail" ? c.failBody : c.body}</p>
              <span className={styles.checkBy}>
                by <code>{c.by}</code>
              </span>
            </li>
          );
        })}
      </ol>

      <p
        className={clsx(
          styles.checkResult,
          !result && styles.checkResultEmpty,
          accepted && styles.checkResultPass,
          stopped && styles.checkResultFail,
        )}
        aria-live="polite"
      >
        {result}
      </p>
    </div>
  );
}
