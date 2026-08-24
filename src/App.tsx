import { useCallback, useState } from "react";
import { ImageStreamHero } from "./components/ImageStreamHero";
import { ReelGrid } from "./components/ReelGrid";
import { ReelLightbox } from "./components/ReelLightbox";
import { TubesCursor } from "./components/TubesCursor";
import { StarsBackground } from "./components/ui/stars";
import { REELS, type Reel } from "./data/reels";

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = useCallback((reel: Reel) => {
    setActiveIndex(REELS.findIndex((r) => r.id === reel.id));
  }, []);

  const step = useCallback((delta: number) => {
    setActiveIndex((i) => (i === null ? i : (i + delta + REELS.length) % REELS.length));
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <TubesCursor />

      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-24 overflow-hidden bg-ink sm:h-28">
        <StarsBackground
          speed={50}
          factor={0.05}
          starColor="#c6f8ff"
          transition={{ stiffness: 30, damping: 20 }}
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference sm:px-10">
        <a href="#top" className="text-sm font-semibold tracking-tight text-white">
          Joshua James
        </a>
        <nav className="flex items-center gap-6 text-sm text-white/80">
          <a href="#work" className="hover:text-white">Work</a>
          <a href="#about" className="hover:text-white">About</a>
          <a href="#contact" className="hover:text-white">Contact</a>
        </nav>
      </header>

      <main id="top" className="relative z-[1]">
        <ImageStreamHero
          reels={REELS}
          onSelect={open}
          className="h-[100svh] w-full"
        >
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-between py-24 text-center sm:py-28">
            <div className="px-6">
              <h1 className="text-balance text-4xl font-medium tracking-tight text-white sm:text-6xl">
                Short-form video,
                <br />
                front and centre.
              </h1>
            </div>
            <p className="max-w-md text-balance px-6 text-sm text-white/60">
              Tap any frame to play it — or scroll down for the full shelf.
            </p>
          </div>
        </ImageStreamHero>

        <section id="work" className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">Selected work</h2>
            <p className="hidden text-sm text-mute sm:block">{REELS.length} reels</p>
          </div>
          <ReelGrid reels={REELS} onSelect={open} />
        </section>

        <section id="about" className="mx-auto max-w-3xl px-6 py-24 sm:px-10">
          <h2 className="mb-6 text-2xl font-medium tracking-tight sm:text-3xl">About</h2>
          <p className="text-lg leading-relaxed text-mute">
            I make short-form video that earns the second watch — hooks, pacing,
            colour and sound design for brands that live on TikTok, Reels and
            Shorts. Editing, motion and grade handled end to end.
          </p>
        </section>

        <section id="contact" className="mx-auto max-w-3xl px-6 pb-32 sm:px-10">
          <h2 className="mb-6 text-2xl font-medium tracking-tight sm:text-3xl">Contact</h2>
          <a
            href="mailto:mindblastmarketing@gmail.com"
            className="inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-85"
          >
            mindblastmarketing@gmail.com
          </a>
        </section>
      </main>

      <footer className="relative z-[1] border-t border-white/10 px-6 py-8 text-center text-xs text-mute sm:px-10">
        © {new Date().getFullYear()} Joshua James
      </footer>

      <ReelLightbox
        reel={activeIndex === null ? null : REELS[activeIndex]}
        onClose={() => setActiveIndex(null)}
        onStep={step}
      />
    </div>
  );
}
