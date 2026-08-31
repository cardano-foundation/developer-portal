import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import OriginalDropdownNavbarItem from '@theme-original/NavbarItem/DropdownNavbarItem';
import {useWindowSize} from '@docusaurus/theme-common';
import {useLocation} from '@docusaurus/router';
import icons from './icons';
import {linkPropsFor} from "@site/src/utils/externalLink";
import ExternalArrow from "@site/src/components/ExternalArrow";

const HOVER_OPEN_DELAY = 80;
const HOVER_CLOSE_DELAY = 120;
const VIEWPORT_MARGIN = 16;

function FeaturedTile({featured}) {
  return (
    <Link
      className="megaMenuFeatured"
      to={featured.to}
      href={featured.href}
      {...linkPropsFor(featured.href)}>
      <img
        src={featured.image}
        alt=""
        className="megaMenuFeaturedArt"
        decoding="async"
      />
      <div className="megaMenuFeaturedBody">
        <span className="megaMenuFeaturedTitle">{featured.title}</span>
        <span className="megaMenuFeaturedDescription">
          {featured.description}
        </span>
        <span className="badge badge--primary megaMenuFeaturedCta">
          {featured.cta}
          {featured.href && <ExternalArrow />}
        </span>
      </div>
    </Link>
  );
}

function MegaColumn({column}) {
  return (
    <div className="megaMenuColumn">
      <div className="megaMenuColumnTitle">{column.title}</div>
      <ul className="megaMenuColumnList">
        {column.items.map((item) => {
          const Icon = icons[item.icon];
          return (
            <li key={item.label}>
              <Link
                className="megaMenuItemLink"
                to={item.to}
                href={item.href}
                {...linkPropsFor(item.href)}>
                {Icon && (
                  <span className="megaMenuItemIconTile">
                    <Icon className="megaMenuItemIcon" aria-hidden="true" />
                  </span>
                )}
                <span className="megaMenuItemContent">
                  <span className="megaMenuItemLabel">
                    {item.label}
                    {item.href && (
                      <>
                        {" "}
                        <ExternalArrow />
                      </>
                    )}
                  </span>
                  {item.description && (
                    <span className="megaMenuItemDescription">
                      {item.description}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MegaDropdownNavbarItem({label, className, customProps}) {
  const {featured, columns} = customProps;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const hoverTimer = useRef(null);
  const location = useLocation();
  const panelId = `megaMenu-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const scheduleOpen = (delay) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(true), delay);
  };
  const scheduleClose = (delay) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), delay);
  };

  // Close when navigating, and clean pending timers on unmount.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // While open: close on click outside, and on Escape regardless of where
  // focus sits (hover-opening never focuses the trigger, so a handler on
  // the item itself would not hear the key).
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // The panel centers on its trigger; near the viewport edges that center
  // position would push it off-screen, so shift it back inside via a custom
  // property the transform picks up. The centered position is derived from
  // the trigger and the panel's layout width rather than read off the panel:
  // the shift rides on a transitioned transform, so right after a style
  // change the panel's own rect still reports its previous, already-shifted
  // position and a stale shift from the last open would read as "fits".
  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!open || !root || !panel) {
      return undefined;
    }
    const place = () => {
      const anchor = root.getBoundingClientRect();
      const width = panel.offsetWidth;
      const left = anchor.left + anchor.width / 2 - width / 2;
      const right = left + width;
      let shift = 0;
      if (left < VIEWPORT_MARGIN) {
        shift = VIEWPORT_MARGIN - left;
      } else if (right > window.innerWidth - VIEWPORT_MARGIN) {
        shift = window.innerWidth - VIEWPORT_MARGIN - right;
      }
      if (shift !== 0) {
        panel.style.setProperty('--mega-menu-shift', `${shift}px`);
      } else {
        panel.style.removeProperty('--mega-menu-shift');
      }
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open]);

  // Hover-intent opening is a mouse behavior; on touch the synthetic
  // mouseenter that precedes each tap would re-arm the open timer and
  // fight the click toggle.
  const onPointerEnter = (event) => {
    if (event.pointerType === 'mouse') {
      scheduleOpen(HOVER_OPEN_DELAY);
    }
  };
  const onPointerLeave = (event) => {
    if (event.pointerType === 'mouse') {
      scheduleClose(HOVER_CLOSE_DELAY);
    }
  };

  const startTile = featured && featured.placement !== 'end' ? featured : null;
  const endTile = featured && featured.placement === 'end' ? featured : null;

  return (
    <li
      ref={rootRef}
      className={clsx('navbar__item', 'navbar__item--mega', className)}
      data-open={open || undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}>
      <button
        ref={triggerRef}
        className="navbar__link megaMenuTrigger"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          clearTimeout(hoverTimer.current);
          setOpen((value) => !value);
        }}>
        {label}
      </button>

      <div
        id={panelId}
        ref={panelRef}
        className="megaMenuPanel"
        onClick={(event) => {
          // Links to the current page produce no route change, which the
          // close-on-navigate effect cannot see.
          if (event.target.closest('a')) {
            setOpen(false);
          }
        }}>
        <div className="megaMenuInner">
          {startTile && <FeaturedTile featured={startTile} />}
          {columns.map((column) => (
            <MegaColumn key={column.title} column={column} />
          ))}
          {endTile && <FeaturedTile featured={endTile} />}
        </div>
      </div>
    </li>
  );
}

export default function DropdownNavbarItem({mobile = false, ...props}) {
  const windowSize = useWindowSize();
  const isMobile = mobile || windowSize === 'mobile';

  const mega =
    props.mega &&
    props.customProps &&
    Array.isArray(props.customProps.columns);

  // On mobile or when not marked as mega, fall back to the original behavior
  // (the drawer consumes the flat `items` list derived in src/data/navbar.js).
  // Strip mega-specific props so they don't leak onto DOM elements.
  if (!mega || isMobile) {
    const {customProps, mega: _mega, ...passthroughProps} = props;
    return <OriginalDropdownNavbarItem mobile={mobile} {...passthroughProps} />;
  }

  return (
    <MegaDropdownNavbarItem
      label={props.label}
      className={props.className}
      customProps={props.customProps}
    />
  );
}
