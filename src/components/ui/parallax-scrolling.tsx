import { useEffect, useRef } from "react";
import { trackScrollProgress } from "../../lib/scroll-progress";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

/**
 * A sticky identity reveal that keeps the original long-form parallax motion
 * without the thumbnail wall. The portrait, display name and supporting
 * details travel at different rates, giving the section depth while keeping
 * the composition editorial and readable.
 */
export function ParallaxComponent() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    return trackScrollProgress(section, (progress) => {
      const stage = stageRef.current;
      const portrait = portraitRef.current;
      const copy = copyRef.current;
      const details = detailsRef.current;
      const cue = cueRef.current;
      if (!stage || !portrait || !copy || !details || !cue) return;

      const enter = smoothstep(0, 0.1, progress);
      const exit = 1 - smoothstep(0.8, 0.98, progress);
      const visible = Math.min(enter, exit);
      /* The name and portrait meet quickly, then the composition settles. */
      const meeting = smoothstep(0.015, 0.36, progress);

      /*
       * This section overlaps the final viewport of the reel wall. Fade the
       * entire stage in only after it pins so the two full-screen scenes
       * cross-dissolve instead of exposing a horizontal section edge.
       */
      stage.style.opacity = String(enter);
      stage.style.pointerEvents = enter > 0.72 ? "auto" : "none";

      portrait.style.cssText = [
        "opacity:1",
        `transform:translate3d(${1 - meeting * 7}vw, ${(progress - 0.5) * -1.4}vh, 0) scale(${1.01 + meeting * 0.025})`,
      ].join(";");

      copy.style.cssText = [
        `opacity:${visible}`,
        `transform:translate3d(${-1 + meeting * 6}vw, ${(progress - 0.5) * -4}vh, 0)`,
      ].join(";");

      details.style.cssText = [
        `opacity:${visible}`,
        `transform:translate3d(${(1 - meeting) * 2.5}vw, ${(progress - 0.5) * -5}vh, 0)`,
      ].join(";");

      cue.style.opacity = String(1 - smoothstep(0.03, 0.14, progress));
      stage.style.setProperty("--identity-glow", String(0.58 + progress * 0.42));
    }, { reducedValue: 0.72 });
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
        <div className="identity-energy" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
        </div>

        <div ref={copyRef} className="identity-copy">
          <p className="identity-kicker"><span />Motion that moves. Stories that stay.<span /></p>
          <h2 id="identity-title" aria-label="Joshua James">
            <span>Joshua</span>
            <span>James</span>
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
