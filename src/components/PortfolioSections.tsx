import { useEffect, useRef, type FormEvent, type ReactNode } from "react";

const SERVICES = [
  ["01", "Short-form edits", "Scroll-stopping cuts shaped around the hook, the beat and the second watch."],
  ["02", "Motion design", "Graphic systems, kinetic type and transitions that feel made for your brand."],
  ["03", "Colour & finish", "A considered grade, sound pass and final polish across every deliverable."],
  ["04", "Social campaigns", "A flexible visual language built to stay coherent across an entire content run."],
  ["05", "Creative direction", "Concept, references and visual treatment before the first frame hits the timeline."],
  ["06", "Platform cutdowns", "Native versions for TikTok, Reels and Shorts — never an afterthought crop."],
] as const;

const PROJECTS = [
  { title: "Crimson Aura", kind: "Motion / Colour", image: "/thumbs/crimson-aura.svg", className: "project-card--wide" },
  { title: "Hue Flow", kind: "Campaign system", image: "/thumbs/hue-flow.svg", className: "" },
  { title: "City Double", kind: "Edit / VFX", image: "/thumbs/city-double.svg", className: "" },
  { title: "Deep Moon", kind: "Colour study", image: "/thumbs/deep-moon.svg", className: "project-card--wide" },
] as const;

const TOOLS = ["After Effects", "Premiere Pro", "DaVinci Resolve", "Blender", "Figma", "Photoshop"];

const PROCESS = [
  ["01", "Discover", "The audience, the ambition and the moment we need to earn."],
  ["02", "Shape", "References become a clear visual route and a tight edit plan."],
  ["03", "Build", "Edit, motion, grade and sound grow together — not in silos."],
  ["04", "Refine", "Precise feedback rounds tune every frame without sanding off the idea."],
  ["05", "Release", "Mastered, versioned and ready to land natively on every platform."],
] as const;

const TESTIMONIALS = [
  ["Joshua found the pace we had been trying to describe in the very first cut. The final campaign felt unmistakably ours.", "Maya Chen", "Brand Director"],
  ["An editor with taste, but also the rare ability to make the process calm. Every decision had a reason behind it.", "Theo Martin", "Creative Producer"],
  ["Our strongest performing reel this year — and the one people kept sending back to us. That says everything.", "Sasha Reid", "Social Lead"],
] as const;

function Icon({ children }: { children: ReactNode }) {
  return <span className="service-icon" aria-hidden="true">{children}</span>;
}

function SplitHeading({ eyebrow, children }: { eyebrow: string; children: string }) {
  return (
    <div className="section-heading reveal">
      <p className="section-kicker"><span />{eyebrow}<span /></p>
      <h2 aria-label={children}>
        {children.split(" ").map((word, index) => (
          <span className="word-mask" key={`${word}-${index}`}>
            <span style={{ transitionDelay: `${index * 55}ms` }}>{word}&nbsp;</span>
          </span>
        ))}
      </h2>
    </div>
  );
}

export function PortfolioSections() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.14, rootMargin: "0px 0px -5%" },
    );

    root.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, []);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Project enquiry — ${data.get("project") || "new project"}`);
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nProject: ${data.get("project")}\nBudget: ${data.get("budget")}\n\n${data.get("message")}`,
    );
    window.location.href = `mailto:mindblastmarketing@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div ref={rootRef} className="portfolio-shell">
      <div className="ambient-orb ambient-orb--one" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--two" aria-hidden="true" />

      <section id="about" className="portfolio-section about-block">
        <div className="about-copy reveal">
          <p className="section-kicker section-kicker--left"><span />Inside the edit</p>
          <h2 className="about-title">Cutting feeling<br />into <em>motion.</em></h2>
          <p className="body-copy">
            I’m Joshua — an editor and motion designer turning raw ideas into sharp,
            cinematic stories built for the feed. Strategy, rhythm, colour and sound,
            considered as one connected system.
          </p>
          <a className="text-link" href="#selected-work">Explore selected work <span>↗</span></a>
        </div>

        <div className="glass-panel about-visual reveal">
          <div className="about-frame">
            <img src="/thumbs/bird-hand.svg" alt="Abstract violet and amber motion artwork" loading="lazy" />
            <a className="play-orb" href="#work" aria-label="Return to the showreel">
              <span>▶</span>
            </a>
            <div className="visual-caption">
              <span>Showreel ’26</span><span>01:14</span>
            </div>
          </div>
        </div>

        <div className="stats-stack reveal" aria-label="Experience statistics">
          <div><strong>7+</strong><span>years shaping stories</span></div>
          <div><strong>150+</strong><span>projects shipped</span></div>
          <div><strong>12m+</strong><span>organic views</span></div>
          <div><strong>24</strong><span>repeat partners</span></div>
        </div>
      </section>

      <section id="services" className="portfolio-section">
        <SplitHeading eyebrow="What I do">Motion design services</SplitHeading>
        <div className="service-grid">
          {SERVICES.map(([number, title, copy], index) => (
            <article className="glass-panel service-card reveal" style={{ transitionDelay: `${index * 60}ms` }} key={title}>
              <div className="service-topline">
                <Icon>{number}</Icon><span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section id="selected-work" className="portfolio-section projects-section">
        <SplitHeading eyebrow="Featured work">Selected motion projects</SplitHeading>
        <div className="projects-grid">
          {PROJECTS.map((project, index) => (
            <a className={`project-card reveal ${project.className}`} href="#work" key={project.title} style={{ transitionDelay: `${index * 70}ms` }}>
              <img src={project.image} alt="" loading="lazy" />
              <div className="project-sheen" />
              <div className="project-number">0{index + 1}</div>
              <div className="project-meta">
                <p>{project.kind}</p><h3>{project.title}</h3>
              </div>
              <span className="project-open">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="portfolio-section tools-section" aria-label="Tools and skills">
        <p className="section-kicker reveal"><span />Tools &amp; skills<span /></p>
        <div className="glass-panel tools-marquee reveal">
          <div className="tools-track">
            {[...TOOLS, ...TOOLS].map((tool, index) => (
              <div className="tool-item" key={`${tool}-${index}`}>
                <span className="tool-glyph">{tool.slice(0, 2)}</span><span>{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="portfolio-section process-section">
        <SplitHeading eyebrow="My process">From idea to impact</SplitHeading>
        <div className="process-line reveal">
          {PROCESS.map(([number, title, copy]) => (
            <article className="process-step" key={title}>
              <div className="process-dot"><span>{number}</span></div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-section testimonial-section">
        <SplitHeading eyebrow="Testimonials">Kind words from clients</SplitHeading>
        <div className="testimonial-grid">
          {TESTIMONIALS.map(([quote, name, role], index) => (
            <figure className="glass-panel quote-card reveal" style={{ transitionDelay: `${index * 80}ms` }} key={name}>
              <span className="quote-mark">“</span>
              <blockquote>{quote}</blockquote>
              <figcaption>
                <span className="avatar">{name.split(" ").map((part) => part[0]).join("")}</span>
                <span><strong>{name}</strong><small>{role}</small></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <footer id="contact" className="portfolio-contact">
        <section className="contact-section reveal" aria-labelledby="contact-title">
          <div className="contact-copy">
            <p className="section-kicker section-kicker--left"><span />Let’s work together</p>
            <h2 id="contact-title">Have a project<br />in mind?</h2>
            <p>Let’s create something extraordinary. Tell me where you want to take it and I’ll bring the cut, movement and finish.</p>

            <div className="contact-details">
              <a href="mailto:mindblastmarketing@gmail.com"><span aria-hidden="true">✉</span><span><small>Email</small>mindblastmarketing@gmail.com</span></a>
              <div><span aria-hidden="true">⌖</span><span><small>Based in</small>Sydney, Australia — working worldwide</span></div>
            </div>

            <div className="contact-socials" aria-label="Social profiles">
              <a href="https://www.behance.net/" target="_blank" rel="noreferrer" aria-label="Behance">Be</a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">yt</a>
            </div>
          </div>

          <form className="contact-form" onSubmit={sendMessage}>
            <label><span>Your name</span><input name="name" required autoComplete="name" placeholder="Name" /></label>
            <label><span>Email address</span><input name="email" type="email" required autoComplete="email" placeholder="you@company.com" /></label>
            <label>
              <span>Project type</span>
              <select name="project" defaultValue="">
                <option value="" disabled>Select a project</option>
                <option>Short-form edit</option><option>Motion design</option><option>Social campaign</option><option>Creative direction</option><option>Other</option>
              </select>
            </label>
            <label>
              <span>Budget range</span>
              <select name="budget" defaultValue="">
                <option value="" disabled>Select a range</option>
                <option>Under $2k</option><option>$2k–$5k</option><option>$5k–$10k</option><option>$10k+</option>
              </select>
            </label>
            <label className="field-wide"><span>Tell me about your project</span><textarea name="message" required placeholder="A quick outline of the idea, timing and what success looks like." /></label>
            <button className="liquid-button field-wide" type="submit"><span>Send message</span><span>↗</span></button>
          </form>

          <div className="contact-visual" aria-hidden="true">
            <img src="/images/contact-portal.png" alt="" loading="lazy" decoding="async" />
            <div className="contact-visual-glow" />
            <p><span />Ideas become motion</p>
          </div>
        </section>

        <div className="portfolio-footer">
          <a href="#top" className="footer-brand">Joshua James<span>Motion &amp; edit</span></a>
          <p>© {new Date().getFullYear()} Joshua James. All rights reserved.</p>
          <div><a href="#selected-work">Work</a><a href="#about">About</a><a href="#services">Services</a><a href="#top">Back to top ↑</a></div>
        </div>
      </footer>
    </div>
  );
}
