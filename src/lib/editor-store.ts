import { create } from "zustand";

export type PrimitiveType = "box" | "sphere" | "cylinder" | "cone" | "torus" | "plane";

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
}

interface EditorState {
  objects: SceneObject[];
  selectedId: string | null;
  environment: "studio" | "city" | "sunset" | "warehouse" | "night";
  showGrid: boolean;
  addObject: (type: PrimitiveType) => void;
  removeObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  setEnvironment: (env: EditorState["environment"]) => void;
  toggleGrid: () => void;
  reset: () => void;
}

const counter = { n: 0 };
const uid = () => `obj_${Date.now().toString(36)}_${(counter.n++).toString(36)}`;

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
  showGrid: true,
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
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  reset: () => set({ objects: initial, selectedId: initial[1].id }),
}));
