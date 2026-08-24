import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ImageStreamHero } from "./ImageStreamHero";
import { StarsBackground } from "./ui/stars";
import type { Reel } from "../data/reels";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  reels: Reel[];
  onSelect: (reel: Reel) => void;
  children?: ReactNode;
};

/**
 * The hero's exit.
 *
 * The handoff to the scene below is a rush *past* the viewer, not a cross-fade.
 * The corridor is already a perspective tunnel, so the exit that belongs to it
 * is the one it was already implying: accelerate, blow past the camera, and be
 * gone. It scales up and blurs out rather than shrinking away, which reads as
 * travel rather than as a section politely dimming — the previous version faded
 * and receded at the same time and felt like watching a light switch.
 *
 * The copy leaves first and faster than the frames. Letting the headline ride
 * the same curve as the tunnel just smears it.
 */
export function ScrollShowcase({ reels, onSelect, children }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".showcase__hero",
          start: "top top",
          // Explicit, because the section no longer has a height of its own to
          // measure "bottom" against.
          end: "+=95%",
          /*
           * Pin the wrapper and animate the stage *inside* it. ScrollTrigger
           * writes its own transform onto whatever it pins, so tweening the
           * pinned node itself means two systems writing one matrix — the pin
           * wins and the animation silently does nothing.
           */
          pin: ".showcase__pin",
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          /*
           * The arrival scene below creates its trigger independently, and
           * mount order is not page order. ScrollTrigger has to recalculate in
           * page order or the pin-spacer measurements downstream are taken
           * against stale positions.
           */
          refreshPriority: 1,
        },
      });

      // Hold, then go — and the going is fast. A linear fade across the whole
      // range is what made this feel like nothing was happening for a screen
      // and a half.
      tl.to(
        ".showcase__copy",
        { opacity: 0, y: -70, filter: "blur(10px)", duration: 0.35, ease: "power2.in" },
        0.05,
      ).to(
        ".showcase__rush",
        {
          scale: 1.9,
          opacity: 0,
          filter: "blur(14px)",
          duration: 0.8,
          ease: "power2.in",
        },
        0.2,
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="showcase" id="work">
      <div className="showcase__hero">
        <div className="showcase__pin">
          <div className="showcase__rush">
            {/* The room the corridor sits in. Inside the rush layer, so the
                sky travels past the viewer on the exit with everything else. */}
            <StarsBackground speed={14} factor={0.04} starColor="#c6f8ff" />
            <ImageStreamHero reels={reels} onSelect={onSelect} className="h-full w-full">
              {children}
            </ImageStreamHero>
          </div>
        </div>
      </div>
    </div>
  );
}
