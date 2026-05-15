# Getting Started

## Prerequisites

- **Bun** ≥ 1.1 (or Node ≥ 20 with npm/pnpm)
- A modern browser with WebGL 2 (Chrome, Edge, Firefox, Safari 16+)

## Install

```bash
bun install
```

## Develop

```bash
bun run dev
```

The dev server starts on <http://localhost:8080> with HMR.

## Project layout

```
src/
├── routes/              # File-based routes (TanStack Start)
│   ├── __root.tsx       # Root layout / <html> shell
│   ├── index.tsx        # Landing page
│   └── editor.tsx       # 3D editor
├── components/
│   ├── editor/          # Viewport, SceneTree, Properties
│   └── ui/              # shadcn/ui primitives
├── lib/
│   ├── editor-store.ts  # Zustand store (objects, lights, postFX)
│   ├── materials.ts     # PBR material presets
│   ├── textures.ts      # Procedural texture generators
│   └── templates.ts     # 22 cinematic scene templates
└── styles.css           # Tailwind v4 tokens + aurora theme
```

## Keyboard shortcuts (in the editor)

| Key       | Action            |
| --------- | ----------------- |
| `Space`   | Play / pause      |
| `T`       | Open templates    |
| `Delete`  | Delete selection  |
| `⌘ / Ctrl + D` | Duplicate    |

## Loading a template

From the landing page **Templates** section, click any tile — it loads in the editor with materials, lights and post-FX preconfigured.
