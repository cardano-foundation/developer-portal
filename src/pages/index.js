import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'Transaction Metadata',
    imageUrl: 'img/card-transaction-metadata.svg',
    targetUrl: 'docs/transaction-metadata/overview',
    description: (
      <>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore 
        magna aliquyam erat, sed diam voluptua.
      </>
    ),
  },
  {
    title: 'Payment Integration',
    imageUrl: 'img/card-payment-integration.svg',
    targetUrl: 'docs/payment-integration/overview',
    description: (
      <>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore 
        magna aliquyam erat, sed diam voluptua.
      </>
    ),
  },
  {
    title: 'Native Tokens',
    imageUrl: 'img/card-native-tokens.svg',
    targetUrl: 'docs/native-tokens/overview',
    description: (
      <>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore 
        magna aliquyam erat, sed diam voluptua.
      </>
    ),
  },
/*
  {
    title: 'Adrestia - SDKs and APIs',
    //imageUrl: 'img/cardano-black.png',
    targetUrl: 'docs/adrestia-SDKs-and-APIs/adrestia-cardano-node',
    description: (
      <>
        Depending on the use-cases you have and the control that you seek, you may use any of the components below.
      </>
    ),
  },
  {
    title: 'Resources',
    //imageUrl: 'img/cardano-black.png',
    targetUrl: 'docs/resources/developer-portal-updates',
    description: (
      <>
      Community, research paper, news, events, funding.
      </>
    ),
  },*/
];

function Feature({imageUrl, title, description, targetUrl}) {
  const imgUrl = useBaseUrl(imageUrl); // not used right now
  const trgUrl = useBaseUrl(targetUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {targetUrl && (
        <Link className="navbar__link" to={trgUrl}>
        <div className="card">
          <div className="card__header">
          {imgUrl && (
            <div className="text--center">
               <img className={styles.featureImage} src={imgUrl} alt={title}/>
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
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Overview`}
      description="Cardano Developer Portal">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--warn button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/portal-signup')}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>
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
