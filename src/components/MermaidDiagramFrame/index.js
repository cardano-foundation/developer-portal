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
