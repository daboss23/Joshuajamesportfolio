import { useEffect, useRef } from "react";

const PALETTES = [
  ["#21d4fd", "#b721ff", "#f5365c"],
  ["#00ffc8", "#ff00ff", "#ffe600"],
  ["#ff6a00", "#ff0066", "#7b2ff7"],
  ["#00e0ff", "#4cc9f0", "#f72585"],
  ["#c0ff3e", "#00ffd0", "#8338ec"],
];

/** Points in the chain. Longer trails cost more per frame to stroke. */
const CHAIN = 34;

/**
 * Neon tubes that trail the cursor, painted behind all content. Click anywhere
 * to re-roll the palette.
 *
 * Three ribbons follow one spring-loaded chain of points, each offset along the
 * segment normal by its own travelling sine, which is what separates them into
 * distinct tubes instead of one thick smear. Drawn on a plain 2D canvas — no
 * WebGL and no third-party module, so there is nothing to fail to load.
 */
export function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Start the chain collapsed at the centre so it unfurls from one point.
    const pts = Array.from({ length: CHAIN }, () => ({ x: width / 2, y: height / 2 }));
    const pointer = { x: width / 2, y: height / 2 };
    let palette = PALETTES[0];
    let phase = 0;
    let idle = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      idle = 0;
    };

    // Never calls preventDefault, so slide and lightbox clicks still land.
    const onClick = () => {
      let next = palette;
      while (next === palette) next = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      palette = next;
    };

    let frame = 0;
    const tick = () => {
      phase += 0.05;
      idle += 1;

      // With the pointer parked, drift the head on a slow lissajous so the
      // tubes keep breathing instead of freezing into a static squiggle.
      if (idle > 90) {
        pointer.x = width / 2 + Math.cos(phase * 0.23) * width * 0.3;
        pointer.y = height / 2 + Math.sin(phase * 0.31) * height * 0.26;
      }

      pts[0].x += (pointer.x - pts[0].x) * 0.18;
      pts[0].y += (pointer.y - pts[0].y) * 0.18;
      for (let i = 1; i < CHAIN; i++) {
        // Followers ease less the further down the chain they sit, which is
        // what gives the tail its lag and whip.
        const k = 0.34 - (i / CHAIN) * 0.16;
        pts[i].x += (pts[i - 1].x - pts[i].x) * k;
        pts[i].y += (pts[i - 1].y - pts[i].y) * k;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      palette.forEach((color, tube) => {
        ctx.strokeStyle = color;
        ctx.shadowColor = color;

        for (let i = 1; i < CHAIN; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          // Unit normal to the segment — the axis the ribbons separate along.
          const nx = -dy / len;
          const ny = dx / len;

          const wave = Math.sin(phase - i * 0.32 + (tube * Math.PI * 2) / 3);
          const spread = wave * (12 + i * 0.9);
          const taper = 1 - i / CHAIN;

          ctx.beginPath();
          ctx.moveTo(a.x + nx * spread, a.y + ny * spread);
          ctx.lineTo(b.x + nx * spread, b.y + ny * spread);
          ctx.lineWidth = 1 + taper * 9;
          ctx.globalAlpha = 0.1 + taper * 0.55;
          ctx.shadowBlur = 14 * taper;
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Screen blend over the page rather than behind it: the trails are additive
  // light, so they glow across the grid and the frames without hiding either.
  // Sits under the header (z-40) and the lightbox (z-50).
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30 mix-blend-screen"
    />
  );
}
