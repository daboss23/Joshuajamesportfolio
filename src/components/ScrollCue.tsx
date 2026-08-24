type ScrollCueProps = {
  label?: string;
  className?: string;
};

export function ScrollCue({
  label = "Click play on any video - or scroll to enter",
  className = "",
}: ScrollCueProps) {
  return (
    <div className={`flex flex-col items-center gap-5 ${className}`}>
      <p
        className="px-6 text-[0.6rem] uppercase leading-relaxed text-white/80 [text-shadow:0_2px_20px_rgba(0,0,0,0.95)] sm:text-xs"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.42em" }}
      >
        {label}
      </p>

      <div className="relative flex h-14 w-4 flex-col items-center">
        <span
          className="cue-beam absolute top-0 h-9 w-px origin-top bg-gradient-to-b from-transparent via-white/50 to-beam"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="cue-chevron absolute bottom-0 h-4 w-4 text-beam"
        >
          <path d="M5 8l7 8 7-8" />
        </svg>
      </div>
    </div>
  );
}
