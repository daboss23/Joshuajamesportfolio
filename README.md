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

## Notes

- The hero pauses while the pointer is over it (or a slide has keyboard focus),
  so slides are easy to hit.
- Slides are real `<button>`s: tab-navigable, with visible focus rings.
- The lightbox supports `←` / `→` to move between reels and `Esc` to close.
- `prefers-reduced-motion` freezes the stream instead of animating it.
