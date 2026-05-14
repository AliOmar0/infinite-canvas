import { create } from "zustand";

export type PrimitiveType =
  | "box"
  | "sphere"
  | "cylinder"
  | "cone"
  | "torus"
  | "plane"
  | "text";

export interface SceneObject {
  id: string;
  name: string;
  type: PrimitiveType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  metalness: number;
  roughness: number;
  /** Text content when type === "text" */
  text?: string;
  /** Per-axis spin speed in rad/sec */
  spin: [number, number, number];
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
}

export type EnvPreset = "studio" | "city" | "sunset" | "warehouse" | "night" | "dawn" | "forest";

export interface Template {
  id: string;
  name: string;
  tags: string[];
  background: string;
  environment: EnvPreset;
  fx: Partial<PostFX>;
  objects: Omit<SceneObject, "id">[];
}

interface EditorState {
  objects: SceneObject[];
  selectedId: string | null;
  environment: EnvPreset;
  background: string;
  showGrid: boolean;
  fx: PostFX;
  playing: boolean;
  addObject: (type: PrimitiveType) => void;
  removeObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  setEnvironment: (env: EnvPreset) => void;
  setBackground: (c: string) => void;
  toggleGrid: () => void;
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
};

const defaultObject = (type: PrimitiveType, index: number): SceneObject => ({
  id: uid(),
  name: `${type}_${String(index).padStart(2, "0")}`,
  type,
  position: [0, type === "plane" ? 0 : 0.5, 0],
  rotation: type === "plane" ? [-Math.PI / 2, 0, 0] : [0, 0, 0],
  scale: [1, 1, 1],
  color: "#e5e5e5",
  metalness: 0.4,
  roughness: 0.35,
  text: type === "text" ? "HELLO" : undefined,
  spin: [0, 0, 0],
});

const initial: SceneObject[] = [
  {
    ...defaultObject("plane", 0),
    name: "ground_00",
    scale: [20, 20, 1],
    color: "#0a0a0a",
    metalness: 0.1,
    roughness: 0.9,
  },
  {
    ...defaultObject("sphere", 1),
    name: "sphere_01",
    position: [0, 1, 0],
    color: "#f5f5f5",
    metalness: 0.9,
    roughness: 0.05,
  },
];

export const useEditor = create<EditorState>((set, get) => ({
  objects: initial,
  selectedId: initial[1].id,
  environment: "studio",
  background: "#050505",
  showGrid: true,
  fx: defaultFx,
  playing: true,
  addObject: (type) => {
    const idx = get().objects.length;
    const obj = defaultObject(type, idx);
    set((s) => ({ objects: [...s.objects, obj], selectedId: obj.id }));
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
  selectObject: (id) => set({ selectedId: id }),
  updateObject: (id, patch) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),
  setEnvironment: (env) => set({ environment: env }),
  setBackground: (c) => set({ background: c }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setFx: (patch) => set((s) => ({ fx: { ...s.fx, ...patch } })),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  loadTemplate: (t) =>
    set({
      objects: t.objects.map((o) => ({ ...o, id: uid() })),
      selectedId: null,
      environment: t.environment,
      background: t.background,
      fx: { ...defaultFx, ...t.fx },
      showGrid: false,
      playing: true,
    }),
  reset: () =>
    set({
      objects: initial,
      selectedId: initial[1].id,
      environment: "studio",
      background: "#050505",
      showGrid: true,
      fx: defaultFx,
      playing: true,
    }),
}));
