import type { Reel } from "../data/reels";
import { SlotFrame } from "./SlotFrame";

export function ReelGrid({
  reels,
  onSelect,
}: {
  reels: Reel[];
  onSelect: (reel: Reel) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {reels.map((reel, i) => (
        <button
          key={reel.id}
          type="button"
          onClick={() => onSelect(reel)}
          aria-label={`Play ${reel.title}`}
          className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {reel.poster ? (
            <img
              src={reel.poster}
              alt={reel.alt ?? ""}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
              <SlotFrame index={i} />
            </div>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-3 text-left">
            <span className="block truncate text-sm font-medium text-chalk">{reel.title}</span>
            {reel.tags && (
              <span className="block truncate text-[11px] text-mute">{reel.tags.join(" · ")}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
