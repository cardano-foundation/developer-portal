import { useEffect, useRef, useState } from "react";

// Clipboard copy with a transient "copied" flag for button feedback. The
// flag resets after `resetMs`; unmounting clears the pending reset.
export default function useCopyToClipboard(resetMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = async (text) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetMs);
    } catch {
      // clipboard blocked: fail silently
    }
  };

  return [copied, copy];
}
