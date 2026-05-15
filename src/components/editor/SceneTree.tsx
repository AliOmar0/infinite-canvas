import { Trash2, Copy, Plus } from "lucide-react";
import { useEditor, PrimitiveType, LightType } from "@/lib/editor-store";
import { cn } from "@/lib/utils";
import { Box, Circle, Cylinder, Triangle, Type, Hexagon, Diamond, Sparkles, Square, Lightbulb, Sun, Zap, Flashlight } from "lucide-react";

const icons: Record<PrimitiveType, typeof Box> = {
  box: Box, sphere: Circle, cylinder: Cylinder, cone: Triangle,
  torus: Circle, torusKnot: Sparkles, icosahedron: Diamond,
  octahedron: Diamond, dodecahedron: Hexagon, plane: Square, text: Type,
};
const lightIcons: Record<LightType, typeof Box> = {
  ambient: Lightbulb, directional: Sun, point: Zap, spot: Flashlight,
};

const primitives: PrimitiveType[] = ["box", "sphere", "cylinder", "cone", "torus", "torusKnot", "icosahedron", "octahedron", "dodecahedron", "plane", "text"];
const lightTypes: LightType[] = ["directional", "point", "spot", "ambient"];

export function SceneTree() {
  const objects = useEditor((s) => s.objects);
  const lights = useEditor((s) => s.lights);
  const selectedId = useEditor((s) => s.selectedId);
  const selectedLightId = useEditor((s) => s.selectedLightId);
  const selectObject = useEditor((s) => s.selectObject);
  const selectLight = useEditor((s) => s.selectLight);
  const removeObject = useEditor((s) => s.removeObject);
  const removeLight = useEditor((s) => s.removeLight);
  const duplicateObject = useEditor((s) => s.duplicateObject);
  const addObject = useEditor((s) => s.addObject);
  const addLight = useEditor((s) => s.addLight);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-3 flex items-center gap-2">
          <span className="size-1 rounded-full bg-accent/70" /> Add Geometry
        </div>
        <div className="grid grid-cols-3 gap-1">
          {primitives.map((p) => {
            const Icon = icons[p];
            return (
              <button
                key={p}
                onClick={() => addObject(p)}
                aria-label={`Add ${p}`}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-md bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={`Add ${p}`}
              >
                <Icon className="size-3.5 text-foreground/70" />
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-foreground/80 truncate w-full text-center">{p}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/5">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-3 flex items-center gap-2">
          <span className="size-1 rounded-full bg-amber-300/80" /> Add Light
        </div>
        <div className="grid grid-cols-4 gap-1">
          {lightTypes.map((l) => {
            const Icon = lightIcons[l];
            return (
              <button
                key={l}
                onClick={() => addLight(l)}
                aria-label={`Add ${l} light`}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-md bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={`Add ${l}`}
              >
                <Icon className="size-3.5 text-foreground/70" />
                <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-foreground/80 truncate w-full text-center">{l}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/50">Scene</span>
        <span className="font-mono text-[10px] text-foreground/40 tabular-nums">{objects.length} OBJ · {lights.length} LIGHT</span>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {objects.map((o) => {
          const Icon = icons[o.type];
          const active = o.id === selectedId;
          return (
            <div
              key={o.id}
              onClick={() => selectObject(o.id)}
              className={cn(
                "group relative flex items-center gap-2 mx-2 my-0.5 px-2.5 py-1.5 rounded-md cursor-pointer text-[11px] font-mono tracking-wide transition-all",
                active
                  ? "bg-gradient-to-r from-accent/20 to-transparent text-foreground ring-1 ring-accent/30 shadow-[inset_2px_0_0_0_var(--accent)]"
                  : "text-foreground/55 hover:text-foreground hover:bg-white/[0.04]",
              )}
            >
              <Icon className="size-3 shrink-0" aria-hidden />
              <span className="truncate flex-1">{o.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); duplicateObject(o.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-foreground"
                title="Duplicate" aria-label={`Duplicate ${o.name}`}
              >
                <Copy className="size-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeObject(o.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                title="Delete" aria-label={`Delete ${o.name}`}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          );
        })}

        {lights.length > 0 && (
          <div className="mt-3 mx-2 px-1 pt-2 pb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-foreground/40 border-t border-white/5 flex items-center gap-2">
            <span className="size-1 rounded-full bg-amber-300/80" /> Lights
          </div>
        )}
        {lights.map((l) => {
          const Icon = lightIcons[l.type];
          const active = l.id === selectedLightId;
          return (
            <div
              key={l.id}
              onClick={() => selectLight(l.id)}
              className={cn(
                "group relative flex items-center gap-2 mx-2 my-0.5 px-2.5 py-1.5 rounded-md cursor-pointer text-[11px] font-mono tracking-wide transition-all",
                active
                  ? "bg-gradient-to-r from-amber-300/15 to-transparent text-foreground ring-1 ring-amber-300/30"
                  : "text-foreground/55 hover:text-foreground hover:bg-white/[0.04]",
              )}
            >
              <Icon className="size-3 shrink-0" style={{ color: l.color }} aria-hidden />
              <span className="truncate flex-1">{l.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeLight(l.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                title="Delete" aria-label={`Delete ${l.name}`}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          );
        })}

        {objects.length === 0 && lights.length === 0 && (
          <div className="px-4 py-10 text-center font-mono">
            <div className="mx-auto mb-3 size-8 rounded-full border border-white/10 flex items-center justify-center">
              <Plus className="size-4 text-foreground/40" aria-hidden />
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">Empty Scene</div>
            <div className="text-[10px] text-foreground/30 mt-1">Add a primitive above</div>
          </div>
        )}
      </div>
    </div>
  );
}
