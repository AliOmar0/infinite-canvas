# Infinite Studio

A browser-native, real-time 3D engine for cinematic design. Compose primitives and 3D type, apply 20+ PBR material presets, light scenes with cinematic rigs, and stack post-FX (bloom, DOF, chromatic aberration, pixelate, noise) — all at 60 FPS in your tab.

> No installs. No accounts. WebGL 2 + React Three Fiber.

## ✨ Highlights

- **Real-time WebGL viewport** with orbit controls, gizmos and shadows
- **20 PBR material presets** — chrome, gold, glass, hologram, lava, obsidian, ice…
- **20+ procedural textures** generated on the GPU (carbon fiber, brick, circuit, concrete…)
- **Cinematic lighting rigs** + per-light editor (directional, point, spot, ambient)
- **Post-FX stack** — bloom, depth-of-field, chromatic aberration, vignette, pixelate, noise
- **22 ready-to-remix templates** with curated lights & post-FX
- **Live 3D type** with bevel, extrusion, and any preset material
- Keyboard shortcuts: `Space` play/pause · `T` templates · `Del` remove · `⌘D` duplicate

## 🚀 Quick start

```bash
bun install
bun run dev
```

Open <http://localhost:8080> and hit **Launch the Studio**.

### Build

```bash
bun run build      # production build
bun run preview    # preview the production build locally
```

## 🧱 Stack

- **TanStack Start** v1 (file-based routing, SSR-capable)
- **React 19** + **Vite 7**
- **React Three Fiber** + `@react-three/drei` + `@react-three/postprocessing`
- **Tailwind CSS v4** (via `src/styles.css` with native `@theme`)
- **Zustand** for editor state

## 📚 Documentation

- [Getting Started](./docs/GETTING_STARTED.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment](./docs/DEPLOYMENT.md)

## 🌐 Deploy to GitHub Pages

A workflow is included at [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml). Push to `main` and enable Pages → "GitHub Actions" in your repo settings. See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for the full guide.

## 🤝 Contributing

PRs welcome. Please run `bun run lint` before submitting.

## 📄 License

MIT
