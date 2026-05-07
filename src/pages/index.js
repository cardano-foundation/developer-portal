import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import OpenStickyButton from "@site/src/components/buttons/OpenStickyButton";

/* --- DATA --- */

const paths = [
  {
    id: "build",
    title: "Build",
    subtitle: "dApps, smart contracts & integrations",
    description: "Write smart contracts, create tokens, accept payments, or integrate Cardano into your application.",
    topics: ["Smart contracts (Aiken, Plutarch, Plinth, and more)", "Native tokens & NFTs", "Client SDKs for TypeScript, Rust, Python, Java…", "Payments & wallet integration"],
    cta: "Start building",
    href: "/docs/get-started/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "operate",
    title: "Operate",
    subtitle: "Nodes, stake pools & infrastructure",
    description: "Run a Cardano node, set up a stake pool, or manage relay and block producer nodes.",
    topics: ["Node installation & configuration", "Pool registration & key management", "Relay & block producer setup", "Monitoring, security & hardening"],
    cta: "Start operating",
    href: "/docs/operate-a-stake-pool/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "govern",
    title: "Govern",
    subtitle: "DReps, governance actions & voting",
    description: "Vote on governance actions, register as a DRep, or understand Cardano's on-chain governance model.",
    topics: ["CIP-1694 governance model", "DRep registration & delegation", "Submitting governance actions", "Constitutional committee guide"],
    cta: "Participate",
    href: "/docs/governance/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "learn",
    title: "Learn",
    subtitle: "Core concepts & fundamentals",
    description: "Understand how Cardano works before writing code. Essential reading for everyone new to the ecosystem.",
    topics: ["The eUTXO model", "Transactions & fees", "Staking, delegation & consensus", "How Cardano differs from EVM chains"],
    cta: "Start learning",
    href: "/docs/learn/core-concepts/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

/* --- COMPONENTS --- */

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}>
        <img
          src={useBaseUrl("img/hero-smart-contracts.jpeg")}
          alt="Cardano developer portal"
          className={styles.heroBackgroundImage}
        />
        <div className={styles.heroOverlay} />
      </div>
      <div className={styles.heroGlow} />
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroCard}>
            <h1 className={styles.heroTitle}>Developer Resources</h1>
            <p className={styles.heroSubtitle}>
              Docs, tools, and SDKs for building on Cardano — whether you're
              writing smart contracts, running a stake pool, or shaping governance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PathPickerSection() {
  return (
    <section className={styles.pathPicker}>
      <div className="container">
        <div className={styles.pathPickerHeader}>
          <h2>What brings you to Cardano?</h2>
          <p>Choose the path that fits what you want to do.</p>
        </div>
        <div className={styles.pathGrid}>
          {paths.map((path) => (
            <Link
              key={path.id}
              to={path.href}
              className={clsx(styles.pathCard, styles[`path_${path.id}`])}
            >
              <div className={styles.pathIconWrap}>
                {path.icon}
              </div>
              <h3 className={styles.pathTitle}>{path.title}</h3>
              <p className={styles.pathSubtitle}>{path.subtitle}</p>
              <p className={styles.pathDesc}>{path.description}</p>
              <ul className={styles.pathTopics}>
                {path.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <span className={styles.pathCta}>{path.cta} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <div className={styles.ctaHeader}>
          <h2>Join the Ecosystem</h2>
          <p>Connect, build, and get funded</p>
        </div>
        <div className={styles.ctaRow}>
          <Link to={useBaseUrl("talent")} className={styles.ctaHackathons}>
            <img
              src={useBaseUrl("img/hackathons/hackathon.jpg")}
              alt="Cardano developers"
              className={styles.ctaHackathonsImage}
            />
            <div className={styles.ctaHackathonsOverlay} />
            <div className={styles.ctaHackathonsContent}>
              <h3>Talent Pool</h3>
              <p>Hear about Cardano hackathons, jobs, and grants for developers</p>
              <span className={styles.ctaHackathonsLink}>Join the pool →</span>
            </div>
          </Link>

          <a
            href="https://cardano.org/events/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaEvents}
          >
            <img
              src={useBaseUrl("img/card-cardano-events.png")}
              alt="Cardano community events"
              className={styles.ctaEventsImage}
            />
            <div className={styles.ctaEventsOverlay} />
            <div className={styles.ctaEventsContent}>
              <h3>Cardano Events</h3>
              <p>Meet developers and community members at events worldwide</p>
              <span className={styles.ctaEventsLink}>Find events ↗</span>
            </div>
          </a>

          <Link to={useBaseUrl("docs/community/funding")} className={styles.ctaFunding}>
            <img
              src={useBaseUrl("img/card-get-funded.jpg")}
              alt="Cardano funding and grants"
              className={styles.ctaFundingImage}
            />
            <div className={styles.ctaFundingOverlay} />
            <div className={styles.ctaFundingContent}>
              <h3>Get Funded</h3>
              <p>Grants and funding opportunities to bring your ideas to life</p>
              <span className={styles.ctaFundingLink}>Explore grants →</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function OfficeHoursSection() {
  return (
    <section className={styles.officeHours}>
      <div className="container">
        <div className={styles.officeHoursInner}>
          <div className={styles.officeHoursContent}>
            <span className={styles.officeHoursBadge}>Every week</span>
            <h2>Developer Office Hours</h2>
            <p>
              Get your questions answered live by Cardano Foundation engineers.
              Each session features a different topic followed by open Q&A. All
              recordings available on YouTube.
            </p>
            <div className={styles.officeHoursActions}>
              <a
                href="https://www.addevent.com/calendar/TG807216"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.officeHoursBtn}
              >
                Add to Calendar
              </a>
              <a
                href="https://www.youtube.com/playlist?list=PLCuyQuWCJVQ3IZiQQvHtczEM-cFAqoHBr"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.officeHoursBtnSecondary}
              >
                Watch Recordings ↗
              </a>
            </div>
          </div>
          <div className={styles.officeHoursImageCard}>
            <img
              src={useBaseUrl("img/card-office-hours.png")}
              alt="Cardano Developers Calendar"
              className={styles.officeHoursImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- PAGE --- */

function Home() {
  return (
    <Layout description="Cardano Developer Portal — docs, tools, and SDKs for building on Cardano">
      <Hero />
      <main>
        <PathPickerSection />
        <CTASection />
        <OfficeHoursSection />
      </main>
      <OpenStickyButton />
    </Layout>
  );
}

export default Home;
