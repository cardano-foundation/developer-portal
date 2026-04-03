import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Mermaid from "@theme/Mermaid";
import styles from "./styles.module.css";

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.75;
const STEP = 0.15;

function measureSvgSize(svg) {
  if (!svg) {
    return { w: 0, h: 0 };
  }
  try {
    const box = svg.getBBox();
    if (box.width > 0 && box.height > 0) {
      return { w: box.width, h: box.height };
    }
  } catch {
    // getBBox can throw before layout
  }
  const w = svg.width?.baseVal?.value || svg.clientWidth;
  const h = svg.height?.baseVal?.value || svg.clientHeight;
  return { w: w || 0, h: h || 0 };
}

export default function MermaidDiagramFrame({ chart, hint, className }) {
  const [scale, setScale] = useState(1);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef(null);
  const scaledRef = useRef(null);

  const measure = useCallback(() => {
    const root = scaledRef.current;
    if (!root) {
      return;
    }
    const svg = root.querySelector("svg");
    const { w, h } = measureSvgSize(svg);
    if (w > 0 && h > 0) {
      setNatural((prev) => (prev.w !== w || prev.h !== h ? { w, h } : prev));
    }
  }, []);

  useEffect(() => {
    const root = scaledRef.current;
    if (!root) {
      return undefined;
    }
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    const mo = new MutationObserver(() => measure());
    mo.observe(root, { childList: true, subtree: true });
    measure();
    const t = window.setTimeout(measure, 400);
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [chart, measure]);

  useEffect(() => {
    const onFs = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const zoomIn = () =>
    setScale((s) => Math.min(MAX_SCALE, Math.round((s + STEP) * 100) / 100));
  const zoomOut = () =>
    setScale((s) => Math.max(MIN_SCALE, Math.round((s - STEP) * 100) / 100));
  const zoomReset = () => setScale(1);

  const onWheel = (e) => {
    if (!(e.ctrlKey || e.metaKey)) {
      return;
    }
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.09 : 0.09;
    setScale((s) => {
      const next = Math.round((s + delta) * 100) / 100;
      return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    });
  };

  const toggleFullscreen = async () => {
    const el = frameRef.current;
    if (!el) {
      return;
    }
    try {
      if (!document.fullscreenElement) {
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) {
          await req.call(el);
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore unsupported / denied
    }
  };

  const spacerStyle =
    natural.w > 0 && natural.h > 0
      ? {
          width: natural.w * scale,
          height: natural.h * scale,
        }
      : { minHeight: "24rem" };

  return (
    <div
      ref={frameRef}
      className={clsx(
        styles.frame,
        fullscreen && styles.frameFullscreen,
        className
      )}
    >
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Diagram zoom and fullscreen"
      >
        <div className={styles.toolbarGroup}>
          <button type="button" onClick={zoomOut} aria-label="Zoom out">
            −
          </button>
          <span className={styles.scaleReadout} aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button type="button" onClick={zoomIn} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={zoomReset} aria-label="Reset zoom">
            Reset
          </button>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit full screen" : "Full screen"}
        >
          {fullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </div>
      {hint ? (
        <p className={styles.hint}>
          {hint}
        </p>
      ) : null}
      <div
        className={styles.viewport}
        onWheel={onWheel}
        role="region"
        aria-label="Pathway diagram"
      >
        <div className={styles.spacer} style={spacerStyle}>
          <div
            ref={scaledRef}
            className={styles.scaled}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
            }}
          >
            <Mermaid value={chart} />
          </div>
        </div>
      </div>
    </div>
  );
}
