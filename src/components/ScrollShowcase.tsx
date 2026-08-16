import { useEffect, useRef, type ReactNode } from "react";
import { ImageStreamHero } from "./ImageStreamHero";
import { ParallaxComponent } from "./ui/parallax-scrolling";
import { trackScrollProgress } from "../lib/scroll-progress";
import type { Reel } from "../data/reels";

type Props = {
  reels: Reel[];
  onSelect: (reel: Reel) => void;
  children?: ReactNode;
};

/**
 * The hero and the parallax gallery as one continuous scroll stage.
 *
 * Both are pinned, and the hero hands off by receding — shrinking, blurring and
 * dimming — exactly as the parallax columns rise over it. The overlap is what
 * makes the seam disappear: there is no point at which one section has ended
 * and the next has not yet started.
 */
export function ScrollShowcase({ reels, onSelect, children }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const pin = pinRef.current;
    if (!hero || !pin) return;

    return trackScrollProgress(hero, (p) => {
      /*
       * The first screen of this section's travel is spent underneath the
       * opening film, so it is held back rather than animated: measured raw,
       * the hero would already be a third faded by the time the bloom cleared
       * and the viewer would never see it at full strength. Derived from the
       * element's own height instead of a hard-coded fraction, so changing the
       * overlap in CSS cannot quietly desynchronise the two.
       */
      const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
      const hold = window.innerHeight;
      const q = Math.min(1, Math.max(0, (p * travel - hold) / (travel - hold)));

      /*
       * The corridor shrinks toward the vanishing point and dims, so the
       * handoff reads as depth rather than a plain fade-out.
       *
       * The fade is spread across the whole of the remaining travel rather
       * than rushed: finishing early left the hero invisible for the best part
       * of a screen before the identity section had risen far enough to show
       * anything, which read as the page briefly going dead. Reaching zero
       * exactly at the end means the next section is entering the viewport at
       * the moment this one runs out.
       */
      pin.style.opacity = String(1 - q);
      pin.style.transform = `translate3d(0, ${-q * 12}vh, 0) scale(${1 - q * 0.18})`;
      pin.style.filter = `blur(${q * 6}px)`;
      // Once it has faded out it is still pinned over the viewport, so stop it
      // intercepting clicks meant for whatever is underneath.
      pin.style.pointerEvents = q > 0.85 ? "none" : "auto";
    });
  }, []);

  return (
    <div className="showcase" id="work">
      <div ref={heroRef} className="showcase__hero">
        <div ref={pinRef} className="showcase__pin">
          <ImageStreamHero reels={reels} onSelect={onSelect} className="h-full w-full">
            {children}
          </ImageStreamHero>
        </div>
      </div>

      <ParallaxComponent />
    </div>
  );
}
