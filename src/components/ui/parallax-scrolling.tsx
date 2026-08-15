import { useEffect, useRef } from "react";

/**
 * Scroll-driven parallax gallery.
 *
 * The section is deliberately taller than the viewport; a sticky stage pins the
 * artwork while that extra height scrolls past, and each column is translated by
 * its own multiple of the scroll progress so the layers separate in depth.
 *
 * Self-contained: no scroll library, no animation dependency. A single rAF loop
 * reads scroll position once per frame and eases toward it, which keeps the
 * motion smooth on trackpads without ever fighting native scrolling.
 */

type Column = {
  /** Translation multiplier. Negative rises, positive sinks; 0 is locked. */
  speed: number;
  /** Thumbnail ids drawn from `public/thumbs`. */
  items: string[];
};

const COLUMNS: Column[] = [
  { speed: -1.15, items: ["px-01", "sunset-diver", "px-06"] },
  { speed: 0.55, items: ["hue-flow", "px-02", "racket-cloud"] },
  { speed: -0.7, items: ["px-03", "city-double", "px-07"] },
  { speed: 1.0, items: ["moon-grade", "px-04", "bird-hand"] },
  { speed: -0.45, items: ["px-05", "crimson-aura", "px-08"] },
];

export function ParallaxComponent() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let eased = 0;
    let target = 0;

    const measure = () => {
      const rect = section.getBoundingClientRect();
      // Travel is however much of the section scrolls past a pinned stage.
      const travel = Math.max(1, rect.height - window.innerHeight);
      // 0 when the section's top hits the viewport top, 1 when its bottom does.
      target = Math.min(1, Math.max(0, -rect.top / travel));
    };

    const paint = () => {
      // Signed distance from the midpoint: layers spread apart symmetrically
      // around the moment the stage is centred, rather than drifting one way.
      const p = eased - 0.5;
      const vh = window.innerHeight;

      colRefs.current.forEach((node, i) => {
        if (!node) return;
        node.style.transform = `translate3d(0, ${p * COLUMNS[i].speed * vh * 0.9}px, 0)`;
      });

      if (headingRef.current) {
        const away = Math.abs(p) * 2; // 0 centred, 1 at either end
        headingRef.current.style.transform = `translate3d(0, ${p * -vh * 0.25}px, 0) scale(${1 + away * 0.12})`;
        headingRef.current.style.opacity = String(Math.max(0, 1 - away * 1.15));
      }

      if (stageRef.current) {
        // Heaviest vignette when the stage is centred, lifting toward the ends.
        const centred = 1 - Math.min(1, Math.abs(p) * 2);
        stageRef.current.style.setProperty("--veil", String(0.35 + centred * 0.6));
      }
    };

    const tick = () => {
      measure();
      // Critically damped enough to feel weighty without lagging behind.
      eased += (target - eased) * (reduced.matches ? 1 : 0.12);
      paint();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section ref={sectionRef} className="parallax" aria-label="Parallax showreel">
      <div ref={stageRef} className="parallax__stage">
        <div className="parallax__grid" aria-hidden="true">
          {COLUMNS.map((col, i) => (
            <div
              key={i}
              ref={(node) => {
                colRefs.current[i] = node;
              }}
              className="parallax__col"
            >
              {col.items.map((id) => (
                <div key={id} className="parallax__card">
                  <img src={`/thumbs/${id}.svg`} alt="" loading="lazy" draggable={false} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="parallax__veil" />

        <div ref={headingRef} className="parallax__heading">
          <p className="parallax__eyebrow">Keep scrolling</p>
          <h2 className="parallax__title">
            Every frame
            <br />
            earns its cut.
          </h2>
        </div>
      </div>
    </section>
  );
}

export default ParallaxComponent;
