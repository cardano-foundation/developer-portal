import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

// Navy chrome band shared with the navbar and footer, identical in both
// themes. Replaced the gradient-and-caret banner that predated the 2026
// brand and clashed with the cream page.
//
// `artwork` is an optional full-bleed background for pages that lead with a
// graphic. It deepens the band and sets the title in the display treatment.
// The artwork is decorative, so it is painted as a background rather than an
// <img>: there is nothing for a screen reader to announce.
// `subtitleLines` reserves a fixed number of lines for the description.
//
// Pages that share one band across sibling routes need this. The band's
// height follows its content, and the description is the only part of that
// content whose height varies, so a two-line description and a three-line one
// give two different bands and the band jumps when you move between them.
// Reserving the taller count makes both sides equal at every width, which
// pinning the band itself does not: a fixed height is either overflowed by
// the content at narrow widths or padded with dead space at wide ones.
export default function SiteHero({
  title,
  description,
  artwork,
  subtitleLines,
  children,
}) {
  const style = {};
  if (artwork) style.backgroundImage = `url(${artwork})`;
  if (subtitleLines) style["--site-hero-subtitle-lines"] = subtitleLines;

  return (
    <header
      className={clsx(
        "hero",
        styles.heroBanner,
        artwork && styles.withArtwork,
        subtitleLines && styles.withSubtitleReserve
      )}
      style={Object.keys(style).length > 0 ? style : undefined}
    >
      <div className="container">
        <div className={styles.taglineContainer}>
          <h1 className={clsx("hero__title", styles.title)}>{title}</h1>
          <p className={clsx("hero__subtitle", styles.subtitle)}>{description}</p>
        </div>
        {children && <div className={styles.heroChildren}>{children}</div>}
      </div>
    </header>
  );
}
