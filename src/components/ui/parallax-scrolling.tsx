import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EnergyRing } from "../EnergyRing";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The identity reveal.
 *
 * One scrubbed GSAP timeline, pinned. The shape of it is: he arrives out of
 * the dark, the ring behind him detonates, and the name is *struck* into place
 * on that shockwave — letter by letter, riding the blast rather than fading up
 * politely after it.
 *
 * The thing that makes it read as one event rather than a queue of tweens is
 * that the beats overlap hard and share the shockwave as their downbeat. Every
 * position parameter below is relative to the `impact` label for that reason:
 * move the label and the whole reveal re-times around it, which is the only
 * way this stays adjustable.
 *
 * Written as a timeline rather than a hand-rolled rAF loop because the timing
 * *is* the design here. `scrub` gives the smoothing for free, and the position
 * parameters state the choreography in the order it plays.
 */

/** Split a word into per-character spans so each letter can be tweened. */
function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {[...text].map((char, i) => (
        <span className="char" key={i}>
          <span className="char__inner">{char}</span>
        </span>
      ))}
    </span>
  );
}

export function ParallaxComponent() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        // The resting state is the finished composition: everything visible,
        // nothing driven by scroll position.
        gsap.set(
          [".identity-portrait", ".identity-orbit", ".identity-kicker", ".char__inner",
           ".identity-role", ".identity-intro", ".identity-actions", ".identity-details"],
          { opacity: 1, clearProps: "transform,filter" },
        );
        gsap.set(".identity-inner", { opacity: 1 });
        gsap.set(".identity-scroll-cue", { opacity: 0 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          // Tight. Every 100% here is a full screen of wheel travel the viewer
          // has to spend, so the budget is sized to the beats, not padded to
          // feel cinematic — 260% left long stretches where nothing moved.
          end: "+=170%",
          // Pinned node stays untouched; every tween below targets its
          // children. See the note in ScrollShowcase.
          pin: ".identity-stage",
          pinSpacing: true,
          // A little over half a second of catch-up. Enough to absorb a
          // trackpad flick without the scene feeling detached from the wheel.
          scrub: 0.6,
          anticipatePin: 1,
          // Refreshed after the corridor above it. See the note there.
          refreshPriority: 0,
        },
      });

      /* ---------------------------------------------------------- arrival --
       * He comes out of the dark: too close, too dim, out of focus, and
       * settles. `expo.out` spends almost all its travel in the first third of
       * the tween, so it reads as an arrival that lands rather than a fade
       * that finishes.
       */
      tl.fromTo(
        ".identity-inner",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "none" },
        0,
      )
        .fromTo(
          ".identity-portrait",
          { opacity: 0, scale: 1.42, filter: "blur(26px) brightness(0.25) saturate(0.4)" },
          {
            opacity: 1,
            scale: 1.06,
            filter: "blur(0px) brightness(1.08) saturate(1.02)",
            duration: 1.9,
            ease: "expo.out",
          },
          0,
        )
        /* A slow counter-drift under everything else, so he is never a still
           photograph sitting behind moving text. */
        /*
         * Duration is pinned to the timeline's real end. A drift longer than
         * the last beat silently extends the timeline, and every extra second
         * of it is scroll distance where the scene is finished and the viewer
         * is still turning the wheel.
         */
        .to(".identity-portrait", { xPercent: -3, yPercent: -2, scale: 1.12, duration: 5.6, ease: "none" }, 0)

        .addLabel("impact", 1)

        /* ------------------------------------------------------ detonation --
         * The ring is nothing, then it is everything, in a quarter of the time
         * anything else takes. `back.out` overshoots the scale so the blast
         * punches past its resting size and settles back into it.
         */
        .fromTo(
          ".identity-orbit",
          { opacity: 0, scale: 0.35 },
          { opacity: 1, scale: 1, duration: 1.1, ease: "back.out(1.9)" },
          "impact-=0.3",
        )
        .fromTo(
          ".identity-orbit",
          { "--energy": 0 },
          { "--energy": 1, duration: 1.3, ease: "power2.out" },
          "impact-=0.18",
        )
        /* The shockwave itself: one hard flash that outruns the ring and is
           gone. It is the loudest thing in the scene and lasts the least. */
        .fromTo(
          ".energy-shock",
          { opacity: 0.9, scale: 0.2 },
          { opacity: 0, scale: 2.6, duration: 1.2, ease: "power2.out" },
          "impact-=0.08",
        )

        /* ------------------------------------------------------ the name ----
         * Struck in, not faded in. Each character starts below its own clip
         * box, rotated back in 3D, and is driven up onto the baseline. The
         * stagger is what makes it read as kinetic type rather than a block
         * of text changing opacity.
         */
        .fromTo(
          ".identity-name--first .char__inner",
          { yPercent: 118, rotateX: -78, opacity: 0 },
          {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            duration: 1.15,
            ease: "expo.out",
            stagger: { each: 0.07, from: "start" },
          },
          "impact",
        )
        .fromTo(
          ".identity-name--last .char__inner",
          { yPercent: 118, rotateX: -78, opacity: 0 },
          {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            duration: 1.15,
            ease: "expo.out",
            stagger: { each: 0.07, from: "start" },
          },
          "impact+=0.32",
        )
        /* A specular sweep chasing the last letter home. */
        .fromTo(
          ".identity-sheen",
          { xPercent: -130, opacity: 0 },
          { xPercent: 130, opacity: 1, duration: 1.4, ease: "power2.inOut" },
          "impact+=0.7",
        )
        .to(".identity-sheen", { opacity: 0, duration: 0.4 }, "impact+=1.9")

        /* ------------------------------------------- everything else, fast --
         * Supporting copy is not the show. It arrives close behind the name,
         * tightly staggered, and gets out of the way.
         */
        .fromTo(
          ".identity-kicker",
          { opacity: 0, x: -40, filter: "blur(6px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.8 },
          "impact-=0.4",
        )
        .fromTo(
          [".identity-role", ".identity-intro", ".identity-actions"],
          { opacity: 0, y: 34, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, stagger: 0.16 },
          "impact+=1",
        )
        .fromTo(
          ".identity-details",
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.8 },
          "impact+=1.35",
        )
        .to(".identity-scroll-cue", { opacity: 0, duration: 0.5 }, 0.2)

        /* ------------------------------------------------------- the hold ---
         * Long enough to read the finished composition, and no longer. The
         * previous 2.2s of empty tween was ~500px of scrolling against a
         * static frame, which is most of what read as the scene stalling.
         */
        .addLabel("hold", "impact+=2.5")
        .to({}, { duration: 0.6 }, "hold")

        /* ------------------------------------------------------- departure --
         * Nothing is allowed to be clipped away by the pin releasing. The
         * whole composition leaves under its own power first — copy pulls
         * back, the ring collapses, he recedes.
         */
        .addLabel("out", "hold+=0.6")
        .to(
          [".identity-kicker", ".identity-role", ".identity-intro", ".identity-actions", ".identity-details"],
          { opacity: 0, y: -26, filter: "blur(7px)", duration: 0.7, stagger: 0.05 },
          "out",
        )
        .to(
          ".identity-name--first .char__inner, .identity-name--last .char__inner",
          { yPercent: -110, opacity: 0, duration: 0.8, ease: "power3.in", stagger: { each: 0.03, from: "end" } },
          "out+=0.15",
        )
        .to(".identity-orbit", { opacity: 0, scale: 0.7, duration: 0.9 }, "out+=0.15")
        .to(
          ".identity-portrait",
          { opacity: 0, scale: 1.3, filter: "blur(18px) brightness(0.3) saturate(0.4)", duration: 1.1 },
          "out+=0.25",
        )
        .to(".identity-inner", { opacity: 0, duration: 0.7, ease: "none" }, "out+=0.7");
    },
    { scope: root },
  );

  return (
    <section ref={root} className="identity-scroll" aria-labelledby="identity-title">
      <div className="identity-stage">
        <div className="identity-inner">
        <img
          className="identity-portrait"
          src="/images/joshua-bomber-clean.webp"
          alt="Joshua James in a shearling bomber jacket looking toward his name"
          fetchPriority="high"
          decoding="async"
        />
        <div className="identity-scrim" aria-hidden="true" />

        <div className="identity-orbit">
          <EnergyRing />
        </div>

        <div className="identity-copy">
          <p className="identity-kicker">
            <span />Motion that moves. Stories that stay.<span />
          </p>
          {/* The visible name is per-character and hidden from assistive tech;
              the accessible name comes from aria-label on the heading. */}
          <h2 id="identity-title" aria-label="Joshua James">
            <Chars text="Joshua" className="identity-name identity-name--first" />
            <Chars text="James" className="identity-name identity-name--last" />
            <span className="identity-sheen" aria-hidden="true" />
          </h2>
          <p className="identity-role">Motion designer / visual storyteller</p>
          <p className="identity-intro">
            I shape raw ideas into sharp, cinematic work built to hold attention
            and leave a feeling behind.
          </p>
          <div className="identity-actions">
            <a className="identity-primary" href="#selected-work">View my work <span>↗</span></a>
            <a className="identity-secondary" href="#contact">Let’s talk <span>+</span></a>
          </div>
        </div>

        <div className="identity-details">
          <div className="identity-socials" aria-label="Social links">
            <a href="https://www.behance.net/" target="_blank" rel="noreferrer" aria-label="Behance">Be</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
          </div>
          <p><span className="availability-dot" />Available for select projects</p>
        </div>

        <div className="identity-scroll-cue" aria-hidden="true">
          <span>Scroll to reveal</span><i />
        </div>
        </div>
      </div>
    </section>
  );
}

export default ParallaxComponent;
