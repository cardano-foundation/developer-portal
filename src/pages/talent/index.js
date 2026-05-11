import React, { useEffect } from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import styles from "./styles.module.css";

const TITLE = "Cardano Developer Talent Pool";
const DESCRIPTION = "A notification list for Cardano hackathons, jobs, and grants relevant to developers";

function MetaData() {
  return (
    <Head>
      <meta property="og:image" content="https://developers.cardano.org/img/og/og-developer-portal.png" />
      <meta name="twitter:image" content="https://developers.cardano.org/img/og/og-developer-portal.png" />
    </Head>
  );
}

function HeroSection() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <h1 className={styles.heroTitle}>
          Cardano Developer Talent Pool
        </h1>
        <p className={styles.heroSubtitle}>
          Sign up to hear about Cardano hackathons, jobs, and grants
          relevant to developers.
        </p>
      </div>
    </header>
  );
}

function OverviewSection() {
  return (
    <section className={styles.overview}>
      <div className="container">
        <div className={styles.overviewContent}>
          <div className={styles.photoGrid}>
            <div className={styles.photoLarge}>
              <img src={useBaseUrl("img/hackathons/hackathon.jpg")} alt="Cardano developers at a hackathon" />
            </div>
            <div className={styles.photoSmall}>
              <img src={useBaseUrl("img/hackathons/builders.jpg")} alt="Developers collaborating" />
            </div>
            <div className={styles.photoSmall}>
              <img src={useBaseUrl("img/hackathons/community.jpg")} alt="Cardano developers collaborating" />
            </div>
          </div>
          <div className={styles.overviewText}>
            <h2>How it works</h2>
            <p>
              A mailing list for Cardano developer opportunities.
              Sign up once, and we'll email you when a relevant
              hackathon, job, or grant comes up.
            </p>
            <p>
              Low frequency. Unsubscribe at any time.
            </p>
            <div className={styles.overviewButtons}>
              <a className="button button--primary" href="#subscribe">
                Join the Talent Pool
              </a>
              <Link to="/docs/community/cardano-developer-community/" className={clsx("button button--outline", styles.buttonWithIcon)}>
                <img src={useBaseUrl("img/icons/users-solid.svg")} alt="" />
                Connect with Developers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourcesSection() {
  const imgUrl = useBaseUrl("img/card-get-started.svg");
  return (
    <section className={styles.resources}>
      <div className="container">
        <div className={styles.resourcesContent}>
          <div className={styles.resourcesText}>
            <h2>Ready to Start Building?</h2>
            <p>
              Explore Cardano development today with guides, tutorials,
              and builder tools.
            </p>
            <div className={styles.resourceLinks}>
              <Link to="/docs/get-started/" className={styles.resourceLink}>
                <img src={useBaseUrl("img/icons/book-solid.svg")} alt="" />
                Get Started
              </Link>
              <Link to="/docs/get-started/client-sdks/overview" className={styles.resourceLink}>
                <img src={useBaseUrl("img/icons/code-solid.svg")} alt="" />
                Client SDKs
              </Link>
              <Link to="/docs/build/smart-contracts/overview" className={styles.resourceLink}>
                <img src={useBaseUrl("img/icons/scroll-solid.svg")} alt="" />
                Smart Contracts
              </Link>
            </div>
          </div>
          <div className={styles.resourcesImage}>
            <img src={imgUrl} alt="Start building on Cardano" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
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
    <section className={styles.cta} id="subscribe">
      <div className="container">
        <h2>Join the Talent Pool</h2>
        <p>
          Hear about Cardano hackathons, jobs, and grants relevant to developers.
        </p>
        <div className={styles.hubspotFormWrapper}>
          <div
            className="hs-form-frame"
            data-region="eu1"
            data-form-id="9f20bbcf-9070-4db2-9317-79d678500a89"
            data-portal-id="7759219"
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
      <main>
        <HeroSection />
        <OverviewSection />
        <ResourcesSection />
        <CTASection />
      </main>
    </Layout>
  );
}
