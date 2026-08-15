export type Reel = {
  /** Stable id, used for deep links (#/reel/<id>) and React keys. */
  id: string;
  title: string;
  /**
   * Vertical 9:16 cover frame. Currently a generated placeholder from
   * `scripts/gen-thumbs.mjs` — swap for a real frame export per reel.
   */
  poster: string;
  alt: string;
  /**
   * The video file itself (mp4/webm). Export the TikTok and host it yourself —
   * it plays in a plain frame with no third-party player or branding.
   */
  videoSrc?: string;
  client?: string;
  tags?: string[];
};

// PLACEHOLDER video files — swap these for your own exports.
const SAMPLE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/";
const [V1, V2, V3] = [
  `${SAMPLE}ForBiggerJoyrides.mp4`,
  `${SAMPLE}ForBiggerBlazes.mp4`,
  `${SAMPLE}ForBiggerEscapes.mp4`,
];

/**
 * Replace these with your own work. Everything downstream — hero corridor,
 * grid, lightbox — is driven off this one array.
 */
export const REELS: Reel[] = [
  {
    id: "sunset-diver",
    title: "Sunset Diver",
    poster: "/thumbs/sunset-diver.svg",
    alt: "Generated placeholder: a drunk polyline walk over a bruised violet field",
    videoSrc: V1,
    client: "Personal",
    tags: ["Edit", "Colour"],
  },
  {
    id: "hue-flow",
    title: "Hue Flow",
    poster: "/thumbs/hue-flow.svg",
    alt: "Generated placeholder: interfering line grids in cyan and magenta",
    videoSrc: V2,
    client: "Spec",
    tags: ["Motion"],
  },
  {
    id: "city-double",
    title: "City Double",
    poster: "/thumbs/city-double.svg",
    alt: "Generated placeholder: concentric wobbling rings around a magenta pupil",
    videoSrc: V3,
    client: "Personal",
    tags: ["Edit"],
  },
  {
    id: "crimson-aura",
    title: "Crimson Aura",
    poster: "/thumbs/crimson-aura.svg",
    alt: "Generated placeholder: concentric rings around a cyan pupil, crimson scanlines",
    videoSrc: V1,
    tags: ["Motion", "Sound"],
  },
  {
    id: "orange-motion",
    title: "Orange Motion",
    poster: "/thumbs/orange-motion.svg",
    alt: "Generated placeholder: a dense orange moire interference field",
    videoSrc: V2,
    client: "Brand",
    tags: ["Campaign"],
  },
  {
    id: "moon-grade",
    title: "Moon Grade",
    poster: "/thumbs/moon-grade.svg",
    alt: "Generated placeholder: a spidery random walk on near-black",
    videoSrc: V3,
    tags: ["Colour"],
  },
  {
    id: "racket-cloud",
    title: "Racket Cloud",
    poster: "/thumbs/racket-cloud.svg",
    alt: "Generated placeholder: melting horizontal bands in magenta and cyan",
    videoSrc: V1,
    client: "Spec",
    tags: ["VFX"],
  },
  {
    id: "hero-gradient",
    title: "Hero Gradient",
    poster: "/thumbs/hero-gradient.svg",
    alt: "Generated placeholder: amber rings around a teal pupil",
    videoSrc: V2,
    tags: ["Motion"],
  },
  {
    id: "bird-hand",
    title: "Bird Hand",
    poster: "/thumbs/bird-hand.svg",
    alt: "Generated placeholder: violet and amber rings around an orange pupil",
    videoSrc: V3,
    client: "Brand",
    tags: ["Edit", "VFX"],
  },
  {
    id: "hue-flow-two",
    title: "Hue Flow II",
    poster: "/thumbs/hue-flow-two.svg",
    alt: "Generated placeholder: a rotating square tunnel in teal and amber",
    videoSrc: V1,
    tags: ["Motion"],
  },
  {
    id: "layered-hero",
    title: "Layered Hero",
    poster: "/thumbs/layered-hero.svg",
    alt: "Generated placeholder: a rotating square tunnel fanning off-centre",
    videoSrc: V2,
    tags: ["Colour"],
  },
  {
    id: "deep-moon",
    title: "Deep Moon",
    poster: "/thumbs/deep-moon.svg",
    alt: "Generated placeholder: a fine crosshatch moire with coral scanlines",
    videoSrc: V3,
    tags: ["Colour"],
  },
];
