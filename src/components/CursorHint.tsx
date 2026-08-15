import { useEffect, useState } from "react";

/**
 * Tells people the cursor trail is clickable, then gets out of the way.
 *
 * The hint retires itself the moment it has been acted on — one click and it
 * never comes back for that visit, so it reads as an invitation rather than
 * permanent chrome. It also fades out on its own after a while, in case nobody
 * takes it up.
 */
export function CursorHint() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDismissed(true);
      return;
    }

    const onClick = () => setDismissed(true);
    window.addEventListener("click", onClick);
    const timer = setTimeout(() => setDismissed(true), 12000);

    return () => {
      window.removeEventListener("click", onClick);
      clearTimeout(timer);
    };
  }, []);

  return (
    <p
      className={`flex items-center justify-center gap-2 text-xs tracking-wide text-white/55 transition-opacity duration-700 [text-shadow:0_2px_20px_rgba(0,0,0,0.95)] ${
        dismissed ? "opacity-0" : "opacity-100"
      }`}
      // Hidden from assistive tech once spent, and never focusable — it is a
      // nudge about an ambient effect, not a control.
      aria-hidden={dismissed}
    >
      <ClickIcon />
      Click anywhere to change the colours
    </p>
  );
}

function ClickIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="animate-pulse"
    >
      <path d="M9 9l10.5 4-4.6 1.8L13 19.5 9 9Z" />
      <path d="M5 3v2M3 5h2M5 9v1M3.5 11.5 4 12" />
    </svg>
  );
}
