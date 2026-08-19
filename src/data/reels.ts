export type Reel = {
  /** Stable id, used for deep links and React keys. */
  id: string;
  title: string;
  /** Vertical 9:16 cover frame. */
  poster: string;
  alt: string;
  /** A self-hosted mp4/webm takes priority when supplied. */
  videoSrc?: string;
  /** Public Google Drive file used until a self-hosted export is available. */
  driveId?: string;
  /** Local cover used if Drive cannot return a generated thumbnail. */
  posterFallback?: string;
  client?: string;
  tags?: string[];
};

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
} as const;

const cover = (driveId: string) =>
  `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;

/** The ten selected reels, displayed in the requested order. */
export const REELS: Reel[] = [
  {
    id: "updated-cerebroflex",
    title: "Updated Cerebroflex",
    poster: cover(DRIVE.cerebroflex),
    posterFallback: "/thumbs/hero-gradient.svg",
    alt: "Cover frame from Updated Cerebroflex",
    driveId: DRIVE.cerebroflex,
    client: "Cerebroflex",
    tags: ["TikTok", "Social"],
  },
  {
    id: "cosmic-clean-9000",
    title: "Cosmic Clean 9000",
    poster: cover(DRIVE.cosmicClean9000),
    posterFallback: "/thumbs/hue-flow.svg",
    alt: "Cover frame from Cosmic Clean 9000",
    driveId: DRIVE.cosmicClean9000,
    client: "Cosmic Clean 9000",
    tags: ["Video Ad", "Social"],
  },
  {
    id: "enclothed-cognition",
    title: "Enclothed Cognition",
    poster: cover(DRIVE.enclothedCognition),
    posterFallback: "/thumbs/moon-grade.svg",
    alt: "Cover frame from Enclothed Cognition",
    driveId: DRIVE.enclothedCognition,
    tags: ["Edit", "Storytelling"],
  },
  {
    id: "spirituality",
    title: "Spirituality",
    poster: cover(DRIVE.spirituality),
    posterFallback: "/thumbs/crimson-aura.svg",
    alt: "Cover frame from Spirituality",
    driveId: DRIVE.spirituality,
    tags: ["Edit", "Storytelling"],
  },
  {
    id: "project-369",
    title: "Project 369",
    poster: cover(DRIVE.project369),
    posterFallback: "/thumbs/layered-hero.svg",
    alt: "Cover frame from Project 369",
    driveId: DRIVE.project369,
    client: "Project 369",
    tags: ["Social", "Campaign"],
  },
  {
    id: "warrior-within",
    title: "Warrior Within",
    poster: cover(DRIVE.warriorWithin),
    posterFallback: "/thumbs/deep-moon.svg",
    alt: "Cover frame from Warrior Within",
    driveId: DRIVE.warriorWithin,
    client: "Warrior Within",
    tags: ["Brand Film", "Edit"],
  },
  {
    id: "ivanna-tok",
    title: "New Ivanna Tok Content",
    poster: cover(DRIVE.ivanna),
    posterFallback: "/thumbs/hue-flow-two.svg",
    alt: "Cover frame from New Ivanna Tok Content",
    driveId: DRIVE.ivanna,
    client: "Ivanna",
    tags: ["TikTok", "Social"],
  },
  {
    id: "ww-tiktok",
    title: "WW TikTok Content Video",
    poster: cover(DRIVE.wwTiktok),
    posterFallback: "/thumbs/sunset-diver.svg",
    alt: "Cover frame from WW TikTok Content Video",
    driveId: DRIVE.wwTiktok,
    client: "Warrior Within",
    tags: ["TikTok", "Social"],
  },
  {
    id: "iwon-organics",
    title: "iwon Organics Viral TikTok Video",
    poster: cover(DRIVE.iwonOrganics),
    posterFallback: "/thumbs/orange-motion.svg",
    alt: "Cover frame from iwon Organics Viral TikTok Video",
    driveId: DRIVE.iwonOrganics,
    client: "iwon Organics",
    tags: ["TikTok", "Viral"],
  },
  {
    id: "boss-warrior",
    title: "Boss Warrior",
    poster: cover(DRIVE.bossWarrior),
    posterFallback: "/thumbs/racket-cloud.svg",
    alt: "Cover frame from Boss Warrior",
    driveId: DRIVE.bossWarrior,
    client: "Warrior Within",
    tags: ["Brand Film", "Edit"],
  },
];
