import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import CodeBlock from "@theme/CodeBlock";
import PageCTA from "@site/src/components/PageCTA";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import styles from "./styles.module.css";

const TITLE = "Agentic Commerce on Cardano";
const DESCRIPTION =
  "Build autonomous agents that collaborate and get paid — the x402 hackathon track at TOKEN2049 Origins 2026";

const SCAFFOLD_COMMAND =
  "npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/x402-express my-app";

const FLOW = [
  { text: "GET /resource" },
  { text: "402 Payment Required", accent: true },
  { text: "pay on-chain" },
  { text: "200 OK" },
];

const STEPS = [
  {
    title: "Scaffold the template",
    body: (
      <>
        <p>
          A paid API, an agent that pays for it, and a local facilitator — the whole x402 loop in
          four short files. Scaffold it, then <code>npm install</code> and <code>npm run demo</code>.
        </p>
        <CodeBlock language="bash">{SCAFFOLD_COMMAND}</CodeBlock>
        <p>
          <Link to="/templates/">Browse it on the templates page</Link> or read the README after
          scaffolding — it carries the quickstart and a troubleshooting table.
        </p>
      </>
    ),
  },
  {
    title: "Create and fund a test wallet",
    body: (
      <>
        <p>
          <code>npm run wallet</code> generates a Cardano preprod wallet and prints the address to
          fund. Test ADA is free from the{" "}
          <a href="https://docs.cardano.org/cardano-testnets/tools/faucet" {...EXTERNAL_LINK_PROPS}>
            preprod faucet
          </a>{" "}
          (select <strong>Preprod</strong>); test USDM is a self-serve claim at{" "}
          <a href="https://tusdm.moneta.global/#manual" {...EXTERNAL_LINK_PROPS}>
            tusdm.moneta.global
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "Get a Blockfrost project id",
    body: (
      <p>
        The agent side needs chain access to build transactions. A free preprod project id from{" "}
        <a href="https://blockfrost.io" {...EXTERNAL_LINK_PROPS}>
          blockfrost.io
        </a>{" "}
        goes into your <code>.env</code>.
      </p>
    ),
  },
  {
    title: "Point at the facilitator",
    body: (
      <>
        <p>
          The facilitator verifies and settles payments so your code never touches chain
          infrastructure. It holds no keys and no funds.
        </p>
        <div className={styles.notice}>
          The hosted facilitator endpoint will be published here before the hackathon. Until then,
          the template includes one: <code>npm run facilitator</code>.
        </div>
      </>
    ),
  },
  {
    title: "Build with your AI agent",
    body: (
      <>
        <p>
          Working with Claude Code, Codex, or another coding agent? Install{" "}
          <a
            href="https://cardano-foundation.github.io/cardano-dev-skills/"
            {...EXTERNAL_LINK_PROPS}
          >
            cardano-dev-skills
          </a>{" "}
          so it answers from current Cardano sources instead of stale training data:
        </p>
        <CodeBlock language="text">
          {"/plugin marketplace add cardano-foundation/cardano-dev-skills\n/plugin install cardano-dev-skills@cardano-dev-skills"}
        </CodeBlock>
      </>
    ),
  },
  {
    title: "Go deeper",
    body: (
      <ul className={styles.linkList}>
        <li>
          <a href="https://www.masumi.network/x402" {...EXTERNAL_LINK_PROPS}>
            The Masumi standard
          </a>{" "}
          — escrow accounts, refunds, dispute handling, agent identity, and an on-chain registry,
          extending x402 on Cardano.
        </li>
        <li>
          <a
            href="https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md"
            {...EXTERNAL_LINK_PROPS}
          >
            The Cardano x402 scheme specification
          </a>{" "}
          — officially part of the x402 standard.
        </li>
        <li>
          <a href="https://github.com/Kammerlo/x402-cardano-demo" {...EXTERNAL_LINK_PROPS}>
            The full protocol demo
          </a>{" "}
          — browser wallet, USDM, escrow routes, and a step-by-step visual UI.
        </li>
      </ul>
    ),
  },
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
      <div className="container">
        <p className={styles.eyebrow}>TOKEN2049 Origins 2026 · Hackathon track</p>
        <h1 className={styles.heroTitle}>Agentic Commerce on Cardano</h1>
        <p className={styles.heroSubtitle}>Build autonomous agents that collaborate and get paid.</p>
        <div className={styles.factRow}>
          <div>
            <span className={styles.factValue}>$27,500</span>
            <span className={styles.factLabel}>prize pool</span>
          </div>
          <div>
            <span className={styles.factValue}>36 hours</span>
            <span className={styles.factLabel}>Oct 6–7</span>
          </div>
          <div>
            <span className={styles.factValue}>preprod</span>
            <span className={styles.factLabel}>network</span>
          </div>
        </div>
        <div className={styles.flowRow} aria-label="The x402 payment flow">
          {FLOW.map((step, i) => (
            <React.Fragment key={step.text}>
              {i > 0 && <span className={styles.flowArrow}>→</span>}
              <span className={clsx(styles.flowChip, step.accent && styles.flowChipAccent)}>
                {step.text}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className={styles.heroButtons}>
          <a className="button button--primary" href="#start">
            Start building
          </a>
          <a className="button button--secondary" href="#rules">
            Rules &amp; judging
          </a>
        </div>
      </div>
    </header>
  );
}

function TrackSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.prose}>
          <p>
            AI agents are becoming customers: buying data, compute, API calls, and each other&apos;s
            services. This track is about building for the agentic economy on Cardano with{" "}
            <strong>x402</strong>, the open standard that puts HTTP&apos;s reserved 402 &quot;Payment
            Required&quot; status code to work. An agent requests a resource, receives a price, pays
            on-chain, and accesses the service — with no accounts or API keys.
          </p>
          <p>
            x402 handles the payment. The open <strong>Masumi</strong> standard extends it on Cardano
            with what agents need beyond paying: escrow accounts, refunds, dispute handling, agent
            identity, and an on-chain registry where agents find each other.
          </p>
          <p>
            Pick your side of the market. <strong>Sell</strong>: monetize your endpoints, APIs, or
            content per request. <strong>Buy</strong>: build agents that autonomously pay for the
            services they use. Or <strong>build in between</strong>: agent-to-agent marketplaces, and
            the tooling and infrastructure underneath it all. Anything that advances agentic commerce
            on Cardano is in scope.
          </p>
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section className={styles.section} id="start">
      <div className="container">
        <h2>From zero to a paid request</h2>
        <p className={styles.sectionLead}>
          Five steps, most of the wait is the faucet. The demo pays 2 tADA for an API call and prints
          the receipt with an explorer link.
        </p>
        <ol className={styles.steps}>
          {STEPS.map(step => (
            <li className={styles.step} key={step.title}>
              <h3>{step.title}</h3>
              {step.body}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function RulesSection() {
  return (
    <section className={styles.section} id="rules">
      <div className="container">
        <h2>Rules &amp; judging</h2>
        <div className={styles.prose}>
          <p>
            <strong>To qualify:</strong> a working prototype on Cardano preprod — a dApp with a
            frontend, or a tool/agent with a live demo. An open-source repository with documentation.
            A demo video of max 3 minutes showing the product in action. A short write-up covering the
            problem, the technical approach, and how the project could be deployed or scaled in
            real-world use. Projects that complete at least one x402 payment on preprod through the
            provided facilitator are weighted favorably in judging.
          </p>
          <p>
            <strong>Judging weighs:</strong> use-case quality, technical execution, a real payment on
            preprod, and long-term potential. Prizes: 1st $15,000 · 2nd $7,500 · 3rd $5,000.
          </p>
        </div>
        <div className={styles.notice}>
          The support channel for the event will be published here. On site, Cardano Foundation
          mentors are available throughout the 36 hours.
        </div>
      </div>
    </section>
  );
}

function TroubleshootingSection() {
  return (
    <section className={styles.section}>
      <div className="container">
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
      </div>
    </section>
  );
}

export default function X402Page() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <main className={styles.page}>
        <Hero />
        <TrackSection />
        <StepsSection />
        <RulesSection />
        <TroubleshootingSection />
        <PageCTA
          title="Keep building on Cardano"
          description="Guides, tutorials, and templates for everything beyond the hackathon."
          buttons={[
            { href: "/docs/developers/", label: "Get Started" },
            { href: "/templates/", label: "Browse Templates" },
          ]}
        />
      </main>
    </Layout>
  );
}
