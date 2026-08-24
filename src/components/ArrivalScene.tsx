import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The arrival.
 *
 * The scene the corridor hands off to. It opens inside the crystal tunnel he
 * has just been rushed into, he walks back out of the distance around two
 * thirds in, and it lands on a hero framing with him held to the right of
 * frame. The left third is empty for the whole landing, which is the only
 * reason the name can live there — so the name is *thrown* in from that side
 * while he is still walking toward camera, and settles onto the frame at the
 * moment he does.
 *
 * The letters do not arrive as words. Each one starts somewhere else entirely
 * — its own distance, angle and size — JOSHUA falling in from above the frame
 * and JAMES rising from below, and they converge on the baseline together.
 * The scatter is deterministic (see `scatter` below) rather than random per
 * mount: ScrollTrigger re-reads `from` values on every refresh, and a fresh
 * random layout on a resize mid-scene is a visible jump.
 *
 * The video is not played. Its playhead is scrubbed off the pinned timeline,
 * so the whole clip is under the wheel — hence the all-intra encode of the
 * asset (`-g 1`): every frame is a keyframe, so a seek to an arbitrary time is
 * a decode of one frame rather than a decode of everything since the last one.
 * A normal-GOP encode of this clip stutters visibly under the same scrub.
 */

const FIRST = "JOSHUA";
const LAST = "JAMES";

const EYEBROW = "Motion that moves. Stories that stay.";
const KICKER = "Motion designer / visual storyteller";
const BLURB =
  "I shape raw ideas into sharp, cinematic work built to hold attention and leave a feeling behind.";

const SCRUB_SRC = "/videos/identity-arrival.mp4";
/*
 * Same clip, VP9. Only ever reached by a browser that cannot demux the H.264 —
 * Chromium builds shipped without the proprietary decoders, mostly on Linux —
 * which would otherwise sit on the poster frame for the whole scene.
 */
const SCRUB_SRC_WEBM = "/videos/identity-arrival.webm";
const PLAY_SRC = "/videos/identity-arrival-lite.mp4";
const PLAY_SRC_WEBM = "/videos/identity-arrival-lite.webm";
const POSTER_START = "/images/identity-arrival-first.jpg";
const POSTER_END = "/images/identity-arrival-poster.jpg";

/** Fallback until `loadedmetadata` lands; the encoded clip is 5.06s. */
const CLIP_SECONDS = 5.06;

type Scatter = {
  /** Start offset as a fraction of the viewport, negative x = off to the left. */
  dx: number;
  dy: number;
  rotate: number;
  rotateY: number;
  scale: number;
};

/** mulberry32 — small, fast, and identical on every run for a given seed. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Where each letter starts. `lift` is -1 for the line that falls in from above
 * and 1 for the line that rises from below; every letter also comes from the
 * left, so the line reads as one gesture entering from his empty side even
 * though no two letters travel the same path.
 */
function scatter(seed: number, count: number, lift: -1 | 1): Scatter[] {
  const random = prng(seed);
  return Array.from({ length: count }, () => ({
    dx: -(0.3 + random() * 0.5),
    dy: lift * (0.35 + random() * 0.55),
    rotate: (random() - 0.5) * 90,
    rotateY: (random() - 0.5) * 80,
    scale: 0.4 + random() * 1.25,
  }));
}

const SCATTER_FIRST = scatter(0x4a4f53, FIRST.length, -1);
const SCATTER_LAST = scatter(0x4a414d, LAST.length, 1);

function Letters({ text, className }: { text: string; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {[...text].map((char, i) => (
        <span className="arrival-char" key={i}>
          {char}
        </span>
      ))}
    </span>
  );
}

/**
 * One file, chosen here rather than by the browser.
 *
 * Two `<source>` children look like the obvious way to offer the fallback, but
 * a browser that cannot demux the H.264 downloads the whole mp4 before it
 * discovers that and moves on to the next source — measured, both files in
 * full. Asking `canPlayType` first costs nothing and fetches one.
 */
function pickSource(video: HTMLVideoElement, mode: "scrub" | "play"): string {
  const supportsH264 = Boolean(video.canPlayType('video/mp4; codecs="avc1.640028"'));
  if (mode === "scrub") return supportsH264 ? SCRUB_SRC : SCRUB_SRC_WEBM;
  return supportsH264 ? PLAY_SRC : PLAY_SRC_WEBM;
}

/**
 * Scrub is the desktop path only. Touch scrolling hands the browser a seek per
 * frame while it is also decoding, and mobile Safari answers those seeks late
 * and out of order — the clip judders exactly where it should be smoothest. A
 * coarse pointer gets a lighter encode played straight through instead, and
 * only the name is driven by scroll.
 */
function pickMode(): "scrub" | "play" | "still" {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "still";
  if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768) return "play";
  return "scrub";
}

export function ArrivalScene() {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /**
   * The playhead the scroll position asks for, written every tick and applied
   * by the ticker below. Seeking is asynchronous: assigning `currentTime`
   * while a seek is still in flight throws the earlier one away, so the tween
   * posts its target here and the applier spends it when the element is ready.
   */
  const wanted = useRef<number | null>(null);

  const [mode] = useState(pickMode);

  useGSAP(
    () => {
      const stage = root.current;
      if (!stage) return;

      if (mode === "still") {
        // The finished composition, held: name on the baseline, last frame of
        // the clip behind it, nothing driven by scroll position.
        gsap.set(".arrival__inner", { opacity: 1 });
        gsap.set(".arrival__name", { opacity: 1, xPercent: 0 });
        gsap.set(".arrival-char", { opacity: 1, x: 0, y: 0, rotate: 0, rotateY: 0, scale: 1 });
        gsap.set(".arrival__line", { filter: "blur(0px)" });
        gsap.set([".arrival__eyebrow", ".arrival__kicker", ".arrival__blurb"], { opacity: 1, y: 0 });
        gsap.set(".arrival__rule", { scaleX: 1 });
        return;
      }

      const video = videoRef.current;
      const teardown: (() => void)[] = [];

      if (video) {
        /*
         * The clip is the heaviest asset on the site and this scene is two
         * screens down, so it is fetched once the page itself has finished
         * loading rather than alongside it — no competing with the corridor's
         * covers for the bandwidth the viewer needs first, and nothing at all
         * until the rest of the page is up.
         */
        const startLoading = () => {
          video.src = pickSource(video, mode);
          video.preload = "auto";
          video.load();
        };

        if (document.readyState === "complete") {
          startLoading();
        } else {
          window.addEventListener("load", startLoading, { once: true });
          teardown.push(() => window.removeEventListener("load", startLoading));
        }
      }

      if (video && mode === "scrub") {
        video.pause();

        /**
         * One write per frame at most, and only when the element can take it.
         * `readyState >= 1` means the seekable range exists; skipping a target
         * inside half a frame of where the playhead already is keeps a slow
         * settle from queueing dozens of seeks that resolve to one frame.
         */
        const applySeek = () => {
          const target = wanted.current;
          if (target === null || video.seeking || video.readyState < 1) return;
          if (Math.abs(video.currentTime - target) < 1 / 48) return;
          video.currentTime = target;
        };

        gsap.ticker.add(applySeek);
        // The clip's real duration decides the scrub tween's end value, and
        // metadata usually lands after the timeline is built.
        video.addEventListener("loadedmetadata", () => ScrollTrigger.refresh(), { once: true });

        // useGSAP reverts everything GSAP created in this scope; the ticker
        // callback is not one of those, so it is handed back as cleanup.
        teardown.push(() => gsap.ticker.remove(applySeek));
      }

      const seek = { t: 0 };

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          /*
           * ~2 screens of wheel for 5 seconds of footage plus the landing.
           * Longer than this and the walk-up stops reading as a walk; shorter
           * and the letters have nowhere to travel. On touch the clip plays at
           * its own rate rather than under the thumb, so the scene only has to
           * last as long as the name takes to assemble.
           */
          end: mode === "scrub" ? "+=200%" : "+=150%",
          // Pin the frame, animate its contents. ScrollTrigger owns the
          // transform on whatever it pins — see the note in ScrollShowcase.
          pin: ".arrival__stage",
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          // Second pinned scene on the page, so it refreshes after the
          // corridor above it, which is 1.
          refreshPriority: 0,
          // Every scatter distance below is a fraction of the viewport, so
          // they have to be re-measured when the viewport changes.
          invalidateOnRefresh: true,
        },
      });

      /* --------------------------------------------------------- the clip --
       * Linear, and finished before the timeline is: the tail of the scene is
       * him already arrived, holding, while the name settles and the scene
       * hands over.
       */
      tl.fromTo(".arrival__inner", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, 0);

      if (mode === "scrub") {
        tl.to(
          seek,
          {
            t: () => videoRef.current?.duration || CLIP_SECONDS,
            duration: 3.2,
            ease: "none",
            onUpdate: () => {
              wanted.current = seek.t;
            },
          },
          0,
        );
      }

      /* --------------------------------------------------------- the name --
       * The block sweeps in from his empty side while the letters are still
       * converging inside it, so the gesture is one move rather than a slide
       * followed by an assembly.
       */
      tl.fromTo(
        ".arrival__name",
        { xPercent: -22, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 1.9, ease: "power3.out" },
        0.95,
      )
        /*
         * Blur belongs to the line, not the letter. Eleven animated filters is
         * eleven separate blur passes a frame; one per line is two, and across
         * letters that are still scattered it reads the same.
         */
        .fromTo(
          ".arrival__line",
          { filter: "blur(18px)" },
          { filter: "blur(0px)", duration: 1.5, ease: "power2.out", stagger: 0.12 },
          1.0,
        )
        .fromTo(
          ".arrival__line--first .arrival-char",
          {
            x: (i: number) => SCATTER_FIRST[i].dx * window.innerWidth,
            y: (i: number) => SCATTER_FIRST[i].dy * window.innerHeight,
            rotate: (i: number) => SCATTER_FIRST[i].rotate,
            rotateY: (i: number) => SCATTER_FIRST[i].rotateY,
            scale: (i: number) => SCATTER_FIRST[i].scale,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            rotateY: 0,
            scale: 1,
            opacity: 1,
            duration: 1.55,
            ease: "expo.out",
            stagger: { each: 0.055, from: "start" },
          },
          1.05,
        )
        /* JAMES answers from underneath and closes in the opposite direction,
           so the two lines meet in the middle rather than sweeping in parallel. */
        .fromTo(
          ".arrival__line--last .arrival-char",
          {
            x: (i: number) => SCATTER_LAST[i].dx * window.innerWidth,
            y: (i: number) => SCATTER_LAST[i].dy * window.innerHeight,
            rotate: (i: number) => SCATTER_LAST[i].rotate,
            rotateY: (i: number) => SCATTER_LAST[i].rotateY,
            scale: (i: number) => SCATTER_LAST[i].scale,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            rotateY: 0,
            scale: 1,
            opacity: 1,
            duration: 1.55,
            ease: "expo.out",
            stagger: { each: 0.055, from: "end" },
          },
          1.32,
        )
        /* --------------------------------------------------- the pre-heads --
         * The eyebrow leads the lockup in by a beat, its rules drawing out
         * from the text; the role line and the blurb answer underneath once
         * the last letter has landed, so the block builds top to bottom
         * around the name rather than arriving with it.
         */
        .fromTo(
          ".arrival__eyebrow",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
          0.75,
        )
        .fromTo(
          ".arrival__rule",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "power3.out", stagger: 0.08 },
          0.85,
        )
        .fromTo(
          [".arrival__kicker", ".arrival__blurb"],
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.14 },
          2.5,
        )

        /* A specular sweep across the finished lockup, timed to the last
           letter landing. */
        .fromTo(
          ".arrival__sheen",
          { xPercent: -140, opacity: 0 },
          { xPercent: 140, opacity: 1, duration: 1.5, ease: "power2.inOut" },
          2.35,
        )
        .to(".arrival__sheen", { opacity: 0, duration: 0.35 }, 3.5)

        /* ------------------------------------------------------- the hold --
         * He is arrived, the name is set. Half a beat to read it, and no more:
         * every unit here is scroll the viewer spends on a still frame.
         */
        .addLabel("landed", 3.05)
        .to({}, { duration: 0.55 }, "landed")

        /* -------------------------------------------------------- handover --
         * The scene leaves under its own power before the pin releases, so
         * nothing is caught mid-composition by the unpin.
         */
        .addLabel("out", "landed+=0.6")
        .to(".arrival__name", { yPercent: -14, opacity: 0, duration: 0.75, ease: "power2.in" }, "out")
        .to(
          [".arrival__eyebrow", ".arrival__kicker", ".arrival__blurb"],
          { y: -22, opacity: 0, duration: 0.75, ease: "power2.in" },
          "out",
        )
        .to(".arrival__video", { scale: 1.14, duration: 1.05, ease: "power2.in" }, "out")
        /*
         * Eased, not linear, and finished a beat before the timeline ends.
         * The portfolio is fully painted underneath by now, so a linear fade
         * spends its whole length with two compositions equally visible;
         * `power2.in` holds the scene and then gets out of the way. Ending
         * early matters too — a scrubbed playhead lags the wheel, and a pin
         * released on a scene still half visible is a visible slide.
         */
        .to(".arrival__inner", { opacity: 0, duration: 0.55, ease: "power2.in" }, "out+=0.35");

      /* Touch: the clip is played once, on arrival, and left on its last
         frame. The name still rides the scroll. */
      if (mode === "play" && video) {
        ScrollTrigger.create({
          trigger: stage,
          start: "top 75%",
          once: true,
          onEnter: () => void video.play().catch(() => {}),
        });
      }

      return () => teardown.forEach((fn) => fn());
    },
    { scope: root, dependencies: [mode] },
  );

  return (
    <section ref={root} className="arrival" aria-labelledby="arrival-title">
      <div className="arrival__stage">
        <div className="arrival__inner">
          {mode === "still" ? (
            <img className="arrival__video" src={POSTER_END} alt="" aria-hidden="true" />
          ) : (
            <video
              ref={videoRef}
              className="arrival__video"
              poster={POSTER_START}
              muted
              playsInline
              /* Raised to "auto", with a source, once the page has loaded. */
              preload="none"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              aria-hidden="true"
            />
          )}

          <div className="arrival__scrim" aria-hidden="true" />

          {/*
            The wrapper places the lockup and the heading animates inside it.
            They cannot be the same node: GSAP folds an element's CSS
            `translate` into the transform it writes, so an `xPercent` sweep
            silently drops the `-50%` that was centring it.

            The visible name is per-letter and hidden from assistive tech; the
            accessible name comes from aria-label on the heading.
          */}
          <div className="arrival__nameblock">
            <p className="arrival__eyebrow">
              <span className="arrival__rule" aria-hidden="true" />
              {EYEBROW}
              <span className="arrival__rule" aria-hidden="true" />
            </p>

            <h2 id="arrival-title" className="arrival__name" aria-label="Joshua James">
              <Letters text={FIRST} className="arrival__line arrival__line--first" />
              <Letters text={LAST} className="arrival__line arrival__line--last" />
              <span className="arrival__sheen" aria-hidden="true" />
            </h2>

            <p className="arrival__kicker">{KICKER}</p>
            <p className="arrival__blurb">{BLURB}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArrivalScene;
