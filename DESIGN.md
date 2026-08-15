# Joshua James Portfolio — Design System

## 1. Atmosphere & Identity

A darkened screening room. The work is the only lit thing in it — no chrome, no
decoration, nothing competing for attention with the frames themselves. The
signature is **the mirrored corridor**: covers stream outward from a vanishing
point in perfect left/right symmetry, growing as they approach and leaving by
the edge of the frame rather than fading away. It reads as depth you move
through, not a carousel you scroll. Everything else on the page is deliberately
quiet so the corridor carries the personality alone.

This is a **dark-only** product. There is no light theme and no `prefers-color-scheme`
branch — the corridor depends on near-black to read, and a light variant would
break the depth illusion.

## 2. Color

Single dark palette. No light column, by design (see above).

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Surface/primary | `--color-ink` | `#050505` | Page background, corridor void |
| Surface/secondary | `--color-ink-soft` | `#0b0b0d` | Cards, panels, lightbox chrome |
| Surface/elevated | `--color-ink-lift` | `#141418` | Hover surfaces, controls |
| Text/primary | `--color-chalk` | `#f4f4f5` | Headlines, body |
| Text/secondary | `--color-mute` | `#8a8a93` | Captions, metadata |
| Text/tertiary | `--color-mute-deep` | `#55555e` | Disabled, footer fine print |
| Border/default | `--color-edge` | `rgba(255,255,255,0.12)` | Dividers, card rims |
| Border/subtle | `--color-edge-soft` | `rgba(255,255,255,0.06)` | Soft separations |
| Accent/primary | `--color-chalk` | `#f4f4f5` | CTAs, focus rings, play affordance |

### Rules

- **White is the accent.** There is no hue accent and one must not be introduced
  — the reel covers supply all the colour on the page, and any UI hue would
  compete with them. This is the single most load-bearing colour decision here.
- Depth comes from tonal shift and scale, never from coloured glows.
- Never introduce a colour outside this table. Extend the table first.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | `clamp(2.75rem, 7.5vw, 6rem)` | 600 | 0.95 | -0.035em | Hero headline only |
| H1 | `clamp(1.75rem, 3vw, 2.5rem)` | 550 | 1.15 | -0.02em | Section headers |
| H2 | 1.5rem | 550 | 1.25 | -0.015em | Subsections |
| H3 | 1.125rem | 550 | 1.4 | -0.01em | Card titles |
| Body/lg | 1.125rem | 400 | 1.65 | 0 | About copy |
| Body | 1rem | 400 | 1.6 | 0 | Default |
| Body/sm | 0.875rem | 400 | 1.5 | 0 | Nav, captions |
| Caption | 0.75rem | 500 | 1.4 | 0.02em | Metadata, tags |
| Overline | 0.6875rem | 600 | 1.3 | 0.09em | Section labels, uppercase |

### Font Stack

- Primary: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- No second family. One family, weight and scale carry all hierarchy.

### Rules

- Display tracking is negative and aggressive (-0.035em); at hero size, default
  tracking reads loose and amateurish.
- Body text never below 14px.
- Headlines use `clamp()` and `text-wrap: balance`, never fixed breakpoint jumps.

## 4. Spacing & Layout

Base unit **4px**. Tokens follow Tailwind's default scale (`space-1` = 4px …
`space-24` = 96px); no custom spacing tokens are defined because none were needed.

### Grid

- Max content width: **1152px** (`max-w-6xl`) for the work grid; **768px**
  (`max-w-3xl`) for prose sections.
- Page gutters: 24px mobile, 40px ≥640px.
- Breakpoints: sm 640, md 768, lg 1024, xl 1280.
- The hero is full-bleed `100svh` and ignores the content grid entirely.

### Rules

- No magic numbers in layout. The corridor's geometry constants are the one
  documented exception — they are physical parameters, not spacing, and live
  annotated at the top of `ImageStreamHero.tsx`.

## 5. Components

### ImageStreamHero

The signature component. A mirrored perspective corridor of reel covers.

- **Structure**: `root(perspective) > stage(preserve-3d) > button[](panel) > img`,
  with an overlay layer for copy passed as `children`.
- **Geometry**: panels are authored at 280×498 (9:16). Scale is exponential in
  progress `u`: `s = S_MIN · e^(ln(S_MAX/S_MIN)·u)`, `S_MIN 0.02 → S_MAX 1.5`.
  Lateral offset is `lane · spread · (s − S_MIN)`, where `spread` is solved per
  frame so a retiring panel clears the viewport edge — panels exit the frame,
  they never fade out mid-screen.
- **Mirror**: both wings carry the *same* reel at the same slot, and the left
  wing's image is `scaleX(-1)`. That symmetry is the identity of the piece; do
  not desynchronise the wings.
- **Variants**: none. One hero, one configuration.
- **States**: default (drifting), hovered (drift pauses, play affordance and
  title fade in), focused (drift pauses, visible white focus ring),
  reduced-motion (drift frozen at its current phase, fully interactive).
- **Accessibility**: every panel is a real `<button>` with
  `aria-label="Play {title}"`; tab order follows DOM order; panels smaller than
  `u > 0.35` are `pointer-events: none` so tiny specks near the vanishing point
  cannot be clicked. The mirrored duplicate is `aria-hidden` to avoid announcing
  every reel twice.
- **Motion**: continuous drift at 0.028 traversals/sec. Entrance is a 1.6s
  `power3.out` scale-and-fade on the stage, with the headline lines rising on a
  0.09s stagger.

### ReelGrid

- **Structure**: responsive grid of 9:16 poster buttons.
- **States**: default, hover (poster lifts, title reveals), focus ring, empty.
- **Motion**: 200ms ease-out on hover transform.

### ReelLightbox

- **Structure**: fixed overlay > backdrop > 9:16 player frame > controls.
- **States**: open, closed, loading.
- **Accessibility**: focus trap, `Esc` closes, `←`/`→` step between reels,
  backdrop click closes.
- **Motion**: 300ms ease-in-out fade + scale on open.

### TubesCursor

- **States**: pointer-fine only — disabled entirely under
  `@media (hover: hover) and (pointer: fine)` and under reduced-motion.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 100–150ms | ease-out | Hover tint, tag chips |
| Standard | 200–300ms | ease-in-out | Lightbox open, overlay fades |
| Emphasis | 1.1–1.6s | `power3.out` | Hero entrance, headline reveal |
| Ambient | continuous | linear | Corridor drift |

### Rules

- Only `transform` and `opacity` are animated. Never layout properties.
- The corridor is driven by a **single `requestAnimationFrame` loop writing
  transforms directly** — not by GSAP tweens per panel. One scalar (`progress`)
  derives all 24 panel transforms, which is why it holds 60fps. GSAP owns the
  entrance choreography only.
- `will-change: transform, opacity` is set on panels, which are permanently in
  motion; it is *not* set on one-shot elements.
- Reduced motion freezes the drift and skips the entrance. It never removes the
  corridor or degrades it to a flat grid — the layout is identical, just static.

## 7. Depth & Surface

**Strategy: mixed — scale-depth plus shadow.**

The corridor's depth is carried by scale, perspective rotation, and an opacity
ramp (`0.6 → 1.0` across the first 30% of travel) against near-black. Panels
additionally carry a single cast shadow to separate them where they overlap.

| Level | Value | Usage |
|-------|-------|-------|
| Panel | `0 30px 80px -20px rgba(0,0,0,0.9)` | Corridor panels, grid posters |
| Elevated | `0 8px 24px rgba(0,0,0,0.6)` | Lightbox frame, controls |

### Rules

- **No edge vignette.** Outer panels stay at full brightness right up to the
  frame edge — darkening them was the single biggest thing making earlier
  versions read as flat. Only a small centre scrim (behind the vanishing point)
  and thin top/bottom scrims for header and footer legibility are permitted.
- Panel corners are near-sharp (2px). Large radii soften the corridor into a
  carousel and cost it its architectural quality.
- A 2–4% film grain overlay sits above everything at `mix-blend-mode: overlay`
  to kill gradient banding in the near-black background.
