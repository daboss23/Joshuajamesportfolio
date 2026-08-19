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
