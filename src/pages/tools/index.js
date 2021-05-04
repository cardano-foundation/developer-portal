import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Image from "@theme/IdealImage";
import styles from "./styles.module.css";
import tools from "../../data/builder-tools";
import PortalHero from "../portalhero";

const TITLE = "Builder Tools";
const DESCRIPTION = "Tools to help you build on Cardano";
const CTA = "Add your tool";
const FILENAME = "builder-tools.js";

function BuilderTools() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <PortalHero
        title={TITLE}
        description={DESCRIPTION}
        cta={CTA}
        filename={FILENAME}
      />
      <main className="container margin-vert--lg">
        <div className="text--center margin-bottom--xl"></div>
        <div className="row">
          {tools.map((tool) => (
            <div key={tool.title} className="col col--4 margin-bottom--lg">
              <div className={clsx("card", styles.showcaseUser)}>
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
                {(tool.website || tool.gettingstarted) && (
                  <div className="card__footer">
                    <div className="button-group button-group--block">
                      {tool.gettingstarted && (
                        <a
                          className="button button--small button--secondary button--block"
                          href={tool.gettingstarted}
                        >
                          Getting Started
                        </a>
                      )}
                      {tool.website && (
                        <a
                          className="button button--small button--secondary button--block"
                          href={tool.website}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          Website
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
