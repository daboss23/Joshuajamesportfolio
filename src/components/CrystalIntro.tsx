import { useEffect, useRef } from "react";
import { trackScrollProgress } from "../lib/scroll-progress";

/**
 * Where in the section's scroll budget the film has finished playing. Past this
 * point the scroll is spent on the handoff rather than on new frames, so the
 * last shot — the camera already inside the crystal — is what dissolves away.
 */
const SCRUB_END = 0.74;
const EXIT_END = 0.96;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/**
 * Picks the film to load.
 *
 * Resolution is chosen here rather than with `<source media>`: that attribute
 * is only honoured inside `<picture>`, and a `<video>` takes the first source
 * regardless — which would push the desktop file at phones.
 *
 * H.264 is preferred where it decodes, because it is the smaller file and has
 * hardware decode essentially everywhere. The VP9 copies exist for Chromium
 * builds shipped without the proprietary codecs — common on Linux — which
 * would otherwise get a permanently blank stage rather than a fallback.
 */
const introSource = () => {
  const small = !window.matchMedia("(min-width: 768px)").matches;
  const probe = document.createElement("video");
  const h264 = probe.canPlayType('video/mp4; codecs="avc1.4d401f"') !== "";

  if (h264) return small ? "/video/crystal-intro-sm.mp4" : "/video/crystal-intro.mp4";
  return small ? "/video/crystal-intro-sm.webm" : "/video/crystal-intro.webm";
};

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

/**
 * The opening film, scrubbed by the scroll wheel.
 *
 * The source is encoded all-intra (every frame a keyframe) precisely so that
 * `currentTime` can be thrown anywhere without the decoder having to walk
 * forward from the previous keyframe — that is the whole difference between a
 * scrub that snaps and one that glides.
 *
 * The film ends with the camera flying into the crystal, so the handoff is
 * built as a continuation of that move rather than a cut: the frame keeps
 * pushing in, a bloom blows out through the facet, and the hero is already
 * sitting underneath when the white clears. The overlap is bought by pulling
 * the showcase up two screens (see `.showcase` margin), which is what makes
 * the two sections read as one shot.
 */
export function CrystalIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // Reduced motion collapses this section to a still (see the media query in
    // index.css), so there is nothing to scrub and no reason to pull down a
    // multi-megabyte film — the poster is the same frame. The header has no
    // title sequence to stay out of either, so it is released immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.dataset.chrome = "on";
      return;
    }

    video.src = introSource();

    /**
     * Safari on iOS will not decode a frame until the element has been touched
     * by a gesture, so a scrub-only video sits on its poster forever. One
     * muted play/pause on the first interaction is enough to hand us the
     * decoder; after that, seeking works for the rest of the visit.
     */
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      video.play().then(() => video.pause()).catch(() => {});
    };
    const unlockEvents = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
    unlockEvents.forEach((name) =>
      window.addEventListener(name, unlock, { once: true, passive: true }),
    );

    const stop = trackScrollProgress(
      section,
      (progress) => {
        const stage = stageRef.current;
        const flash = flashRef.current;
        const copy = copyRef.current;
        const cue = cueRef.current;
        if (!stage || !flash || !copy || !cue) return;

        const duration = video.duration;
        if (Number.isFinite(duration) && duration > 0) {
          // A hair short of the very end: the final frame is often a partial
          // one, and seeking exactly to `duration` can bounce back to 0.
          const target = clamp(progress / SCRUB_END) * (duration - 0.05);
          // Only ever hold one seek in flight. Queueing them makes the decoder
          // fall behind the wheel and the picture judder.
          if (!video.seeking && Math.abs(video.currentTime - target) > 1 / 60) {
            video.currentTime = target;
          }
        }

        // The push-in never stops — it just runs out of film and keeps going,
        // which is what sells the handoff as one continuous camera move.
        const exit = smoothstep(SCRUB_END, EXIT_END, progress);
        // Pushes hard rather than drifting: once the film runs out, the frame
        // is a near-flat facet, so only a fast scale reads as continued motion
        // instead of a still image being held.
        stage.style.opacity = String(1 - smoothstep(0.42, 1, exit));
        stage.style.transform = `scale(${1 + exit * exit * 0.85})`;
        stage.style.filter = `blur(${exit * exit * 16}px)`;
        stage.style.pointerEvents = exit > 0.5 ? "none" : "auto";

        // Released as the bloom peaks, so navigation never floats over the
        // title sequence but is in place by the time the hero is legible.
        document.documentElement.dataset.chrome = exit > 0.5 ? "on" : "off";

        // Light blowing out through the facet, peaking mid-handoff so the cut
        // itself happens inside the white.
        flash.style.opacity = String(Math.sin(exit * Math.PI) * 0.92);

        const intro = smoothstep(0.02, 0.14, progress);
        const copyOut = 1 - smoothstep(0.2, 0.42, progress);
        copy.style.opacity = String(intro * copyOut);
        copy.style.transform = `translate3d(0, ${(1 - intro) * 26 - progress * 60}px, 0)`;
        cue.style.opacity = String((1 - smoothstep(0.04, 0.16, progress)) * 0.9);
      },
      { ease: 0.14 },
    );

    return () => {
      stop();
      unlockEvents.forEach((name) => window.removeEventListener(name, unlock));
    };
  }, []);

  return (
    <section ref={sectionRef} className="intro-scroll" aria-label="Opening title sequence">
      <div ref={stageRef} className="intro-stage">
        <video
          ref={videoRef}
          className="intro-video"
          // Muted + inline + no controls: this is set dressing that happens to
          // be a video file, not a player anyone is meant to operate.
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          poster="/video/crystal-intro-poster.jpg"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="intro-grain" aria-hidden="true" />
        <div className="intro-vignette" aria-hidden="true" />
        <div ref={flashRef} className="intro-flash" aria-hidden="true" />

        <div ref={copyRef} className="intro-copy">
          <p className="intro-kicker"><span />Motion &amp; edit<span /></p>
          <h1 className="intro-title">
            <span>Joshua</span>
            <span>James</span>
          </h1>
          <p className="intro-sub">Short-form video, cut to be felt.</p>
        </div>

        <div ref={cueRef} className="intro-cue" aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </section>
  );
}

export default CrystalIntro;
