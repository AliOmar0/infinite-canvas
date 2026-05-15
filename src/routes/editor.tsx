import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle, type PanelImperativeHandle } from "react-resizable-panels";
import { Play, Pause, Download, RotateCcw, LayoutGrid, X, Search, Keyboard, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Maximize2, Minimize2, Save, Upload, Command as CommandIcon, GripVertical } from "lucide-react";
import { Viewport } from "@/components/editor/Viewport";
import { SceneTree } from "@/components/editor/SceneTree";
import { Properties } from "@/components/editor/Properties";
import { CommandPalette } from "@/components/editor/CommandPalette";
import { TemplatePreview } from "@/components/editor/TemplatePreview";
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
  const serializeScene = useEditor((s) => s.serializeScene);
  const loadSceneJSON = useEditor((s) => s.loadSceneJSON);

  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const leftRef = useRef<PanelImperativeHandle | null>(null);
  const rightRef = useRef<PanelImperativeHandle | null>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const focusMode = leftCollapsed && rightCollapsed;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const toggleLeft = useCallback(() => {
    const p = leftRef.current; if (!p) return;
    if (p.isCollapsed()) { p.expand(); setLeftCollapsed(false); }
    else { p.collapse(); setLeftCollapsed(true); }
  }, []);
  const toggleRight = useCallback(() => {
    const p = rightRef.current; if (!p) return;
    if (p.isCollapsed()) { p.expand(); setRightCollapsed(false); }
    else { p.collapse(); setRightCollapsed(true); }
  }, []);
  const toggleFocus = useCallback(() => {
    const l = leftRef.current, r = rightRef.current; if (!l || !r) return;
    if (l.isCollapsed() && r.isCollapsed()) { l.expand(); r.expand(); setLeftCollapsed(false); setRightCollapsed(false); }
    else { l.collapse(); r.collapse(); setLeftCollapsed(true); setRightCollapsed(true); }
  }, []);

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
    flash("PNG exported");
  };

  const saveScene = () => {
    const json = serializeScene();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infinite-scene-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Scene saved");
  };

  const loadScene = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      const text = await f.text();
      flash(loadSceneJSON(text) ? "Scene loaded" : "Invalid scene file");
    };
    input.click();
  };

  // Try loading scene from URL hash (#scene=base64) on mount
  useEffect(() => {
    const h = window.location.hash;
    const m = h.match(/scene=([^&]+)/);
    if (m) {
      try {
        const json = decodeURIComponent(escape(atob(decodeURIComponent(m[1]))));
        if (loadSceneJSON(json)) flash("Loaded shared scene");
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setShowPalette((v) => !v); return; }
      if (inField) return;
      if (e.key === "Escape") { setShowTemplates(false); setShowShortcuts(false); setShowPalette(false); }
      if (e.key === " ") { e.preventDefault(); togglePlaying(); }
      if (e.key === "t" || e.key === "T") setShowTemplates((v) => !v);
      if (e.key === "?") setShowShortcuts((v) => !v);
      if (e.key === "[") toggleLeft();
      if (e.key === "]") toggleRight();
      if (e.key === "f" || e.key === "F") toggleFocus();
      if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) { e.preventDefault(); saveScene(); }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [togglePlaying, selectedId, selectedLightId]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <a href="#viewport-region" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-foreground focus:text-background focus:px-3 focus:py-1 focus:rounded">
        Skip to viewport
      </a>
      <header className="h-14 flex items-center justify-between px-3 shrink-0 m-2 mb-0 rounded-xl liquid-glass">
        <div className="flex items-center gap-4 pl-2 min-w-0">
          <Link to="/" className="font-mono text-xs tracking-tighter uppercase font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm flex items-center gap-2 shrink-0">
            <span className="size-2 rounded-full bg-accent animate-pulse-glow" />
            Infinite Studio
          </Link>
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{objects.length} OBJ</span><span className="opacity-40">·</span>
            <span>{lights.length} LIGHT</span><span className="opacity-40">·</span>
            <span className={playing ? "text-accent" : ""}>{playing ? "LIVE" : "PAUSED"}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button onClick={() => setShowPalette(true)} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 glass-pill rounded-full text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title="Command palette (⌘K)">
            <CommandIcon className="size-3" /> <span>K</span>
          </button>
          <span className="w-px h-5 bg-white/10 mx-1 hidden md:block" aria-hidden />
          <IconBtn onClick={toggleLeft} title={leftCollapsed ? "Show scene panel ([)" : "Hide scene panel ([)"}>
            {leftCollapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
          </IconBtn>
          <IconBtn onClick={toggleRight} title={rightCollapsed ? "Show properties (])" : "Hide properties (])"}>
            {rightCollapsed ? <PanelRightOpen className="size-3.5" /> : <PanelRightClose className="size-3.5" />}
          </IconBtn>
          <IconBtn onClick={toggleFocus} title={focusMode ? "Exit focus (F)" : "Focus mode (F)"}>
            {focusMode ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </IconBtn>
          <span className="w-px h-5 bg-white/10 mx-1" aria-hidden />
          <IconBtn onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts (?)"><Keyboard className="size-3.5" /></IconBtn>
          <IconBtn onClick={saveScene} title="Save scene (⌘S)"><Save className="size-3.5" /></IconBtn>
          <IconBtn onClick={loadScene} title="Load scene"><Upload className="size-3.5" /></IconBtn>
          <button onClick={() => setShowTemplates((v) => !v)} className="px-3 py-1.5 glass-pill rounded-full text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white/10 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <LayoutGrid className="size-3" aria-hidden /> Templates
          </button>
          <IconBtn onClick={togglePlaying} title={playing ? "Pause (space)" : "Play (space)"}>{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}</IconBtn>
          <button onClick={exportPng} className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-mono uppercase tracking-[0.2em] font-bold hover:opacity-90 transition flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Download className="size-3" aria-hidden /> Export
          </button>
          <IconBtn onClick={reset} title="Reset scene"><RotateCcw className="size-3.5" /></IconBtn>
        </div>
      </header>

      <div className="flex-1 min-h-0 relative p-2 pt-2">
        <PanelGroup
          orientation="horizontal"
          id="infinite-studio-v5"
          resizeTargetMinimumSize={{ fine: 20, coarse: 36 }}
          className="h-full w-full"
        >
          <Panel
            panelRef={leftRef}
            id="left"
            defaultSize="24%"
            minSize="14%"
            maxSize="64%"
            collapsible
            collapsedSize="0%"
            className="min-w-0 rounded-xl liquid-glass overflow-hidden"
          >
            <div className="h-full w-full overflow-hidden"><SceneTree /></div>
          </Panel>
          <ResizeHandle hidden={leftCollapsed} label="Resize scene panel" />
          <Panel id="center" defaultSize="52%" minSize="22%" className="relative min-w-0">
            <main id="viewport-region" className="absolute inset-0 bg-card rounded-xl overflow-hidden border border-border" aria-label="3D viewport">
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
                      <p className="text-[10px] font-mono text-muted-foreground mt-1 tracking-wider">{filtered.length} OF {TEMPLATES.length} PRESETS</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
                        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search templates" aria-label="Search templates" className="liquid-glass rounded-full pl-7 pr-3 py-1.5 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring w-48" />
                      </div>
                      <IconBtn onClick={() => setShowTemplates(false)} title="Close"><X className="size-3.5" /></IconBtn>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((t) => (
                      <button key={t.id} onClick={() => { loadTemplate(t); setShowTemplates(false); }} className="group text-left rounded-xl overflow-hidden liquid-glass hover:border-white/40 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <div className="aspect-video relative overflow-hidden">
                          <TemplatePreview t={t} />
                          <div className="absolute inset-x-0 bottom-0 px-2.5 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
                            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/90 truncate">{t.name}</div>
                          </div>
                        </div>
                        <div className="px-3 py-2.5 bg-card flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{t.name}</div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1 truncate">{t.tags.join(" · ")}</div>
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors shrink-0">→</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {filtered.length === 0 && <div className="py-20 text-center font-mono text-xs text-muted-foreground">No templates match "{query}"</div>}
                </div>
              )}

              {showShortcuts && (
                <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" className="absolute inset-0 bg-background/60 backdrop-blur-2xl z-30 flex items-center justify-center p-8 animate-fade-in">
                  <div className="max-w-md w-full liquid-glass-strong rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-mono text-xs uppercase tracking-[0.3em]">Shortcuts</h2>
                      <IconBtn onClick={() => setShowShortcuts(false)} title="Close"><X className="size-3.5" /></IconBtn>
                    </div>
                    <ul className="space-y-2 text-xs font-mono">
                      {[
                        ["⌘/Ctrl + K", "Command palette"],
                        ["Space", "Play / pause"],
                        ["T", "Templates"],
                        ["⌘/Ctrl + S", "Save scene JSON"],
                        ["Del / Bksp", "Delete selected"],
                        ["⌘/Ctrl + D", "Duplicate selected"],
                        ["[", "Toggle scene panel"],
                        ["]", "Toggle properties"],
                        ["F", "Focus mode (hide both)"],
                        ["Esc", "Close panel"],
                        ["?", "This dialog"],
                        ["Drag handles", "Resize panels"],
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
          </Panel>
          <ResizeHandle hidden={rightCollapsed} label="Resize properties panel" />
          <Panel
            panelRef={rightRef}
            id="right"
            defaultSize="24%"
            minSize="16%"
            maxSize="64%"
            collapsible
            collapsedSize="0%"
            className="min-w-0 rounded-xl liquid-glass overflow-hidden"
          >
            <div className="h-full w-full overflow-hidden"><Properties /></div>
          </Panel>
        </PanelGroup>
      </div>

      <CommandPalette
        open={showPalette}
        onOpenChange={setShowPalette}
        onExportPng={exportPng}
        onSaveScene={saveScene}
        onLoadScene={loadScene}
      />

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 liquid-glass-strong rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="p-2 glass-pill rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {children}
    </button>
  );
}

function ResizeHandle({ hidden, label }: { hidden?: boolean; label: string }) {
  if (hidden) return null;
  return (
    <PanelResizeHandle aria-label={label} className="group relative flex w-5 shrink-0 cursor-col-resize touch-none items-center justify-center self-stretch rounded-lg hover:bg-white/[0.04] transition-colors">
      <div className="h-16 w-1 rounded-full bg-white/15 group-hover:bg-accent/80 group-data-[separator=active]:bg-accent transition-colors flex items-center justify-center">
        <GripVertical className="size-3 text-foreground/0 group-hover:text-foreground/80 transition-colors" />
      </div>
    </PanelResizeHandle>
  );
}
