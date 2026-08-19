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
   */
  videoSrc?: string;
  /** Google Drive (or another provider) preview URL used when the original is hosted externally. */
  embedSrc?: string;
  client?: string;
  tags?: string[];
};

const drivePoster = (id: string) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
const drivePreview = (id: string) =>
  `https://drive.google.com/file/d/${id}/preview`;

/**
 * Replace these with your own work. Everything downstream — hero corridor,
 * grid, lightbox — is driven off this one array.
 */
export const REELS: Reel[] = [
  {
    id: "updated-cerebroflex",
    title: "Updated Cerebroflex",
    poster: drivePoster("1aukdeAF3Y6ppnunhICdtd2ksqi179Q-s"),
    alt: "Cover frame from Updated Cerebroflex",
    embedSrc: drivePreview("1aukdeAF3Y6ppnunhICdtd2ksqi179Q-s"),
    client: "Cerebroflex",
    tags: ["TikTok", "Social"],
  },
  {
    id: "cosmic-clean-9000",
    title: "Cosmic Clean 9000",
    poster: drivePoster("1jopum_f0cbbBadcZV9n6rw9R91nUiy-q"),
    alt: "Cover frame from Cosmic Clean 9000",
    embedSrc: drivePreview("1jopum_f0cbbBadcZV9n6rw9R91nUiy-q"),
    client: "Cosmic Clean 9000",
    tags: ["Video Ad", "Social"],
  },
  {
    id: "enclothed-cognition",
    title: "Enclothed Cognition",
    poster: drivePoster("1cFY6VcYW3BJwunxZX24yHIUQLK4_LJQH"),
    alt: "Cover frame from Enclothed Cognition",
    embedSrc: drivePreview("1cFY6VcYW3BJwunxZX24yHIUQLK4_LJQH"),
    tags: ["Edit", "Storytelling"],
  },
  {
    id: "spirituality",
    title: "Spirituality",
    poster: drivePoster("1Yeou9hWmIonxugJzRet3IzDznQaB6TBe"),
    alt: "Cover frame from Spirituality",
    embedSrc: drivePreview("1Yeou9hWmIonxugJzRet3IzDznQaB6TBe"),
    tags: ["Edit", "Storytelling"],
  },
  {
    id: "project-369",
    title: "Project 369",
    poster: drivePoster("1VfEQNMITdLQnBJn6hwXgwSKSfltVdxBy"),
    alt: "Cover frame from Project 369",
    embedSrc: drivePreview("1VfEQNMITdLQnBJn6hwXgwSKSfltVdxBy"),
    client: "Project 369",
    tags: ["Social", "Campaign"],
  },
  {
    id: "warrior-within",
    title: "Warrior Within",
    poster: drivePoster("1PsJQ1gf2vs4epdTLAY4KWGJGarjgCwzd"),
    alt: "Cover frame from Warrior Within",
    embedSrc: drivePreview("1PsJQ1gf2vs4epdTLAY4KWGJGarjgCwzd"),
    client: "Warrior Within",
    tags: ["Brand Film", "Edit"],
  },
  {
    id: "ivanna-tok",
    title: "Ivanna Tok Content",
    poster: drivePoster("1cM3JPpeFIH2EaU42SvbqEtPE78EwHvw6"),
    alt: "Cover frame from Ivanna Tok Content",
    embedSrc: drivePreview("1cM3JPpeFIH2EaU42SvbqEtPE78EwHvw6"),
    client: "Ivanna",
    tags: ["TikTok", "Social"],
  },
  {
    id: "ww-tiktok",
    title: "WW TikTok Content",
    poster: drivePoster("1Z4k248fCjrxMqSt0Nqt16GmaL9yV1Vgg"),
    alt: "Cover frame from WW TikTok Content",
    embedSrc: drivePreview("1Z4k248fCjrxMqSt0Nqt16GmaL9yV1Vgg"),
    client: "Warrior Within",
    tags: ["TikTok", "Social"],
  },
  {
    id: "iwon-organics",
    title: "iwon Organics Viral TikTok",
    poster: drivePoster("1tIhH_27V2rx_AwJ5UYZepq_l177gD2Te"),
    alt: "Cover frame from iwon Organics Viral TikTok",
    embedSrc: drivePreview("1tIhH_27V2rx_AwJ5UYZepq_l177gD2Te"),
    client: "iwon Organics",
    tags: ["TikTok", "Viral"],
  },
  {
    id: "boss-warrior",
    title: "Boss Warrior",
    poster: drivePoster("1Nd3RvC2GMwSko4M6k4CaIborqZTZUUmj"),
    alt: "Cover frame from Boss Warrior",
    embedSrc: drivePreview("1Nd3RvC2GMwSko4M6k4CaIborqZTZUUmj"),
    client: "Warrior Within",
    tags: ["Brand Film", "Edit"],
  },
];
