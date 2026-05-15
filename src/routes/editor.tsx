import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Play, Pause, Download, RotateCcw, LayoutGrid, X, Search, Keyboard } from "lucide-react";
import { Viewport } from "@/components/editor/Viewport";
import { SceneTree } from "@/components/editor/SceneTree";
import { Properties } from "@/components/editor/Properties";
import { useEditor } from "@/lib/editor-store";
import { TEMPLATES } from "@/lib/templates";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
  head: () => ({
    meta: [
      { title: "Editor — Infinite Studio" },
      { name: "description", content: "Browser-native real-time 3D scene editor with materials, lights, post-FX, and 20+ templates." },
    ],
  }),
});

function EditorPage() {
  const reset = useEditor((s) => s.reset);
  const objects = useEditor((s) => s.objects);
  const lights = useEditor((s) => s.lights);
  const playing = useEditor((s) => s.playing);
  const togglePlaying = useEditor((s) => s.togglePlaying);
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const removeObject = useEditor((s) => s.removeObject);
  const removeLight = useEditor((s) => s.removeLight);
  const duplicateObject = useEditor((s) => s.duplicateObject);
  const selectedId = useEditor((s) => s.selectedId);
  const selectedLightId = useEditor((s) => s.selectedLightId);

  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter((t) =>
      t.name.toLowerCase().includes(q) || t.tags.some((tg) => tg.toLowerCase().includes(q))
    );
  }, [query]);

  const exportPng = () => {
    const cap = (window as unknown as { __captureViewport?: () => string }).__captureViewport;
    if (!cap) return;
    const url = cap();
    const a = document.createElement("a");
    a.href = url;
    a.download = `infinite-studio-${Date.now()}.png`;
    a.click();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "Escape") { setShowTemplates(false); setShowShortcuts(false); }
      if (e.key === " ") { e.preventDefault(); togglePlaying(); }
      if (e.key === "t" || e.key === "T") setShowTemplates((v) => !v);
      if (e.key === "?") setShowShortcuts((v) => !v);
      if ((e.key === "Delete" || e.key === "Backspace")) {
        if (selectedId) removeObject(selectedId);
        else if (selectedLightId) removeLight(selectedLightId);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.key === "D")) {
        if (selectedId) { e.preventDefault(); duplicateObject(selectedId); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlaying, selectedId, selectedLightId, removeObject, removeLight, duplicateObject]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <a href="#viewport-region" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-foreground focus:text-background focus:px-3 focus:py-1 focus:rounded">
        Skip to viewport
      </a>
      <header className="h-14 flex items-center justify-between px-3 shrink-0 m-2 mb-0 rounded-xl liquid-glass">
        <div className="flex items-center gap-4 pl-2">
          <Link to="/" className="font-mono text-xs tracking-tighter uppercase font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent animate-pulse-glow" />
            Infinite Studio
          </Link>
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{objects.length} OBJ</span><span className="opacity-40">·</span>
            <span>{lights.length} LIGHT</span><span className="opacity-40">·</span>
            <span className={playing ? "text-accent" : ""}>{playing ? "LIVE" : "PAUSED"}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowShortcuts(true)}
            aria-label="Keyboard shortcuts"
            className="p-2 glass-pill rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="size-3.5" />
          </button>
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="px-3 py-1.5 glass-pill rounded-full text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white/10 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LayoutGrid className="size-3" aria-hidden /> Templates
          </button>
          <button
            onClick={togglePlaying}
            aria-label={playing ? "Pause animation" : "Play animation"}
            className="p-2 glass-pill rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={playing ? "Pause (space)" : "Play (space)"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            onClick={exportPng}
            className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-mono uppercase tracking-[0.2em] font-bold hover:opacity-90 transition flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="size-3" aria-hidden /> Export PNG
          </button>
          <button
            onClick={reset}
            aria-label="Reset scene"
            className="p-2 glass-pill rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Reset scene"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative gap-2 p-2 pt-2">
        <aside className="w-60 shrink-0 rounded-xl liquid-glass overflow-hidden" aria-label="Scene tree">
          <SceneTree />
        </aside>

        <main id="viewport-region" className="flex-1 relative bg-card min-w-0 rounded-xl overflow-hidden border border-border" aria-label="3D viewport">
          <Viewport />
          <div className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.2em] text-foreground/60 pointer-events-none select-none px-2 py-1 rounded glass-pill">
            VIEWPORT_01 · DRAG TO ORBIT
          </div>
          <div className="absolute bottom-3 right-4 font-mono text-[10px] tracking-[0.2em] text-foreground/60 pointer-events-none select-none px-2 py-1 rounded glass-pill">
            WEBGL · REALTIME
          </div>

          {showTemplates && (
            <div role="dialog" aria-modal="true" aria-label="Templates" className="absolute inset-0 bg-background/70 backdrop-blur-2xl z-30 overflow-y-auto p-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <h2 className="font-mono text-xs uppercase tracking-[0.3em]">Choose a template</h2>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1 tracking-wider">
                    {filtered.length} OF {TEMPLATES.length} PRESETS
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search templates"
                      aria-label="Search templates"
                      className="liquid-glass rounded-full pl-7 pr-3 py-1.5 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring w-48"
                    />
                  </div>
                  <button
                    onClick={() => setShowTemplates(false)}
                    aria-label="Close templates"
                    className="p-2 glass-pill rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { loadTemplate(t); setShowTemplates(false); }}
                    className="group text-left rounded-xl overflow-hidden liquid-glass hover:border-white/40 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="aspect-video relative overflow-hidden" style={{ background: t.background }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-white/85 mix-blend-difference text-center px-2">{t.name}</div>
                      </div>
                    </div>
                    <div className="px-3 py-2.5 bg-card flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{t.name}</div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1 truncate">
                          {t.tags.join(" · ")}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors shrink-0">→</span>
                    </div>
                  </button>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="py-20 text-center font-mono text-xs text-muted-foreground">No templates match "{query}"</div>
              )}
            </div>
          )}

          {showShortcuts && (
            <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" className="absolute inset-0 bg-background/60 backdrop-blur-2xl z-30 flex items-center justify-center p-8 animate-fade-in">
              <div className="max-w-md w-full liquid-glass-strong rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-xs uppercase tracking-[0.3em]">Shortcuts</h2>
                  <button onClick={() => setShowShortcuts(false)} aria-label="Close" className="p-2 glass-pill rounded-full hover:bg-white/10">
                    <X className="size-3.5" />
                  </button>
                </div>
                <ul className="space-y-2 text-xs font-mono">
                  {[
                    ["Space", "Play / pause"],
                    ["T", "Templates"],
                    ["Del / Bksp", "Delete selected"],
                    ["Cmd/Ctrl + D", "Duplicate selected"],
                    ["Esc", "Close panel"],
                    ["?", "This dialog"],
                    ["Drag viewport", "Orbit camera"],
                    ["Scroll viewport", "Zoom"],
                  ].map(([k, d]) => (
                    <li key={k} className="flex justify-between border-b border-border pb-1.5">
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">{k}</kbd>
                      <span className="text-muted-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </main>

        <aside className="w-72 shrink-0 rounded-xl liquid-glass overflow-hidden" aria-label="Properties panel">
          <Properties />
        </aside>
      </div>
    </div>
  );
}
