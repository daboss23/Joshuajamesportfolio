import { useEffect, useRef, type ReactNode } from "react";
import { ImageStreamHero } from "./ImageStreamHero";
import { ParallaxComponent } from "./ui/parallax-scrolling";
import { trackScrollProgress } from "../lib/scroll-progress";
import { cue, mix, smootherstep } from "../lib/easing";
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
       * The corridor holds at full strength for the first third of its budget
       * and only then begins to leave. Receding from the very first pixel of
       * scroll is what made the old handoff feel abrupt: the section the user
       * was still looking at started dimming before anything had arrived to
       * replace it, so the movement read as a fault rather than as a
       * transition. Holding first, then dissolving across the same window the
       * portrait fades up in, turns the two scenes into one cross-dissolve.
       */
      const leaving = cue([0.32, 0.94], p);
      /* Drift is on its own, slower curve so the corridor keeps travelling
         after it has faded — motion that continues past the dissolve is what
         sells the recession as depth rather than as an opacity change. */
      const recede = smootherstep(0, 1, p);

      pin.style.opacity = String(1 - leaving);
      pin.style.transform = `translate3d(0, ${mix(0, -7, recede).toFixed(2)}vh, 0) scale(${mix(
        1,
        0.9,
        recede,
      ).toFixed(4)})`;
      pin.style.filter = `blur(${mix(0, 5, leaving).toFixed(2)}px)`;
      // Once it has mostly dissolved it is still pinned over the viewport, so
      // stop it intercepting clicks meant for the scene underneath.
      pin.style.pointerEvents = leaving > 0.4 ? "none" : "auto";
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
