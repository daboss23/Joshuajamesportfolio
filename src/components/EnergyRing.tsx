/**
 * The purple ring behind the portrait, and the energy it throws off.
 *
 * Four layers, drawn back to front, each doing one job so they can be lit
 * independently as the scene ignites:
 *
 *   halo      a soft bloom that seats the ring in the artwork rather than
 *             leaving it pasted on top of it
 *   waves     concentric rings that expand out of the halo and dissolve —
 *             the "something is radiating from here" cue
 *   spectrum  a radial equaliser: bars stood on the ring's circumference,
 *             each oscillating on its own phase, which is what reads as
 *             *frequency* rather than as a generic glow
 *   sparks    embers thrown outward along the radius, so the energy leaves
 *             the ring instead of staying trapped in it
 *
 * Everything is CSS animation on transform and opacity only, so the whole
 * thing composites and costs nothing on the main thread while the page is
 * being scrubbed. Intensity is driven from the scene's scroll progress
 * through the `--energy` custom property (see the identity scene), so the
 * ring wakes up as the portrait lands rather than running at full strength
 * from the first frame.
 */

const BARS = 72;
const WAVES = 4;
const SPARKS = 18;

export function EnergyRing() {
  return (
    <div className="energy-ring" aria-hidden="true">
      <div className="energy-halo" />

      <div className="energy-waves">
        {Array.from({ length: WAVES }, (_, i) => (
          <span key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      <div className="energy-spectrum">
        {Array.from({ length: BARS }, (_, i) => (
          <span
            key={i}
            style={{
              "--angle": `${(i / BARS) * 360}deg`,
              /*
               * Three interleaved periods rather than one. A single sine
               * swept around the ring gives a rotating bulge that reads as a
               * spinning object; summing periods that do not share a factor
               * keeps neighbouring bars related — so it still looks like one
               * signal — without the pattern ever repeating on a lap.
               */
              "--phase": `${-(
                Math.sin(i * 0.7) * 0.42 +
                Math.sin(i * 0.23 + 1.1) * 0.34 +
                Math.sin(i * 1.9) * 0.24
              ).toFixed(3)}s`,
              "--reach": (
                0.55 +
                0.45 * Math.abs(Math.sin(i * 0.41 + 0.6))
              ).toFixed(3),
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="energy-sparks">
        {Array.from({ length: SPARKS }, (_, i) => (
          <span
            key={i}
            style={{
              "--angle": `${(i / SPARKS) * 360 + (i % 3) * 7}deg`,
              "--delay": `${-(i * 0.37).toFixed(2)}s`,
              "--duration": `${(3.4 + (i % 5) * 0.62).toFixed(2)}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

export default EnergyRing;
