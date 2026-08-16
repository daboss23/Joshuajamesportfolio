import { useEffect, useRef, type ReactNode } from "react";
import type { Reel } from "../data/reels";

type Props = {
  reels: Reel[];
  onSelect: (reel: Reel) => void;
  className?: string;
  children?: ReactNode;
  /** Lower is slower. Full traversal of the corridor takes 1/speed seconds. */
  speed?: number;
};

const SLIDE_W = 280;   // must match the rendered panel width
const S_MIN = 0.1;     // scale of a panel as it is born at the centre
const S_MAX = 1.15;    // scale of a panel as it leaves the frame
const LN_R = Math.log(S_MAX / S_MIN);

/**
 * A mirrored perspective corridor: covers stream outward from the vanishing
 * point in the centre, growing as they approach the viewer. Every slide is a
 * button, so a click anywhere in the stream opens that reel.
 */
export function ImageStreamHero({
  reels,
  onSelect,
  className = "",
  children,
  speed = 0.023,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const progress = useRef(0);
  /**
   * Number of slides currently hovered or focused. A count rather than a
   * boolean because slides overlap: sliding from one card straight onto its
   * neighbour fires the new card's enter before the old card's leave, and a
   * boolean would flap back to "moving" for a frame.
   */
  const held = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const count = reels.length;
    let frame = 0;
    let last = performance.now();

    const layout = () => {
      const width = root.clientWidth;
      slideRefs.current.forEach((node, i) => {
        if (!node) return;
        // Even indices ride the left lane, odd the right — so the two wings
        // stay mirrored while showing different covers.
        const lane = i % 2 === 0 ? -1 : 1;
        const slot = Math.floor(i / 2);
        const lanes = Math.ceil(count / 2);

        const u = (((slot / lanes + progress.current) % 1) + 1) % 1;
        const s = S_MIN * Math.exp(LN_R * u);

        // Panels sit shoulder to shoulder, so the gap between two of them has
        // to grow at the same rate the panels do; the 0.82 pulls the wings in
        // and lets neighbours overlap slightly so no seams show. A newborn
        // panel straddles the centre line, which is what joins the two wings.
        const spread = (SLIDE_W * lanes * 0.82) / LN_R;
        const k = width / 1440;
        const x = lane * spread * (s - S_MIN) * k;
        const rotate = lane * -(4 + u * 20);
        const fade = Math.min(1, u / 0.02) * Math.min(1, (1 - u) / 0.04);

        node.style.transform = `translate3d(${x}px, 0, 0) rotateY(${rotate}deg) scale(${s * k})`;
        node.style.opacity = String(fade);
        node.style.zIndex = String(Math.round(u * 100));
        // Only the large, near slides should swallow clicks.
        node.style.pointerEvents = u > 0.3 ? "auto" : "none";
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (held.current === 0 && !reduced.matches) {
        progress.current = (progress.current + dt * speed) % 1;
      }
      layout();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [reels, speed]);

  // The root's leave handler is a safety net: if a card is unmounted or loses
  // pointer capture while held (e.g. the lightbox opens over it), its own leave
  // never fires, so the count is zeroed once the pointer is out of the hero.
  return (
    <div
      ref={rootRef}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ perspective: "1400px" }}
      onPointerLeave={() => (held.current = 0)}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          {reels.map((reel, i) => (
            <button
              key={reel.id}
              ref={(node) => {
                slideRefs.current[i] = node;
              }}
              type="button"
              onClick={() => onSelect(reel)}
              onPointerEnter={() => (held.current += 1)}
              onPointerLeave={() => (held.current = Math.max(0, held.current - 1))}
              onFocus={() => (held.current += 1)}
              onBlur={() => (held.current = Math.max(0, held.current - 1))}
              aria-label={`Play ${reel.title}`}
              className="group absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              style={{ width: 280, height: 498, willChange: "transform, opacity" }}
            >
              <img
                src={reel.poster}
                alt={reel.alt}
                loading={i < 4 ? "eager" : "lazy"}
                draggable={false}
                className="h-full w-full rounded-xl object-cover shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
              />
              <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black">
                  <PlayIcon />
                </span>
              </span>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/80 to-transparent p-4 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {reel.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/*
        No vignette here. A full-bleed overlay tinted the hero but stopped dead
        at its bottom edge, which read as a dark panel sitting over the page.
        The headline gets its contrast from its own text-shadow instead, so the
        cursor tubes stay at full strength right through the section.
      */}

      {children}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.4-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}
