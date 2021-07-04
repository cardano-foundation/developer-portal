import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import PortalHero from "./portalhero";

const features = [
  {
    title: "Get Started",
    imageUrl: "img/card-get-started.svg",
    targetUrl: "docs/get-started/",
    description: (
      <>
        Welcome to the Cardano Developer Portal. This category will help you
        find your way around quickly.
      </>
    ),
  },
  {
    title: "Integrate Cardano",
    imageUrl: "img/card-integrate-cardano.svg",
    targetUrl: "docs/integrate-cardano/",
    description: (
      <>How to integrate Cardano into existing websites and services.</>
    ),
  },
  {
    title: "Build with Transaction Metadata",
    imageUrl: "img/card-transaction-metadata.svg",
    targetUrl: "docs/transaction-metadata/",
    description: (
      <>
        Learn what transaction metadata is, how to add it to a transaction, how
        to view the metadata and what potential use cases are.
      </>
    ),
  },
  {
    title: "Discover Native Tokens",
    imageUrl: "img/card-native-tokens.svg",
    targetUrl: "docs/native-tokens/",
    description: (
      <>
        Learn what native tokens are, how to mint them, which policies can be
        used and how to create NFT.
      </>
    ),
  },
  {
    title: "Fund your Project",
    imageUrl: "img/card-fund-your-project.svg",
    targetUrl: "docs/fund-your-project/",
    description: (
      <>Learn what Project Catalyst is and what opportunities are available to get your ideas funded.</>
    ),
  },
  {
    title: "Operate a Stake Pool",
    imageUrl: "img/card-stake-pool-course.svg",
    targetUrl: "docs/stake-pool-operation/",
    description: (
      <>
        Learn what it takes to become a Cardano stake pool operator from a
        technical and marketing perspective.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description, targetUrl }) {
  const imgUrl = useBaseUrl(imageUrl); // not used right now
  const trgUrl = useBaseUrl(targetUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {targetUrl && (
        <Link className="navbar__link" to={trgUrl}>
          <div className="card">
            <div className="card__header">
              {imgUrl && (
                <div className="text--center">
                  <img
                    className={styles.featureImage}
                    src={imgUrl}
                    alt={title}
                  />
                </div>
              )}
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
    <Layout title={`Overview`} description="Cardano Developer Portal">
      <PortalHero
        title={siteConfig.title}
        description={siteConfig.tagline}
        cta={'Get Started'}
        url={useBaseUrl("docs/get-started/")}
      />
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
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
