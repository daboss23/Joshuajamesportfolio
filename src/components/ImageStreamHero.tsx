import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Reel } from "../data/reels";
import { SlotFrame } from "./SlotFrame";

gsap.registerPlugin(useGSAP);

type Props = {
  reels: Reel[];
  onSelect: (reel: Reel) => void;
  className?: string;
  children?: ReactNode;
  /** Corridor traversals per second. Lower is slower. */
  speed?: number;
};

/** Panel geometry in design-space pixels, 9:16. */
const PANEL_W = 280;
const PANEL_H = 498;

/**
 * A panel is born at S_MIN on the vanishing point and retires at S_MAX, by
 * which point it has cleared the viewport edge. Scale is exponential in
 * progress, which is what makes a constant drift read as constant velocity
 * down a real corridor rather than as a linear slide.
 */
const S_MIN = 0.05;
const S_MAX = 1.2;
const LN_R = Math.log(S_MAX / S_MIN);

/**
 * Neighbour pitch as a fraction of panel width. At or above 1.0 the panels
 * separate and the corridor reads as a row of cards with black gaps; below 1.0
 * they overlap and weld into one continuous wall. This is the value the whole
 * layout is solved against — panel scale falls out of it rather than being
 * chosen independently. See DESIGN.md §5.
 */
const PITCH = 1.02;

/**
 * Slots per wing, by viewport. A narrow screen cannot hold twelve panels at
 * this pitch without shrinking them to a thin ribbon — the packing constraint
 * and the panel size are in direct tension — so narrow viewports show fewer,
 * larger panels instead.
 */
const slotsFor = (width: number) => (width <= 640 ? 6 : width <= 1024 ? 9 : 12);

/** Extra travel past the frame edge before a panel recycles. */
const EDGE_PAD = 48;

type Panel = { reel: Reel; slot: number; lane: -1 | 1; mirrored: boolean };

export function ImageStreamHero({
  reels,
  onSelect,
  className = "",
  children,
  speed = 0.028,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const progress = useRef(0);
  const paused = useRef(false);

  /**
   * Both wings carry the same reel at the same slot, and the left wing is
   * flipped — that symmetry is the whole identity of the piece. The mirrored
   * copy is hidden from assistive tech so reels aren't announced twice.
   */
  const [slots, setSlots] = useState(() =>
    typeof window === "undefined" ? 12 : slotsFor(window.innerWidth),
  );

  useEffect(() => {
    const sync = () => setSlots(slotsFor(window.innerWidth));
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const panels = useMemo<Panel[]>(() => {
    // Spread the chosen reels evenly across the full set, so a narrow viewport
    // shows a representative sample rather than just the first few.
    const chosen = Array.from(
      { length: Math.min(slots, reels.length) },
      (_, i) => reels[Math.round((i * reels.length) / slots) % reels.length],
    );
    return chosen.flatMap((reel, slot) => [
      { reel, slot, lane: -1 as const, mirrored: true },
      { reel, slot, lane: 1 as const, mirrored: false },
    ]);
  }, [reels, slots]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || slots === 0) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      let frame = 0;
      let last = performance.now();

      const layout = () => {
        const width = root.clientWidth;

        /*
          Two constraints have to hold at once: a retiring panel must clear the
          frame edge, and neighbours must sit at PITCH so the wall stays
          continuous. Solving them together pins the panel scale k:

            reach  = W/2 + PANEL_W·S_MAX·k/2 + PAD
            spread = reach / (S_MAX − S_MIN)
            pitch  = spread·(e^(LN_R/slots) − 1) / (PANEL_W·k)  ≡ PITCH

          which rearranges to the closed form below. Deriving k this way is why
          the corridor holds its proportions from 375px to ultrawide instead of
          thinning out on small screens.
        */
        const p = Math.exp(LN_R / slots) - 1;
        const d = S_MAX - S_MIN;
        const k = Math.min(
          1.4,
          Math.max(
            0.45,
            ((width / 2 + EDGE_PAD) * p) / (PANEL_W * (PITCH * d - (S_MAX * p) / 2)),
          ),
        );

        const reach = width / 2 + (PANEL_W * S_MAX * k) / 2 + EDGE_PAD;
        const spread = reach / d;

        for (let i = 0; i < panelRefs.current.length; i++) {
          const node = panelRefs.current[i];
          if (!node) continue;
          const { slot, lane } = panels[i];

          const u = (((slot / slots + progress.current) % 1) + 1) % 1;
          const s = S_MIN * Math.exp(LN_R * u);

          const x = lane * spread * (s - S_MIN);
          // Sign matters more than magnitude here: the OUTER edge of each panel
          // tilts toward the viewer, so the wing bows out and folds back at the
          // frame edge. Flipping this to inner-edge-forward flattens the whole
          // corridor into a wall and the curve disappears.
          const rotate = lane * -(5 + u * 18);
          // Short birth fade hides the pop-in at the vanishing point; the depth
          // ramp dims distant panels against the void. Neither touches the
          // outer end of the run, which stays at full brightness.
          const born = Math.min(1, u / 0.05);
          const depth = 0.6 + 0.4 * Math.min(1, u / 0.3);

          node.style.transform = `translate3d(${x}px,0,0) rotateY(${rotate}deg) scale(${s * k})`;
          node.style.opacity = String(born * depth);
          node.style.zIndex = String(Math.round(u * 100));
          // Only panels large enough to aim at should swallow a click.
          node.style.pointerEvents = u > 0.35 ? "auto" : "none";
        }
      };

      const tick = (now: number) => {
        const dt = Math.min(now - last, 64) / 1000;
        last = now;
        if (!paused.current && !reduced.matches) {
          progress.current = (progress.current + dt * speed) % 1;
        }
        layout();
        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      const onResize = () => layout();
      window.addEventListener("resize", onResize);

      if (!reduced.matches) {
        gsap.from(stageRef.current, {
          autoAlpha: 0,
          scale: 0.9,
          duration: 1.6,
          ease: "power3.out",
        });
        gsap.from("[data-hero-line]", {
          yPercent: 115,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.09,
          delay: 0.2,
        });
        gsap.from("[data-hero-sub]", {
          autoAlpha: 0,
          duration: 0.9,
          ease: "power2.out",
          delay: 0.9,
        });
      }

      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: rootRef, dependencies: [panels, slots, speed] },
  );

  return (
    <div
      ref={rootRef}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ perspective: "1500px", perspectiveOrigin: "50% 50%" }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div
        ref={stageRef}
        className="pointer-events-none absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Corridor sits below centre so the headline clears the tallest panels. */}
        <div className="absolute left-1/2 top-[57%] h-0 w-0">
          {panels.map((panel, i) => (
            <button
              key={`${panel.reel.id}-${panel.lane}`}
              ref={(node) => {
                panelRefs.current[i] = node;
              }}
              type="button"
              tabIndex={panel.mirrored ? -1 : 0}
              aria-hidden={panel.mirrored || undefined}
              onClick={() => onSelect(panel.reel)}
              aria-label={`Play ${panel.reel.title}`}
              className="group absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white"
              style={{
                width: PANEL_W,
                height: PANEL_H,
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
              }}
            >
              {panel.reel.poster ? (
                <img
                  src={panel.reel.poster}
                  alt={panel.mirrored ? "" : (panel.reel.alt ?? "")}
                  loading={panel.slot < 4 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  className="h-full w-full rounded-sm object-cover shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
                  style={panel.mirrored ? { transform: "scaleX(-1)" } : undefined}
                />
              ) : (
                // Placeholder frames are not flipped — a mirrored slot number
                // reads as a rendering fault rather than as symmetry.
                <div className="h-full w-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
                  <SlotFrame index={panel.slot} />
                </div>
              )}
              {/* Hairline rim keeps panels separable where they overlap. */}
              <span className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-inset ring-white/10" />

              <span className="absolute inset-0 grid place-items-center rounded-sm bg-black/35 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black">
                  <PlayIcon />
                </span>
              </span>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-sm bg-gradient-to-t from-black/85 to-transparent p-4 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
                {panel.reel.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/*
        Centre scrim only — a small pool of dark over the vanishing point so the
        headline holds contrast. Deliberately NOT an edge vignette: outer panels
        stay at full brightness to the frame edge, which is what gives the
        corridor its depth. See DESIGN.md §7.
      */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 57%, rgba(5,5,5,0.70) 0%, rgba(5,5,5,0.28) 48%, rgba(5,5,5,0) 74%)",
        }}
      />
      {/*
        Headline scrim. Reaches further down than a normal header scrim because
        the display type is set over the top of the corridor — it buys contrast
        for the copy without darkening the panels at the frame edge.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-ink via-ink/75 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/90 to-transparent" />

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
