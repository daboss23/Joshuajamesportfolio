export type Reel = {
  /** Stable id, used for deep links (#/reel/<id>) and React keys. */
  id: string;
  title: string;
  /** Vertical 9:16 cover frame. */
  poster: string;
  alt: string;
  /**
   * Public TikTok URL, e.g. https://www.tiktok.com/@handle/video/7300000000000000000
   * Used for the embedded player and the "open on TikTok" link.
   */
  tiktokUrl?: string;
  /**
   * Self-hosted fallback (mp4/webm). Takes priority over `tiktokUrl` so you can
   * ship a fast native player and still link out to TikTok.
   */
  videoSrc?: string;
  client?: string;
  tags?: string[];
};

const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";

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
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    client: "Personal",
    tags: ["Edit", "Colour"],
  },
  {
    id: "hue-flow",
    title: "Hue Flow",
    poster: `${CDN}/gradients/hue-flow/hue-flow-01.png`,
    alt: "Flowing hue gradient",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    client: "Spec",
    tags: ["Motion"],
  },
  {
    id: "city-double",
    title: "City Double",
    poster: `${CDN}/stock-images/821d815affa6496c39cbdeeec7a84603.jpg`,
    alt: "Double-exposure portrait blended with a city skyline at dusk",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    client: "Personal",
    tags: ["Edit"],
  },
  {
    id: "crimson-aura",
    title: "Crimson Aura",
    poster: `${CDN}/gradients/crimson_aura/crimson-aura-02.png`,
    alt: "Crimson aura gradient",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    tags: ["Motion", "Sound"],
  },
  {
    id: "orange-motion",
    title: "Orange Motion",
    poster: `${CDN}/stock-images/937438c560ada1c83317f2c11b3454b0.jpg`,
    alt: "Motion-blurred side-profile portrait against a deep orange backdrop",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    client: "Brand",
    tags: ["Campaign"],
  },
  {
    id: "moon-grade",
    title: "Moon Grade",
    poster: `${CDN}/gradients/moon/moon-grade-03.png`,
    alt: "Moon-toned gradient",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    tags: ["Colour"],
  },
  {
    id: "racket-cloud",
    title: "Racket Cloud",
    poster: `${CDN}/stock-images/98f89cb9994f5c382ab964062c4039db.jpg`,
    alt: "Figure holding a racket that dissolves into a swirling colourful cloud",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    client: "Spec",
    tags: ["VFX"],
  },
  {
    id: "hero-gradient",
    title: "Hero Gradient",
    poster: `${CDN}/gradients/hero_gradient/hero-gradients-01.png`,
    alt: "Soft multi-tone gradient wash",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    tags: ["Motion"],
  },
  {
    id: "bird-hand",
    title: "Bird Hand",
    poster: `${CDN}/stock-images/ddcbee38be8b7274e19e132d7ab35b53.jpg`,
    alt: "Hand gesture with a colourful cutout of a bird flying through the fingers",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    client: "Brand",
    tags: ["Edit", "VFX"],
  },
  {
    id: "hue-flow-two",
    title: "Hue Flow II",
    poster: `${CDN}/gradients/hue-flow/hue-flow-02.png`,
    alt: "Second flowing hue gradient",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    tags: ["Motion"],
  },
  {
    id: "layered-hero",
    title: "Layered Hero",
    poster: `${CDN}/gradients/hero_gradient/hero-gradients-03.png`,
    alt: "Layered hero gradient",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    tags: ["Colour"],
  },
  {
    id: "deep-moon",
    title: "Deep Moon",
    poster: `${CDN}/gradients/moon/moon-grade-05.png`,
    alt: "Deep moon-toned gradient",
    tiktokUrl: "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    tags: ["Colour"],
  },
];
