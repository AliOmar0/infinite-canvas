import type { Template } from "./editor-store";

export const TEMPLATES: Template[] = [
  {
    id: "modern-forms",
    name: "Modern Forms",
    tags: ["abstract", "3d", "collection"],
    background: "#0a0a0a",
    environment: "studio",
    fx: { bloom: true, bloomIntensity: 0.5, vignette: true },
    objects: [
      {
        name: "ground", type: "plane",
        position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], scale: [20, 20, 1],
        color: "#0a0a0a", metalness: 0.2, roughness: 0.7, spin: [0, 0, 0],
      },
      {
        name: "sphere_pink", type: "sphere",
        position: [-2, 0.8, 0.5], rotation: [0, 0, 0], scale: [1.2, 1.2, 1.2],
        color: "#ff2d8a", metalness: 0.9, roughness: 0.1, spin: [0, 0.4, 0],
      },
      {
        name: "torus_yellow", type: "torus",
        position: [1.5, 1, -0.5], rotation: [0.5, 0, 0], scale: [1.4, 1.4, 1.4],
        color: "#f7c948", metalness: 0.85, roughness: 0.15, spin: [0.3, 0.6, 0],
      },
      {
        name: "cone_blue", type: "cone",
        position: [0, 1.2, 1.5], rotation: [0, 0, 0], scale: [1, 1.6, 1],
        color: "#2563eb", metalness: 0.7, roughness: 0.25, spin: [0, 0.5, 0],
      },
    ],
  },
  {
    id: "liquid-metal",
    name: "Liquid Metal",
    tags: ["interactive", "abstract", "effect"],
    background: "#000000",
    environment: "warehouse",
    fx: { bloom: true, bloomIntensity: 1.1, chromatic: true, chromaticOffset: 0.0025, vignette: true },
    objects: [
      {
        name: "blob", type: "sphere",
        position: [0, 1, 0], rotation: [0, 0, 0], scale: [1.8, 1.8, 1.8],
        color: "#ffffff", metalness: 1, roughness: 0.02, spin: [0.1, 0.4, 0.1],
      },
      {
        name: "ring", type: "torus",
        position: [0, 1, 0], rotation: [Math.PI / 2, 0, 0], scale: [2.6, 2.6, 2.6],
        color: "#9ca3af", metalness: 1, roughness: 0.05, spin: [0, 0.2, 0],
      },
    ],
  },
  {
    id: "system-error",
    name: "System Error",
    tags: ["halftone", "monitor", "classic"],
    background: "#0019ff",
    environment: "night",
    fx: { bloom: false, pixelate: true, pixelSize: 8, vignette: true, noise: true, noiseOpacity: 0.2 },
    objects: [
      {
        name: "title", type: "text", text: "SYSTEM",
        position: [0, 1.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1],
        color: "#ffffff", metalness: 0, roughness: 1, spin: [0, 0, 0],
      },
      {
        name: "subtitle", type: "text", text: "ERROR",
        position: [0, 0.4, 0], rotation: [0, 0, 0], scale: [0.7, 0.7, 0.7],
        color: "#ffffff", metalness: 0, roughness: 1, spin: [0, 0, 0],
      },
    ],
  },
  {
    id: "acid-skull",
    name: "Acid Pop",
    tags: ["toon", "artwork", "3d"],
    background: "#ff00aa",
    environment: "sunset",
    fx: { bloom: true, bloomIntensity: 1.2, chromatic: true, chromaticOffset: 0.003 },
    objects: [
      {
        name: "core", type: "torus",
        position: [0, 1, 0], rotation: [0.6, 0, 0], scale: [1.6, 1.6, 1.6],
        color: "#84ff00", metalness: 0.7, roughness: 0.2, spin: [0.2, 0.4, 0],
      },
      {
        name: "halo", type: "torus",
        position: [0, 1, 0], rotation: [0, 0, 0], scale: [2.4, 2.4, 2.4],
        color: "#000000", metalness: 0.1, roughness: 0.6, spin: [0, -0.3, 0],
      },
    ],
  },
  {
    id: "hello",
    name: "Say Hello",
    tags: ["text", "wide-angle", "serif"],
    background: "#7cc1ff",
    environment: "city",
    fx: { bloom: true, bloomIntensity: 0.7, vignette: false },
    objects: [
      {
        name: "ground", type: "plane",
        position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], scale: [40, 40, 1],
        color: "#7cc1ff", metalness: 0.1, roughness: 0.8, spin: [0, 0, 0],
      },
      {
        name: "hello", type: "text", text: "hello",
        position: [0, 1.2, 0], rotation: [0, 0, 0], scale: [1.4, 1.4, 1.4],
        color: "#ffffff", metalness: 0.2, roughness: 0.6, spin: [0, 0.3, 0],
      },
    ],
  },
  {
    id: "dream",
    name: "Dream",
    tags: ["chrome", "glow", "gothic"],
    background: "#0a0011",
    environment: "night",
    fx: { bloom: true, bloomIntensity: 1.4, chromatic: true, chromaticOffset: 0.004, vignette: true },
    objects: [
      {
        name: "stack_a", type: "box",
        position: [-1, 0.8, 0], rotation: [0.3, 0.5, 0], scale: [1, 0.4, 1.4],
        color: "#ffd1f7", metalness: 1, roughness: 0.1, spin: [0, 0.4, 0],
      },
      {
        name: "stack_b", type: "box",
        position: [0, 1.2, 0], rotation: [0.4, 0.6, 0], scale: [1, 0.4, 1.4],
        color: "#a78bfa", metalness: 1, roughness: 0.1, spin: [0, 0.4, 0],
      },
      {
        name: "stack_c", type: "box",
        position: [1, 1.6, 0], rotation: [0.5, 0.7, 0], scale: [1, 0.4, 1.4],
        color: "#fde68a", metalness: 1, roughness: 0.1, spin: [0, 0.4, 0],
      },
    ],
  },
];
