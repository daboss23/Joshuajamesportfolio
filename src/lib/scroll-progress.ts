/**
 * Tracks how far an element has travelled through the viewport and hands the
 * eased progress to a per-frame callback.
 *
 * Progress is 0 when the element's top reaches the viewport top and 1 when its
 * bottom does — i.e. the element's own overflow past one screen is the budget.
 * The value is eased toward rather than used raw, which is what stops a
 * trackpad flick from snapping the layers into place.
 *
 * Everything runs off one rAF loop that reads layout and never writes it, so
 * scrolling stays on the compositor and callers only apply transforms.
 */
export function trackScrollProgress(
  el: HTMLElement,
  onFrame: (progress: number) => void,
  {
    ease = 0.12,
    reducedValue = 0,
  }: {
    ease?: number;
    /**
     * The single progress value to hold at when the user has asked for reduced
     * motion — pick whichever one leaves the section in its resting state (0 for
     * a section that animates away, 0.5 for one that animates around a centre).
     */
    reducedValue?: number;
  } = {},
): () => void {
  // Scroll-linked movement is exactly what reduced motion is asking us to drop,
  // so paint the resting state once and never start the loop.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onFrame(reducedValue);
    return () => {};
  }

  let frame = 0;
  let eased = 0;
  let primed = false;

  const tick = () => {
    const rect = el.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const target = Math.min(1, Math.max(0, -rect.top / travel));

    // Jump straight to the target on the first frame so a reload part-way down
    // the page doesn't animate in from 0.
    if (!primed) {
      eased = target;
      primed = true;
    } else {
      eased += (target - eased) * ease;
    }

    onFrame(eased);
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
