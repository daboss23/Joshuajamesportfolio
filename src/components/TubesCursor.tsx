import { useEffect, useRef } from "react";

type TubesApp = {
  dispose?: () => void;
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
};

const randomColors = (count: number) =>
  Array.from(
    { length: count },
    () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  );

/**
 * Full-page tubes that trail the cursor, painted behind all content. Click
 * anywhere to re-roll the palette.
 */
export function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<TubesApp | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Initialise after first paint: the library reads the canvas size on start,
    // and a zero-sized canvas makes its geometry NaN.
    const timer = setTimeout(() => {
      // Typed as a bare dynamic import so TypeScript does not try to resolve
      // the CDN URL; Vite leaves it alone thanks to @vite-ignore.
      const load = new Function(
        "return import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')"
      ) as () => Promise<{ default: (canvas: HTMLCanvasElement, opts: unknown) => TubesApp }>;

      load()
        .then(({ default: TubesCursorLib }) => {
          if (!canvasRef.current) return;
          appRef.current = TubesCursorLib(canvasRef.current, {
            tubes: {
              colors: ["#5e72e4", "#8965e0", "#f5365c"],
              lights: {
                intensity: 200,
                colors: ["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"],
              },
            },
          });
        })
        .catch((err) => console.error("Tubes cursor failed to load:", err));
    }, 100);

    // Never calls preventDefault, so slide and grid clicks still open the player.
    const onClick = () => {
      appRef.current?.tubes.setColors(randomColors(3));
      appRef.current?.tubes.setLightsColors(randomColors(4));
    };
    window.addEventListener("click", onClick);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", onClick);
      appRef.current?.dispose?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />;
}
