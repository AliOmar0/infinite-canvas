import { Box, Circle, Cylinder, Triangle, Trash2, Copy, Type, Hexagon, Diamond, Sparkles, Square, Lightbulb, Sun, Zap, Flashlight } from "lucide-react";
import { useEditor, PrimitiveType, LightType } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

const icons: Record<PrimitiveType, typeof Box> = {
  box: Box,
  sphere: Circle,
  cylinder: Cylinder,
  cone: Triangle,
  torus: Circle,
  torusKnot: Sparkles,
  icosahedron: Diamond,
  octahedron: Diamond,
  dodecahedron: Hexagon,
  plane: Square,
  text: Type,
};

const lightIcons: Record<LightType, typeof Box> = {
  ambient: Lightbulb,
  directional: Sun,
  point: Zap,
  spot: Flashlight,
};

const primitives: PrimitiveType[] = ["box", "sphere", "cylinder", "cone", "torus", "torusKnot", "icosahedron", "octahedron", "dodecahedron", "plane", "text"];
const lightTypes: LightType[] = ["directional", "point", "spot", "ambient"];

export function SceneTree() {
  const objects = useEditor((s) => s.objects);
  const selectedId = useEditor((s) => s.selectedId);
  const selectObject = useEditor((s) => s.selectObject);
  const removeObject = useEditor((s) => s.removeObject);
  const duplicateObject = useEditor((s) => s.duplicateObject);
  const addObject = useEditor((s) => s.addObject);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Add Primitive
        </div>
        <div className="grid grid-cols-3 gap-1">
          {primitives.map((p) => {
            const Icon = icons[p];
            return (
              <button
                key={p}
                onClick={() => addObject(p)}
                className="flex flex-col items-center gap-1 py-2 border border-border hover:bg-white/5 hover:border-white/20 transition-colors rounded-sm"
                title={`Add ${p}`}
              >
                <Icon className="size-3 text-muted-foreground" />
                <span className="font-mono text-[9px] uppercase tracking-wider">{p}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Scene
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {objects.length} OBJ
        </span>
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
                "group flex items-center gap-2 px-4 py-1.5 cursor-pointer text-xs font-mono transition-colors",
                active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5",
              )}
            >
              <Icon className="size-3 shrink-0" />
              <span className="truncate flex-1">{o.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); duplicateObject(o.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-foreground"
                title="Duplicate"
              >
                <Copy className="size-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeObject(o.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                title="Delete"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          );
        })}
        {objects.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground font-mono">
            EMPTY SCENE
          </div>
        )}
      </div>
    </div>
  );
}
