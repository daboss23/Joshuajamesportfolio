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
  const backdropRef = useRef<HTMLDivElement>(null);
  const walkRef = useRef<HTMLImageElement>(null);
  const liftRef = useRef<HTMLImageElement>(null);
  const shadesOnRef = useRef<HTMLImageElement>(null);
  const nameLookRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    return trackScrollProgress(section, (progress) => {
      const stage = stageRef.current;
      const backdrop = backdropRef.current;
      const walk = walkRef.current;
      const lift = liftRef.current;
      const shadesOn = shadesOnRef.current;
      const nameLook = nameLookRef.current;
      const copy = copyRef.current;
      const details = detailsRef.current;
      const cue = cueRef.current;
      if (
        !stage ||
        !backdrop ||
        !walk ||
        !lift ||
        !shadesOn ||
        !nameLook ||
        !copy ||
        !details ||
        !cue
      ) return;

      /*
       * The shades are deliberately held back until the last 13% of the
       * section. First the full-body frame advances toward camera; then three
       * tightly-spaced stills create the action: lift, glasses seated, head
       * turn. Keeping the name reveal even later makes the look land on it.
       */
      const walkProgress = clamp(progress / 0.875);
      const walkScale = 0.72 + walkProgress * 0.62;
      const walkBob = Math.sin(walkProgress * Math.PI * 8) * (1 - walkProgress) * 0.55;
      const walkOpacity = 1 - smoothstep(0.872, 0.897, progress);
      const liftOpacity =
        smoothstep(0.872, 0.897, progress) *
        (1 - smoothstep(0.918, 0.94, progress));
      const shadesOnOpacity =
        smoothstep(0.918, 0.94, progress) *
        (1 - smoothstep(0.958, 0.98, progress));
      const nameLookOpacity = smoothstep(0.958, 0.985, progress);
      const nameReveal = smoothstep(0.973, 0.997, progress);

      walk.style.cssText = [
        `opacity:${walkOpacity}`,
        `transform:translate3d(${(1 - walkProgress) * 5}vw, ${8 - walkProgress * 10 + walkBob}vh, 0) scale(${walkScale})`,
      ].join(";");

      lift.style.cssText = [
        `opacity:${liftOpacity}`,
        `transform:translate3d(1.6vw, ${1.5 - liftOpacity * 1.5}vh, 0) scale(${1.02 + liftOpacity * 0.025})`,
      ].join(";");

      shadesOn.style.cssText = [
        `opacity:${shadesOnOpacity}`,
        `transform:translate3d(1.2vw, 0, 0) scale(${1.04 + shadesOnOpacity * 0.02})`,
      ].join(";");

      nameLook.style.cssText = [
        `opacity:${nameLookOpacity}`,
        `transform:translate3d(${1.5 - nameLookOpacity * 1.5}vw, 0, 0) scale(${1.06 - nameLookOpacity * 0.02})`,
      ].join(";");

      backdrop.style.cssText = [
        `opacity:${0.42 + progress * 0.16}`,
        `transform:scale(${1.04 + progress * 0.055})`,
      ].join(";");

      copy.style.cssText = [
        `opacity:${nameReveal}`,
        `transform:translate3d(${(1 - nameReveal) * -5}vw, 0, 0)`,
      ].join(";");

      details.style.cssText = [
        `opacity:${nameReveal}`,
        `transform:translate3d(0, ${(1 - nameReveal) * 2.5}vh, 0)`,
      ].join(";");

      cue.style.opacity = String(1 - smoothstep(0.08, 0.24, progress));
      stage.style.setProperty("--identity-glow", String(0.32 + progress * 0.68));
    }, { reducedValue: 1 });
  }, []);

  return (
    <section ref={sectionRef} className="identity-scroll" aria-labelledby="identity-title">
      <div ref={stageRef} className="identity-stage">
        <div ref={backdropRef} className="identity-backdrop" aria-hidden="true" />
        <img
          ref={walkRef}
          className="identity-frame identity-frame--walk"
          src="/images/joshua-walk-no-shades.webp"
          alt="Joshua James walking toward the camera in a deep-purple suit"
          fetchPriority="high"
          decoding="async"
        />
        <img
          ref={liftRef}
          className="identity-frame"
          src="/images/joshua-shades-lift.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <img
          ref={shadesOnRef}
          className="identity-frame"
          src="/images/joshua-shades-on.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <img
          ref={nameLookRef}
          className="identity-frame"
          src="/images/joshua-name-look.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <div className="identity-scrim" aria-hidden="true" />
        <div className="identity-orbit" aria-hidden="true"><span /><span /></div>

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
