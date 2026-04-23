import React, {useCallback, useEffect, useRef, useState} from "react";
import Mermaid from "@theme/Mermaid";
import styles from "./styles.module.css";

const ZOOM_MIN = 0.45;
const ZOOM_MAX = 2.75;
const ZOOM_STEP = 0.12;

function requestFullscreen(el) {
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen;
  fn?.call(el);
}

function exitFullscreen() {
  const fn =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.msExitFullscreen;
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    fn?.call(document);
  }
}

function isFullscreenActive() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

/**
 * Wraps a Mermaid diagram with a toolbar: zoom controls, reset, and fullscreen.
 * Ctrl/Cmd + scroll over the diagram area adjusts zoom (non-passive wheel).
 */
export default function MermaidDiagramFrame({hint, diagram}) {
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const zoomRef = useRef(1);
  const didAutoFitRef = useRef(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({x: 0, y: 0, left: 0, top: 0});
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const onChange = () => setFullscreen(isFullscreenActive());
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const fitToViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const svg = viewport.querySelector("svg");
    if (!svg) return;

    // Prefer explicit width; fall back to bounding box.
    const svgRect = svg.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();

    // Account for padding (1rem on each side from CSS).
    const computed = window.getComputedStyle(viewport);
    const padX =
      parseFloat(computed.paddingLeft || "0") +
      parseFloat(computed.paddingRight || "0");

    const availableW = Math.max(1, viewportRect.width - padX);
    const diagramW = Math.max(1, svgRect.width);
    const next = availableW / diagramW;
    const clamped = Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, Math.round(next * 100) / 100),
    );

    zoomRef.current = clamped;
    setZoom(clamped);
    // Reset pan to top-left so users start “in frame”.
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }, []);

  // Auto-fit once per diagram render (and after fullscreen toggles).
  useEffect(() => {
    didAutoFitRef.current = false;
  }, [diagram]);

  useEffect(() => {
    if (didAutoFitRef.current) return;
    // Mermaid renders async; defer a couple ticks.
    const t1 = setTimeout(() => {
      fitToViewport();
      didAutoFitRef.current = true;
    }, 50);
    const t2 = setTimeout(() => {
      fitToViewport();
      didAutoFitRef.current = true;
    }, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [fitToViewport, fullscreen, diagram]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) {
      return undefined;
    }
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) {
        return;
      }
      e.preventDefault();
      const z = zoomRef.current;
      const next = e.deltaY > 0 ? z - ZOOM_STEP : z + ZOOM_STEP;
      const clamped = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, Math.round(next * 100) / 100),
      );
      zoomRef.current = clamped;
      setZoom(clamped);
    };
    el.addEventListener("wheel", onWheel, {passive: false});
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) {
      return undefined;
    }

    const onPointerDown = (e) => {
      // Only left click / primary pointer
      if (e.button !== 0) return;
      // Avoid interfering with link clicks inside the SVG.
      if (e.target && e.target.closest && e.target.closest("a")) return;

      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        left: el.scrollLeft,
        top: el.scrollTop,
      };
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isPanningRef.current) return;
      const start = panStartRef.current;
      el.scrollLeft = start.left - (e.clientX - start.x);
      el.scrollTop = start.top - (e.clientY - start.y);
    };

    const endPan = () => {
      isPanningRef.current = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endPan);
    el.addEventListener("pointercancel", endPan);
    el.addEventListener("mouseleave", endPan);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endPan);
      el.removeEventListener("pointercancel", endPan);
      el.removeEventListener("mouseleave", endPan);
    };
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) =>
      Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100),
    );
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) =>
      Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100),
    );
  }, []);

  const zoomReset = useCallback(() => setZoom(1), []);

  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }
    if (isFullscreenActive()) {
      exitFullscreen();
    } else {
      requestFullscreen(el);
    }
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.toolbar}>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
        <div className={styles.actions}>
          <span className={styles.zoomLabel} aria-hidden>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={zoomOut}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={zoomReset}
            aria-label="Reset zoom"
          >
            1:1
          </button>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={zoomIn}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={fitToViewport}
            aria-label="Fit diagram to viewport"
          >
            Fit
          </button>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={toggleFullscreen}
            aria-label={
              fullscreen ? "Exit full screen" : "Enter full screen"
            }
          >
            {fullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </div>
      <div
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        role="region"
        aria-label="Pathway diagram. Use toolbar or Ctrl or Command plus scroll to zoom."
      >
        <div
          className={styles.scaleWrap}
          style={{transform: `scale(${zoom})`}}
        >
          <Mermaid value={diagram} />
        </div>
      </div>
    </div>
  );
}
