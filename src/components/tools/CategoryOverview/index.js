import React from "react";
import styles from "./styles.module.css";
import CategoryCard from "../CategoryCard";

function CategoryOverview({ categories, items, introTitle, introDescription, ctaTitle, ctaDescription, ctaButtonText, ctaButtonUrl }) {
  return (
    <section className={styles.categoryOverview}>
      <div className="container">
        <div className={styles.headerSection}>
          <div className={styles.introContent}>
            <h2 className={styles.introTitle}>{introTitle}</h2>
            <p className={styles.introDescription}>
              {introDescription}
            </p>
          </div>
          
          <div className={styles.divider}>|</div>
          
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>{ctaTitle}</h3>
            <p className={styles.ctaDescription}>
              {ctaDescription}
            </p>
            <a 
              href={ctaButtonUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.ctaButton}
            >
              {ctaButtonText}
            </a>
          </div>
        </div>
        
        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <CategoryCard key={index} category={category} items={items} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryOverview; 