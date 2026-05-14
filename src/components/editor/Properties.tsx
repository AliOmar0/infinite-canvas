import { useEditor } from "@/lib/editor-store";

function Vec3Input({
  label,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  value: [number, number, number];
  onChange: (v: [number, number, number]) => void;
  step?: number;
}) {
  const labels = ["X", "Y", "Z"] as const;
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {value.map((n, i) => (
          <div key={i} className="flex items-center bg-white/5 rounded-sm">
            <span className="px-2 text-[10px] font-mono text-muted-foreground">{labels[i]}</span>
            <input
              type="number"
              step={step}
              value={Number(n.toFixed(3))}
              onChange={(e) => {
                const next = [...value] as [number, number, number];
                next[i] = parseFloat(e.target.value) || 0;
                onChange(next);
              }}
              className="w-full bg-transparent text-xs font-mono py-1.5 pr-2 outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Slider({
  label, value, onChange, min = 0, max = 1, step = 0.01,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[10px] text-foreground">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-white"
      />
    </div>
  );
}

export function Properties() {
  const selectedId = useEditor((s) => s.selectedId);
  const obj = useEditor((s) => s.objects.find((o) => o.id === selectedId));
  const update = useEditor((s) => s.updateObject);
  const env = useEditor((s) => s.environment);
  const setEnv = useEditor((s) => s.setEnvironment);
  const showGrid = useEditor((s) => s.showGrid);
  const toggleGrid = useEditor((s) => s.toggleGrid);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-border">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
          World
        </div>
        <div className="space-y-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Environment
            </div>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value as typeof env)}
              className="w-full bg-white/5 text-xs font-mono py-1.5 px-2 rounded-sm outline-none border border-transparent focus:border-white/20"
            >
              {["studio", "city", "sunset", "warehouse", "night"].map((e) => (
                <option key={e} value={e} className="bg-background">{e}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center justify-between text-xs font-mono cursor-pointer">
            <span className="text-muted-foreground uppercase tracking-[0.2em] text-[10px]">Grid</span>
            <input type="checkbox" checked={showGrid} onChange={toggleGrid} className="accent-white" />
          </label>
        </div>
      </div>

      {!obj ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center text-xs font-mono text-muted-foreground tracking-wider">
            NO SELECTION<br />
            <span className="text-[10px] opacity-60">Click an object in the viewport</span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Name
            </div>
            <input
              value={obj.name}
              onChange={(e) => update(obj.id, { name: e.target.value })}
              className="w-full bg-white/5 text-xs font-mono py-1.5 px-2 rounded-sm outline-none border border-transparent focus:border-white/20"
            />
          </div>

          <Vec3Input
            label="Position"
            value={obj.position}
            onChange={(v) => update(obj.id, { position: v })}
          />
          <Vec3Input
            label="Rotation"
            value={obj.rotation}
            onChange={(v) => update(obj.id, { rotation: v })}
            step={0.05}
          />
          <Vec3Input
            label="Scale"
            value={obj.scale}
            onChange={(v) => update(obj.id, { scale: v })}
          />

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Material
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={obj.color}
                  onChange={(e) => update(obj.id, { color: e.target.value })}
                  className="w-10 h-8 bg-transparent rounded-sm cursor-pointer"
                />
                <input
                  type="text"
                  value={obj.color}
                  onChange={(e) => update(obj.id, { color: e.target.value })}
                  className="flex-1 bg-white/5 text-xs font-mono py-1.5 px-2 rounded-sm outline-none uppercase"
                />
              </div>
              <Slider
                label="Metalness"
                value={obj.metalness}
                onChange={(v) => update(obj.id, { metalness: v })}
              />
              <Slider
                label="Roughness"
                value={obj.roughness}
                onChange={(v) => update(obj.id, { roughness: v })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
