# Joshua James — short-form video portfolio

A dark, full-bleed portfolio built around a mirrored 3D "image stream" hero:
TikTok covers fly outward from the vanishing point, and **every slide is a
button** — click one and it plays in a 9:16 lightbox.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4. No runtime dependencies beyond React.

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
  id: "my-reel",                  // unique; also the deep link, #/reel/my-reel
  title: "My Reel",
  poster: "/posters/my-reel.jpg", // vertical 9:16 cover frame
  posterFallback: FALLBACK.moon3, // used only if the cover fails to load
  alt: "Description of the cover",
  videoSrc: "/videos/my-reel.mp4",// self-hosted file
  driveId: "1AbC…",               // or stream from Drive
  client: "Brand",
  tags: ["Edit", "Colour"],
}
```

The player picks the first of these it finds:

1. `videoSrc` — a self-hosted mp4/webm, played in a plain frame with no
   third-party chrome. Best experience; needs the file to exist.
2. `driveId` — streamed from Drive's own player. Nothing to host, but it
   carries Google's chrome, will not autoplay, and Drive throttles files that
   get a lot of views. The file has to be shared publicly.
3. Neither — the lightbox says so rather than playing something unrelated.

Covers work the same way: `poster` first, `posterFallback` if it fails to load.
Self-hosted posters go in `public/posters/` and are referenced as
`/posters/….jpg`.

## Importing the videos

The reels in `src/data/reels.ts` are the ten selected pieces, but their
`videoSrc` fields are empty until the source files are pulled out of Drive and
transcoded. `scripts/import-reels.mjs` does that in one pass — download,
downscale to a 1080-long-edge mp4, extract a cover frame, delete the original:

```bash
npm install --no-save ffmpeg-static ffprobe-static
node scripts/import-reels.mjs              # all ten
node scripts/import-reels.mjs spirituality # or just some
```

Outputs go to `public/videos/<id>.mp4` and `public/posters/<id>.jpg`, matching
each reel's `id`. A run summary is written to `scripts/import-manifest.json`,
including which clips are landscape — the 9:16 player crops those, so they may
want a different treatment.

The script needs outbound access to `drive.usercontent.google.com`. Sessions
whose egress policy blocks Drive will fail at the download step; run it from an
environment with network access, or fetch the files by hand into `/tmp/reel-import`
as `<id>.src.mp4` and re-run — existing downloads are reused.

Once the files exist, point each reel at them:

```ts
videoSrc: "/videos/spirituality.mp4",
poster: "/posters/spirituality.jpg",
```


## Notes

- The hero pauses while the pointer is over it (or a slide has keyboard focus),
  so slides are easy to hit.
- Slides are real `<button>`s: tab-navigable, with visible focus rings.
- The lightbox supports `←` / `→` to move between reels and `Esc` to close.
- `prefers-reduced-motion` freezes the stream instead of animating it.
