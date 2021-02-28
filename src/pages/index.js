import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

const features = [
  {
    title: '📖 Learn Cardano',
    imageUrl: 'docs/learn-cardano/token-locking',
    description: (
      <>Learn how Cardano works with the vision and mission, inspiration, why cardano, and key concepts.</>
    ),
  },
  {
    title: <>🤓 Getting Started</>,
    imageUrl: 'docs/getting-started/cardano-node',
    description: (
      <>Step by step instructions, node installion, stake pool operators and managing wallets</>
    ),
  },
  {
    title: <>👨‍💻 Smart Contracts and Building DApps</>,
    imageUrl: 'docs/smart-contracts-and-building-dapps/plutus/plutus-overview',
    description: (
      <>Build smart contracts and dapps with Plutus, Marlowe and Glow.</>
    ),
  },
  {
    title: <>⚒️ Adrestia - SDKs and APIs</>,
    imageUrl: 'docs/adrestia-SDKs-and-APIs/adrestia-cardano-node',
    description: (
      <>Depending on the use-cases you have and the control that you seek, you can choose specific Cardano components .</>
    ),
  },
  {
    title: <>💡 Resources</>,
    imageUrl: 'docs/resources/developer-portal-updates',
    description: (
      <>Check latest updates, releases, research papers, news, events, fundings and be part of the community.</>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <Link className="navbar__link" to={imgUrl}>
          <div className="card">
            <div className="card__header">
              <h3>{title}</h3>
            </div>
            <div className="card__body">
              <p>{description}</p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout title="Homepage" description="Cardano Developer Portal">
      {/* <header className={clsx("hero hero--primary", styles.heroBanner)}> */}
      {/* <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p> */}
      {/* <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div> */}
      {/* </div> */}
      {/* </header> */}
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
            <div class="alert alert--primary" role="alert">
            <center>
            <h2> Welcome to the developer portal on everything about Cardano blockchain</h2></center>
            </div>
              <div className="row cards__container">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
