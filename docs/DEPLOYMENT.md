# Deployment

## GitHub Pages (workflow included)

The repo ships with [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml). It builds the app on every push to `main` and publishes the static output to GitHub Pages.

### One-time setup

1. Push the repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. (Optional) If your repo is served from `https://<user>.github.io/<repo>/` rather than a custom domain, set the env var `BASE_PATH=/<repo>/` in the workflow (already wired — just edit the default).

### Trigger

Push to `main` — or run the workflow manually from the **Actions** tab.

> **Heads up:** TanStack Start can run as a server (Cloudflare Workers, Node) or as a fully client-rendered SPA. Infinite Studio has no server functions, so the build output works as a static SPA on Pages. If you later add server-side logic, prefer Cloudflare Pages or Workers — Pages will not run it.

## Cloudflare Pages / Workers

Already configured via `wrangler.jsonc`. Use:

```bash
bunx wrangler deploy
```

## Netlify / Vercel

Both auto-detect Vite. Set:

- **Build command:** `bun run build`
- **Output directory:** `dist`

A SPA fallback is recommended (`/* /index.html 200`) since the editor route is client-rendered.
