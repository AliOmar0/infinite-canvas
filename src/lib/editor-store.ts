import { create } from "zustand";
import type { TextureId } from "./textures";

export type PrimitiveType =
  | "box"
  | "sphere"
  | "cylinder"
  | "cone"
  | "torus"
  | "torusKnot"
  | "icosahedron"
  | "octahedron"
  | "dodecahedron"
  | "plane"
  | "text";

export interface SceneObject {
  id: string;
  name: string;
  type: PrimitiveType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  /** Base color */
  color: string;
  metalness: number;
  roughness: number;
  /** Emissive color & intensity for glow */
  emissive: string;
  emissiveIntensity: number;
  /** Clearcoat layer */
  clearcoat: number;
  clearcoatRoughness: number;
  /** Refraction / glass */
  transmission: number;
  ior: number;
  thickness: number;
  /** Environment reflection multiplier */
  envMapIntensity: number;
  /** Texture preset id */
  texture: TextureId;
  textureRepeat: number;
  /** Text content when type === "text" */
  text?: string;
  /** Per-axis spin speed in rad/sec */
  spin: [number, number, number];
  /** Optional gentle vertical bobbing */
  bob: number;
  /** Cast/receive shadows */
  castShadow: boolean;
  receiveShadow: boolean;
}

export type LightType = "directional" | "point" | "spot" | "ambient";

export interface SceneLight {
  id: string;
  name: string;
  type: LightType;
  position: [number, number, number];
  color: string;
  intensity: number;
  castShadow: boolean;
  /** spot only */
  angle?: number;
  penumbra?: number;
  /** point/spot only */
  distance?: number;
  decay?: number;
}

export interface PostFX {
  bloom: boolean;
  bloomIntensity: number;
  chromatic: boolean;
  chromaticOffset: number;
  vignette: boolean;
  noise: boolean;
  noiseOpacity: number;
  pixelate: boolean;
  pixelSize: number;
  dof: boolean;
  dofFocus: number;
  dofBokeh: number;
}

export type EnvPreset =
  | "studio" | "city" | "sunset" | "warehouse" | "night" | "dawn" | "forest" | "park" | "lobby" | "apartment";

export type ToneMapping = "neutral" | "aces" | "agx" | "cineon" | "linear";

export interface Template {
  id: string;
  name: string;
  tags: string[];
  background: string;
  environment: EnvPreset;
  fx: Partial<PostFX>;
  toneMapping?: ToneMapping;
  exposure?: number;
  showGrid?: boolean;
  lights?: Omit<SceneLight, "id">[];
  objects: Omit<SceneObject, "id">[];
}

interface EditorState {
  objects: SceneObject[];
  lights: SceneLight[];
  selectedId: string | null;
  selectedLightId: string | null;
  environment: EnvPreset;
  envIntensity: number;
  background: string;
  showGrid: boolean;
  showShadows: boolean;
  toneMapping: ToneMapping;
  exposure: number;
  fx: PostFX;
  playing: boolean;

  addObject: (type: PrimitiveType) => void;
  removeObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;

  addLight: (type: LightType) => void;
  removeLight: (id: string) => void;
  selectLight: (id: string | null) => void;
  updateLight: (id: string, patch: Partial<SceneLight>) => void;

  setEnvironment: (env: EnvPreset) => void;
  setEnvIntensity: (n: number) => void;
  setBackground: (c: string) => void;
  toggleGrid: () => void;
  toggleShadows: () => void;
  setToneMapping: (t: ToneMapping) => void;
  setExposure: (n: number) => void;
  setFx: (patch: Partial<PostFX>) => void;
  togglePlaying: () => void;
  loadTemplate: (t: Template) => void;
  reset: () => void;
}

const counter = { n: 0 };
const uid = () => `obj_${Date.now().toString(36)}_${(counter.n++).toString(36)}`;

const defaultFx: PostFX = {
  bloom: true,
  bloomIntensity: 0.6,
  chromatic: false,
  chromaticOffset: 0.002,
  vignette: true,
  noise: false,
  noiseOpacity: 0.15,
  pixelate: false,
  pixelSize: 6,
  dof: false,
  dofFocus: 8,
  dofBokeh: 3,
};

const baseObjectDefaults = {
  emissive: "#000000",
  emissiveIntensity: 0,
  clearcoat: 0,
  clearcoatRoughness: 0.1,
  transmission: 0,
  ior: 1.5,
  thickness: 0.5,
  envMapIntensity: 1,
  texture: "none" as TextureId,
  textureRepeat: 1,
  bob: 0,
  castShadow: true,
  receiveShadow: true,
};

const defaultObject = (type: PrimitiveType, index: number): SceneObject => ({
  id: uid(),
  name: `${type}_${String(index).padStart(2, "0")}`,
  type,
  position: [0, type === "plane" ? 0 : 0.6, 0],
  rotation: type === "plane" ? [-Math.PI / 2, 0, 0] : [0, 0, 0],
  scale: [1, 1, 1],
  color: "#e5e5e5",
  metalness: 0.4,
  roughness: 0.35,
  text: type === "text" ? "HELLO" : undefined,
  spin: [0, 0, 0],
  ...baseObjectDefaults,
});

const initialObjects: SceneObject[] = [
  {
    ...defaultObject("plane", 0),
    name: "ground_00",
    scale: [30, 30, 1],
    color: "#0a0a0a",
    metalness: 0.1,
    roughness: 0.9,
    castShadow: false,
  },
  {
    ...defaultObject("sphere", 1),
    name: "hero_sphere",
    position: [0, 1.2, 0],
    color: "#f5f5f5",
    metalness: 1,
    roughness: 0.05,
    envMapIntensity: 1.4,
  },
];

const initialLights: SceneLight[] = [
  { id: uid(), name: "ambient", type: "ambient", position: [0, 0, 0], color: "#ffffff", intensity: 0.25, castShadow: false },
  { id: uid(), name: "key_light", type: "directional", position: [6, 9, 5], color: "#ffffff", intensity: 1.4, castShadow: true },
  { id: uid(), name: "rim_light", type: "directional", position: [-5, 4, -4], color: "#88aaff", intensity: 0.7, castShadow: false },
];

export const useEditor = create<EditorState>((set, get) => ({
  objects: initialObjects,
  lights: initialLights,
  selectedId: initialObjects[1].id,
  selectedLightId: null,
  environment: "studio",
  envIntensity: 1,
  background: "#050505",
  showGrid: true,
  showShadows: true,
  toneMapping: "aces",
  exposure: 1,
  fx: defaultFx,
  playing: true,

  addObject: (type) => {
    const idx = get().objects.length;
    const obj = defaultObject(type, idx);
    set((s) => ({ objects: [...s.objects, obj], selectedId: obj.id, selectedLightId: null }));
  },
  removeObject: (id) =>
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  duplicateObject: (id) => {
    const o = get().objects.find((x) => x.id === id);
    if (!o) return;
    const copy: SceneObject = {
      ...o,
      id: uid(),
      name: `${o.name}_copy`,
      position: [o.position[0] + 1, o.position[1], o.position[2] + 1],
    };
    set((s) => ({ objects: [...s.objects, copy], selectedId: copy.id }));
  },
  selectObject: (id) => set({ selectedId: id, selectedLightId: id ? null : get().selectedLightId }),
  updateObject: (id, patch) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),

  addLight: (type) => {
    const light: SceneLight = {
      id: uid(),
      name: `${type}_${get().lights.length.toString().padStart(2, "0")}`,
      type,
      position: type === "ambient" ? [0, 0, 0] : [3, 5, 3],
      color: "#ffffff",
      intensity: type === "ambient" ? 0.3 : 1,
      castShadow: type === "directional" || type === "spot",
      angle: type === "spot" ? Math.PI / 6 : undefined,
      penumbra: type === "spot" ? 0.3 : undefined,
      distance: type === "point" || type === "spot" ? 20 : undefined,
      decay: type === "point" || type === "spot" ? 1.5 : undefined,
    };
    set((s) => ({ lights: [...s.lights, light], selectedLightId: light.id, selectedId: null }));
  },
  removeLight: (id) =>
    set((s) => ({
      lights: s.lights.filter((l) => l.id !== id),
      selectedLightId: s.selectedLightId === id ? null : s.selectedLightId,
    })),
  selectLight: (id) => set({ selectedLightId: id, selectedId: id ? null : get().selectedId }),
  updateLight: (id, patch) =>
    set((s) => ({ lights: s.lights.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),

  setEnvironment: (env) => set({ environment: env }),
  setEnvIntensity: (n) => set({ envIntensity: n }),
  setBackground: (c) => set({ background: c }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleShadows: () => set((s) => ({ showShadows: !s.showShadows })),
  setToneMapping: (t) => set({ toneMapping: t }),
  setExposure: (n) => set({ exposure: n }),
  setFx: (patch) => set((s) => ({ fx: { ...s.fx, ...patch } })),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  loadTemplate: (t) =>
    set({
      objects: t.objects.map((o) => ({ ...baseObjectDefaults, ...o, id: uid() } as SceneObject)),
      lights: (t.lights ?? initialLights.map((l) => ({ ...l }))).map((l) => ({ ...l, id: uid() })),
      selectedId: null,
      selectedLightId: null,
      environment: t.environment,
      background: t.background,
      fx: { ...defaultFx, ...t.fx },
      toneMapping: t.toneMapping ?? "aces",
      exposure: t.exposure ?? 1,
      showGrid: t.showGrid ?? false,
      playing: true,
    }),
  reset: () =>
    set({
      objects: initialObjects.map((o) => ({ ...o, id: uid() })),
      lights: initialLights.map((l) => ({ ...l, id: uid() })),
      selectedId: null,
      selectedLightId: null,
      environment: "studio",
      envIntensity: 1,
      background: "#050505",
      showGrid: true,
      showShadows: true,
      toneMapping: "aces",
      exposure: 1,
      fx: defaultFx,
      playing: true,
    }),
}));
