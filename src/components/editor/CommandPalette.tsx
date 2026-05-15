import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { Box, Circle, Cylinder, Triangle, Type, Hexagon, Diamond, Sparkles, Square, Lightbulb, Sun, Zap, Flashlight, LayoutGrid, Play, Pause, Download, RotateCcw, Save, Upload, Home } from "lucide-react";
import { useEditor, PrimitiveType, LightType } from "@/lib/editor-store";
import { TEMPLATES } from "@/lib/templates";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onExportPng: () => void;
  onSaveScene: () => void;
  onLoadScene: () => void;
}

const primIcons: Record<PrimitiveType, typeof Box> = {
  box: Box, sphere: Circle, cylinder: Cylinder, cone: Triangle, torus: Circle,
  torusKnot: Sparkles, icosahedron: Diamond, octahedron: Diamond,
  dodecahedron: Hexagon, plane: Square, text: Type,
};
const lightIcons: Record<LightType, typeof Box> = {
  ambient: Lightbulb, directional: Sun, point: Zap, spot: Flashlight,
};
const PRIMS: PrimitiveType[] = ["box", "sphere", "cylinder", "cone", "torus", "torusKnot", "icosahedron", "octahedron", "dodecahedron", "plane", "text"];
const LIGHTS: LightType[] = ["directional", "point", "spot", "ambient"];

export function CommandPalette({ open, onOpenChange, onExportPng, onSaveScene, onLoadScene }: Props) {
  const navigate = useNavigate();
  const addObject = useEditor((s) => s.addObject);
  const addLight = useEditor((s) => s.addLight);
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const togglePlaying = useEditor((s) => s.togglePlaying);
  const reset = useEditor((s) => s.reset);
  const playing = useEditor((s) => s.playing);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const run = (fn: () => void) => { fn(); onOpenChange(false); };

  if (!open) return null;
  return (
    <div
      role="dialog" aria-modal="true" aria-label="Command palette"
      className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-2xl flex items-start justify-center pt-[14vh] px-4 animate-fade-in"
      onClick={() => onOpenChange(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl liquid-glass-strong rounded-2xl overflow-hidden shadow-2xl">
        <Command label="Command palette" className="flex flex-col">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-white/10">
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command — add cube, load template, save…"
              className="flex-1 bg-transparent outline-none py-2 text-sm placeholder:text-muted-foreground"
            />
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white/5 rounded border border-white/10">ESC</kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto px-2 py-2">
            <Command.Empty className="py-6 text-center text-xs font-mono text-muted-foreground">No results</Command.Empty>

            <Group label="Actions">
              <Item icon={playing ? Pause : Play} label={playing ? "Pause animation" : "Play animation"} hint="SPACE" onSelect={() => run(togglePlaying)} />
              <Item icon={Download} label="Export PNG" hint="" onSelect={() => run(onExportPng)} />
              <Item icon={Save} label="Save scene as JSON" hint="" onSelect={() => run(onSaveScene)} />
              <Item icon={Upload} label="Load scene from JSON" hint="" onSelect={() => run(onLoadScene)} />
              <Item icon={RotateCcw} label="Reset scene" hint="" onSelect={() => run(reset)} />
              <Item icon={Home} label="Go to landing page" hint="" onSelect={() => run(() => navigate({ to: "/" }))} />
            </Group>

            <Group label="Add geometry">
              {PRIMS.map((p) => {
                const Icon = primIcons[p];
                return (
                  <Item key={p} icon={Icon} label={`Add ${p}`} hint="" onSelect={() => run(() => addObject(p))} />
                );
              })}
            </Group>

            <Group label="Add light">
              {LIGHTS.map((l) => {
                const Icon = lightIcons[l];
                return (
                  <Item key={l} icon={Icon} label={`Add ${l} light`} hint="" onSelect={() => run(() => addLight(l))} />
                );
              })}
            </Group>

            <Group label="Templates">
              {TEMPLATES.map((t) => (
                <Item key={t.id} icon={LayoutGrid} label={t.name} hint={t.tags.slice(0, 2).join(" · ")} onSelect={() => run(() => loadTemplate(t))} />
              ))}
            </Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Command.Group heading={label} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.24em] [&_[cmdk-group-heading]]:text-muted-foreground">
      {children}
    </Command.Group>
  );
}

function Item({ icon: Icon, label, hint, onSelect }: { icon: typeof Box; label: string; hint: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-white/10 aria-selected:text-foreground text-foreground/85"
    >
      <Icon className="size-3.5 shrink-0 text-foreground/60" aria-hidden />
      <span className="flex-1 truncate">{label}</span>
      {hint && <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{hint}</span>}
    </Command.Item>
  );
}
