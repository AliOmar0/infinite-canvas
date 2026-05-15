import { existsSync, readdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const clientDir = join(process.cwd(), "dist", "client");
const assetsDir = join(clientDir, "assets");
const basePath = process.env.BASE_PATH || "/";

if (!existsSync(assetsDir)) {
  throw new Error("Missing dist/client/assets. Run the Vite build before generating GitHub Pages files.");
}

const files = readdirSync(assetsDir);
const entryScript = files.find((file) => /^index-[\w-]+\.js$/.test(file) && file !== "index-Cm4Ec_p7.js");
const cssFile = files.find((file) => /^styles-[\w-]+\.css$/.test(file));

if (!entryScript) {
  throw new Error("Could not find the generated browser entry script in dist/client/assets.");
}

if (!cssFile) {
  throw new Error("Could not find the generated stylesheet in dist/client/assets.");
}

const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
const asset = (file: string) => `${normalizedBase}assets/${file}`;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Infinite Studio — Browser-native creative engine</title>
    <meta name="description" content="A high-performance creative engine for cinematic motion and AI-assisted 3D design — directly in your browser." />
    <meta property="og:title" content="Infinite Studio — Browser-native creative engine" />
    <meta property="og:description" content="Cinematic 3D and AI-assisted visual composition. Real-time, browser-native, production-ready." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="${asset(cssFile)}" />
    <script type="module" crossorigin src="${asset(entryScript)}"></script>
  </head>
  <body>
  </body>
</html>
`;

writeFileSync(join(clientDir, "index.html"), html);
copyFileSync(join(clientDir, "index.html"), join(clientDir, "404.html"));
writeFileSync(join(clientDir, ".nojekyll"), "");

console.log(`Generated GitHub Pages index.html using ${entryScript} and ${cssFile}`);
