import React, { useEffect } from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import styles from "./styles.module.css";

const TITLE = "Hackathons & Challenges";
const DESCRIPTION = "Build innovative projects, collaborate with developers, and win prizes on Cardano";

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
          Hackathons & Challenges
        </h1>
        <p className={styles.heroSubtitle}>
          Build innovative projects, collaborate with developers worldwide,
          and earn rewards in the Cardano ecosystem.
        </p>
        <div className={styles.heroCta}>
          <a className={clsx("button button--secondary button--lg", styles.primaryBtn)} href="#subscribe">
            Get Notified
          </a>
          <Link className={clsx("button button--outline button--lg", styles.secondaryBtn)} to="/docs/get-started/">
            Start Building
          </Link>
        </div>
      </div>
    </header>
  );
}

function BenefitIcon({ src, alt }) {
  return (
    <div className={styles.benefitIconWrapper}>
      <img src={useBaseUrl(src)} alt={alt} className={styles.benefitIcon} />
    </div>
  );
}

const benefits = [
  {
    icon: "img/icons/code-solid.svg",
    title: "Real Experience",
    description: "Build production-ready projects with cutting-edge blockchain technology."
  },
  {
    icon: "img/icons/people-group-solid.svg",
    title: "Global Network",
    description: "Connect with developers, mentors, and industry leaders worldwide."
  },
  {
    icon: "img/icons/coins-solid.svg",
    title: "Earn Rewards",
    description: "Compete for prizes and get your project funded."
  },
  {
    icon: "img/icons/chart-line-solid.svg",
    title: "Launch Your Project",
    description: "Turn your idea into a real product in the ecosystem."
  }
];

function BenefitsSection() {
  return (
    <section className={styles.benefits}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Why Participate</h2>
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, idx) => (
            <div key={idx} className={styles.benefitCard}>
              <BenefitIcon src={benefit.icon} alt={benefit.title} />
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OverviewSection() {
  return (
    <section className={styles.overview}>
      <div className="container">
        <div className={styles.overviewContent}>
          <div className={styles.photoGrid}>
            <div className={styles.photoLarge}>
              <img src={useBaseUrl("img/hackathons/hackathon.png")} alt="Cardano Hackathon event" />
            </div>
            <div className={styles.photoSmall}>
              <img src={useBaseUrl("img/hackathons/builders.png")} alt="Developers collaborating" />
            </div>
            <div className={styles.photoSmall}>
              <img src={useBaseUrl("img/hackathons/community.png")} alt="Hackathon winners" />
            </div>
          </div>
          <div className={styles.overviewText}>
            <h2>Join the Builders</h2>
            <p>
              Cardano hackathons are global events that bring together the most
              promising developers and entrepreneurs to build real products on Cardano.
            </p>
            <p>
              Whether you're competing solo or with a team, you'll have access to
              mentorship, technical resources, and a community of builders who share
              your passion for decentralized technology.
            </p>
            <div className={styles.overviewButtons}>
              <a className="button button--primary" href="#subscribe">
                Get Notified
              </a>
              <Link to="/docs/community/cardano-developer-community" className={clsx("button button--outline", styles.buttonWithIcon)}>
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

function WaysToParticipateSection() {
  return (
    <section className={styles.waysSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Ways to Participate</h2>
        <div className={styles.waysList}>
          <div className={styles.wayItem}>
            <span className={styles.wayNumber}>01</span>
            <div className={styles.wayContent}>
              <h3>Hackathons</h3>
              <p>Intensive building sprints where teams create complete projects in days or weeks. Perfect for turning ideas into working prototypes.</p>
            </div>
          </div>
          <div className={styles.wayItem}>
            <span className={styles.wayNumber}>02</span>
            <div className={styles.wayContent}>
              <h3>Bounties</h3>
              <p>Specific technical challenges with defined goals and immediate rewards. Contribute fixes, features, or integrations to existing projects.</p>
            </div>
          </div>
          <div className={styles.wayItem}>
            <span className={styles.wayNumber}>03</span>
            <div className={styles.wayContent}>
              <h3>Grants</h3>
              <p>Financial backing to turn ambitious ideas into production-ready products. Receive support to take your idea from concept to launch.</p>
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
              Don't wait for the next hackathon. Explore Cardano development
              today with guides, tutorials, and builder tools.
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
        <h2>Stay Updated</h2>
        <p>
          Be the first to know when new hackathons and challenges are announced.
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

export default function HackathonsPage() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <MetaData />
      <main>
        <HeroSection />
        <BenefitsSection />
        <OverviewSection />
        <WaysToParticipateSection />
        <ResourcesSection />
        <CTASection />
      </main>
    </Layout>
  );
}
