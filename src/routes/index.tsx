import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Box, Sparkles, Zap, Layers, Lightbulb, Wand2, Type, Move3d, Cpu, Shield } from "lucide-react";
import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import heroViewport from "@/assets/hero-viewport.jpg";
import showcase1 from "@/assets/showcase-1.jpg";
import showcase2 from "@/assets/showcase-2.jpg";
import { TEMPLATES } from "@/lib/templates";
import { MATERIAL_PRESETS } from "@/lib/materials";
import { useEditor } from "@/lib/editor-store";

export const Route = createFileRoute("/")({
  component: Index,
});

const navLinks = [
  { label: "Editor", href: "/editor", to: true },
  { label: "Materials", href: "#materials" },
  { label: "Lighting", href: "#lighting" },
  { label: "Templates", href: "#templates" },
  { label: "FAQ", href: "#faq" },
];

const features = [
  { icon: Move3d, index: "[01]", title: "Real-time WebGL Viewport",
    body: "Orbit, pan and sculpt PBR materials in a 60-FPS browser viewport. Hardware-accelerated by your GPU." },
  { icon: Layers, index: "[02]", title: "20+ Procedural Textures",
    body: "Carbon fiber, brick, circuit, concrete, noise — generated on the fly with zero downloads." },
  { icon: Lightbulb, index: "[03]", title: "Cinematic Lighting Rigs",
    body: "Studio, neon, noir, golden hour, arctic. Edit per-light: directional, point, spot, ambient with shadows." },
  { icon: Sparkles, index: "[04]", title: "Post-FX Stack",
    body: "Bloom, depth-of-field, chromatic aberration, vignette, pixelate, noise. Stack and tune in real time." },
  { icon: Type, index: "[05]", title: "Live 3D Type",
    body: "Beveled extruded text in any preset material — chrome, glass, neon — directly in the scene tree." },
  { icon: Wand2, index: "[06]", title: "20 Material Presets",
    body: "Chrome, gold, glass, ice, hologram, lava, velvet, obsidian. One click, fully editable PBR." },
];

const faqs = [
  { q: "Do I need to install anything?", a: "No. Infinite Studio runs entirely in your browser using WebGL 2. Open the editor and start composing." },
  { q: "Can I export my work?", a: "Yes. Export the current viewport as a high-resolution PNG. PBR scene export is on the roadmap." },
  { q: "What hardware is recommended?", a: "Any device with a modern GPU and a Chromium- or Firefox-based browser. M-series Macs and recent dedicated GPUs unlock the highest quality." },
  { q: "Is my work private?", a: "Scenes live in your browser session. We never collect viewport data." },
];

function Index() {
  const navigate = useNavigate();
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const openTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (t) loadTemplate(t);
    navigate({ to: "/editor" });
  };

  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const allTags = useMemo(() => Array.from(new Set(TEMPLATES.flatMap((t) => t.tags))).slice(0, 12), []);
  const filteredTemplates = useMemo(
    () => (tagFilter ? TEMPLATES.filter((t) => t.tags.includes(tagFilter)) : TEMPLATES),
    [tagFilter]
  );

  // Cursor spotlight tracking for hero
  const onHeroMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty("--y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div className="bg-background text-foreground font-display min-h-screen relative">
      <div className="mesh-bg" aria-hidden />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-foreground focus:text-background focus:px-3 focus:py-1 focus:rounded">
        Skip to content
      </a>

      <nav aria-label="Primary" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(960px,calc(100%-2rem))]">
        <div className="liquid-glass rounded-full px-3 h-14 flex items-center justify-between">
          <Link to="/" className="font-mono text-sm tracking-tighter uppercase font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full pl-3 pr-4 flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent animate-pulse-glow" />
            Infinite Studio
          </Link>
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            {navLinks.map((l) =>
              l.to ? (
                <Link key={l.label} to={l.href} className="px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} className="px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-foreground transition-colors">
                  {l.label}
                </a>
              )
            )}
          </div>
          <Link
            to="/editor"
            className="px-4 py-2 bg-accent text-accent-foreground text-[11px] font-mono uppercase tracking-[0.2em] font-bold rounded-full hover:opacity-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open Editor
          </Link>
        </div>
      </nav>

      <main id="main">
        {/* Hero — Liquid Metal */}
        <LiquidMetalHero
          badge="Browser-Native 3D Engine · v0.5"
          title={
            <>
              <span className="text-aurora">Infinite Depth.</span>
              <br />
              Browser Native.
            </>
          }
          subtitle="A high-performance creative engine for cinematic 3D — materials, lighting, post-FX, all in real time. No installs."
          primaryCtaLabel="Launch the Studio"
          secondaryCtaLabel={`Browse ${TEMPLATES.length} Templates`}
          onPrimaryCtaClick={() => navigate({ to: "/editor" })}
          onSecondaryCtaClick={() => {
            document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
          }}
          features={["WebGL 2 · 60 FPS", "20 PBR Materials", "Cinematic Post-FX"]}
        />

        {/* Hero render strip */}
        <section className="relative px-6 pt-4 pb-20">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent rounded-xl blur-3xl opacity-30 pointer-events-none" />
            <div className="relative w-full aspect-video rounded-xl glow-ring overflow-hidden bg-card">
              <img
                src={heroViewport}
                alt="Infinite Studio viewport — cinematic 3D render of an obsidian sculpture"
                width={1600} height={896}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-4 text-[10px] font-mono text-foreground/60 tracking-[0.2em]">SYSTEM_VIEWPORT_01</div>
              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-foreground/60 tracking-[0.2em]">60 FPS · 4K READY</div>
            </div>
          </div>

          {/* metric strip */}
          <div className="mt-12 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
            {[
              { k: "20+", v: "Templates" },
              { k: "20", v: "Materials" },
              { k: "10", v: "HDRI Envs" },
              { k: "6", v: "Post-FX" },
            ].map((m) => (
              <div key={m.v} className="liquid-glass rounded-xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-extrabold tracking-tighter text-aurora">{m.k}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">{m.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Marquee */}
        <section aria-hidden className="border-y border-border py-5 bg-background/60 relative overflow-hidden">
          <div className="marquee">
            <div className="marquee-track font-mono text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-12 pr-12">
                  {["WebGL 2", "PBR Materials", "Real-Time", "Aurora FX", "Procedural Textures", "Cinematic Light Rigs", "Bloom · DOF · Chroma", "60 FPS", "Zero Install"].map((w) => (
                    <span key={w} className="flex items-center gap-12">
                      <span className="text-foreground/80">{w}</span>
                      <span className="text-aurora">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="engine" className="py-32 px-6 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 max-w-2xl">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">[01] Engine</div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">A studio in your tab.</h2>
              <p className="text-muted-foreground text-base">
                Every primitive, light, material, and post-effect is GPU-accelerated and editable in real time.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-md overflow-hidden">
              {features.map((f) => (
                <div key={f.index} className="p-8 bg-background space-y-4">
                  <div className="flex items-center justify-between">
                    <f.icon className="size-5 text-foreground" aria-hidden />
                    <span className="font-mono text-xs text-muted-foreground">{f.index}</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Materials */}
        <section id="materials" className="py-32 px-6 border-t border-border bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">[02] Materials</div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Physically-based, instantly applied.</h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm">
                Every preset is a real PBR material — metalness, roughness, transmission, clearcoat, emissive — fully editable.
              </p>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {MATERIAL_PRESETS.map((m) => (
                <li key={m.id}>
                  <Link
                    to="/editor"
                    className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                    aria-label={`Open editor with ${m.label} material`}
                  >
                    <div
                      className="aspect-square rounded-md border border-border group-hover:border-white/40 transition-all relative overflow-hidden"
                      style={{
                        background: m.preset.transmission && m.preset.transmission > 0.5
                          ? `linear-gradient(135deg, ${m.preset.color}80, #ffffff20)`
                          : m.preset.metalness > 0.7
                            ? `radial-gradient(circle at 30% 30%, ${m.preset.color}, #000)`
                            : m.preset.color,
                        boxShadow: m.preset.emissiveIntensity ? `inset 0 0 24px ${m.preset.emissive}` : undefined,
                      }}
                    />
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                      {m.label}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Lighting */}
        <section id="lighting" className="py-32 px-6 border-t border-border">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">[03] Lighting</div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">Light the mood.</h2>
              <p className="text-muted-foreground text-base mb-8 max-w-md">
                Build your own rig from directional, point, spot, and ambient lights. Or start from a curated cinematic preset.
              </p>
              <ul className="space-y-3">
                {[
                  ["Studio", "Balanced 3-point key + fill + rim"],
                  ["Noir", "High-contrast spot with magenta rim"],
                  ["Neon", "Saturated point lights for product glow"],
                  ["Golden Hour", "Warm directional sun with sky bounce"],
                  ["Arctic", "Cool sky + soft fill, cinematic blues"],
                ].map(([n, d]) => (
                  <li key={n} className="flex justify-between border-b border-border pb-2.5">
                    <span className="font-bold text-sm">{n}</span>
                    <span className="text-muted-foreground text-xs text-right">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Studio", g: "linear-gradient(135deg, #f5f5f5 0%, #888 50%, #2a2a2a 100%)" },
                { name: "Noir", g: "radial-gradient(circle at 30% 30%, #ffffff 0%, #ff3a8a 30%, #050010 80%)" },
                { name: "Neon", g: "radial-gradient(circle at 30% 70%, #ff00aa 0%, transparent 50%), radial-gradient(circle at 70% 30%, #00ffff 0%, transparent 50%), #0a0033" },
                { name: "Golden", g: "radial-gradient(circle at 30% 30%, #ffd070 0%, #ffb060 30%, #3a1500 100%)" },
              ].map((p) => (
                <div key={p.name} className="aspect-square rounded-md border border-border relative overflow-hidden" style={{ background: p.g }}>
                  <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/85 mix-blend-difference">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="py-32 bg-white/[0.02] border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">[04] Templates</div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Ready to remix.</h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm">
                {TEMPLATES.length} curated 3D scenes with materials, lights and post-FX. One click loads them in the editor.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-8" role="group" aria-label="Filter templates by tag">
              <button
                onClick={() => setTagFilter(null)}
                aria-pressed={tagFilter === null}
                className={`px-3 py-1 border text-[10px] font-mono uppercase tracking-[0.2em] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tagFilter === null ? "bg-foreground text-background border-foreground" : "border-border hover:bg-white/5"}`}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTagFilter(t)}
                  aria-pressed={tagFilter === t}
                  className={`px-3 py-1 border text-[10px] font-mono uppercase tracking-[0.2em] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tagFilter === t ? "bg-foreground text-background border-foreground" : "border-border hover:bg-white/5"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openTemplate(t.id)}
                  className="group text-left rounded-md overflow-hidden border border-border hover:border-white/40 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Load ${t.name} template`}
                >
                  <div className="aspect-[4/3] relative overflow-hidden" style={{ background: t.background }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <div className="font-mono text-sm md:text-base uppercase tracking-[0.25em] text-white/85 mix-blend-difference text-center">
                        {t.name}
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-3 bg-card flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{t.name}</div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1 truncate">
                        {t.tags.join(" · ")}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors shrink-0">OPEN →</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-16 grid md:grid-cols-2 gap-6">
              {[
                { src: showcase1, alt: "Refraction test 04 — abstract glass sculpture", code: "REFRACTION_TEST_04" },
                { src: showcase2, alt: "Volumetric environment 09 — atmospheric landscape", code: "VOLUMETRIC_ENV_09" },
              ].map((s) => (
                <figure key={s.code} className="relative aspect-[4/3] bg-card ring-1 ring-white/5 rounded-lg overflow-hidden group">
                  <img src={s.src} alt={s.alt} width={1280} height={960} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                  <figcaption className="absolute bottom-3 left-4 text-[10px] font-mono text-foreground/70 tracking-[0.2em]">{s.code}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="py-32 px-6 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">[05] Workflow</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-12">Three steps to a render.</h2>
            <ol className="grid md:grid-cols-3 gap-px bg-border rounded-md overflow-hidden">
              {[
                { icon: Box, n: "01", t: "Compose", d: "Drop primitives, type, or load a template. Drag the gizmo to position, scale and rotate." },
                { icon: Wand2, n: "02", t: "Style", d: "Apply a material preset, dial metalness and transmission. Add procedural texture." },
                { icon: Cpu, n: "03", t: "Light + render", d: "Pick an HDRI, place lights, stack post-FX. Export viewport as a high-resolution PNG." },
              ].map((s) => (
                <li key={s.n} className="p-8 bg-background space-y-4">
                  <div className="flex items-center justify-between">
                    <s.icon className="size-5" aria-hidden />
                    <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{s.t}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-32 px-6 border-t border-border bg-white/[0.02]">
          <div className="max-w-3xl mx-auto">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">[06] FAQ</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-12">Common questions.</h2>
            <dl className="space-y-2">
              {faqs.map((f) => (
                <details key={f.q} className="group border border-border rounded-md bg-card/30 [&[open]]:bg-card/60 transition-colors">
                  <summary className="px-5 py-4 cursor-pointer flex items-center justify-between gap-4 text-sm font-bold list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
                    {f.q}
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform" aria-hidden>+</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 border-t border-border">
          <div className="max-w-3xl mx-auto text-center">
            <Zap className="size-8 mx-auto mb-6 text-foreground" aria-hidden />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Open the studio.</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-10 text-pretty">
              Real-time WebGL viewport. Materials, lights, post-FX — entirely in your browser.
            </p>
            <Link
              to="/editor"
              className="inline-block px-10 py-4 bg-accent text-accent-foreground font-bold rounded-sm text-xs uppercase tracking-[0.2em] hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Launch Editor
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-border px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <div className="font-mono text-sm tracking-tighter uppercase font-bold">Infinite Studio</div>
            <p className="text-muted-foreground text-xs max-w-xs">
              The browser-native foundation for next-generation cinematic design.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <Shield className="size-3" aria-hidden /> Runs entirely in your browser
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12 md:gap-16">
            <FooterCol heading="Platform" links={[{ label: "Editor", to: "/editor" }, { label: "Materials", href: "#materials" }, { label: "Lighting", href: "#lighting" }]} />
            <FooterCol heading="Resources" links={[{ label: "Templates", href: "#templates" }, { label: "FAQ", href: "#faq" }]} />
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

type FooterLink = { label: string; href?: string; to?: string };
function FooterCol({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">{heading}</h4>
      <ul className="text-xs space-y-2 text-foreground/70">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:text-foreground">{l.label}</Link>
            ) : (
              <a href={l.href} className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:text-foreground">{l.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
