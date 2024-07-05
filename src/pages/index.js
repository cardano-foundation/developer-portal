import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import PortalHero from "./portalhero";
import OpenStickyButton from "../components/buttons/openStickyButton";

const features = [
  {
    title: "Get Started",
    imageUrl: "img/card-get-started.svg",
    targetUrl: "docs/get-started/",
    description: (
      <>
        Get an overview of Cardano, understand the components, discover builder
        tools, learn technical concepts and connect to the developer community.
      </>
    ),
  },
  {
    title: "Integrate Cardano",
    imageUrl: "img/card-integrate-cardano.svg",
    targetUrl: "docs/integrate-cardano/",
    description: (
      <>
        Explore Cardano wallets and learn how to integrate Cardano into
        applications and websites.
      </>
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
        Read what native tokens are, how to mint them, ways to create NFT and
        why you don't need smart contracts for all this.
      </>
    ),
  },
  {
    title: "Create Smart Contracts",
    imageUrl: "img/card-smart-contracts.svg",
    targetUrl: "docs/smart-contracts/",
    description: (
      <>
        Discover Marlowe and Plutus and learn how to create smart contracts on Cardano.
      </>
    ),
  },
  {
    title: "Participate in Governance",
    imageUrl: "img/card-governance.svg",
    targetUrl: "docs/governance/",
    description: (
      <>
        Governance is an essential topic that includes Cardano Improvement Proposals (CIP), 
        project funding, voting, and network parameters.
      </>
    ),
  },
  {
    title: "Operate a Stake Pool",
    imageUrl: "img/card-operate-a-stake-pool.svg",
    targetUrl: "docs/operate-a-stake-pool/",
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
    <div className={clsx("col col--4", styles.featurePadding)}>
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
    <Layout description="Cardano Developer Portal">
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
      <OpenStickyButton/>
    </Layout>
  );
}

export default Home;
