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
  client?: string;
  tags?: string[];
};

const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";
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
    poster: `${CDN}/stock-images/767d99bb371a54d0d36751e8cecae43c.jpg`,
    alt: "Diver silhouetted inside a sunset seascape shaped like a profile",
    videoSrc: V1,
    client: "Personal",
    tags: ["Edit", "Colour"],
  },
  {
    id: "hue-flow",
    title: "Hue Flow",
    poster: `${CDN}/gradients/hue-flow/hue-flow-01.png`,
    alt: "Flowing hue gradient",
    videoSrc: V2,
    client: "Spec",
    tags: ["Motion"],
  },
  {
    id: "city-double",
    title: "City Double",
    poster: `${CDN}/stock-images/821d815affa6496c39cbdeeec7a84603.jpg`,
    alt: "Double-exposure portrait blended with a city skyline at dusk",
    videoSrc: V3,
    client: "Personal",
    tags: ["Edit"],
  },
  {
    id: "crimson-aura",
    title: "Crimson Aura",
    poster: `${CDN}/gradients/crimson_aura/crimson-aura-02.png`,
    alt: "Crimson aura gradient",
    videoSrc: V1,
    tags: ["Motion", "Sound"],
  },
  {
    id: "orange-motion",
    title: "Orange Motion",
    poster: `${CDN}/stock-images/937438c560ada1c83317f2c11b3454b0.jpg`,
    alt: "Motion-blurred side-profile portrait against a deep orange backdrop",
    videoSrc: V2,
    client: "Brand",
    tags: ["Campaign"],
  },
  {
    id: "moon-grade",
    title: "Moon Grade",
    poster: `${CDN}/gradients/moon/moon-grade-03.png`,
    alt: "Moon-toned gradient",
    videoSrc: V3,
    tags: ["Colour"],
  },
  {
    id: "racket-cloud",
    title: "Racket Cloud",
    poster: `${CDN}/stock-images/98f89cb9994f5c382ab964062c4039db.jpg`,
    alt: "Figure holding a racket that dissolves into a swirling colourful cloud",
    videoSrc: V1,
    client: "Spec",
    tags: ["VFX"],
  },
  {
    id: "hero-gradient",
    title: "Hero Gradient",
    poster: `${CDN}/gradients/hero_gradient/hero-gradients-01.png`,
    alt: "Soft multi-tone gradient wash",
    videoSrc: V2,
    tags: ["Motion"],
  },
  {
    id: "bird-hand",
    title: "Bird Hand",
    poster: `${CDN}/stock-images/ddcbee38be8b7274e19e132d7ab35b53.jpg`,
    alt: "Hand gesture with a colourful cutout of a bird flying through the fingers",
    videoSrc: V3,
    client: "Brand",
    tags: ["Edit", "VFX"],
  },
  {
    id: "hue-flow-two",
    title: "Hue Flow II",
    poster: `${CDN}/gradients/hue-flow/hue-flow-02.png`,
    alt: "Second flowing hue gradient",
    videoSrc: V1,
    tags: ["Motion"],
  },
  {
    id: "layered-hero",
    title: "Layered Hero",
    poster: `${CDN}/gradients/hero_gradient/hero-gradients-03.png`,
    alt: "Layered hero gradient",
    videoSrc: V2,
    tags: ["Colour"],
  },
  {
    id: "deep-moon",
    title: "Deep Moon",
    poster: `${CDN}/gradients/moon/moon-grade-05.png`,
    alt: "Deep moon-toned gradient",
    videoSrc: V3,
    tags: ["Colour"],
  },
];
