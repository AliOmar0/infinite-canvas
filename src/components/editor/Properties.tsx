import { useState } from "react";
import { useEditor, EnvPreset, ToneMapping, SceneObject, SceneLight } from "@/lib/editor-store";
import { MATERIAL_PRESETS } from "@/lib/materials";
import { TEXTURE_PRESETS, TextureId } from "@/lib/textures";
import { cn } from "@/lib/utils";

const ENV_OPTIONS: EnvPreset[] = ["studio", "city", "sunset", "warehouse", "night", "dawn", "forest", "park", "lobby", "apartment"];
const TONE_OPTIONS: ToneMapping[] = ["neutral", "aces", "agx", "cineon", "linear"];

function Vec3Input({ label, value, onChange, step = 0.1 }: {
  label: string; value: [number, number, number]; onChange: (v: [number, number, number]) => void; step?: number;
}) {
  const labels = ["X", "Y", "Z"] as const;
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-1">
        {value.map((n, i) => (
          <div key={i} className="flex items-center bg-white/5 rounded-sm focus-within:ring-1 focus-within:ring-ring">
            <span className="px-2 text-[10px] font-mono text-muted-foreground" aria-hidden>{labels[i]}</span>
            <input
              type="number" step={step} value={Number(n.toFixed(3))}
              aria-label={`${label} ${labels[i]}`}
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

function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
        <span className="font-mono text-[10px] text-foreground tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="w-full accent-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center justify-between text-xs font-mono cursor-pointer py-1">
      <span className="text-muted-foreground uppercase tracking-[0.2em] text-[10px]">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-white size-3.5" aria-label={label} />
    </label>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} color`}
          className="w-10 h-8 bg-transparent rounded-sm cursor-pointer border border-border" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} hex`}
          className="flex-1 bg-white/5 text-xs font-mono py-1.5 px-2 rounded-sm outline-none uppercase focus-visible:ring-1 focus-visible:ring-ring" />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-border space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

type Tab = "object" | "material" | "animate" | "world" | "fx";

export function Properties() {
  const obj = useEditor((s) => s.objects.find((o) => o.id === s.selectedId));
  const light = useEditor((s) => s.lights.find((l) => l.id === s.selectedLightId));
  const update = useEditor((s) => s.updateObject);
  const updateLight = useEditor((s) => s.updateLight);

  const [tab, setTab] = useState<Tab>("object");

  const selectionTabs: Tab[] = ["object", "material", "animate"];
  const globalTabs: Tab[] = ["world", "fx"];
  const allTabs = [...(obj || light ? selectionTabs : []), ...globalTabs];
  const effectiveTab = allTabs.includes(tab) ? tab : "world";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div role="tablist" className="flex border-b border-border bg-background sticky top-0 z-10">
        {allTabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={effectiveTab === t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              effectiveTab === t ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {effectiveTab === "object" && (light ? <LightObjectPanel light={light} update={updateLight} /> : obj ? <ObjectPanel obj={obj} update={update} /> : <Empty />)}
        {effectiveTab === "material" && (obj ? <MaterialPanel obj={obj} update={update} /> : <Empty hint="Select an object to edit its material" />)}
        {effectiveTab === "animate" && (obj ? <AnimatePanel obj={obj} update={update} /> : <Empty hint="Select an object to animate it" />)}
        {effectiveTab === "world" && <WorldPanel />}
        {effectiveTab === "fx" && <FxPanel />}
      </div>
    </div>
  );
}

function Empty({ hint = "Click an object in the viewport" }: { hint?: string }) {
  return (
    <div className="h-full flex items-center justify-center px-4 py-12">
      <div className="text-center text-xs font-mono text-muted-foreground tracking-wider">
        NO SELECTION
        <div className="text-[10px] opacity-60 mt-2 normal-case tracking-normal">{hint}</div>
      </div>
    </div>
  );
}

function ObjectPanel({ obj, update }: { obj: SceneObject; update: (id: string, p: Partial<SceneObject>) => void }) {
  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Name</div>
        <input
          value={obj.name}
          onChange={(e) => update(obj.id, { name: e.target.value })}
          aria-label="Object name"
          className="w-full bg-white/5 text-xs font-mono py-1.5 px-2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      {obj.type === "text" && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Text</div>
          <input value={obj.text || ""} onChange={(e) => update(obj.id, { text: e.target.value })} aria-label="Text content"
            className="w-full bg-white/5 text-sm py-1.5 px-2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      )}
      <Vec3Input label="Position" value={obj.position} onChange={(v) => update(obj.id, { position: v })} />
      <Vec3Input label="Rotation" value={obj.rotation} onChange={(v) => update(obj.id, { rotation: v })} step={0.05} />
      <Vec3Input label="Scale" value={obj.scale} onChange={(v) => update(obj.id, { scale: v })} />
      <div className="space-y-1 pt-2 border-t border-border">
        <Toggle label="Cast Shadow" checked={obj.castShadow} onChange={() => update(obj.id, { castShadow: !obj.castShadow })} />
        <Toggle label="Receive Shadow" checked={obj.receiveShadow} onChange={() => update(obj.id, { receiveShadow: !obj.receiveShadow })} />
      </div>
    </div>
  );
}

function LightObjectPanel({ light, update }: { light: SceneLight; update: (id: string, p: Partial<SceneLight>) => void }) {
  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Light · {light.type}</div>
        <input value={light.name} onChange={(e) => update(light.id, { name: e.target.value })} aria-label="Light name"
          className="w-full bg-white/5 text-xs font-mono py-1.5 px-2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>
      <ColorRow label="Color" value={light.color} onChange={(c) => update(light.id, { color: c })} />
      <Slider label="Intensity" value={light.intensity} min={0} max={10} step={0.05} onChange={(v) => update(light.id, { intensity: v })} />
      {light.type !== "ambient" && (
        <Vec3Input label="Position" value={light.position} onChange={(v) => update(light.id, { position: v })} />
      )}
      {(light.type === "point" || light.type === "spot") && (
        <>
          <Slider label="Distance" value={light.distance ?? 0} min={0} max={50} step={0.5} onChange={(v) => update(light.id, { distance: v })} />
          <Slider label="Decay" value={light.decay ?? 1} min={0} max={3} step={0.05} onChange={(v) => update(light.id, { decay: v })} />
        </>
      )}
      {light.type === "spot" && (
        <>
          <Slider label="Angle (rad)" value={light.angle ?? 0} min={0.05} max={Math.PI / 2} step={0.01} onChange={(v) => update(light.id, { angle: v })} />
          <Slider label="Penumbra" value={light.penumbra ?? 0} min={0} max={1} onChange={(v) => update(light.id, { penumbra: v })} />
        </>
      )}
      {light.type !== "ambient" && (
        <Toggle label="Cast Shadow" checked={light.castShadow} onChange={() => update(light.id, { castShadow: !light.castShadow })} />
      )}
    </div>
  );
}

function MaterialPanel({ obj, update }: { obj: SceneObject; update: (id: string, p: Partial<SceneObject>) => void }) {
  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Presets</div>
        <div className="grid grid-cols-3 gap-1.5">
          {MATERIAL_PRESETS.map((m) => (
            <button
              key={m.id}
              onClick={() => update(obj.id, m.preset)}
              className="aspect-square rounded-sm border border-border hover:border-white/40 transition-colors relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={m.label}
              aria-label={`Apply ${m.label} material`}
              style={{
                background: m.preset.transmission && m.preset.transmission > 0.5
                  ? `linear-gradient(135deg, ${m.preset.color}80, #ffffff20)`
                  : m.preset.metalness > 0.7
                    ? `radial-gradient(circle at 30% 30%, ${m.preset.color}, #000)`
                    : m.preset.color,
                boxShadow: m.preset.emissiveIntensity ? `inset 0 0 16px ${m.preset.emissive}` : undefined,
              }}
            >
              <span className="absolute bottom-0.5 left-1 right-1 text-[8px] font-mono uppercase tracking-wider text-white/90 truncate text-left mix-blend-difference">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <ColorRow label="Color" value={obj.color} onChange={(c) => update(obj.id, { color: c })} />
        <Slider label="Metalness" value={obj.metalness} onChange={(v) => update(obj.id, { metalness: v })} />
        <Slider label="Roughness" value={obj.roughness} onChange={(v) => update(obj.id, { roughness: v })} />
        <Slider label="Env Intensity" value={obj.envMapIntensity} min={0} max={3} step={0.05} onChange={(v) => update(obj.id, { envMapIntensity: v })} />
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Advanced</div>
        <Slider label="Clearcoat" value={obj.clearcoat} onChange={(v) => update(obj.id, { clearcoat: v })} />
        <Slider label="Clearcoat Rough" value={obj.clearcoatRoughness} onChange={(v) => update(obj.id, { clearcoatRoughness: v })} />
        <Slider label="Transmission" value={obj.transmission} onChange={(v) => update(obj.id, { transmission: v })} />
        <Slider label="IOR" value={obj.ior} min={1} max={2.5} step={0.01} onChange={(v) => update(obj.id, { ior: v })} />
        <Slider label="Thickness" value={obj.thickness} min={0} max={5} step={0.05} onChange={(v) => update(obj.id, { thickness: v })} />
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Emissive</div>
        <ColorRow label="Color" value={obj.emissive} onChange={(c) => update(obj.id, { emissive: c })} />
        <Slider label="Intensity" value={obj.emissiveIntensity} min={0} max={5} step={0.05} onChange={(v) => update(obj.id, { emissiveIntensity: v })} />
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Texture</div>
        <div className="grid grid-cols-5 gap-1">
          {TEXTURE_PRESETS.map((t) => (
            <button
              key={t.id}
              onClick={() => update(obj.id, { texture: t.id as TextureId })}
              aria-label={`Apply ${t.label} texture`}
              className={cn(
                "aspect-square rounded-sm border text-[8px] font-mono uppercase tracking-wider relative overflow-hidden",
                obj.texture === t.id ? "border-white" : "border-border hover:border-white/40"
              )}
              style={{
                background: textureSwatch(t.id),
              }}
              title={t.label}
            />
          ))}
        </div>
        {obj.texture !== "none" && (
          <Slider label="Repeat" value={obj.textureRepeat} min={0.5} max={10} step={0.5} onChange={(v) => update(obj.id, { textureRepeat: v })} />
        )}
      </div>
    </div>
  );
}

function textureSwatch(id: string): string {
  switch (id) {
    case "checker": return "repeating-conic-gradient(#fff 0 25%, #222 0 50%) 50% / 16px 16px";
    case "grid": return "linear-gradient(#222 1px, transparent 1px) 0 0/8px 8px, linear-gradient(90deg, #222 1px, #fff 1px) 0 0/8px 8px";
    case "dots": return "radial-gradient(#fff 25%, #111 26%) 0 0/8px 8px";
    case "stripes": return "repeating-linear-gradient(0deg, #fff 0 4px, #222 4px 8px)";
    case "noise": return "linear-gradient(135deg, #888, #444)";
    case "carbon": return "linear-gradient(135deg, #1a1a1a 25%, #404040 25%, #404040 50%, #1a1a1a 50%) 0 0/8px 8px";
    case "brick": return "linear-gradient(#a0421a, #a0421a) 0 0/12px 6px, #3a1a10";
    case "concrete": return "linear-gradient(135deg, #888, #666)";
    case "circuit": return "linear-gradient(#031010, #062018)";
    default: return "linear-gradient(135deg, #222, #444)";
  }
}

function AnimatePanel({ obj, update }: { obj: SceneObject; update: (id: string, p: Partial<SceneObject>) => void }) {
  return (
    <div className="px-4 py-4 space-y-4">
      <Vec3Input label="Spin (rad/s)" value={obj.spin} onChange={(v) => update(obj.id, { spin: v })} step={0.05} />
      <Slider label="Bob amplitude" value={obj.bob} min={0} max={2} step={0.05} onChange={(v) => update(obj.id, { bob: v })} />
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Spin: continuous rotation per axis. Bob: gentle vertical float.
      </p>
    </div>
  );
}

function WorldPanel() {
  const env = useEditor((s) => s.environment);
  const setEnv = useEditor((s) => s.setEnvironment);
  const envI = useEditor((s) => s.envIntensity);
  const setEnvI = useEditor((s) => s.setEnvIntensity);
  const bg = useEditor((s) => s.background);
  const setBg = useEditor((s) => s.setBackground);
  const showGrid = useEditor((s) => s.showGrid);
  const toggleGrid = useEditor((s) => s.toggleGrid);
  const showShadows = useEditor((s) => s.showShadows);
  const toggleShadows = useEditor((s) => s.toggleShadows);
  const tone = useEditor((s) => s.toneMapping);
  const setTone = useEditor((s) => s.setToneMapping);
  const exposure = useEditor((s) => s.exposure);
  const setExposure = useEditor((s) => s.setExposure);

  return (
    <>
      <Section title="Environment">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">HDRI Preset</label>
          <select value={env} onChange={(e) => setEnv(e.target.value as EnvPreset)}
            className="w-full bg-white/5 text-xs font-mono py-1.5 px-2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {ENV_OPTIONS.map((e) => <option key={e} value={e} className="bg-background">{e}</option>)}
          </select>
        </div>
        <Slider label="Env Intensity" value={envI} min={0} max={3} step={0.05} onChange={setEnvI} />
        <ColorRow label="Background" value={bg} onChange={setBg} />
      </Section>
      <Section title="Camera">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Tone Mapping</label>
          <select value={tone} onChange={(e) => setTone(e.target.value as ToneMapping)}
            className="w-full bg-white/5 text-xs font-mono py-1.5 px-2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {TONE_OPTIONS.map((e) => <option key={e} value={e} className="bg-background">{e}</option>)}
          </select>
        </div>
        <Slider label="Exposure" value={exposure} min={0} max={3} step={0.05} onChange={setExposure} />
      </Section>
      <Section title="Render">
        <Toggle label="Grid" checked={showGrid} onChange={toggleGrid} />
        <Toggle label="Shadows" checked={showShadows} onChange={toggleShadows} />
      </Section>
    </>
  );
}

function FxPanel() {
  const fx = useEditor((s) => s.fx);
  const setFx = useEditor((s) => s.setFx);
  return (
    <div className="px-4 py-3 space-y-3">
      <Toggle label="Bloom" checked={fx.bloom} onChange={() => setFx({ bloom: !fx.bloom })} />
      {fx.bloom && <Slider label="Bloom Intensity" value={fx.bloomIntensity} min={0} max={3} onChange={(v) => setFx({ bloomIntensity: v })} />}
      <Toggle label="Chromatic Aberration" checked={fx.chromatic} onChange={() => setFx({ chromatic: !fx.chromatic })} />
      {fx.chromatic && <Slider label="CA Offset" value={fx.chromaticOffset} min={0} max={0.01} step={0.0005} onChange={(v) => setFx({ chromaticOffset: v })} />}
      <Toggle label="Depth of Field" checked={fx.dof} onChange={() => setFx({ dof: !fx.dof })} />
      {fx.dof && <>
        <Slider label="Focus Distance" value={fx.dofFocus} min={0} max={1} step={0.005} onChange={(v) => setFx({ dofFocus: v })} />
        <Slider label="Focal Length" value={fx.dofFocalLength} min={0.005} max={0.3} step={0.005} onChange={(v) => setFx({ dofFocalLength: v })} />
        <Slider label="Bokeh Scale" value={fx.dofBokeh} min={0} max={15} step={0.1} onChange={(v) => setFx({ dofBokeh: v })} />
      </>}
      <Toggle label="Pixelate" checked={fx.pixelate} onChange={() => setFx({ pixelate: !fx.pixelate })} />
      {fx.pixelate && <Slider label="Pixel Size" value={fx.pixelSize} min={1} max={20} step={1} onChange={(v) => setFx({ pixelSize: v })} />}
      <Toggle label="Noise" checked={fx.noise} onChange={() => setFx({ noise: !fx.noise })} />
      {fx.noise && <Slider label="Noise Opacity" value={fx.noiseOpacity} min={0} max={1} onChange={(v) => setFx({ noiseOpacity: v })} />}
      <Toggle label="Vignette" checked={fx.vignette} onChange={() => setFx({ vignette: !fx.vignette })} />
    </div>
  );
}
