# Joshua James — short-form video portfolio

A dark, full-bleed portfolio built around a mirrored 3D "image stream" hero:
TikTok covers fly outward from the vanishing point, and **every slide is a
button** — click one and it plays in a 9:16 lightbox.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4, with GSAP (ScrollTrigger) and
Lenis driving the scroll-linked scenes.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # static output in dist/
```

## Adding your own videos

Everything — hero corridor, work grid and player — is driven by one array in
`src/data/reels.ts`:

```ts
{
  id: "my-reel",                 // unique
  title: "My Reel",
  poster: "/posters/my-reel.jpg",// vertical 9:16 cover frame
  alt: "Description of the cover",
  tiktokUrl: "https://www.tiktok.com/@handle/video/7300000000000000000",
  // videoSrc: "/videos/my-reel.mp4",  // optional self-hosted file
  client: "Brand",
  tags: ["Edit", "Colour"],
}
```

- `tiktokUrl` is played through TikTok's official embed (`/embed/v2/<id>`) and
  also powers the "Open on TikTok" link.
- `videoSrc` takes priority when set, so you can serve an mp4 for a faster,
  chrome-free player and still link out to TikTok.
- Drop posters in `public/` and reference them as `/posters/....jpg`.

## The arrival scene

The section after the identity reveal (`src/components/ArrivalScene.tsx`) scrubs
a video with the scroll while JOSHUA and JAMES converge onto the frame from
scattered starting positions — the clip is under the wheel, not playing on its
own.

Its assets live in `public/videos` and `public/images`:

| File | Used for |
| --- | --- |
| `identity-arrival.mp4` | the desktop scrub (H.264, **every frame a keyframe**) |
| `identity-arrival.webm` | same clip for browsers without H.264 |
| `identity-arrival-lite.mp4` / `.webm` | touch devices, where the clip plays through instead |
| `identity-arrival-first.jpg` | poster, the clip's first frame |
| `identity-arrival-poster.jpg` | the still shown under `prefers-reduced-motion` |

To swap the footage, re-encode from your own source the same way. The
all-intra flags are the part that matters — a normal encode seeks by decoding
everything since the last keyframe, which stutters under a scrub:

```bash
# desktop scrub copy — starts 2s into the source
ffmpeg -ss 2.0 -i source.mp4 -an -vf "scale=1280:-2:flags=lanczos" \
  -c:v libx264 -crf 23 -g 1 -bf 0 -preset slow -pix_fmt yuv420p \
  -movflags +faststart public/videos/identity-arrival.mp4

# touch copy — played, not scrubbed, so a normal GOP is fine
ffmpeg -ss 2.0 -i source.mp4 -an -vf "scale=854:-2:flags=lanczos" \
  -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p \
  -movflags +faststart public/videos/identity-arrival-lite.mp4
```

Posters are single frames of the same clip (`-frames:v 1` at the start and end
timestamps). The scene reads the clip's real duration at runtime, so a
different length needs no code change.

## Notes

- The hero pauses while the pointer is over it (or a slide has keyboard focus),
  so slides are easy to hit.
- Slides are real `<button>`s: tab-navigable, with visible focus rings.
- The lightbox supports `←` / `→` to move between reels and `Esc` to close.
- `prefers-reduced-motion` freezes the stream instead of animating it.
