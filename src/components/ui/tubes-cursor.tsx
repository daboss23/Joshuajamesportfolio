import { useEffect, useRef } from "react";

type TubesApp = {
  dispose?: () => void;
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
};

/** Random hex colours for the click-to-recolour handler. */
const randomColors = (count: number) =>
  new Array(count)
    .fill(0)
    .map(
      () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
    );

/**
 * Full-page tubes that trail the cursor, painted behind the page content.
 * Click anywhere to re-roll the palette.
 *
 * Only the canvas is rendered here — the demo's own hero copy and full-screen
 * wrapper are left out, since this mounts as a background layer under the real
 * page rather than as a standalone page of its own.
 */
export default function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<TubesApp | null>(null);

  useEffect(() => {
    // "Computed radius is NaN" comes from the library initialising before the
    // canvas has its final dimensions. The delay lets the DOM finish painting.
    const initTimer = setTimeout(() => {
      // Wrapped in `new Function` so TypeScript does not try to resolve the CDN
      // URL as a module, and Vite leaves the import in place at build time.
      const load = new Function(
        "return import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')",
      ) as () => Promise<{
        default: (canvas: HTMLCanvasElement, opts: unknown) => TubesApp;
      }>;

      load()
        .then((module) => {
          const TubesCursorLib = module.default;

          if (canvasRef.current) {
            appRef.current = TubesCursorLib(canvasRef.current, {
              tubes: {
                colors: ["#5e72e4", "#8965e0", "#f5365c"],
                lights: {
                  intensity: 200,
                  colors: ["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"],
                },
              },
            });
          }
        })
        .catch((err) => console.error("Failed to load TubesCursor module:", err));
    }, 100);

    // Listened for on the window rather than a wrapper element: the canvas sits
    // behind the page, so clicks land on the content above it. Nothing here
    // calls preventDefault, so reel clicks still open the player.
    const handleClick = () => {
      if (!appRef.current) return;
      appRef.current.tubes.setColors(randomColors(3));
      appRef.current.tubes.setLightsColors(randomColors(4));
    };
    window.addEventListener("click", handleClick);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener("click", handleClick);
      if (appRef.current && typeof appRef.current.dispose === "function") {
        appRef.current.dispose();
      }
    };
  }, []);

  /*
   * The canvas needs a viewport-sized parent to measure.
   *
   * The library sizes its renderer from the canvas's parent element and writes
   * the result back as an inline `width`/`height` on the canvas — which beats
   * the utility classes. Left as a direct child of the page wrapper it measures
   * the whole document, so the canvas ends up as tall as the page (five-plus
   * screens here) while only the top slice is ever on screen, and the tubes
   * shrink into a fraction of the viewport. Pinning the wrapper to the viewport
   * means the measurement is one screen, whatever the page height.
   */
  /*
   * `screen` blending is what lets one canvas serve the whole site. Painted
   * behind the page it was invisible the moment a section had a background of
   * its own; painted on top it would grey everything out, because the renderer
   * clears to black. Screen maps that black to a no-op and leaves only the
   * light, so the trail trails over the film, the hero and every panel below
   * without touching their colour.
   */
  return (
    <div className="tubes-cursor" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export { TubesCursor };
