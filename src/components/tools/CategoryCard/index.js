import React from "react";
import styles from "./styles.module.css";

function CategoryCard({ category, items }) {
  // Find featured items by exact title match (validation handled at build time)
  const featuredItems = items.filter(item => 
    category.featured.includes(item.title)
  ).slice(0, 3);
  
  return (
    <div className={styles.categoryCard}>
      <div className={styles.categoryHeader}>
        <h3 className={styles.categoryTitle}>{category.title}</h3>
        <p className={styles.categoryDescription}>{category.description}</p>
      </div>
      
      <div className={styles.categoryTools}>
        {featuredItems.map((item) => (
          <a 
            key={item.title}
            href={item.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.toolCard}
          >
            <div className={styles.toolInfo}>
              <h4 className={styles.toolTitle}>{item.title}</h4>
              <p className={styles.toolDescription}>
                {item.description.length > 120 
                  ? `${item.description.substring(0, 120)}...` 
                  : item.description
                }
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default CategoryCard; 