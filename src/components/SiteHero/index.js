import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

// Page header band. Follows the theme like the navbar: cream with ink
// type in light mode, navy with cream type in dark.
//
// `art` is an optional decorative node (its component carries aria-hidden)
// painted absolutely behind the copy. Unlike `artwork` below, the band
// keeps its theme-following ground and the node brings its own visuals.
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
  art,
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
        art && styles.withArt,
        subtitleLines && styles.withSubtitleReserve
      )}
      style={Object.keys(style).length > 0 ? style : undefined}
    >
      {art}
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
