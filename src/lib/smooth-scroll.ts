import Lenis from "lenis";

/**
 * Puts the page on an interpolated scroll position.
 *
 * A wheel notch is a single discrete jump — typically around a hundred pixels
 * delivered in one event — so anything driven straight off `scrollY` moves in
 * steps no matter how carefully it is eased downstream. Lenis absorbs the
 * notch and plays it out across frames, which is what turns the scrubbed
 * opening film and the pinned sections from stepping to gliding.
 *
 * It drives the real document scroll rather than transforming a wrapper, so
 * `position: sticky`, anchor links and the scrollbar all keep working.
 *
 * Returns a teardown function.
 */
export function initSmoothScroll(): () => void {
  // Scroll interpolation is motion the user has explicitly asked not to see,
  // and native scrolling is the accessible default.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const lenis = new Lenis({
    // Long enough to feel weighted, short enough that the page still goes
    // where it was thrown rather than sliding on past it.
    duration: 1.05,
    // Exponential ease-out: quick to answer the wheel, slow to settle.
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    /*
     * Touch is left alone deliberately. Phone scrolling already has momentum
     * implemented below the browser, and interposing another integrator on top
     * of it is what makes smooth-scroll libraries feel rubbery on mobile.
     */
    syncTouch: false,
  });

  let frame = requestAnimationFrame(function raf(time: number) {
    lenis.raf(time);
    frame = requestAnimationFrame(raf);
  });

  /*
   * In-page anchors have to be handed to Lenis explicitly: left to the
   * browser they jump instantly, which after all this would read as the page
   * having two different scrolling behaviours.
   */
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = anchor?.getAttribute("href");
    if (!anchor || !hash || hash === "#") return;

    const targetEl = document.querySelector(hash);
    if (!targetEl) return;

    event.preventDefault();
    lenis.scrollTo(targetEl as HTMLElement, { offset: 0, duration: 1.4 });
  };

  document.addEventListener("click", onClick);

  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener("click", onClick);
    lenis.destroy();
  };
}
