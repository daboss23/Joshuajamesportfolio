import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Puts the page on an interpolated scroll position, on GSAP's clock.
 *
 * A wheel notch is a single discrete jump — typically around a hundred pixels
 * delivered in one event — so anything driven straight off `scrollY` moves in
 * steps no matter how carefully it is eased downstream. Lenis absorbs the
 * notch and plays it out across frames.
 *
 * The three lines that matter are the handshake with ScrollTrigger:
 *
 *  - `lenis.on("scroll", ScrollTrigger.update)` — Lenis moves the page without
 *    the browser firing a native scroll event ScrollTrigger would catch, so it
 *    has to be told. Without this every pinned scene lags a frame behind the
 *    content and the whole page feels loose.
 *  - driving `lenis.raf` from `gsap.ticker` instead of its own
 *    `requestAnimationFrame` — two independent rAF loops resolve in whatever
 *    order the browser feels like, so scroll position and the animations read
 *    from it disagree on alternate frames. One clock, one order.
 *  - `lagSmoothing(0)` — GSAP's recovery from a long frame jumps the playhead
 *    to catch up, which on a scrubbed timeline shows as a lurch. Scroll-linked
 *    animation wants real elapsed time, not corrected time.
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

  lenis.on("scroll", ScrollTrigger.update);

  const drive = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(drive);
  gsap.ticker.lagSmoothing(0);

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
    document.removeEventListener("click", onClick);
    gsap.ticker.remove(drive);
    lenis.destroy();
  };
}
