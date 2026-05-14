import type { SceneObject } from "./editor-store";

export type MaterialPreset = Pick<
  SceneObject,
  | "color"
  | "metalness"
  | "roughness"
  | "emissive"
  | "emissiveIntensity"
  | "clearcoat"
  | "clearcoatRoughness"
  | "transmission"
  | "ior"
  | "thickness"
  | "envMapIntensity"
  | "texture"
  | "textureRepeat"
>;

export interface MaterialPresetEntry {
  id: string;
  label: string;
  preset: MaterialPreset;
}

const base: MaterialPreset = {
  color: "#cccccc",
  metalness: 0,
  roughness: 0.5,
  emissive: "#000000",
  emissiveIntensity: 0,
  clearcoat: 0,
  clearcoatRoughness: 0.1,
  transmission: 0,
  ior: 1.5,
  thickness: 0.5,
  envMapIntensity: 1,
  texture: "none",
  textureRepeat: 1,
};

export const MATERIAL_PRESETS: MaterialPresetEntry[] = [
  { id: "chrome", label: "Chrome",
    preset: { ...base, color: "#f5f5f5", metalness: 1, roughness: 0.05, envMapIntensity: 1.4 } },
  { id: "gold", label: "Gold",
    preset: { ...base, color: "#ffcc66", metalness: 1, roughness: 0.18, envMapIntensity: 1.2 } },
  { id: "copper", label: "Copper",
    preset: { ...base, color: "#c87533", metalness: 1, roughness: 0.22 } },
  { id: "brushed", label: "Brushed Steel",
    preset: { ...base, color: "#aab0b6", metalness: 1, roughness: 0.45 } },
  { id: "glass", label: "Glass",
    preset: { ...base, color: "#ffffff", metalness: 0, roughness: 0.02, transmission: 1, ior: 1.52, thickness: 1.2, clearcoat: 1 } },
  { id: "frosted", label: "Frosted Glass",
    preset: { ...base, color: "#e0eaff", metalness: 0, roughness: 0.45, transmission: 0.9, ior: 1.45, thickness: 1.5 } },
  { id: "plastic", label: "Plastic",
    preset: { ...base, color: "#ff3b6b", metalness: 0, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.1 } },
  { id: "ceramic", label: "Ceramic",
    preset: { ...base, color: "#f7f3ee", metalness: 0, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 } },
  { id: "rubber", label: "Rubber",
    preset: { ...base, color: "#1a1a1a", metalness: 0, roughness: 0.95 } },
  { id: "concrete", label: "Concrete",
    preset: { ...base, color: "#9a9a9a", metalness: 0, roughness: 0.85, texture: "concrete", textureRepeat: 2 } },
  { id: "carbon", label: "Carbon Fiber",
    preset: { ...base, color: "#222222", metalness: 0.5, roughness: 0.3, texture: "carbon", textureRepeat: 3, clearcoat: 0.6 } },
  { id: "neon", label: "Neon",
    preset: { ...base, color: "#000000", metalness: 0, roughness: 0.4, emissive: "#ff2dff", emissiveIntensity: 2 } },
  { id: "hologram", label: "Hologram",
    preset: { ...base, color: "#22e0ff", metalness: 0.6, roughness: 0.2, emissive: "#22e0ff", emissiveIntensity: 0.6, transmission: 0.4, clearcoat: 1 } },
  { id: "lava", label: "Lava",
    preset: { ...base, color: "#ff3000", metalness: 0, roughness: 0.7, emissive: "#ff6a00", emissiveIntensity: 1.6, texture: "noise", textureRepeat: 4 } },
  { id: "ice", label: "Ice",
    preset: { ...base, color: "#cfe9ff", metalness: 0, roughness: 0.1, transmission: 0.85, ior: 1.31, thickness: 1.2, clearcoat: 1 } },
  { id: "wax", label: "Wax",
    preset: { ...base, color: "#ffe9d0", metalness: 0, roughness: 0.4, transmission: 0.4, thickness: 1, clearcoat: 0.4 } },
  { id: "velvet", label: "Velvet",
    preset: { ...base, color: "#5a0e3a", metalness: 0, roughness: 0.95, emissive: "#2a0418", emissiveIntensity: 0.2 } },
  { id: "obsidian", label: "Obsidian",
    preset: { ...base, color: "#0a0a0a", metalness: 0.9, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 } },
  { id: "iridescent", label: "Iridescent",
    preset: { ...base, color: "#a3b6ff", metalness: 1, roughness: 0.15, clearcoat: 1, envMapIntensity: 1.6 } },
  { id: "matte-black", label: "Matte Black",
    preset: { ...base, color: "#0a0a0a", metalness: 0, roughness: 1 } },
];
