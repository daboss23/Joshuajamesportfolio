/**
 * Shared timing vocabulary for every scroll-driven scene on the page.
 *
 * The site's motion is choreographed rather than tweened ad hoc: each element
 * owns a *window* on its section's 0→1 scroll progress and plays its whole
 * entrance inside that window. Declaring the windows as data (see `CUE` in the
 * identity scene) rather than burying `progress * 0.4 + 0.1` arithmetic in the
 * frame loop is what makes the order of the reveal readable and adjustable —
 * "the portrait lands, then the name" is a pair of numbers, not a puzzle.
 */

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/** Hermite ease-in-out over [edge0, edge1], flat outside it. */
export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

/**
 * Quintic smootherstep: like `smoothstep` but with zero second derivative at
 * both ends too. Used for anything that moves a large element a long way —
 * the portrait, the pinned corridor — because smoothstep's non-zero curvature
 * at the edges is just visible as a tick at the start and end of a big travel.
 */
export const smootherstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/** Decelerating ease, for entrances that should arrive rather than glide in. */
export const easeOutExpo = (x: number) =>
  x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x));

/** A timing window on a section's 0→1 progress. */
export type Cue = readonly [start: number, end: number];

/** How far through its own window `progress` is, eased. */
export const cue = (window: Cue, progress: number) =>
  smoothstep(window[0], window[1], progress);

/**
 * A cue that plays in and then back out again: 0 before `enter`, 1 across the
 * hold, 0 after `leave`. Everything that lives on a pinned stage needs one, so
 * that the stage can dissolve instead of being clipped away when it unpins.
 */
export const cueInOut = (enter: Cue, leave: Cue, progress: number) =>
  Math.min(cue(enter, progress), 1 - cue(leave, progress));

/** Linear blend, so callers can read "from → to" instead of doing the algebra. */
export const mix = (from: number, to: number, t: number) => from + (to - from) * t;
