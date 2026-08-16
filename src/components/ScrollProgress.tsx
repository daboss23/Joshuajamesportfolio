import { useEffect, useRef } from "react";

/**
 * The spectrum progress rail across the top of the page.
 *
 * Reads scroll position on a rAF-throttled listener and writes one transform,
 * so a flick of the wheel costs a single style flush rather than one per
 * scroll event.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let queued = false;

    const measure = () => {
      queued = false;
      const travel = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / travel));
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-rail" aria-hidden="true">
      <div ref={barRef} className="scroll-rail__fill" />
    </div>
  );
}

export default ScrollProgress;
