# Architecture

Infinite Studio is a single-page TanStack Start app. The 3D engine runs entirely on the client via React Three Fiber.

## Layers

```
┌────────────────────────────────────────────┐
│  routes/index.tsx        Landing page      │
│  routes/editor.tsx       Editor shell      │
├────────────────────────────────────────────┤
│  components/editor/                        │
│    Viewport.tsx  ── R3F Canvas + post-FX   │
│    SceneTree.tsx ── outliner               │
│    Properties.tsx── tabbed inspector       │
├────────────────────────────────────────────┤
│  lib/editor-store.ts (Zustand)             │
│    objects · lights · postFX · selection   │
├────────────────────────────────────────────┤
│  lib/materials.ts   PBR presets            │
│  lib/textures.ts    Canvas-based generators│
│  lib/templates.ts   Curated scenes         │
└────────────────────────────────────────────┘
```

## State model

`SceneObject` carries transform + full PBR (metalness, roughness, clearcoat, transmission, IOR, thickness, emissive) plus animation hints (`spin`, `bob`) and shadow flags.

`SceneLight` is a discriminated union: `Directional | Point | Spot | Ambient`.

`PostFX` is a single object aggregating bloom, DOF, chromatic aberration, vignette, pixelate, noise, plus exposure & tone mapping.

All mutations go through Zustand actions — no prop drilling.

## Rendering

- `<Canvas>` from `@react-three/fiber`
- Tone mapping: ACES, AgX, Neutral, Cineon, Linear
- Procedural textures generated on a 2D `<canvas>` and uploaded as `THREE.CanvasTexture`
- Post-processing via `@react-three/postprocessing` (`EffectComposer`)

## Why no backend?

Scenes live in browser memory. Export is a viewport PNG. This keeps the app deployable as static assets (GitHub Pages, Cloudflare Pages, Netlify, etc.).
