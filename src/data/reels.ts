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
  /**
   * Google Drive file id, used to stream the reel straight from Drive when no
   * self-hosted `videoSrc` exists yet. `videoSrc` always wins when both are set.
   */
  driveId?: string;
  /** Shown if the Drive-generated cover frame fails to load. */
  posterFallback?: string;
  client?: string;
  tags?: string[];
};

const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";

const DRIVE = {
  cerebroflex: "1aukdeAF3Y6ppnunhICdtd2ksqi179Q-s",
  cosmicClean9000: "1jopum_f0cbbBadcZV9n6rw9R91nUiy-q",
  enclothedCognition: "1cFY6VcYW3BJwunxZX24yHIUQLK4_LJQH",
  spirituality: "1Yeou9hWmIonxugJzRet3IzDznQaB6TBe",
  project369: "1VfEQNMITdLQnBJn6hwXgwSKSfltVdxBy",
  warriorWithin: "1PsJQ1gf2vs4epdTLAY4KWGJGarjgCwzd",
  ivanna: "1cM3JPpeFIH2EaU42SvbqEtPE78EwHvw6",
  wwTiktok: "1Z4k248fCjrxMqSt0Nqt16GmaL9yV1Vgg",
  iwonOrganics: "1tIhH_27V2rx_AwJ5UYZepq_l177gD2Te",
  bossWarrior: "1Nd3RvC2GMwSko4M6k4CaIborqZTZUUmj",
};

/** Fallback covers, used only when a Drive thumbnail fails to load. */
const FALLBACK = {
  hueFlow1: `${CDN}/gradients/hue-flow/hue-flow-01.png`,
  hueFlow2: `${CDN}/gradients/hue-flow/hue-flow-02.png`,
  crimson: `${CDN}/gradients/crimson_aura/crimson-aura-02.png`,
  moon3: `${CDN}/gradients/moon/moon-grade-03.png`,
  moon5: `${CDN}/gradients/moon/moon-grade-05.png`,
  hero1: `${CDN}/gradients/hero_gradient/hero-gradients-01.png`,
  hero3: `${CDN}/gradients/hero_gradient/hero-gradients-03.png`,
};

/** Drive's own cover frame for a file. Public files only. */
const cover = (driveId: string) =>
  `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;

/**
 * The ten reels selected for the portfolio.
 *
 * Playback currently streams from Drive via `driveId`, and covers are the
 * Drive-generated frames for each file. That keeps the site live without
 * hosting 1.24 GB anywhere, at the cost of Google's player chrome and Drive's
 * throttling on heavily-viewed files.
 *
 * To move to self-hosted files, run `scripts/import-reels.mjs` and set
 * `videoSrc`/`poster` per reel — `videoSrc` takes priority over `driveId`.
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
    poster: cover(DRIVE.cerebroflex),
    posterFallback: FALLBACK.hero1,
    alt: "Cover frame for the Cerebroflex short-form ad",
    driveId: DRIVE.cerebroflex,
    tags: ["Ad", "Edit"],
  },
  {
    id: "cosmic-clean-9000",
    title: "Cosmic Clean 9000",
    poster: cover(DRIVE.cosmicClean9000),
    posterFallback: FALLBACK.hueFlow1,
    alt: "Cover frame for the Cosmic Clean 9000 ad",
    driveId: DRIVE.cosmicClean9000,
    tags: ["Ad", "Edit"],
  },
  {
    id: "enclothed-cognition",
    title: "Enclothed Cognition",
    poster: cover(DRIVE.enclothedCognition),
    posterFallback: FALLBACK.moon3,
    alt: "Cover frame for the Enclothed Cognition reel",
    driveId: DRIVE.enclothedCognition,
    tags: ["Content"],
  },
  {
    id: "spirituality",
    title: "Spirituality",
    poster: cover(DRIVE.spirituality),
    posterFallback: FALLBACK.crimson,
    alt: "Cover frame for the Spirituality reel",
    driveId: DRIVE.spirituality,
    tags: ["Content"],
  },
  {
    id: "project369",
    title: "Project369",
    poster: cover(DRIVE.project369),
    posterFallback: FALLBACK.hero3,
    alt: "Cover frame for the Project369 reel",
    driveId: DRIVE.project369,
    tags: ["Ad", "Edit"],
  },
  {
    id: "warrior-within",
    title: "Warrior Within",
    poster: cover(DRIVE.warriorWithin),
    posterFallback: FALLBACK.moon5,
    alt: "Cover frame for the Warrior Within reel",
    driveId: DRIVE.warriorWithin,
    tags: ["Content", "Edit"],
  },
  {
    id: "ivanna",
    title: "Ivanna",
    poster: cover(DRIVE.ivanna),
    posterFallback: FALLBACK.hueFlow2,
    alt: "Cover frame for the Ivanna TikTok content piece",
    driveId: DRIVE.ivanna,
    tags: ["Content"],
  },
  {
    id: "ww-tiktok",
    title: "WW",
    poster: cover(DRIVE.wwTiktok),
    posterFallback: FALLBACK.hero1,
    alt: "Cover frame for the WW TikTok content piece",
    driveId: DRIVE.wwTiktok,
    tags: ["Content"],
  },
  {
    id: "iwon-organics",
    title: "iwon Organics",
    poster: cover(DRIVE.iwonOrganics),
    posterFallback: FALLBACK.hueFlow1,
    alt: "Cover frame for the iwon Organics viral TikTok video",
    driveId: DRIVE.iwonOrganics,
    tags: ["Ad", "Viral"],
  },
  {
    id: "boss-warrior",
    title: "Boss Warrior",
    poster: cover(DRIVE.bossWarrior),
    posterFallback: FALLBACK.moon3,
    alt: "Cover frame for the Boss Warrior reel",
    driveId: DRIVE.bossWarrior,
    tags: ["Content", "Edit"],
  },
];
