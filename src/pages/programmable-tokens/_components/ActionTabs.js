import React, { useRef, useState } from "react";
import clsx from "clsx";
import styles from "../styles.module.css";

/* Mint goes through the token's permanent issuance policy; the other three
   are the actions of programmableLogicGlobal, each with its own delegate.
   Source: CIP-0113, "High level flow", "TransferAct", "ThirdPartyAct" and
   "UnfrackingAct". */
const ACTIONS = [
  {
    id: "mint",
    name: "Mint",
    entry: "issuanceMintingPolicy",
    who: "The issuer",
    auth: "The token's minting logic decides who may mint and burn",
    script: "minting_logic_script",
    checks: [
      "Minted tokens must land at programmableLogicBase addresses; they cannot leave custody",
      "The token's minting logic runs in the same transaction",
      "The issuance policy is permanent, so the policy ID never changes",
      "Issuers burn tokens they hold; taking tokens from a holder is a third-party action",
    ],
    before: [{ owner: "Issuer", assets: ["mint 100 Token"] }],
    after: [{ owner: "Alice", assets: ["100 Token"] }],
  },
  {
    id: "transfer",
    name: "Transfer",
    entry: "TransferAct",
    who: "The holder",
    auth: "The holder's stake credential: a signature, or the holder's script runs",
    script: "transfer_logic_script",
    checks: [
      "One registry proof per policy spent or minted, in lexicographic order",
      "Every registered policy's transfer logic runs",
      "Programmable value stays at programmableLogicBase addresses",
      "Mint and burn can ride along: spend 100, burn 30, output 70",
    ],
    before: [{ owner: "Alice", assets: ["100 Token"] }],
    after: [
      { owner: "Bob", assets: ["40 Token"] },
      { owner: "Alice", assets: ["60 Token"] },
    ],
  },
  {
    id: "third-party",
    name: "Third party",
    entry: "ThirdPartyAct",
    who: "Whoever the module allows, for example an issuer admin",
    auth: "No holder signature: third_party_logic_script decides who and what",
    script: "third_party_logic_script",
    checks: [
      "Each input pairs with an output at the same address, with the same datum",
      "Only the acted-on policy may change, and it must change",
      "That policy's total at programmableLogicBase never drops, except by a burn in the same transaction",
      "Covers partial seizure, wipe (seize and burn) and batches across many UTxOs",
    ],
    before: [{ owner: "Alice", assets: ["100 Token"] }],
    after: [
      { owner: "Alice", assets: ["60 Token"] },
      { owner: "Issuer", assets: ["40 Token"] },
    ],
  },
  {
    id: "unfracking",
    name: "Unfracking",
    entry: "UnfrackingAct",
    disabled: true,
    who: "The holder",
    auth: "The holder's stake credential, as for a transfer",
    script: "unfracking_logic_script",
    checks: [
      "One policy per action, removed entirely from the continuing output",
      "Every other token, the address, the datum and the reference script stay byte-identical; ADA may move",
      "Ownership does not change: it restructures, it does not transfer",
      "Forbidden by default: an empty credential means no unfracking for that policy",
    ],
    before: [{ owner: "Alice", assets: ["100 Token", "5 Other"], frozen: "Token" }],
    after: [
      { owner: "Alice", assets: ["5 Other"] },
      { owner: "Alice", assets: ["100 Token"], frozen: "Token" },
    ],
    note: "Token is frozen. While it shares a UTxO with Other, Other is stuck too. Unfracking moves Token into its own UTxO, so Other can move again.",
  },
];

function Utxo({ utxo }) {
  return (
    <div className={styles.utxo}>
      <span className={styles.utxoOwner}>{utxo.owner}</span>
      {utxo.assets.map(a => (
        <span
          key={a}
          className={clsx(styles.utxoAsset, utxo.frozen && a.endsWith(utxo.frozen) && styles.utxoFrozen)}
        >
          {a}
        </span>
      ))}
    </div>
  );
}

export default function ActionTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const action = ACTIONS[active];

  function onKeyDown(e) {
    const last = ACTIONS.length - 1;
    const moves = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    setActive(moves[e.key]);
    tabs.current[moves[e.key]]?.focus();
  }

  return (
    <div className={styles.actions}>
      <div className={styles.tabList} role="tablist" aria-label="Programmable token actions">
        {ACTIONS.map((a, i) => (
          <button
            key={a.id}
            ref={el => (tabs.current[i] = el)}
            type="button"
            role="tab"
            id={`action-tab-${a.id}`}
            aria-selected={i === active}
            aria-controls={i === active ? `action-panel-${a.id}` : undefined}
            tabIndex={i === active ? 0 : -1}
            className={clsx(styles.tab, i === active && styles.tabOn)}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {a.name}
            {a.disabled && " "}
            {a.disabled && <span className={styles.tabOff}>off</span>}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`action-panel-${action.id}`}
        aria-labelledby={`action-tab-${action.id}`}
        tabIndex={0}
        className={styles.tabPanel}
      >
        {action.disabled && (
          <p className={styles.disabledNote}>
            Disabled in the current implementation. This is what CIP-113 specifies for it.
          </p>
        )}
        <dl className={styles.actionFacts}>
          <div>
            <dt>Entry point</dt>
            <dd>
              <code>{action.entry}</code>
            </dd>
          </div>
          <div>
            <dt>Started by</dt>
            <dd>{action.who}</dd>
          </div>
          <div>
            <dt>Authorized by</dt>
            <dd>{action.auth}</dd>
          </div>
          <div>
            <dt>Token script that must run</dt>
            <dd>
              <code>{action.script}</code>
            </dd>
          </div>
        </dl>

        <div className={styles.actionBody}>
          <ul className={styles.checkList}>
            {action.checks.map(c => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className={styles.flow} role="group" aria-label="Example, before and after">
            <div className={styles.flowSide}>
              <span className={styles.txColLabel}>Before</span>
              {action.before.map((u, i) => (
                <Utxo key={i} utxo={u} />
              ))}
            </div>
            <span className={styles.flowArrow} aria-hidden="true">
              →
            </span>
            <div className={styles.flowSide}>
              <span className={styles.txColLabel}>After</span>
              {action.after.map((u, i) => (
                <Utxo key={i} utxo={u} />
              ))}
            </div>
          </div>
        </div>
        {action.note && <p className={styles.actionNote}>{action.note}</p>}
      </div>
    </div>
  );
}
