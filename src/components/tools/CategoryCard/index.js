import React from "react";
import styles from "./styles.module.css";
import { SortedShowcases } from "../../../data/builder-tools";

function CategoryCard({ category }) {
  // Find featured tools by exact title match (validation handled at build time)
  const tools = SortedShowcases.filter(tool => 
    category.featured.includes(tool.title)
  ).slice(0, 3);
  
  return (
    <div className={styles.categoryCard}>
      <div className={styles.categoryHeader}>
        <h3 className={styles.categoryTitle}>{category.title}</h3>
        <p className={styles.categoryDescription}>{category.description}</p>
      </div>
      
      <div className={styles.categoryTools}>
        {tools.map((tool) => (
          <a 
            key={tool.title}
            href={tool.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.toolCard}
          >
            <div className={styles.toolInfo}>
              <h4 className={styles.toolTitle}>{tool.title}</h4>
              <p className={styles.toolDescription}>
                {tool.description.length > 120 
                  ? `${tool.description.substring(0, 120)}...` 
                  : tool.description
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