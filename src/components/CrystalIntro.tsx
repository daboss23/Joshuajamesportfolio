import { useEffect, useRef } from "react";
import { trackScrollProgress } from "../lib/scroll-progress";

/**
 * Where in the section's scroll budget the film has finished playing. Past this
 * point the scroll is spent on the handoff rather than on new frames, so the
 * last shot — the camera already inside the crystal — is what dissolves away.
 */
const SCRUB_END = 0.74;
const EXIT_END = 0.96;

/** Frames are numbered from 1, zero-padded to three digits. */
const FRAME_COUNT = 185;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

const frameUrl = (dir: string, index: number) =>
  `/frames/${dir}/${String(index + 1).padStart(3, "0")}.jpg`;

/**
 * The opening film, scrubbed by the scroll wheel.
 *
 * Drawn as a still sequence rather than played as a video. Scrubbing a
 * `<video>` means assigning `currentTime` and waiting: the seek is
 * asynchronous, the browser coalesces and rate-limits it, and the picture
 * arrives some frames after the wheel did — which is exactly the lag and
 * stepping that made the first attempt feel broken. Decoded stills have no
 * such pipeline. The frame for a given scroll position is simply drawn, every
 * animation frame, so the film tracks the wheel exactly.
 *
 * The trade is bandwidth, and it is smaller than it looks: the sequence is
 * every frame of the source clip at 4.3MB, against 2.8MB for the equivalent
 * all-intra video that could not be scrubbed cleanly anyway. It also drops the
 * codec problem entirely — a JPEG decodes everywhere, so there is no H.264
 * fallback to carry and no iOS gesture to wait for before the first frame.
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones get a narrower sequence: a quarter of the bytes for a picture
    // that is never displayed above ~430 CSS pixels wide anyway.
    const dir = window.matchMedia("(min-width: 768px)").matches ? "hi" : "lo";

    const frames: HTMLImageElement[] = [];
    const ready: boolean[] = new Array(FRAME_COUNT).fill(false);

    /** The frame the scroll is asking for, whether or not it has arrived yet. */
    let wanted = 0;
    /** The frame actually on the canvas, so an unchanged frame costs nothing. */
    let painted = -1;

    /**
     * Falls back to the nearest already-decoded frame. Early in the visit most
     * of the sequence is still in flight, and holding a neighbouring frame
     * looks like a film that has not caught up — where drawing nothing would
     * flash the stage empty on every index that has yet to load.
     */
    const nearestReady = (index: number) => {
      if (ready[index]) return index;
      for (let step = 1; step < FRAME_COUNT; step += 1) {
        if (ready[index - step]) return index - step;
        if (ready[index + step]) return index + step;
      }
      return -1;
    };

    const paint = (force = false) => {
      const source = nearestReady(wanted);
      if (source < 0 || (source === painted && !force)) return;
      painted = source;

      const image = frames[source];
      const { width, height } = canvas;
      // `object-fit: cover` by hand, since a canvas scales its bitmap rather
      // than laying it out.
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    };

    /*
     * Staged loading.
     *
     * Requesting all 185 frames at once holds the window `load` event open
     * until the last one lands — thirteen seconds of it on a connection that
     * cannot open 185 sockets — and gives the viewer nothing to look at any
     * sooner, because the frames arrive in file order rather than in the order
     * the scroll needs them.
     *
     * So a sparse spine of every eighth frame is fetched first. That is enough
     * for the whole film to be scrubbable almost immediately, at reduced
     * temporal resolution, because `nearestReady` will hold a neighbouring
     * frame for any index that has not arrived. The remaining frames are
     * deferred until after load and trickle in at low priority, filling the
     * gaps between the spine until the scrub is frame-exact.
     */
    const SPINE_STRIDE = 8;
    const MAX_IN_FLIGHT = 10;

    let cancelled = false;
    let inFlight = 0;
    const deferred: number[] = [];

    const request = (i: number, priority: "high" | "low") => {
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = priority;
      inFlight += 1;
      const done = () => {
        inFlight -= 1;
        if (!cancelled) pump();
      };
      image.onload = () => {
        ready[i] = true;
        // Repaint if this frame is a better match than whatever stand-in is
        // currently up — including the very first frame landing on an empty
        // stage, and any frame that fills in behind a scroll already past it.
        if (painted < 0 || Math.abs(i - wanted) < Math.abs(painted - wanted)) paint();
        done();
      };
      image.onerror = done;
      image.src = frameUrl(dir, i);
      frames[i] = image;
    };

    const pump = () => {
      while (!cancelled && inFlight < MAX_IN_FLIGHT && deferred.length > 0) {
        request(deferred.shift()!, "low");
      }
    };

    for (let i = 0; i < FRAME_COUNT; i += 1) {
      // The last frame is on the spine whatever the stride works out to: it is
      // the one the handoff blooms out of, so it must never be a stand-in.
      if (i % SPINE_STRIDE === 0 || i === FRAME_COUNT - 1) request(i, "high");
      else deferred.push(i);
    }

    const startDeferred = () => {
      if (!cancelled) pump();
    };
    if (document.readyState === "complete") startDeferred();
    else window.addEventListener("load", startDeferred, { once: true });

    const resize = () => {
      // Capped at 2: beyond that the extra pixels are invisible and the fill
      // rate is not.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      // Resizing a canvas clears it, so the current frame has to go back down —
      // hence forcing past the "already painted" check.
      paint(true);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      // No scrubbing and no handoff — the section is collapsed to a single
      // screen in CSS, so it just shows the opening frame.
      document.documentElement.dataset.chrome = "on";
      return () => {
        cancelled = true;
        window.removeEventListener("resize", resize);
        window.removeEventListener("load", startDeferred);
      };
    }

    const stop = trackScrollProgress(
      section,
      (progress) => {
        const stage = stageRef.current;
        const flash = flashRef.current;
        const cue = cueRef.current;
        if (!stage || !flash || !cue) return;

        wanted = Math.round(clamp(progress / SCRUB_END) * (FRAME_COUNT - 1));
        paint();

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

        // Released as the bloom peaks, so navigation and the cursor trail never
        // sit over the title sequence but are in place for the montage.
        document.documentElement.dataset.chrome = exit > 0.5 ? "on" : "off";

        // Light blowing out through the facet, peaking mid-handoff so the cut
        // itself happens inside the white.
        flash.style.opacity = String(Math.sin(exit * Math.PI) * 0.92);

        cue.style.opacity = String((1 - smoothstep(0.04, 0.16, progress)) * 0.9);
      },
      // Light: the scroll position arriving here is already interpolated (see
      // lib/smooth-scroll), so heavy easing on top only adds lag.
      { ease: 0.3 },
    );

    return () => {
      cancelled = true;
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("load", startDeferred);
    };
  }, []);

  return (
    <section ref={sectionRef} className="intro-scroll" aria-label="Opening film">
      <div ref={stageRef} className="intro-stage">
        <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />

        <div className="intro-vignette" aria-hidden="true" />
        <div ref={flashRef} className="intro-flash" aria-hidden="true" />

        <div ref={cueRef} className="intro-cue" aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </section>
  );
}

export default CrystalIntro;
