import React, { useEffect } from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import FileIcon from "@site/static/img/icons/file-outline.svg";
import styles from "./styles.module.css";

const TITLE = "Cardano Developer Talent Pool";
const DESCRIPTION = "A notification list for Cardano hackathons, jobs, and grants relevant to developers";

/* The hero's decorative circle field: one entry per circle, row by row.
   The middle row sits mostly behind the title panel, so its sequence only
   shows at the edges. */
const HERO_ROWS = [
  ["ballAmber", "ballLavender", "ballGlow", "ballGray", "ballFade", "ballAmber", "ballLavender", "ballFade", "ballBlue", "ballGlow", "ballGray", "ballLavender", "ballGlow", "ballBlue", "ballGray", "ballFade", "ballLavender", "ballAmber", "ballBlue", "ballGlow", "ballGray", "ballFade"],
  ["ballGlow", "ballBlue", "ballGlow", "ballAmber", "ballGray", "ballFade", "ballLavender", "ballGlow", "ballBlue", "ballGray", "ballAmber", "ballFade", "ballGlow", "ballLavender", "ballBlue", "ballAmber", "ballGray", "ballBlue", "ballLavender", "ballFade", "ballAmber", "ballGlow"],
  ["ballGray", "ballLavender", "ballGray", "ballGlow", "ballBlue", "ballAmber", "ballFade", "ballBlue", "ballLavender", "ballGlow", "ballFade", "ballGray", "ballBlue", "ballAmber", "ballGlow", "ballLavender", "ballBlue", "ballFade", "ballGray", "ballAmber", "ballGlow", "ballLavender"],
  ["ballBlue", "ballFade", "ballAmber", "ballLavender", "ballGlow", "ballBlue", "ballGray", "ballFade", "ballAmber", "ballGlow", "ballLavender", "ballBlue", "ballGray", "ballGlow", "ballFade", "ballAmber", "ballLavender", "ballGray", "ballBlue", "ballGlow", "ballGray", "ballAmber"],
  ["ballLavender", "ballGlow", "ballBlue", "ballGray", "ballAmber", "ballFade", "ballGlow", "ballLavender", "ballBlue", "ballAmber", "ballGray", "ballGlow", "ballFade", "ballBlue", "ballLavender", "ballGlow", "ballAmber", "ballGray", "ballFade", "ballBlue", "ballLavender", "ballGray"],
  ["ballBlue", "ballAmber", "ballGlow", "ballLavender", "ballAmber", "ballBlue", "ballGray", "ballAmber", "ballGlow", "ballBlue", "ballGray", "ballAmber", "ballLavender", "ballBlue", "ballGray", "ballGlow", "ballAmber", "ballGray", "ballFade", "ballLavender", "ballBlue", "ballAmber"],
];

function MetaData() {
  return (
    <Head>
      <meta property="og:image" content="https://developers.cardano.org/img/og/og-developer-portal.jpg" />
      <meta name="twitter:image" content="https://developers.cardano.org/img/og/og-developer-portal.jpg" />
    </Head>
  );
}

function HeroSection() {
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
        <h1 className={styles.heroTitle}>Cardano Developer Talent Pool</h1>
        <p className={styles.heroSubtitle}>
          Sign up to hear about Cardano hackathons, jobs, and grants
          relevant to developers.
        </p>
      </div>
    </header>
  );
}

function JoinSection() {
  // The form service injects its own markup into the frame below; this page
  // only decides where the form sits, its internal styling is owned there.
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js-eu1.hsforms.net/forms/embed/7759219.js";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <section className={styles.join} id="subscribe" tabIndex={-1}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Join the Talent Pool</h2>
          <p>Hear about Cardano hackathons, jobs, and grants relevant to developers.</p>
        </div>
        <div className={styles.splitRow}>
          <div className={styles.formCol}>
            <div
              className="hs-form-frame"
              data-region="eu1"
              data-form-id="9f20bbcf-9070-4db2-9317-79d678500a89"
              data-portal-id="7759219"
            />
          </div>
          <div className={styles.photoCard}>
            <img src={useBaseUrl("img/talent/join-rooftop.webp")} alt="Developers looking out over a city at sunset" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className={styles.howItWorks}>
      <div className="container">
        <div className={clsx(styles.splitRow, styles.splitRowWide)}>
          <div className={styles.photoCard}>
            <img src={useBaseUrl("img/talent/how-it-works-cafe.webp")} alt="Two developers talking in a café" />
          </div>
          <div className={styles.howText}>
            <h2>How it works</h2>
            <p>
              A mailing list for Cardano developer opportunities.
              Sign up once, and we'll email you when a relevant
              hackathon, job, or grant comes up.
            </p>
            <p>Low frequency. Unsubscribe at any time.</p>
            <div className={styles.chipRow}>
              <a className={styles.chip} href="#subscribe">
                Join the Talent Pool
                <span aria-hidden="true">→</span>
              </a>
              <Link className={styles.chip} to="/docs/community/cardano-developer-community/">
                Connect with Developers
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StartBuildingSection() {
  return (
    <section className={styles.bandSection}>
      <div className="container">
        <div className={styles.band}>
          <FileIcon className={styles.bandIcon} aria-hidden="true" />
          <div className={styles.bandContent}>
            <h2 className={styles.bandTitle}>Ready to Start Building?</h2>
            <p className={styles.bandText}>
              Explore Cardano development today with guides, tutorials,
              and builder tools.
            </p>
            <div className={styles.pillRow}>
              <Link className={styles.pill} to="/docs/developers/">
                Get Started
                <span className={styles.pillArrow} aria-hidden="true">→</span>
              </Link>
              <Link className={styles.pill} to="/docs/developers/curriculum/start-building/choose-your-tools/">
                Client SDKs
                <span className={styles.pillArrow} aria-hidden="true">→</span>
              </Link>
              <Link className={styles.pill} to="/docs/developers/curriculum/smart-contracts/overview/">
                Smart Contracts
                <span className={styles.pillArrow} aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <img
            className={styles.bandArt}
            src={useBaseUrl("img/talent/start-building-cubes.webp")}
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}

export default function TalentPoolPage() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <MetaData />
      <main className={styles.talent}>
        <HeroSection />
        <JoinSection />
        <HowItWorksSection />
        <StartBuildingSection />
      </main>
    </Layout>
  );
}
