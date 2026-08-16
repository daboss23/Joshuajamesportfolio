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
      // The corridor shrinks toward the vanishing point and dims, so the
      // handoff reads as depth rather than a plain fade-out.
      pin.style.opacity = String(Math.max(0, 1 - p * 1.25));
      pin.style.transform = `translate3d(0, ${-p * 12}vh, 0) scale(${1 - p * 0.18})`;
      pin.style.filter = `blur(${p * 6}px)`;
      // Once it has faded out it is still pinned over the viewport, so stop it
      // intercepting clicks meant for whatever is underneath.
      pin.style.pointerEvents = p > 0.6 ? "none" : "auto";
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
