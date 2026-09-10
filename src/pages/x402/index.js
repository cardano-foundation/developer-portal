import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import PageCTA from "@site/src/components/PageCTA";
import ExternalArrow from "@site/src/components/ExternalArrow";
import useCopyToClipboard from "@site/src/utils/useCopyToClipboard";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import styles from "./styles.module.css";

const TITLE = "Agentic Commerce on Cardano";
const DESCRIPTION =
  "Build autonomous agents that collaborate and get paid — the x402 hackathon track at TOKEN2049 Origins 2026";

const SCAFFOLD_COMMAND =
  "npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/x402-express my-app";

/* Mirrors a real run of the starter on preprod (2 tADA, settled in 27.9s,
   tx df1f9bca…) — compressed, not invented. */
const TERMINAL_LINES = [
  { cls: "termCmd", prompt: true, text: "npm run demo" },
  { cls: "termReq", text: "→ GET /api/message" },
  { cls: "term402", text: "← 402 Payment Required · 2 tADA on preprod" },
  { cls: "termMuted", text: "building and signing the payment tx …" },
  { cls: "termReq", text: "→ GET /api/message · PAYMENT-SIGNATURE" },
  { cls: "term200", text: "← 200 OK · 27.9s" },
  { cls: "termBody", text: '{ "message": "You paid for this with x402 on Cardano." }' },
  { cls: "termMuted", text: "receipt: df1f9bca… · confirmed on preprod" },
];

const MARKET = [
  {
    title: "Sell",
    text: "Monetize your endpoints, APIs, or content per request.",
    hint: "start in seller.ts · paymentMiddleware",
  },
  {
    title: "Buy",
    text: "Build agents that autonomously pay for the services they use.",
    hint: "start in buyer.ts · wrapFetchWithPayment",
  },
  {
    title: "Build in between",
    text: "Agent-to-agent marketplaces, and the tooling and infrastructure underneath it all.",
    hint: "both sides · plus the Masumi standard",
  },
];

const DEEPER_LINKS = [
  {
    title: "The Masumi standard",
    href: "https://www.masumi.network/x402",
    text: "Escrow accounts, refunds, dispute handling, agent identity, and an on-chain registry — extending x402 on Cardano.",
  },
  {
    title: "The Cardano x402 scheme",
    href: "https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md",
    text: "The specification — officially part of the x402 standard.",
  },
  {
    title: "The full protocol demo",
    href: "https://github.com/Kammerlo/x402-cardano-demo",
    text: "Browser wallet, USDM, escrow routes, and a step-by-step visual UI.",
  },
];

const CHECKLIST = [
  "A working prototype on Cardano preprod — a dApp with a frontend, or a tool/agent with a live demo.",
  "An open-source repository with documentation.",
  "A demo video of max 3 minutes showing the product in action.",
  "A short write-up: the problem, the technical approach, and how it could be deployed or scaled in real-world use.",
  "At least one x402 payment on preprod through the provided facilitator — weighted favorably in judging.",
];

const TROUBLESHOOTING = [
  [
    "Seller answers 500 with “no supported payment kinds”",
    "The facilitator isn’t reachable at FACILITATOR_URL — start one (npm run facilitator) or fix the URL.",
  ],
  [
    "Buyer prints “Payment failed: HTTP 402”",
    "The payment was attempted and rejected — the reason (invalidReason) is in the facilitator’s log.",
  ],
  [
    "Buyer hangs, then fails",
    "Wallet not funded yet, or the faucet is still pending — check the address on preprod.cardanoscan.io.",
  ],
  [
    "Rejections come back as HTTP 200",
    "That’s the protocol shape: verify answers 200 with isValid:false and a reason. 4xx/5xx means transport, not payment.",
  ],
  [
    "Everything takes 20–60 seconds after paying",
    "That’s one on-chain confirmation on preprod — the chain, not a bug.",
  ],
];

/* The page's one code surface: a dark block in both themes, with an optional
   mono label and copy button. Hand-styled because the theme CodeBlock follows
   the color scheme. */
function Snippet({ label, copyText, children }) {
  const [copied, copy] = useCopyToClipboard(2000);
  return (
    <div className={styles.snippet}>
      {(label || copyText) && (
        <div className={styles.snippetBar}>
          <span className={styles.snippetLabel}>{label}</span>
          {copyText && (
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copy(copyText)}
              aria-label="Copy to clipboard"
            >
              {copied ? "copied" : "copy"}
            </button>
          )}
        </div>
      )}
      <pre className={styles.snippetPre}>{children}</pre>
    </div>
  );
}

function Step({ number, title, time, children }) {
  return (
    <li className={styles.step}>
      <div className={styles.stepHead}>
        <h3>
          {number}. {title}
        </h3>
        {time && <span className={styles.time}>{time}</span>}
      </div>
      {children}
    </li>
  );
}

export default function X402Page() {
  const bandArt = useBaseUrl("img/talent/start-building-cubes.webp");

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <main className={styles.page}>
        <div className="container">
          <div className={styles.wrap}>
            <header className={styles.hero}>
              <p className={clsx("monoKicker", styles.heroKicker)}>
                TOKEN2049 Origins 2026 · Hackathon track
              </p>
              <h1 className={styles.heroTitle}>Agentic Commerce</h1>
              <p className={styles.heroSubtitle}>
                Build autonomous agents that collaborate and get paid — on Cardano.
              </p>
              <p className={styles.heroFacts}>$27,500 prize pool · 36 hours, Oct 6–7 · preprod</p>
              <div className={styles.heroActions}>
                <a className="button button--primary" href="#start">
                  Start building
                </a>
                <a href="#rules">Rules &amp; judging</a>
              </div>
            </header>

            <section className={styles.section}>
              <h2>AI agents are becoming customers</h2>
              <p>
                This track is about building for the agentic economy on Cardano with{" "}
                <strong>x402</strong>, the open standard that puts HTTP&apos;s reserved 402
                &quot;Payment Required&quot; status code to work. An agent requests a resource,
                receives a price, pays on-chain, and accesses the service — with no accounts or API
                keys.
              </p>
              <p>
                x402 handles the payment. The open <strong>Masumi</strong> standard extends it on
                Cardano with what agents need beyond paying: escrow accounts, refunds, dispute
                handling, agent identity, and an on-chain registry where agents find each other.
                Use x402 on its own for payments, or build on Masumi when your agents work with
                each other.
              </p>
              <Snippet>
                {TERMINAL_LINES.map((line, i) => (
                  <div className={styles[line.cls]} key={i}>
                    {line.prompt && <span className={styles.termPrompt}>$ </span>}
                    {line.text}
                  </div>
                ))}
              </Snippet>
            </section>

            <section className={styles.section}>
              <h2>Pick your side of the market</h2>
              {MARKET.map(row => (
                <div className={styles.marketRow} key={row.title}>
                  <h3>{row.title}</h3>
                  <p>{row.text}</p>
                  <p className={styles.hint}>{row.hint}</p>
                </div>
              ))}
              <p>Anything that advances agentic commerce on Cardano is in scope.</p>
            </section>

            <section className={clsx(styles.section, styles.anchorTarget)} id="start">
              <h2>From zero to a paid request</h2>
              <p className={styles.lead}>
                From an empty directory to one successful x402 payment on preprod — a real 2 tADA
                API call with the receipt on-chain. About 15 minutes; the faucet wait is most of
                it.
              </p>
              <p>
                <strong>Building with a coding agent?</strong> Claude Code, Codex, or another agent
                can run this whole path for you. Install{" "}
                <a
                  href="https://cardano-foundation.github.io/cardano-dev-skills/"
                  {...EXTERNAL_LINK_PROPS}
                >
                  cardano-dev-skills
                </a>{" "}
                first, so it works from current Cardano sources instead of stale training data:
              </p>
              <Snippet
                label="your coding agent"
                copyText={
                  "/plugin marketplace add cardano-foundation/cardano-dev-skills\n/plugin install cardano-dev-skills@cardano-dev-skills"
                }
              >
                <div className={styles.cCmd}>
                  /plugin marketplace add cardano-foundation/cardano-dev-skills
                </div>
                <div className={styles.cCmd}>
                  /plugin install cardano-dev-skills@cardano-dev-skills
                </div>
              </Snippet>
              <ol className={styles.steps}>
                <Step number="1" title="Scaffold the template" time="~2 min">
                  <p>
                    A paid API, an agent that pays for it, and a local facilitator — the whole x402
                    loop in four short files.
                  </p>
                  <Snippet
                    label="terminal"
                    copyText={`${SCAFFOLD_COMMAND}\ncd my-app && npm install`}
                  >
                    <div className={styles.cCmd}>{SCAFFOLD_COMMAND}</div>
                    <div className={styles.cCmd}>cd my-app &amp;&amp; npm install</div>
                  </Snippet>
                  <p>
                    <Link to="/templates/">Browse the template</Link> — the README carries this
                    quickstart and the troubleshooting table.
                  </p>
                </Step>
                <Step number="2" title="Create a wallet and fund it" time="~5 min · mostly the faucet">
                  <Snippet label="terminal" copyText="npm run wallet">
                    <div className={styles.cCmd}>npm run wallet</div>
                  </Snippet>
                  <p>
                    It prints a <code>MNEMONIC</code> and the address to fund. Test ADA is free
                    from the{" "}
                    <a
                      href="https://docs.cardano.org/cardano-testnets/tools/faucet"
                      {...EXTERNAL_LINK_PROPS}
                    >
                      preprod faucet
                    </a>{" "}
                    — select <strong>Preprod</strong>; funds usually arrive within a minute or two.
                    Test USDM is an optional self-serve claim at{" "}
                    <a href="https://tusdm.moneta.global/#manual" {...EXTERNAL_LINK_PROPS}>
                      tusdm.moneta.global
                    </a>
                    .
                  </p>
                </Step>
                <Step number="3" title="Fill in .env" time="~3 min">
                  <p>
                    Two ids do all the work: your funded wallet, and free chain access from{" "}
                    <a href="https://blockfrost.io" {...EXTERNAL_LINK_PROPS}>
                      blockfrost.io
                    </a>
                    .
                  </p>
                  <Snippet
                    label=".env"
                    copyText={`FACILITATOR_URL=http://localhost:4022\nSELLER_ADDRESS=addr_test1...\nMNEMONIC=...\nBLOCKFROST_PROJECT_ID=preprod...`}
                  >
                    <div>
                      <span className={styles.cKey}>FACILITATOR_URL</span>=http://localhost:4022
                      {"   "}
                      <span className={styles.cComment}># hosted URL announced before the event</span>
                    </div>
                    <div>
                      <span className={styles.cKey}>SELLER_ADDRESS</span>=addr_test1...
                      {"            "}
                      <span className={styles.cComment}># receives the payment</span>
                    </div>
                    <div>
                      <span className={styles.cKey}>MNEMONIC</span>=...{"                            "}
                      <span className={styles.cComment}># from npm run wallet, funded</span>
                    </div>
                    <div>
                      <span className={styles.cKey}>BLOCKFROST_PROJECT_ID</span>=preprod...
                      {"        "}
                      <span className={styles.cComment}># free at blockfrost.io</span>
                    </div>
                  </Snippet>
                  <p className={styles.slotNote}>
                    The hosted facilitator endpoint will be published here before the hackathon. It
                    verifies and settles payments — your code never touches chain infrastructure,
                    and it holds no keys and no funds.
                  </p>
                </Step>
                <Step
                  number="4"
                  title="Run it — one payment, on-chain"
                  time="~1 min · plus one confirmation"
                >
                  <p>
                    Two terminals. The seller comes up, the buyer hits the paid route, gets the
                    402, pays, and retries:
                  </p>
                  <Snippet label="terminal" copyText={"npm run facilitator\nnpm run demo"}>
                    <div>
                      <span className={styles.cCmd}>npm run facilitator</span>
                      {"   "}
                      <span className={styles.cComment}># terminal 1 — until the hosted URL lands</span>
                    </div>
                    <div>
                      <span className={styles.cCmd}>npm run demo</span>
                      {"          "}
                      <span className={styles.cComment}># terminal 2</span>
                    </div>
                  </Snippet>
                  <p className={styles.snippetCaption}>Success looks like</p>
                  <Snippet>
                    <div className={styles.term402}>← 402 Payment Required · 2 tADA on preprod</div>
                    <div className={styles.term200}>← 200 OK · 27.9s</div>
                    <div className={styles.termMuted}>
                      receipt: df1f9bca… · preprod.cardanoscan.io/transaction/df1f9bca…
                    </div>
                  </Snippet>
                  <p>
                    That receipt is a real transaction — open it in the explorer. From here
                    it&apos;s yours: change the route and price in <code>seller.ts</code>, or point
                    the buyer at someone else&apos;s endpoint.
                  </p>
                </Step>
              </ol>
            </section>

            <section className={styles.section}>
              <h2>Go deeper</h2>
              <ul className={styles.deeper}>
                {DEEPER_LINKS.map(link => (
                  <li key={link.href}>
                    <a href={link.href} {...EXTERNAL_LINK_PROPS}>
                      {link.title}
                      <ExternalArrow />
                    </a>
                    <p>{link.text}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className={clsx(styles.section, styles.anchorTarget)} id="rules">
              <h2>Rules &amp; judging</h2>
              <p className={styles.lead}>
                Judging weighs use-case quality, technical execution, a real payment on preprod,
                and long-term potential.
              </p>
              <h3>To qualify</h3>
              <ul className={styles.checklist}>
                {CHECKLIST.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3>Prizes</h3>
              <p className={styles.prizes}>1st $15,000 · 2nd $7,500 · 3rd $5,000</p>
              <p className={styles.slotNote}>
                The support channel will be published here. On site, Cardano Foundation mentors are
                available throughout the 36 hours.
              </p>
            </section>

            <section className={styles.section}>
              <h2>When something fails</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Symptom</th>
                      <th>Cause / fix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TROUBLESHOOTING.map(([symptom, fix]) => (
                      <tr key={symptom}>
                        <td>{symptom}</td>
                        <td>{fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <PageCTA
          title="Keep building on Cardano"
          description="Guides, tutorials, and templates for everything beyond the hackathon."
          buttons={[
            { href: "/docs/developers/", label: "Get Started" },
            { href: "/templates/", label: "Browse Templates" },
          ]}
          art={bandArt}
        />
      </main>
    </Layout>
  );
}
