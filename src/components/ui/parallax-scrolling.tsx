import { useEffect, useRef } from "react";
import { EnergyRing } from "../EnergyRing";
import { trackScrollProgress } from "../../lib/scroll-progress";
import { clamp, cue, cueInOut, mix, smootherstep, type Cue } from "../../lib/easing";

/**
 * The identity reveal: the portrait arrives, the ring ignites behind him, and
 * only then does the name land.
 *
 * The scene is written as a storyboard. Every beat is a window on the
 * section's 0→1 scroll progress, and the windows overlap deliberately — a beat
 * starts while the one before it is still finishing, which is what makes the
 * sequence read as one movement instead of a queue of separate fades.
 *
 * Three things are load-bearing here and easy to undo by accident:
 *
 *  1. The portrait's window opens before everything else and closes early, so
 *     he is *established* before a single word appears. That ordering is the
 *     whole point of the scene.
 *  2. Nothing is clipped away at the end. Every layer, the stage included,
 *     runs through `cueInOut` so the composition dissolves before the sticky
 *     stage unpins. Fading only the copy leaves the portrait to be cut off by
 *     the section edge, which is the one seam that gives away that the page is
 *     made of separate sections.
 *  3. Transforms are written with `style.transform`, not `style.cssText`.
 *     Rewriting cssText drops any property the frame does not re-state and
 *     forces the whole declaration to be reparsed every frame.
 */

/** The storyboard. Read top to bottom for the order of the reveal. */
const CUE = {
  /** He fades in first, alone. */
  portrait: [0.0, 0.16] as Cue,
  /** The ring wakes as he settles, so the energy looks like it belongs to him. */
  ignite: [0.08, 0.30] as Cue,
  /** Then the words, in reading order. */
  kicker: [0.17, 0.26] as Cue,
  first: [0.21, 0.33] as Cue,
  last: [0.26, 0.39] as Cue,
  role: [0.32, 0.43] as Cue,
  intro: [0.36, 0.48] as Cue,
  actions: [0.41, 0.53] as Cue,
  details: [0.45, 0.57] as Cue,
  /** Everything leaves together, before the stage unpins. */
  outro: [0.84, 1.0] as Cue,
} as const;

/**
 * How far a beat travels on its way in, in vh/vw. Kept small: the drama comes
 * from the order and the timing, and a long slide on a big serif headline just
 * reads as the text being late.
 */
const RISE = 2.4;

export function ParallaxComponent() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const roleRef = useRef<HTMLParagraphElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    return trackScrollProgress(
      section,
      (progress) => {
        const stage = stageRef.current;
        const portrait = portraitRef.current;
        const ring = ringRef.current;
        if (!stage || !portrait || !ring) return;

        const leaving = cue(CUE.outro, progress);

        /*
         * The stage carries the cross-dissolve with the reel corridor beneath
         * it: it is already fading up while the corridor is still receding, so
         * at no point is either scene alone on screen.
         */
        stage.style.opacity = String(mix(0, 1, cue(CUE.portrait, progress)) * (1 - leaving));
        stage.style.pointerEvents = progress > 0.2 && leaving < 0.4 ? "auto" : "none";

        /* --- the portrait: arrives, settles, and is never cut off --------- */
        const landing = cue(CUE.portrait, progress);
        const drift = smootherstep(0, 1, progress);
        portrait.style.opacity = String(1 - leaving);
        portrait.style.transform = [
          // A gentle push left across the whole scene keeps him alive under
          // the copy. `identity-portrait` carries enough overscan that this
          // can never expose the frame edge.
          `translate3d(${mix(1.6, -1.6, drift)}vw, ${mix(2.2, -2.2, drift)}vh, 0)`,
          // Lands from slightly too close, which is what makes it feel like he
          // steps into the frame rather than simply appearing in it.
          `scale(${mix(1.14, 1.03, landing) + leaving * 0.05})`,
        ].join(" ");
        portrait.style.filter = `brightness(${mix(0.72, 1.08, landing)}) saturate(${mix(
          0.6,
          1.02,
          landing,
        )}) contrast(1.02) blur(${mix(9, 0, landing).toFixed(2)}px)`;

        /* --- the ring: ignites behind him, breathes, leaves with him ------ */
        const energy = cue(CUE.ignite, progress) * (1 - leaving);
        ring.style.setProperty("--energy", energy.toFixed(3));
        ring.style.opacity = String(energy);
        ring.style.transform = `scale(${mix(0.82, 1, cue(CUE.ignite, progress))})`;

        /* --- the copy: one beat each, in reading order -------------------- */
        const beat = (
          node: HTMLElement | null,
          window: Cue,
          { x = 0, y = RISE }: { x?: number; y?: number } = {},
        ) => {
          if (!node) return;
          const t = cueInOut(window, CUE.outro, progress);
          node.style.opacity = String(t);
          node.style.transform = `translate3d(${mix(x, 0, t)}vw, ${mix(y, 0, t)}vh, 0)`;
        };

        beat(kickerRef.current, CUE.kicker, { x: -1.1 });
        beat(firstRef.current, CUE.first, { x: -1.6, y: 3.2 });
        beat(lastRef.current, CUE.last, { x: 1.6, y: 3.2 });
        beat(roleRef.current, CUE.role, { x: -0.7 });
        beat(introRef.current, CUE.intro, { x: -0.7 });
        beat(actionsRef.current, CUE.actions, { y: 1.8 });
        beat(detailsRef.current, CUE.details, { x: 1.2 });

        /* The prompt to keep scrolling is only true while there is more to
           reveal, so it retires as the name lands. */
        if (cueRef.current) {
          cueRef.current.style.opacity = String(1 - cue([0.04, 0.18], progress));
        }

        stage.style.setProperty("--identity-glow", clamp(0.35 + energy * 0.65).toFixed(3));
      },
      /* Reduced motion holds the scene at the beat where the whole
         composition is up and nothing has begun to leave. */
      { reducedValue: 0.68 },
    );
  }, []);

  return (
    <section ref={sectionRef} className="identity-scroll" aria-labelledby="identity-title">
      <div ref={stageRef} className="identity-stage">
        <img
          ref={portraitRef}
          className="identity-portrait"
          src="/images/joshua-bomber-clean.webp"
          alt="Joshua James in a shearling bomber jacket looking toward his name"
          fetchPriority="high"
          decoding="async"
        />
        <div className="identity-scrim" aria-hidden="true" />

        <div ref={ringRef} className="identity-orbit">
          <EnergyRing />
        </div>

        <div className="identity-copy">
          <p ref={kickerRef} className="identity-kicker">
            <span />Motion that moves. Stories that stay.<span />
          </p>
          <h2 id="identity-title" aria-label="Joshua James">
            <span ref={firstRef}>Joshua</span>
            <span ref={lastRef}>James</span>
          </h2>
          <p ref={roleRef} className="identity-role">Motion designer / visual storyteller</p>
          <p ref={introRef} className="identity-intro">
            I shape raw ideas into sharp, cinematic work built to hold attention
            and leave a feeling behind.
          </p>
          <div ref={actionsRef} className="identity-actions">
            <a className="identity-primary" href="#selected-work">View my work <span>↗</span></a>
            <a className="identity-secondary" href="#contact">Let’s talk <span>+</span></a>
          </div>
        </div>

        <div ref={detailsRef} className="identity-details">
          <div className="identity-socials" aria-label="Social links">
            <a href="https://www.behance.net/" target="_blank" rel="noreferrer" aria-label="Behance">Be</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
          </div>
          <p><span className="availability-dot" />Available for select projects</p>
        </div>

        <div ref={cueRef} className="identity-scroll-cue" aria-hidden="true">
          <span>Scroll to reveal</span><i />
        </div>
      </div>
    </section>
  );
}

export default ParallaxComponent;
