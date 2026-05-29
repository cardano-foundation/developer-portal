// "Copy page" dropdown shown in the docs breadcrumb row.
// The raw .md files are generated at build time by docusaurus-plugin-llms
// (and relocated by scripts/fix-llms-paths.js); this only consumes them —
// no markdown is generated client-side.
import React, {useEffect, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';

const RESET_MS = 2000;

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true">
      <rect x="5.75" y="5.75" width="8" height="8" rx="1.5" />
      <path d="M10.25 5.75V3.5A1.5 1.5 0 0 0 8.75 2H3.5A1.5 1.5 0 0 0 2 3.5v5.25a1.5 1.5 0 0 0 1.5 1.5h2.25" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true">
      <path d="M3 8.5l3.5 3.5L13 5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true">
      <path d="M9 1.75H4.5A1.75 1.75 0 0 0 2.75 3.5v9A1.75 1.75 0 0 0 4.5 14.25h7A1.75 1.75 0 0 0 13.25 12.5V5.5z" />
      <path d="M9 1.75V5.5h4.25" />
    </svg>
  );
}

function ChevronIcon({open}) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
      className={`copy-markdown__chevron${open ? ' copy-markdown__chevron--open' : ''}`}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export default function CopyMarkdownActions() {
  // useLocation (not useDoc) so this component is safe to render outside a
  // DocProvider — DocBreadcrumbs is also used by generated category index
  // pages, which have no DocProvider and would make useDoc() throw.
  const {pathname} = useLocation();
  // The .md sibling lives at the current route with the trailing slash
  // replaced by the extension.
  const markdownUrl = pathname.replace(/\/$/, '') + '.md';

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'copied' | 'error'
  const containerRef = useRef(null);
  const resetTimer = useRef(null);

  // Clear a pending reset timer on unmount so it can't setState afterwards.
  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  // While open, close on outside click or Escape.
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onMouseDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleCopy = async () => {
    setOpen(false);
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    try {
      const response = await fetch(markdownUrl);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      await navigator.clipboard.writeText(await response.text());
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    resetTimer.current = setTimeout(() => {
      setStatus('idle');
      resetTimer.current = null;
    }, RESET_MS);
  };

  const triggerLabel =
    status === 'copied'
      ? 'Copied!'
      : status === 'error'
        ? 'Copy failed'
        : 'Copy page';

  return (
    <div className="copy-markdown" ref={containerRef}>
      <button
        type="button"
        className="copy-markdown__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}>
        {status === 'copied' ? <CheckIcon /> : <CopyIcon />}
        <span>{triggerLabel}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="copy-markdown__menu">
          <button
            type="button"
            className="copy-markdown__item"
            onClick={handleCopy}>
            <CopyIcon />
            <span className="copy-markdown__item-text">
              <span className="copy-markdown__item-title">Copy page</span>
              <span className="copy-markdown__item-desc">
                Copy this page as Markdown for LLMs
              </span>
            </span>
          </button>
          <a
            className="copy-markdown__item"
            href={markdownUrl}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}>
            <FileIcon />
            <span className="copy-markdown__item-text">
              <span className="copy-markdown__item-title">View as Markdown</span>
              <span className="copy-markdown__item-desc">
                Open this page as plain text
              </span>
            </span>
          </a>
        </div>
      )}

      <span className="copy-markdown__status" aria-live="polite">
        {status === 'copied'
          ? 'Page markdown copied to clipboard.'
          : status === 'error'
            ? 'Could not copy page markdown.'
            : ''}
      </span>
    </div>
  );
}
