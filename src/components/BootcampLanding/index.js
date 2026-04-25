import React, { useState } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import modules from "@site/src/data/bootcamp";
import styles from "./styles.module.css";

function HeroSection() {
  const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);

  return (
    <header className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Cardano Bootcamp</h1>
        <p className={styles.heroSubtitle}>
          The end-to-end developer journey. From understanding Cardano to
          shipping production-grade smart contracts.
        </p>
        <div className={styles.heroCta}>
          <a className={styles.primaryBtn} href="#journey">
            Start the journey
          </a>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{modules.length}</span>
            <span className={styles.statLabel}>modules</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{totalTopics}</span>
            <span className={styles.statLabel}>topics</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>Open source</span>
            <span className={styles.statLabel}>community-maintained</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ModuleAccordion({ module, isOpen, onToggle }) {
  return (
    <div className={styles.moduleWrapper}>
      {/* Timeline connector dot */}
      <div className={styles.timelineDot} />

      <div className={clsx(styles.moduleCard, isOpen && styles.moduleCardOpen)}>
        <button
          className={styles.moduleHeader}
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <div className={styles.moduleHeaderLeft}>
            <span className={styles.moduleNumber}>
              Module {String(module.number).padStart(2, "0")}
            </span>
            <h3 className={styles.moduleTitle}>{module.title}</h3>
            <p className={styles.moduleDescription}>{module.description}</p>
          </div>
          <div className={styles.moduleHeaderRight}>
            <span className={styles.topicCount}>
              {module.topics.length} {module.topics.length === 1 ? "topic" : "topics"}
            </span>
            <span className={styles.chevron}>{isOpen ? "▾" : "▸"}</span>
          </div>
        </button>

        {isOpen && (
          <div className={styles.moduleBody}>
            {module.topics.map((topic, i) => (
              <div key={i} className={styles.topicRow}>
                <span className={styles.topicNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.topicContent}>
                  <span className={styles.topicTitle}>{topic.title}</span>
                  <span className={styles.topicDescription}>
                    {topic.description}
                  </span>
                </div>
                <span className={styles.topicArrow}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JourneySection() {
  const [openModule, setOpenModule] = useState(null);

  return (
    <section className={styles.journey} id="journey">
      <div className={styles.journeyContainer}>
        <h2 className={styles.journeyTitle}>The Journey</h2>

        <div className={styles.timeline}>
          {modules.map((module) => (
            <ModuleAccordion
              key={module.number}
              module={module}
              isOpen={openModule === module.number}
              onToggle={() =>
                setOpenModule(
                  openModule === module.number ? null : module.number
                )
              }
            />
          ))}

          {/* Graduation */}
          <div className={styles.moduleWrapper}>
            <div className={clsx(styles.timelineDot, styles.graduationDot)} />
            <div className={styles.graduationCard}>
              <h3 className={styles.graduationTitle}>Graduation</h3>
              <p className={styles.graduationText}>
                You're ready. Now go build something real.
              </p>
              <div className={styles.graduationLinks}>
                <Link className={styles.gradLink} to="/hackathons">
                  Hackathons & Talent Pool
                </Link>
                <Link
                  className={styles.gradLink}
                  to="/docs/community/cardano-developer-community"
                >
                  Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BootcampLanding() {
  return (
    <div className={styles.bootcamp}>
      <HeroSection />
      <JourneySection />
    </div>
  );
}
