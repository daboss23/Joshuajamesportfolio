export type Reel = {
  /** Stable id, used for React keys. Any unique string is fine. */
  id: string;
  /** Shown in the lightbox and on hover. */
  title: string;
  /**
   * Your video file, 9:16. Drop the export in `public/videos/` and reference
   * it as "/videos/my-reel.mp4", or paste any absolute URL.
   * Leave it out and the frame stays empty but still clickable.
   */
  videoSrc?: string;
  /**
   * Cover frame, 9:16. Drop it in `public/posters/` and reference it as
   * "/posters/my-reel.jpg". Leave it out and an empty placeholder frame is
   * drawn instead — the corridor still works with no posters at all.
   */
  poster?: string;
  /** Describe the cover for screen readers. Only needed once `poster` is set. */
  alt?: string;
  client?: string;
  tags?: string[];
};

/**
 * Twelve empty 9:16 slots, ready for your work.
 *
 * Everything downstream — the hero corridor, the work grid and the player —
 * reads from this one array, so adding a video is a single edit here. A filled
 * entry looks like this:
 *
 *   {
 *     id: "hook-test",
 *     title: "Hook Test",
 *     videoSrc: "/videos/hook-test.mp4",
 *     poster: "/posters/hook-test.jpg",
 *     alt: "Opening frame of the hook test edit",
 *     client: "Brand",
 *     tags: ["Edit", "Colour"],
 *   }
 *
 * The corridor shows twelve slots at desktop width and fewer on narrow
 * screens, so keeping at least twelve entries here keeps it full.
 */
export const REELS: Reel[] = [
  { id: "slot-01", title: "Slot 01" },
  { id: "slot-02", title: "Slot 02" },
  { id: "slot-03", title: "Slot 03" },
  { id: "slot-04", title: "Slot 04" },
  { id: "slot-05", title: "Slot 05" },
  { id: "slot-06", title: "Slot 06" },
  { id: "slot-07", title: "Slot 07" },
  { id: "slot-08", title: "Slot 08" },
  { id: "slot-09", title: "Slot 09" },
  { id: "slot-10", title: "Slot 10" },
  { id: "slot-11", title: "Slot 11" },
  { id: "slot-12", title: "Slot 12" },
];
