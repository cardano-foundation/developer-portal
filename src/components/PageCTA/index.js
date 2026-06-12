import React from "react";
import clsx from "clsx";

import styles from "./styles.module.css";

// Reusable section-level CTA: title, description, one or two buttons.
// `secondaryButton` is optional.
export default function PageCTA({
  title,
  description,
  href,
  buttonText,
  secondaryButton = null,
  variant = "secondary",
}) {
  const isPrimary = variant === "primary";
  return (
    <section className={clsx(styles.cta, isPrimary && styles.ctaPrimary)}>
      <div className="container">
        <div className={styles.inner}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
          <div className={styles.buttonRow}>
            <a
              className={clsx(
                "button button--lg",
                isPrimary ? "button--primary" : "button--secondary",
                styles.button
              )}
              href={href}
            >
              {buttonText}
            </a>
            {secondaryButton && (
              <a
                className={clsx(
                  "button button--lg button--outline",
                  isPrimary ? "button--primary" : "button--secondary",
                  styles.button
                )}
                href={secondaryButton.href}
              >
                {secondaryButton.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
