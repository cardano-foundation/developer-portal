import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import footer from '@site/src/data/footer';
import DiscordIcon from '@site/static/img/icons/discord.svg';
import GithubIcon from '@site/static/img/icons/github.svg';
import styles from './styles.module.css';
import {externalLinkProps} from "@site/src/utils/externalLink";
import ExternalArrow from "@site/src/components/ExternalArrow";

const socialIcons = {
  discord: DiscordIcon,
  github: GithubIcon,
};

function FooterLink({item}) {
  return (
    <Link
      className={styles.link}
      to={item.to}
      href={item.href}
      {...externalLinkProps(item.href)}>
      {item.label}
      {item.href && (
        <>
          {" "}
          <ExternalArrow />
        </>
      )}
    </Link>
  );
}

// Replaces the theme's footer entirely: content comes from
// src/data/footer.js instead of themeConfig, so the component renders on
// every page without a footer block in docusaurus.config.js.
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Link
            to="/"
            className={styles.brandLogoLink}
            aria-label="Cardano Developer Portal home">
            {/* The footer is navy in both themes, so the white lockup serves
                both and needs no theme-aware swap (same as the navbar logo). */}
            <img
              className={styles.brandLogo}
              src={useBaseUrl('/img/brand/cardano-horizontal-white.svg')}
              alt="Cardano"
            />
            <span className={styles.brandName}>Developer Portal</span>
          </Link>
          <p className={styles.tagline}>{footer.tagline}</p>
          <div className={styles.socials}>
            {footer.socials.map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <Link
                  key={social.icon}
                  className={styles.socialLink}
                  href={social.href}
                  aria-label={social.label}
                  {...externalLinkProps(social.href)}>
                  <Icon className={styles.socialIcon} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className={styles.columns}>
          {footer.columns.map((column) => (
            <nav
              key={column.title}
              className={styles.column}
              aria-label={`${column.title} links`}>
              <div className={styles.columnTitle}>{column.title}</div>
              <ul className={styles.linkList}>
                {column.items.map((item) => (
                  <li key={item.label}>
                    <FooterLink item={item} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className={styles.bottomBar}>
        {/* The static build bakes in its own year; after a rollover the
            client recomputes it, so hydration must tolerate the difference. */}
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} Cardano Foundation
        </span>
        <div className={styles.legal}>
          {footer.legal.map((item) => (
            <FooterLink key={item.label} item={item} />
          ))}
        </div>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
