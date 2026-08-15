import type { CSSProperties } from "react";

type Props = {
  /** Any CSS colour. Drives the lines, the horizon glow and the sky wash. */
  gridColor?: string;
  showScanlines?: boolean;
  glowEffect?: boolean;
  /** Seconds for one full sweep of the grid toward the viewer. Lower is faster. */
  speed?: number;
  className?: string;
};

/**
 * An infinite perspective grid receding to a horizon, with a CRT treatment.
 *
 * The floor is a repeating gradient on a plane laid flat by rotateX, scrolled
 * by animating its background position — so the motion is one compositor-driven
 * animation rather than anything per-frame in JS. A mirrored plane above the
 * horizon gives the ceiling.
 */
export default function RetroGrid({
  gridColor = "#ff00ff",
  showScanlines = true,
  glowEffect = true,
  speed = 3,
  className = "",
}: Props) {
  const style = {
    "--grid-color": gridColor,
    "--grid-speed": `${speed}s`,
  } as CSSProperties;

  return (
    <div
      className={`retro-grid ${glowEffect ? "retro-grid--glow" : ""} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div className="retro-grid__sky" />
      <div className="retro-grid__horizon" />
      <div className="retro-grid__floor">
        <div className="retro-grid__plane" />
      </div>
      {showScanlines && <div className="retro-grid__scanlines" />}
      <div className="retro-grid__vignette" />
    </div>
  );
}

export { RetroGrid };
