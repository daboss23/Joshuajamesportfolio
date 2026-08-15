/**
 * An empty 9:16 frame, shown wherever a reel has no `poster` yet.
 *
 * Deliberately self-contained: no network request, no external asset, nothing
 * to go missing. The corridor has to read as architecture even before a single
 * video is added, so each frame carries a faint tonal wash rather than being a
 * flat grey rectangle — twelve identical fills would collapse the depth that
 * the scale and rotation work so hard to build.
 *
 * Palette stays neutral on purpose. Per DESIGN.md §2 the reel covers are the
 * only source of hue on the page; a coloured placeholder would set the wrong
 * expectation for what the finished corridor looks like.
 */
export function SlotFrame({ index, label }: { index: number; label?: string }) {
  // Two slowly-rotating neutral washes keyed off the slot, so neighbouring
  // frames separate without any of them reading as "coloured".
  const angle = 145 + ((index * 37) % 70);
  // Sits well clear of the ~2% background: an empty frame still has to hold its
  // silhouette against the void, or the corridor reads as a black rectangle.
  const lift = 12 + ((index * 13) % 11);

  return (
    <div
      className="relative grid h-full w-full place-items-center overflow-hidden rounded-sm"
      style={{
        background: `linear-gradient(${angle}deg, hsl(240 6% ${lift + 5}%) 0%, hsl(240 7% ${Math.max(4, lift - 3)}%) 100%)`,
      }}
    >
      {/* Corner ticks — a framing crop mark, so an empty slot still looks
          intentional rather than unstyled. */}
      <svg
        className="absolute inset-0 h-full w-full text-white/15"
        viewBox="0 0 90 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
          <path d="M6 16V6h10M74 6h10v10M84 144v10H74M16 154H6v-10" />
        </g>
      </svg>

      <div className="pointer-events-none flex flex-col items-center gap-1 text-center">
        <span className="text-[0.6875rem] font-semibold tracking-[0.09em] text-white/40">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[0.625rem] font-medium tracking-[0.06em] text-white/25">9:16</span>
        {label && (
          <span className="mt-1 max-w-[80%] truncate text-[0.625rem] text-white/20">{label}</span>
        )}
      </div>
    </div>
  );
}
