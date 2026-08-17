import { useEffect, useRef } from "react";
import type { Reel } from "../data/reels";

type Props = {
  reel: Reel | null;
  onClose: () => void;
  onStep: (delta: number) => void;
};

export function ReelLightbox({ reel, onClose, onStep }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!reel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [reel, onClose, onStep]);

  if (!reel) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={reel.title}
      // Above the cursor trail and every piece of fixed chrome: a player that
      // has rainbow tubes crawling across it is not a player.
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[380px] flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
          {reel.videoSrc ? (
            <video
              key={reel.id}
              src={reel.videoSrc}
              poster={reel.poster}
              controls
              autoPlay
              playsInline
              loop
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-mute">
              No video file set for “{reel.title}”. Add a <code>videoSrc</code> in{" "}
              <code>src/data/reels.ts</code>.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-chalk">{reel.title}</p>
            {reel.client && <p className="text-xs text-mute">{reel.client}</p>}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <NavButton label="Previous reel" onClick={() => onStep(-1)}>
            ←
          </NavButton>
          <NavButton label="Next reel" onClick={() => onStep(1)}>
            →
          </NavButton>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-2 right-0 grid h-10 w-10 -translate-y-full place-items-center rounded-full bg-white/10 text-lg text-chalk transition-colors hover:bg-white/20"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-chalk transition-colors hover:bg-white/10"
    >
      {children}
    </button>
  );
}
