import { useState } from "react";
import type { Reel } from "../data/reels";

/**
 * Cover frame for a reel.
 *
 * Covers come from Drive, which serves nothing for a file that has lost its
 * thumbnail or hit a quota. Rather than leave a broken image in the grid, fall
 * back to the reel's gradient once and stay there.
 */
export function ReelPoster({
  reel,
  className,
  loading = "lazy",
}: {
  reel: Reel;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [src, setSrc] = useState(reel.poster);

  return (
    <img
      src={src}
      alt={reel.alt}
      loading={loading}
      // Every cover sits inside a button; dragging one off is never wanted.
      draggable={false}
      onError={() => {
        if (reel.posterFallback && src !== reel.posterFallback) {
          setSrc(reel.posterFallback);
        }
      }}
      className={className}
    />
  );
}
