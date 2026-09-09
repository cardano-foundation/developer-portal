import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import CodeBlock from "@theme/CodeBlock";
import PageCTA from "@site/src/components/PageCTA";
import ExternalArrow from "@site/src/components/ExternalArrow";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import styles from "./styles.module.css";

const TITLE = "Agentic Commerce on Cardano";
const DESCRIPTION =
  "Build autonomous agents that collaborate and get paid — the x402 hackathon track at TOKEN2049 Origins 2026";

const SCAFFOLD_COMMAND =
  "npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/x402-express my-app";

/* The hero's decorative circle field, same primitive as the talent page:
   one entry per circle, row by row. The middle rows sit mostly behind the
   title panel, so their sequences only show at the edges. */
const HERO_ROWS = [
  ["ballAmber", "ballLavender", "ballGlow", "ballGray", "ballFade", "ballAmber", "ballLavender", "ballFade", "ballBlue", "ballGlow", "ballGray", "ballLavender", "ballGlow", "ballBlue", "ballGray", "ballFade", "ballLavender", "ballAmber", "ballBlue", "ballGlow", "ballGray", "ballFade"],
  ["ballGlow", "ballBlue", "ballGlow", "ballAmber", "ballGray", "ballFade", "ballLavender", "ballGlow", "ballBlue", "ballGray", "ballAmber", "ballFade", "ballGlow", "ballLavender", "ballBlue", "ballAmber", "ballGray", "ballBlue", "ballLavender", "ballFade", "ballAmber", "ballGlow"],
  ["ballGray", "ballLavender", "ballGray", "ballGlow", "ballBlue", "ballAmber", "ballFade", "ballBlue", "ballLavender", "ballGlow", "ballFade", "ballGray", "ballBlue", "ballAmber", "ballGlow", "ballLavender", "ballBlue", "ballFade", "ballGray", "ballAmber", "ballGlow", "ballLavender"],
  ["ballBlue", "ballFade", "ballAmber", "ballLavender", "ballGlow", "ballBlue", "ballGray", "ballFade", "ballAmber", "ballGlow", "ballLavender", "ballBlue", "ballGray", "ballGlow", "ballFade", "ballAmber", "ballLavender", "ballGray", "ballBlue", "ballGlow", "ballGray", "ballAmber"],
  ["ballLavender", "ballGlow", "ballBlue", "ballGray", "ballAmber", "ballFade", "ballGlow", "ballLavender", "ballBlue", "ballAmber", "ballGray", "ballGlow", "ballFade", "ballBlue", "ballLavender", "ballGlow", "ballAmber", "ballGray", "ballFade", "ballBlue", "ballLavender", "ballGray"],
  ["ballBlue", "ballAmber", "ballGlow", "ballLavender", "ballAmber", "ballBlue", "ballGray", "ballAmber", "ballGlow", "ballBlue", "ballGray", "ballAmber", "ballLavender", "ballBlue", "ballGray", "ballGlow", "ballAmber", "ballGray", "ballFade", "ballLavender", "ballBlue", "ballAmber"],
];

const FACTS = [
  { value: "$27,500", label: "prize pool" },
  { value: "36 hours", label: "Oct 6–7" },
  { value: "preprod", label: "network" },
];

/* The terminal transcript mirrors a real run of the starter template on
   preprod (2 tADA, settled in 27.9s, tx df1f9bca…) — compressed, not
   invented. */
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

const PRIZES = [
  { place: "1st place", value: "$15,000", first: true },
  { place: "2nd place", value: "$7,500" },
  { place: "3rd place", value: "$5,000" },
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

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroField} aria-hidden="true">
        {HERO_ROWS.map((row, rowIndex) => (
          <div className={styles.heroFieldRow} key={rowIndex}>
            {row.map((variant, ballIndex) => (
              <span key={ballIndex} className={clsx(styles.ball, styles[variant])} />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.heroPanel}>
        <p className={clsx("monoKicker", styles.heroKicker)}>
          TOKEN2049 Origins 2026 · Hackathon track
        </p>
        <h1 className={styles.heroTitle}>Agentic Commerce</h1>
        <p className={styles.heroSubtitle}>
          Build autonomous agents that collaborate and get paid — on Cardano.
        </p>
        <div className={styles.factRow}>
          {FACTS.map(fact => (
            <div className={styles.factTile} key={fact.label}>
              <span className={styles.factValue}>{fact.value}</span>
              <span className={styles.factLabel}>{fact.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.heroActions}>
          <a className="button button--primary" href="#start">
            Start building
          </a>
          <a className={styles.heroGhost} href="#rules">
            Rules &amp; judging
          </a>
        </div>
      </div>
    </header>
  );
}

function Terminal() {
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <span className={styles.terminalDot} />
        <span className={styles.terminalDot} />
        <span className={styles.terminalDot} />
        <span className={styles.terminalTitle}>x402-express — demo</span>
      </div>
      <pre className={styles.terminalBody}>
        {TERMINAL_LINES.map((line, i) => (
          <div className={styles[line.cls]} key={i}>
            {line.prompt && <span className={styles.termPrompt}>$ </span>}
            {line.text}
          </div>
        ))}
      </pre>
    </div>
  );
}

function ProtocolSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>AI agents are becoming customers</h2>
          <p>Buying data, compute, API calls, and each other&apos;s services.</p>
        </div>
        <div className={styles.protocolRow}>
          <div className={styles.protocolCopy}>
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
              handling, agent identity, and an on-chain registry where agents find each other. Use
              x402 on its own for payments, or build on Masumi when your agents work with each
              other.
            </p>
          </div>
          <Terminal />
        </div>
      </div>
    </section>
  );
}

function MarketSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Pick your side of the market</h2>
        </div>
        <div className={styles.cardGrid}>
          {MARKET.map(card => (
            <div className={styles.marketCard} key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className={clsx("monoKicker", styles.marketHint)}>{card.hint}</span>
            </div>
          ))}
        </div>
        <p className={styles.marketFooter}>
          Anything that advances agentic commerce on Cardano is in scope.
        </p>
      </div>
    </section>
  );
}

/* One step of the linear path: number rail, action title, a time hint,
   then the actual commands/config for that step. */
function PathStep({ number, title, time, children }) {
  return (
    <li className={styles.pathStep}>
      <span className={styles.pathDisc} aria-hidden="true">
        {number}
      </span>
      <div className={styles.pathHead}>
        <h3>{title}</h3>
        {time && <span className={clsx("monoKicker", styles.pathTime)}>{time}</span>}
      </div>
      <div className={styles.pathBody}>{children}</div>
    </li>
  );
}

function AgentPanel() {
  return (
    <div className={styles.agentPanel}>
      <div className={styles.agentCopy}>
        <p className={clsx("monoKicker", styles.agentKicker)}>Building with a coding agent?</p>
        <p>
          Claude Code, Codex, or another agent can run this whole path for you. Install{" "}
          <a href="https://cardano-foundation.github.io/cardano-dev-skills/" {...EXTERNAL_LINK_PROPS}>
            cardano-dev-skills
          </a>{" "}
          first, so it works from current Cardano sources instead of stale training data:
        </p>
        <CodeBlock language="text">
          {"/plugin marketplace add cardano-foundation/cardano-dev-skills\n/plugin install cardano-dev-skills@cardano-dev-skills"}
        </CodeBlock>
      </div>
      <div className={styles.agentArt} aria-hidden="true">
        <span className={styles.artGlyph}>402</span>
        <span className={clsx("monoKicker", styles.artLabel)}>Payment Required</span>
      </div>
    </div>
  );
}

function PathSection() {
  return (
    <section className={clsx(styles.section, styles.anchorTarget)} id="start">
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>From zero to a paid request</h2>
          <p>
            From an empty directory to one successful x402 payment on preprod — a real 2 tADA API
            call with the receipt on-chain. About 15 minutes; the faucet wait is most of it.
          </p>
        </div>
        <div className={styles.pathWrap}>
          <AgentPanel />
          <ol className={styles.path}>
            <PathStep number="1" title="Scaffold the template" time="~2 min">
              <p>
                A paid API, an agent that pays for it, and a local facilitator — the whole x402
                loop in four short files.
              </p>
              <CodeBlock language="bash">
                {`${SCAFFOLD_COMMAND}\ncd my-app && npm install`}
              </CodeBlock>
              <p className={styles.pathAside}>
                <Link to="/templates/">Browse the template</Link> — the README carries this
                quickstart and the troubleshooting table.
              </p>
            </PathStep>
            <PathStep number="2" title="Create a wallet and fund it" time="~5 min · mostly the faucet">
              <CodeBlock language="bash">npm run wallet</CodeBlock>
              <p>
                It prints a <code>MNEMONIC</code> and the address to fund. Test ADA is free from
                the{" "}
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
            </PathStep>
            <PathStep number="3" title="Fill in .env" time="~3 min">
              <p>
                Two ids do all the work: your funded wallet, and free chain access from{" "}
                <a href="https://blockfrost.io" {...EXTERNAL_LINK_PROPS}>
                  blockfrost.io
                </a>
                .
              </p>
              <CodeBlock language="bash" title=".env">
                {`FACILITATOR_URL=http://localhost:4022   # hosted URL announced before the event
SELLER_ADDRESS=addr_test1...            # receives the payment
MNEMONIC=...                            # from npm run wallet, funded
BLOCKFROST_PROJECT_ID=preprod...        # free at blockfrost.io`}
              </CodeBlock>
              <div className={styles.slot}>
                <span className={styles.slotDot} />
                <span>
                  The hosted facilitator endpoint will be published here before the hackathon. It
                  verifies and settles payments — your code never touches chain infrastructure, and
                  it holds no keys and no funds.
                </span>
              </div>
            </PathStep>
            <PathStep number="4" title="Run it — one payment, on-chain" time="~1 min · plus one confirmation">
              <p>
                Two terminals. The seller comes up, the buyer hits the paid route, gets the 402,
                pays, and retries:
              </p>
              <CodeBlock language="bash">
                {`npm run facilitator   # terminal 1 — until the hosted URL lands
npm run demo          # terminal 2`}
              </CodeBlock>
              <p className={clsx("monoKicker", styles.outputLabel)}>Success looks like</p>
              <pre className={styles.outputBlock}>
                <div className={styles.term402}>← 402 Payment Required · 2 tADA on preprod</div>
                <div className={styles.term200}>← 200 OK · 27.9s</div>
                <div className={styles.termMuted}>
                  receipt: df1f9bca… · preprod.cardanoscan.io/transaction/df1f9bca…
                </div>
              </pre>
              <p>
                That receipt is a real transaction — open it in the explorer. From here it&apos;s
                yours: change the route and price in <code>seller.ts</code>, or point the buyer at
                someone else&apos;s endpoint.
              </p>
            </PathStep>
          </ol>
        </div>
      </div>
    </section>
  );
}

function DeeperSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Go deeper</h2>
        </div>
        <div className={styles.cardGrid}>
          {DEEPER_LINKS.map(card => (
            <a
              className={styles.linkCard}
              href={card.href}
              key={card.href}
              {...EXTERNAL_LINK_PROPS}
            >
              <h3>
                {card.title}
                <ExternalArrow />
              </h3>
              <p>{card.text}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function RulesSection() {
  return (
    <section className={clsx(styles.section, styles.anchorTarget)} id="rules">
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Rules &amp; judging</h2>
          <p>
            Judging weighs use-case quality, technical execution, a real payment on preprod, and
            long-term potential.
          </p>
        </div>
        <div className={styles.rulesRow}>
          <div className={styles.rulesCol}>
            <p className={clsx("monoKicker", styles.rulesKicker)}>To qualify</p>
            <ul className={styles.checklist}>
              {CHECKLIST.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={styles.rulesCol}>
            <p className={clsx("monoKicker", styles.rulesKicker)}>Prizes</p>
            <div className={styles.prizeStack}>
              {PRIZES.map(prize => (
                <div
                  className={clsx(styles.prizeCard, prize.first && styles.prizeFirst)}
                  key={prize.place}
                >
                  <span className={styles.prizeValue}>{prize.value}</span>
                  <span className={clsx("monoKicker", styles.prizeLabel)}>{prize.place}</span>
                </div>
              ))}
            </div>
            <div className={styles.slot}>
              <span className={styles.slotDot} />
              <span>
                The support channel will be published here. On site, Cardano Foundation mentors are
                available throughout the 36 hours.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TroubleshootingSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>When something fails</h2>
        </div>
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
      </div>
    </section>
  );
}

export default function X402Page() {
  const bandArt = useBaseUrl("img/talent/start-building-cubes.webp");
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <main className={styles.page}>
        <Hero />
        <ProtocolSection />
        <MarketSection />
        <PathSection />
        <DeeperSection />
        <RulesSection />
        <TroubleshootingSection />
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
