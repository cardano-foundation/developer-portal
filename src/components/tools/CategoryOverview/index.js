import React from "react";
import styles from "./styles.module.css";
import CategoryCard from "../CategoryCard";
import { WorkflowCategories } from "../../../data/builder-tools";

function CategoryOverview() {
  return (
    <section className={styles.categoryOverview}>
      <div className="container">
        <div className={styles.headerSection}>
          <div className={styles.introContent}>
            <h2 className={styles.introTitle}>Develop on Cardano</h2>
            <p className={styles.introDescription}>
              Discover the tools and libraries that power Cardano development. From smart contract languages 
              to blockchain APIs, these community-built tools help you create decentralized applications, 
              integrate with wallets, and interact with the Cardano ecosystem.
            </p>
          </div>
          
          <div className={styles.divider}>|</div>
          
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>Don't know where to start?</h3>
            <p className={styles.ctaDescription}>
              Follow our decision tree to get personalized recommendations for what you want to build.
            </p>
            <a 
              href="https://example.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.ctaButton}
            >
              Find Your Tools →
            </a>
          </div>
        </div>
        
        <div className={styles.categoryGrid}>
          {WorkflowCategories.map((category, index) => (
            <CategoryCard key={index} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryOverview; 