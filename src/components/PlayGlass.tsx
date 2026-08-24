/**
 * The play affordance, as a piece of glass rather than a picture of one.
 *
 * Built from CSS so it is genuinely translucent: a flat PNG can only be
 * *painted* semi-transparent, while this refracts whatever cover it happens to
 * be sitting on — which is the whole point of the treatment on artwork that is
 * different behind every button.
 */
export function PlayGlass({ className = "" }: { className?: string }) {
  return (
    <span className={`play-glass ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" focusable="false">
        <path
          d="M9.2 6.6a1 1 0 0 1 1.52-.85l7 5.4a1 1 0 0 1 0 1.7l-7 5.4a1 1 0 0 1-1.52-.85V6.6Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
