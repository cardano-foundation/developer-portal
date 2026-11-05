import React, { useEffect, useState } from "react";
import styles from "../styles.module.css";

/* Hero art: the whole idea in one row. A token leaves Alice's wallet and
   stops at the token's own transfer rules. The first transfer passes and
   reaches Bob; the second is blocked at the gate. Loops; decorative, so it
   is hidden from assistive tech. With reduced motion it renders the passed
   state without animating. */
const DUR = "10s";
const LINE = { from: 130, to: 430, y: 150 };

/* Normalized timeline over DUR. The token waits just short of the gate
   (0.3167 of the line) so the verdict mark stays visible. Pass: move,
   check, continue to Bob.
   Block: move, check, stop and fade. */
const MOTION_TIMES = "0;0.05;0.18;0.26;0.38;0.47;0.48;0.55;0.68;1";
const MOTION_POINTS = "0;0;0.3167;0.3167;1;1;0;0;0.3167;0.3167";
const TOKEN_TIMES = "0;0.03;0.42;0.46;0.5;0.53;0.82;0.88;1";
const TOKEN_VALUES = "0;1;1;0;0;1;1;0;0";

function Show({ from, to }) {
  return (
    <animate
      attributeName="opacity"
      values="0;0;1;1;0;0"
      keyTimes={`0;${from};${from + 0.02};${to};${to + 0.02};1`}
      dur={DUR}
      repeatCount="indefinite"
    />
  );
}

function Wallet({ x, name, children }) {
  return (
    <g>
      <rect x={x} y="110" width="130" height="80" rx="14" className={styles.heroNodeBox} />
      {children}
      <text x={x + 65} y="146" className={styles.heroNodeKey}>
        {name}
      </text>
      <text x={x + 65} y="170" className={styles.heroNodeNext}>
        wallet
      </text>
    </g>
  );
}

export default function HeroTransfer() {
  const [still, setStill] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(query.matches);
    const onChange = e => setStill(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const passOn = still ? 1 : 0;

  return (
    <svg className={styles.heroArt} viewBox="0 0 560 300" aria-hidden="true" focusable="false">
      <line x1={LINE.from} y1={LINE.y} x2={LINE.to} y2={LINE.y} className={styles.heroLink} />

      <Wallet x={0} name="Alice" />
      <Wallet x={430} name="Bob">
        <rect
          x="430"
          y="110"
          width="130"
          height="80"
          rx="14"
          className={styles.heroNodeLit}
          opacity={passOn}
        >
          {!still && <Show from={0.37} to={0.46} />}
        </rect>
      </Wallet>

      {/* The gate: the token's transfer rules. */}
      <text x="280" y="78" className={styles.heroGateCaption}>
        transfer rules
      </text>
      <rect x="235" y="105" width="90" height="90" rx="18" className={styles.heroGate} />
      <text x="280" y="158" className={styles.heroGateIdle}>
        {"{ }"}
      </text>
      <g opacity={passOn}>
        {!still && <Show from={0.22} to={0.44} />}
        <rect x="235" y="105" width="90" height="90" rx="18" className={styles.heroGatePass} />
        <text x="280" y="162" className={styles.heroGateMark}>
          ✓
        </text>
        <text x="280" y="228" className={styles.heroVerdictPass}>
          passed
        </text>
      </g>
      {!still && (
        <g opacity="0">
          <Show from={0.66} to={0.9} />
          <rect x="235" y="105" width="90" height="90" rx="18" className={styles.heroGateBlock} />
          <text x="280" y="162" className={styles.heroGateMark}>
            ✕
          </text>
          <text x="280" y="228" className={styles.heroVerdictBlock}>
            blocked
          </text>
        </g>
      )}

      <g transform={still ? `translate(${LINE.to} ${LINE.y})` : undefined} opacity={still ? 0 : 1}>
        {!still && (
          <>
            <animateMotion
              path={`M ${LINE.from} ${LINE.y} L ${LINE.to} ${LINE.y}`}
              keyTimes={MOTION_TIMES}
              keyPoints={MOTION_POINTS}
              calcMode="linear"
              dur={DUR}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values={TOKEN_VALUES}
              keyTimes={TOKEN_TIMES}
              dur={DUR}
              repeatCount="indefinite"
            />
          </>
        )}
        <circle r="20" className={styles.heroTokenGlow} />
        <circle r="11" className={styles.heroToken} />
      </g>

      <text x="280" y="282" className={styles.heroArtCaption}>
        the token&apos;s rules run on every transfer
      </text>
    </svg>
  );
}
