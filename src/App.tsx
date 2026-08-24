import { useCallback, useEffect, useState } from "react";
import { initSmoothScroll } from "./lib/smooth-scroll";
import { CursorHint } from "./components/CursorHint";
import { ScrollProgress } from "./components/ScrollProgress";
import { ReelLightbox } from "./components/ReelLightbox";
import { ScrollShowcase } from "./components/ScrollShowcase";
import { PortfolioSections } from "./components/PortfolioSections";
import { ArrivalScene } from "./components/ArrivalScene";
import { ScrollCue } from "./components/ScrollCue";
import TubesCursor from "./components/ui/tubes-cursor";
import { REELS, type Reel } from "./data/reels";

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => initSmoothScroll(), []);

  const open = useCallback((reel: Reel) => {
    setActiveIndex(REELS.findIndex((r) => r.id === reel.id));
  }, []);

  const step = useCallback((delta: number) => {
    setActiveIndex((i) => (i === null ? i : (i + delta + REELS.length) % REELS.length));
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <TubesCursor />
      <ScrollProgress />

      <header className="site-header fixed inset-x-0 top-0 z-[80] flex items-center justify-between px-6 py-5 sm:px-10">
        <a href="#top" className="site-logo text-sm font-semibold tracking-tight text-white">
          Joshua James <span>Motion &amp; edit</span>
        </a>
        <nav className="header-nav flex items-center gap-6 text-sm text-white/80">
          <a href="#selected-work" className="hover:text-white">Work</a>
          <a href="#services" className="hover:text-white">Services</a>
          <a href="#about" className="hover:text-white">About</a>
          <a href="#contact" className="header-cta">Let’s talk <span>↗</span></a>
        </nav>
      </header>

      {/* Above the cursor trail's layer, so no section can be painted over. */}
      <main id="top" className="relative z-[1]">
        <ScrollShowcase reels={REELS} onSelect={open}>
          <div className="showcase__copy pointer-events-none relative z-10 flex h-full flex-col items-center justify-between py-24 text-center sm:py-28">
            <div className="px-6">
              <h1 className="text-balance text-4xl font-medium tracking-tight text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.95)] sm:text-6xl">
                Short-form video,
                <br />
                front and centre.
              </h1>
            </div>
            <div className="flex flex-col items-center gap-3 px-6">
              <ScrollCue />
              <CursorHint />
            </div>
          </div>
        </ScrollShowcase>

        <ArrivalScene />

        <PortfolioSections />
      </main>

      <ReelLightbox
        reel={activeIndex === null ? null : REELS[activeIndex]}
        onClose={() => setActiveIndex(null)}
        onStep={step}
      />
    </div>
  );
}
