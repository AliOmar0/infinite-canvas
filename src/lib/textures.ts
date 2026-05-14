import * as THREE from "three";

export type TextureId =
  | "none"
  | "checker"
  | "grid"
  | "dots"
  | "stripes"
  | "noise"
  | "carbon"
  | "brick"
  | "concrete"
  | "circuit";

export const TEXTURE_PRESETS: { id: TextureId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "checker", label: "Checker" },
  { id: "grid", label: "Grid" },
  { id: "dots", label: "Dots" },
  { id: "stripes", label: "Stripes" },
  { id: "noise", label: "Noise" },
  { id: "carbon", label: "Carbon" },
  { id: "brick", label: "Brick" },
  { id: "concrete", label: "Concrete" },
  { id: "circuit", label: "Circuit" },
];

const cache = new Map<string, THREE.Texture>();

function makeCanvas(size = 512): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}

function paintChecker(ctx: CanvasRenderingContext2D, s: number) {
  const n = 8;
  const cs = s / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#fff" : "#222";
      ctx.fillRect(x * cs, y * cs, cs, cs);
    }
  }
}

function paintGrid(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;
  const step = s / 8;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(s, i * step); ctx.stroke();
  }
}

function paintDots(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#111"; ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "#fff";
  const n = 10, r = s / (n * 3);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    ctx.beginPath();
    ctx.arc((x + 0.5) * (s / n), (y + 0.5) * (s / n), r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintStripes(ctx: CanvasRenderingContext2D, s: number) {
  const n = 12;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? "#fff" : "#222";
    ctx.fillRect(0, (i * s) / n, s, s / n);
  }
}

function paintNoise(ctx: CanvasRenderingContext2D, s: number) {
  const img = ctx.createImageData(s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function paintCarbon(ctx: CanvasRenderingContext2D, s: number) {
  const cell = s / 16;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const off = (y % 2) * (cell / 2);
      const grad = ctx.createLinearGradient(x * cell + off, y * cell, x * cell + off + cell, y * cell + cell);
      grad.addColorStop(0, "#1a1a1a");
      grad.addColorStop(0.5, "#404040");
      grad.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = grad;
      ctx.fillRect(x * cell + off, y * cell, cell - 1, cell - 1);
    }
  }
}

function paintBrick(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#3a1a10"; ctx.fillRect(0, 0, s, s);
  const bw = s / 6, bh = s / 12;
  ctx.fillStyle = "#a0421a";
  for (let y = 0; y < 12; y++) {
    const off = (y % 2) * (bw / 2);
    for (let x = -1; x < 7; x++) {
      ctx.fillRect(x * bw + off + 2, y * bh + 2, bw - 4, bh - 4);
    }
  }
}

function paintConcrete(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#888"; ctx.fillRect(0, 0, s, s);
  const img = ctx.getImageData(0, 0, s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 60;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * s, Math.random() * s, Math.random() * 6 + 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintCircuit(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#031010"; ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "#00ffaa"; ctx.lineWidth = 2;
  const grid = s / 16;
  for (let i = 0; i < 32; i++) {
    const x = Math.floor(Math.random() * 16) * grid;
    const y = Math.floor(Math.random() * 16) * grid;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() > 0.5 ? grid * 3 : 0), y + (Math.random() > 0.5 ? 0 : grid * 3));
    ctx.stroke();
  }
  ctx.fillStyle = "#00ffaa";
  for (let i = 0; i < 24; i++) {
    ctx.fillRect(Math.floor(Math.random() * 16) * grid - 3, Math.floor(Math.random() * 16) * grid - 3, 6, 6);
  }
}

const PAINTERS: Record<Exclude<TextureId, "none">, (ctx: CanvasRenderingContext2D, s: number) => void> = {
  checker: paintChecker,
  grid: paintGrid,
  dots: paintDots,
  stripes: paintStripes,
  noise: paintNoise,
  carbon: paintCarbon,
  brick: paintBrick,
  concrete: paintConcrete,
  circuit: paintCircuit,
};

export function getTexture(id: TextureId): THREE.Texture | null {
  if (id === "none") return null;
  if (cache.has(id)) return cache.get(id)!;
  const { canvas, ctx } = makeCanvas(512);
  PAINTERS[id](ctx, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(id, tex);
  return tex;
}
