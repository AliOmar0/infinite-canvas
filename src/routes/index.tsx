import { createFileRoute, Link } from "@tanstack/react-router";
import heroViewport from "@/assets/hero-viewport.jpg";
import showcase1 from "@/assets/showcase-1.jpg";
import showcase2 from "@/assets/showcase-2.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const navLinks = [
  { label: "Engine", href: "#engine" },
  { label: "Showcase", href: "#showcase" },
];

const features = [
  {
    index: "[01]",
    title: "Real-time 3D Raytracing",
    body: "Hardware-accelerated rendering directly in the browser. Zero latency, cinematic quality, unlimited light bounces.",
  },
  {
    index: "[02]",
    title: "AI Texture Synthesis",
    body: "Generate hyper-realistic PBR materials from simple prompts. Our diffusion model understands depth, roughness, and normal maps.",
  },
  {
    index: "[03]",
    title: "Lossless Vector Export",
    body: "Scale your 3D compositions to any size. Native support for SVG, Lottie, and 8K ProRes sequences.",
  },
];

const showcase = [
  { src: showcase1, alt: "Refraction test 04 — abstract glass sculpture", code: "REFRACTION_TEST_04" },
  { src: showcase2, alt: "Volumetric environment 09 — atmospheric landscape", code: "VOLUMETRIC_ENV_09" },
];

function Index() {
  return (
    <div className="bg-background text-foreground font-display min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-mono text-sm tracking-tighter uppercase font-bold">Infinite Studio</div>
          <div className="hidden md:flex gap-8 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <Link to="/editor" className="px-4 py-1.5 bg-accent text-accent-foreground text-[11px] font-mono uppercase tracking-[0.2em] font-bold rounded-full hover:bg-accent/90 transition-colors">
            Open Editor
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative pt-36 pb-20 px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6 animate-reveal [animation-delay:100ms]">
              Next-Gen Creative Engine
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-balance mb-8 animate-reveal [animation-delay:200ms] leading-[0.95]">
              Infinite <span className="text-muted-foreground">Depth.</span>
              <br />
              Browser Native.
            </h1>
            <p className="max-w-xl mx-auto text-base text-muted-foreground text-pretty mb-10 animate-reveal [animation-delay:250ms]">
              A high-performance creative engine for cinematic motion and AI-assisted 3D design. No installs.
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center items-center animate-reveal [animation-delay:300ms]">
              <Link to="/editor" className="px-8 py-4 bg-accent text-accent-foreground font-bold rounded-sm text-xs uppercase tracking-[0.2em] hover:bg-accent/90 transition-colors">
                Create New Scene
              </Link>
              <button className="px-8 py-4 border border-border hover:bg-white/5 transition-colors font-bold rounded-sm text-xs uppercase tracking-[0.2em]">
                Watch Showreel
              </button>
            </div>
          </div>

          <div className="mt-20 max-w-7xl mx-auto relative animate-lens [animation-delay:500ms]">
            <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent rounded-xl blur-3xl opacity-30 pointer-events-none" />
            <div className="relative w-full aspect-video rounded-xl ring-1 ring-white/10 overflow-hidden bg-card">
              <img
                src={heroViewport}
                alt="Infinite Studio viewport — cinematic 3D render of an obsidian sculpture"
                width={1600}
                height={896}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-4 text-[10px] font-mono text-foreground/60 tracking-[0.2em]">
                SYSTEM_VIEWPORT_01
              </div>
              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-foreground/60 tracking-[0.2em]">
                60 FPS · 4K READY
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="engine" className="py-32 px-6 border-t border-border">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            {features.map((f) => (
              <div key={f.index} className="space-y-4">
                <div className="font-mono text-xs text-muted-foreground">{f.index}</div>
                <h3 className="text-xl font-bold tracking-tight">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Showcase */}
        <section id="showcase" className="py-32 bg-white/[0.02] border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Built in Infinite.</h2>
              <a
                href="#"
                className="font-mono text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Browse Gallery
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {showcase.map((s) => (
                <figure
                  key={s.code}
                  className="relative aspect-[4/3] bg-card ring-1 ring-white/5 rounded-lg overflow-hidden group"
                >
                  <img
                    src={s.src}
                    alt={s.alt}
                    width={1280}
                    height={960}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <figcaption className="absolute bottom-3 left-4 text-[10px] font-mono text-foreground/70 tracking-[0.2em]">
                    {s.code}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Editor CTA */}
        <section className="py-32 px-6 border-t border-border">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
              Open the studio.
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mb-10 text-pretty">
              Real-time WebGL viewport. Add primitives, sculpt materials, light scenes — entirely in your browser.
            </p>
            <Link
              to="/editor"
              className="inline-block px-10 py-4 bg-accent text-accent-foreground font-bold rounded-sm text-xs uppercase tracking-[0.2em] hover:bg-accent/90 transition-colors"
            >
              Launch Editor
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-border px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <div className="font-mono text-sm tracking-tighter uppercase font-bold">Infinite Studio</div>
            <p className="text-muted-foreground text-xs max-w-xs">
              The browser-native foundation for next-generation cinematic design.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16">
            <FooterCol
              heading="Platform"
              links={["Engine", "Benchmarks", "Updates"]}
            />
            <FooterCol
              heading="Resources"
              links={["Documentation", "API Reference", "Templates"]}
            />
            <FooterCol heading="Connect" links={["Twitter", "Discord"]} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          <div>© 2026 Infinite Studio</div>
          <div>LATENCY: 12ms · STATUS: NOMINAL</div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ heading, links }: { heading: string; links: string[] }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">{heading}</h4>
      <ul className="text-xs space-y-2 text-foreground/70">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-foreground transition-colors">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
