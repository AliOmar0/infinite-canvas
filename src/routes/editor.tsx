import { createFileRoute, Link } from "@tanstack/react-router";
import { Viewport } from "@/components/editor/Viewport";
import { SceneTree } from "@/components/editor/SceneTree";
import { Properties } from "@/components/editor/Properties";
import { useEditor } from "@/lib/editor-store";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
  head: () => ({
    meta: [
      { title: "Editor — Infinite Studio" },
      { name: "description", content: "Browser-native real-time 3D scene editor." },
    ],
  }),
});

function EditorPage() {
  const reset = useEditor((s) => s.reset);
  const objects = useEditor((s) => s.objects);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top bar */}
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
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {objects.length} OBJ · LIVE
          </span>
          <button
            onClick={reset}
            className="px-3 py-1 border border-border text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white/5 transition-colors rounded-sm"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex min-h-0">
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
        </main>

        <aside className="w-72 border-l border-border shrink-0 bg-background">
          <Properties />
        </aside>
      </div>
    </div>
  );
}
