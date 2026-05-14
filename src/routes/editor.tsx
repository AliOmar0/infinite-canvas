import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Pause, Download, RotateCcw, LayoutGrid } from "lucide-react";
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
      { name: "description", content: "Browser-native real-time 3D scene editor with post-FX." },
    ],
  }),
});

function EditorPage() {
  const reset = useEditor((s) => s.reset);
  const objects = useEditor((s) => s.objects);
  const playing = useEditor((s) => s.playing);
  const togglePlaying = useEditor((s) => s.togglePlaying);
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const [showTemplates, setShowTemplates] = useState(false);

  const exportPng = () => {
    const cap = (window as unknown as { __captureViewport?: () => string }).__captureViewport;
    if (!cap) return;
    const url = cap();
    const a = document.createElement("a");
    a.href = url;
    a.download = `infinite-studio-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-mono text-xs tracking-tighter uppercase font-bold">
            Infinite Studio
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Untitled Scene
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
            {objects.length} OBJ · {playing ? "LIVE" : "PAUSED"}
          </span>
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="px-3 py-1 border border-border text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white/5 transition-colors rounded-sm flex items-center gap-1.5"
          >
            <LayoutGrid className="size-3" /> Templates
          </button>
          <button
            onClick={togglePlaying}
            className="p-1.5 border border-border hover:bg-white/5 transition-colors rounded-sm"
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            onClick={exportPng}
            className="px-3 py-1 border border-border text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white/5 transition-colors rounded-sm flex items-center gap-1.5"
          >
            <Download className="size-3" /> PNG
          </button>
          <button
            onClick={reset}
            className="p-1.5 border border-border hover:bg-white/5 transition-colors rounded-sm"
            title="Reset"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        <aside className="w-60 border-r border-border shrink-0 bg-background">
          <SceneTree />
        </aside>

        <main className="flex-1 relative bg-card min-w-0">
          <Viewport />
          <div className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.2em] text-foreground/60 pointer-events-none">
            VIEWPORT_01 · DRAG TO ORBIT
          </div>
          <div className="absolute bottom-3 right-4 font-mono text-[10px] tracking-[0.2em] text-foreground/60 pointer-events-none">
            WEBGL · REALTIME
          </div>

          {showTemplates && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-30 overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-xs uppercase tracking-[0.3em]">Choose a template</h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                >
                  Close ✕
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { loadTemplate(t); setShowTemplates(false); }}
                    className="group text-left rounded-md overflow-hidden border border-border hover:border-white/30 transition-colors"
                  >
                    <div
                      className="aspect-video relative"
                      style={{ background: t.background }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/80">{t.name}</div>
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-card">
                      <div className="text-xs font-bold">{t.name}</div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        {t.tags.join(" · ")}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="w-72 border-l border-border shrink-0 bg-background">
          <Properties />
        </aside>
      </div>
    </div>
  );
}
