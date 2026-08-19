import { useState } from "react";
import type { Reel } from "../data/reels";

/** A Drive cover that falls back to local artwork if the thumbnail fails. */
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
