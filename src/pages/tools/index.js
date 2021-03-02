
import React from 'react';

import Image from '@theme/IdealImage';
import Layout from '@theme/Layout';

import clsx from 'clsx';
import styles from './styles.module.css';
import tools from '../../data/builder-tools';

const TITLE = 'Builder Tools';
const DESCRIPTION =
  'Tools to help you build on Cardano.';
const EDIT_URL =
  'https://github.com/cardano-foundation/developer-portal/edit/main/src/data/builder-tools.js';

function BuilderTools() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <main className="container margin-vert--lg">
        <div className="text--center margin-bottom--xl">
          <h1>{TITLE}</h1>
          <p>{DESCRIPTION}</p>
          <p>
            <a
              className={'button button--primary'}
              href={EDIT_URL}
              target={'_blank'}>
              Add your project!
            </a>
          </p>
        </div>
        <div className="row">
          {tools.map((tool) => (
            <div key={tool.title} className="col col--4 margin-bottom--lg">
              <div className={clsx('card', styles.showcaseUser)}>
                <div className="card__image">
                  <Image img={tool.preview} alt={tool.title} />
                </div>
                <div className="card__body">
                  <div className="avatar">
                    <div className="avatar__intro margin-left--none">
                      <h4 className="avatar__name">{tool.title}</h4>
                      <small className="avatar__subtitle">
                        {tool.description}
                      </small>
                    </div>
                  </div>
                </div>
                {(tool.website || tool.source) && (
                  <div className="card__footer">
                    <div className="button-group button-group--block">
                      {tool.website && (
                        <a
                          className="button button--small button--secondary button--block"
                          href={tool.website}
                          target="_blank"
                          rel="noreferrer noopener">
                          Website
                        </a>
                      )}
                      {tool.source && (
                        <a
                          className="button button--small button--secondary button--block"
                          href={tool.source}
                          target="_blank"
                          rel="noreferrer noopener">
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}

export default BuilderTools;