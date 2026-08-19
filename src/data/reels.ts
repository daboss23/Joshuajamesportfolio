export type Reel = {
  /** Stable id, used for deep links (#/reel/<id>) and React keys. */
  id: string;
  title: string;
  /** Vertical 9:16 cover frame. */
  poster: string;
  alt: string;
  /**
   * The video file itself (mp4/webm). Export the TikTok and host it yourself —
   * it plays in a plain frame with no third-party player or branding.
   *
   * Until a reel has one, the lightbox shows a "no video set" placeholder
   * instead of playing sample footage.
   */
  videoSrc?: string;
  client?: string;
  tags?: string[];
};

const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";

/**
 * TEMPORARY COVERS — these gradients are stand-ins, not frames from the reels.
 * Replace each `poster` with a real 9:16 cover exported from its video.
 */
const COVER = {
  hueFlow1: `${CDN}/gradients/hue-flow/hue-flow-01.png`,
  hueFlow2: `${CDN}/gradients/hue-flow/hue-flow-02.png`,
  crimson: `${CDN}/gradients/crimson_aura/crimson-aura-02.png`,
  moon3: `${CDN}/gradients/moon/moon-grade-03.png`,
  moon5: `${CDN}/gradients/moon/moon-grade-05.png`,
  hero1: `${CDN}/gradients/hero_gradient/hero-gradients-01.png`,
  hero3: `${CDN}/gradients/hero_gradient/hero-gradients-03.png`,
};

/**
 * The ten reels selected for the portfolio.
 *
 * `videoSrc` is intentionally unset: the source files live in the Google Drive
 * folder "TikTok Video/marketing Content" and still need to be hosted somewhere
 * the site can stream from. Fill in each `videoSrc` once hosting is decided.
 *
 * Source file in Drive, in this order:
 *   1. Updated Cerebroflex Tok Video.mp4        (128 MB)
 *   2. Cosmic Clean 9000 Ad.mp4                 ( 92 MB)
 *   3. "Enclothed Cognition" (2) (1).mp4        ( 60 MB)
 *   4. "Spirituality Vid.mp4                    ( 89 MB)
 *   5. AProject369 Vid.mp4                      (119 MB)
 *   6. Warrior Within!.mp4                      (232 MB)
 *   7. New Ivanna Tok Content.mp4               ( 88 MB)
 *   8. WW TiTok Content Video.mp4               (120 MB)
 *   9. iwon Organics Viral Tiktok Video.mp4     (139 MB)
 *  10. a newe boss warrior vid.mp4              (173 MB)
 */
export const REELS: Reel[] = [
  {
    id: "cerebroflex",
    title: "Cerebroflex",
    poster: COVER.hero1,
    alt: "Cover frame for the Cerebroflex short-form ad",
    tags: ["Ad", "Edit"],
  },
  {
    id: "cosmic-clean-9000",
    title: "Cosmic Clean 9000",
    poster: COVER.hueFlow1,
    alt: "Cover frame for the Cosmic Clean 9000 ad",
    tags: ["Ad", "Edit"],
  },
  {
    id: "enclothed-cognition",
    title: "Enclothed Cognition",
    poster: COVER.moon3,
    alt: "Cover frame for the Enclothed Cognition reel",
    tags: ["Content"],
  },
  {
    id: "spirituality",
    title: "Spirituality",
    poster: COVER.crimson,
    alt: "Cover frame for the Spirituality reel",
    tags: ["Content"],
  },
  {
    id: "project369",
    title: "Project369",
    poster: COVER.hero3,
    alt: "Cover frame for the Project369 reel",
    tags: ["Ad", "Edit"],
  },
  {
    id: "warrior-within",
    title: "Warrior Within",
    poster: COVER.moon5,
    alt: "Cover frame for the Warrior Within reel",
    tags: ["Content", "Edit"],
  },
  {
    id: "ivanna",
    title: "Ivanna",
    poster: COVER.hueFlow2,
    alt: "Cover frame for the Ivanna TikTok content piece",
    tags: ["Content"],
  },
  {
    id: "ww-tiktok",
    title: "WW",
    poster: COVER.hero1,
    alt: "Cover frame for the WW TikTok content piece",
    tags: ["Content"],
  },
  {
    id: "iwon-organics",
    title: "iwon Organics",
    poster: COVER.hueFlow1,
    alt: "Cover frame for the iwon Organics viral TikTok video",
    tags: ["Ad", "Viral"],
  },
  {
    id: "boss-warrior",
    title: "Boss Warrior",
    poster: COVER.moon3,
    alt: "Cover frame for the Boss Warrior reel",
    tags: ["Content", "Edit"],
  },
];
