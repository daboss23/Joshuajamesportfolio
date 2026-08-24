import { useEffect, useMemo, useRef, type CSSProperties } from "react";

type SpringTransition = {
  stiffness?: number;
  damping?: number;
};

export type StarsBackgroundProps = {
  /** Pixels per second the star field drifts upward. */
  speed?: number;
  /** How far the field parallaxes with the pointer, as a fraction of cursor travel. */
  factor?: number;
  starColor?: string;
  transition?: SpringTransition;
  className?: string;
  style?: CSSProperties;
};

const TILE = 256;

/** Renders a seamless, tileable star field and returns it as a data URL. */
function makeStarTile(color: string, count: number, maxRadius: number, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = TILE;
  canvas.height = TILE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Small deterministic PRNG so every remount paints the same sky.
  let state = seed;
  const rand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = rand() * TILE;
    const y = rand() * TILE;
    const r = 0.35 + rand() * maxRadius;
    ctx.globalAlpha = 0.35 + rand() * 0.65;
    // Draw each star four times so stars near an edge wrap cleanly.
    for (const dx of [0, x < maxRadius * 2 ? TILE : -TILE]) {
      for (const dy of [0, y < maxRadius * 2 ? TILE : -TILE]) {
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return canvas.toDataURL();
}

const LAYERS = [
  { count: 6, maxRadius: 0.5, depth: 0.4, seed: 7 },
  { count: 4, maxRadius: 0.9, depth: 0.7, seed: 91 },
  { count: 2, maxRadius: 1.3, depth: 1, seed: 5381 },
];

export function StarsBackground({
  speed = 50,
  factor = 0.05,
  starColor = "#c6f8ff",
  transition,
  className = "",
  style,
}: StarsBackgroundProps) {
  const stiffness = transition?.stiffness ?? 30;
  const damping = transition?.damping ?? 20;

  const hostRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tiles = useMemo(
    () =>
      typeof document === "undefined"
        ? LAYERS.map(() => "")
        : LAYERS.map((l) => makeStarTile(starColor, l.count, l.maxRadius, l.seed)),
    [starColor],
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let drift = 0;
    let last = performance.now();
    let frame = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = hostRef.current?.getBoundingClientRect();
      if (!rect) return;
      target.x = (e.clientX - rect.left - rect.width / 2) * factor;
      target.y = (e.clientY - rect.top - rect.height / 2) * factor;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      // Critically-ish damped spring toward the pointer offset.
      for (const axis of ["x", "y"] as const) {
        const a = stiffness * (target[axis] - pos[axis]) - damping * vel[axis];
        vel[axis] += a * dt;
        pos[axis] += vel[axis] * dt;
      }
      drift = (drift + speed * dt) % TILE;

      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (!el) return;
        const x = -pos.x * layer.depth;
        const y = -pos.y * layer.depth - drift * layer.depth;
        el.style.backgroundPosition = `${x}px ${y}px`;
      });

      frame = requestAnimationFrame(tick);
    };

    if (!reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      frame = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, [speed, factor, stiffness, damping]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={style}
    >
      {LAYERS.map((layer, i) => (
        <div
          key={layer.seed}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: tiles[i] ? `url(${tiles[i]})` : undefined,
            backgroundRepeat: "repeat",
            backgroundSize: `${TILE}px ${TILE}px`,
          }}
        />
      ))}
    </div>
  );
}
