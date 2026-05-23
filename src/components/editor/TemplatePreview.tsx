import type { Template, SceneObject } from "@/lib/editor-store";

/**
 * Cinematic SVG mini-scene preview for a template.
 * - Auto-fits all objects into the frame
 * - Iso-ish projection with depth sort, drop shadows, and floor reflections
 * - Rim glow from emissive objects and colored lights
 * - Sky gradient derived from background + dominant light color
 */
export function TemplatePreview({ t }: { t: Template }) {
  const W = 320;
  const H = 180;

  // --- Lighting / palette ---------------------------------------------------
  const bg = t.background || "#0a0a0a";
  const isLightBg = luminance(bg) > 0.55;
  const accent =
    t.objects.find((o) => (o.emissiveIntensity ?? 0) > 0.3)?.emissive ??
    t.lights?.find((l) => l.type !== "ambient" && l.color && l.color !== "#ffffff")?.color ??
    (isLightBg ? "#7aa7ff" : "#ffffff");
  const secondary =
    t.lights?.filter((l) => l.type !== "ambient" && l.color !== "#ffffff" && l.color !== accent)[0]?.color ??
    shift(accent, 40);
  const horizon = isLightBg ? lighten(bg, 0.1) : lighten(bg, 0.18);
  const floorColor = isLightBg ? darken(bg, 0.08) : darken(bg, 0.35);
  const fog = isLightBg ? "#000" : "#000";
  const textColor = isLightBg ? "#1a1a1a" : "#fafafa";

  // --- Geometry pass --------------------------------------------------------
  const drawables = t.objects.filter((o) => o.type !== "plane");

  // Compute bounding box in world space (xy projection-ish)
  const bounds = drawables.reduce(
    (b, o) => {
      const sx = Math.max(o.scale[0], 0.2);
      const sy = Math.max(o.scale[1], 0.2);
      const sz = Math.max(o.scale[2], 0.2);
      const r = Math.max(sx, sy, sz) * 0.7;
      b.minX = Math.min(b.minX, o.position[0] - r);
      b.maxX = Math.max(b.maxX, o.position[0] + r);
      b.minY = Math.min(b.minY, 0);
      b.maxY = Math.max(b.maxY, o.position[1] + sy);
      b.minZ = Math.min(b.minZ, o.position[2] - r);
      b.maxZ = Math.max(b.maxZ, o.position[2] + r);
      return b;
    },
    { minX: 0, maxX: 0, minY: 0, maxY: 1, minZ: 0, maxZ: 0 },
  );

  const worldW = Math.max(bounds.maxX - bounds.minX, 2);
  const worldH = Math.max(bounds.maxY - bounds.minY, 2);
  const cx = W / 2;
  const groundY = H * 0.74;
  // Fit: use ~70% of width and ~55% of height for the scene
  const scale = Math.min((W * 0.7) / (worldW + 1), (H * 0.55) / (worldH + 1));
  const offsetX = -((bounds.minX + bounds.maxX) / 2);

  const project = (p: [number, number, number]) => {
    const [x, y, z] = p;
    const sx = cx + (x + offsetX - z * 0.45) * scale;
    const sy = groundY - y * scale - z * 0.28 * scale;
    return [sx, sy] as const;
  };

  // Back-to-front sort by z then y
  const sorted = [...drawables]
    .map((o, i) => ({ o, i }))
    .sort((a, b) => a.o.position[2] - b.o.position[2] || a.o.position[1] - b.o.position[1]);

  // --- Render ---------------------------------------------------------------
  const id = t.id.replace(/[^a-z0-9_-]/gi, "");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={lighten(bg, isLightBg ? -0.05 : 0.08)} />
          <stop offset="60%" stopColor={bg} />
          <stop offset="100%" stopColor={horizon} />
        </linearGradient>
        <radialGradient id={`sun-${id}`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={accent} stopOpacity={isLightBg ? 0.35 : 0.55} />
          <stop offset="55%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`rim-${id}`} cx="80%" cy="80%" r="60%">
          <stop offset="0%" stopColor={secondary} stopOpacity={isLightBg ? 0.25 : 0.45} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`floor-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={floorColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={fog} stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id={`pool-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`vignette-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#000" stopOpacity={isLightBg ? 0.2 : 0.45} />
        </linearGradient>
        <filter id={`blur-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`soft-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* Sky / background */}
      <rect width={W} height={H} fill={`url(#sky-${id})`} />
      <rect width={W} height={H} fill={`url(#sun-${id})`} />
      <rect width={W} height={H} fill={`url(#rim-${id})`} />

      {/* Horizon line */}
      <line x1="0" y1={groundY} x2={W} y2={groundY} stroke={isLightBg ? "#000" : "#fff"} strokeOpacity="0.08" />

      {/* Floor */}
      <rect x="0" y={groundY} width={W} height={H - groundY} fill={`url(#floor-${id})`} />

      {/* Accent pool on floor */}
      <ellipse cx={cx} cy={groundY + (H - groundY) * 0.45} rx={W * 0.42} ry={(H - groundY) * 0.75} fill={`url(#pool-${id})`} />

      {/* Subtle grid */}
      <g stroke={isLightBg ? "#000" : "#fff"} strokeOpacity="0.05">
        {Array.from({ length: 5 }, (_, i) => {
          const y = groundY + ((H - groundY) * (i + 1)) / 6;
          return <line key={i} x1="0" y1={y} x2={W} y2={y} />;
        })}
      </g>

      {/* Object reflections (drawn beneath objects) */}
      <g opacity="0.35" filter={`url(#soft-${id})`}>
        {sorted.map(({ o, i }) => {
          const [sx, sy] = project(o.position);
          const reflY = groundY + (groundY - sy) * 0.55;
          const s = sizeOf(o, scale);
          return (
            <ellipse
              key={`r-${i}`}
              cx={sx}
              cy={reflY}
              rx={s * 0.55}
              ry={s * 0.18}
              fill={o.color}
              opacity={0.5}
            />
          );
        })}
      </g>

      {/* Soft contact shadows */}
      <g opacity="0.6">
        {sorted.map(({ o, i }) => {
          const [sx] = project([o.position[0], 0, o.position[2]]);
          const sy = groundY + 2;
          const s = sizeOf(o, scale);
          return (
            <ellipse key={`sh-${i}`} cx={sx} cy={sy} rx={s * 0.7} ry={s * 0.15} fill="#000" opacity={isLightBg ? 0.25 : 0.55} />
          );
        })}
      </g>

      {/* Objects */}
      {sorted.map(({ o, i }) => renderObject(o, i, project, scale, id, textColor))}

      {/* Foreground vignette */}
      <rect width={W} height={H} fill={`url(#vignette-${id})`} />
      <rect width={W} height={H} fill="none" stroke={isLightBg ? "#000" : "#fff"} strokeOpacity="0.05" />
    </svg>
  );
}

// -------------------------------------------------------------------------- //
// Helpers                                                                    //
// -------------------------------------------------------------------------- //

function sizeOf(o: Omit<SceneObject, "id">, scale: number) {
  return Math.max(o.scale[0], o.scale[1], o.scale[2]) * scale * 0.55;
}

function renderObject(
  o: Omit<SceneObject, "id">,
  i: number,
  project: (p: [number, number, number]) => readonly [number, number],
  worldScale: number,
  id: string,
  textColor: string,
) {
  const [sx, sy] = project(o.position);
  const s = sizeOf(o, worldScale);
  const fill = o.color;
  const stroke = "rgba(255,255,255,0.18)";
  const hi = lighten(fill, 0.25);
  const lo = darken(fill, 0.35);
  const gid = `g-${id}-${i}`;
  const ei = o.emissiveIntensity ?? 0;

  const sphereGrad = (
    <radialGradient id={gid} cx="35%" cy="30%" r="80%">
      <stop offset="0%" stopColor={hi} />
      <stop offset="55%" stopColor={fill} />
      <stop offset="100%" stopColor={lo} />
    </radialGradient>
  );
  const boxGrad = (
    <linearGradient id={gid} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stopColor={hi} />
      <stop offset="100%" stopColor={lo} />
    </linearGradient>
  );

  const glow =
    ei > 0.2 ? (
      <circle cx={sx} cy={sy} r={s * 1.6} fill={o.emissive} opacity={Math.min(0.55, ei * 0.22)} />
    ) : null;

  let shape: React.ReactNode = null;
  let grad: React.ReactNode = sphereGrad;

  switch (o.type) {
    case "sphere":
      shape = <circle cx={sx} cy={sy} r={s * 0.7} fill={`url(#${gid})`} stroke={stroke} />;
      break;
    case "box": {
      grad = boxGrad;
      const w = s * 1.2;
      const h = s * 1.2 * (o.scale[1] / Math.max(o.scale[0], 0.1));
      const x = sx - w / 2;
      const y = sy - h / 2;
      shape = (
        <g>
          <rect x={x} y={y} width={w} height={h} fill={`url(#${gid})`} stroke={stroke} rx={2} />
          <polygon
            points={`${x + w},${y} ${x + w + 6},${y - 5} ${x + w + 6},${y + h - 5} ${x + w},${y + h}`}
            fill={lo}
            opacity={0.85}
          />
          <polygon
            points={`${x},${y} ${x + 6},${y - 5} ${x + w + 6},${y - 5} ${x + w},${y}`}
            fill={hi}
            opacity={0.9}
          />
        </g>
      );
      break;
    }
    case "cylinder": {
      grad = boxGrad;
      const w = s * 0.9;
      const h = s * 1.5;
      shape = (
        <g>
          <rect x={sx - w / 2} y={sy - h / 2} width={w} height={h} fill={`url(#${gid})`} stroke={stroke} rx={w / 2} />
          <ellipse cx={sx} cy={sy - h / 2} rx={w / 2} ry={w / 6} fill={hi} stroke={stroke} />
        </g>
      );
      break;
    }
    case "cone":
      shape = (
        <polygon
          points={`${sx},${sy - s * 0.8} ${sx - s * 0.6},${sy + s * 0.55} ${sx + s * 0.6},${sy + s * 0.55}`}
          fill={`url(#${gid})`}
          stroke={stroke}
        />
      );
      break;
    case "torus":
      grad = boxGrad;
      shape = (
        <g>
          <ellipse cx={sx} cy={sy} rx={s * 0.85} ry={s * 0.26} fill="none" stroke={lo} strokeWidth={Math.max(2, s * 0.22)} />
          <ellipse cx={sx} cy={sy - 1.5} rx={s * 0.85} ry={s * 0.26} fill="none" stroke={hi} strokeWidth={Math.max(1.5, s * 0.12)} opacity={0.7} />
        </g>
      );
      break;
    case "torusKnot":
      grad = boxGrad;
      shape = (
        <g fill="none" strokeLinecap="round">
          <ellipse cx={sx} cy={sy} rx={s * 0.75} ry={s * 0.55} transform={`rotate(25 ${sx} ${sy})`} stroke={lo} strokeWidth={Math.max(2, s * 0.16)} />
          <ellipse cx={sx} cy={sy} rx={s * 0.75} ry={s * 0.55} transform={`rotate(-25 ${sx} ${sy})`} stroke={fill} strokeWidth={Math.max(2, s * 0.14)} />
          <ellipse cx={sx} cy={sy} rx={s * 0.75} ry={s * 0.55} transform={`rotate(70 ${sx} ${sy})`} stroke={hi} strokeWidth={Math.max(1.5, s * 0.1)} opacity={0.8} />
        </g>
      );
      break;
    case "icosahedron":
    case "dodecahedron":
    case "octahedron": {
      grad = boxGrad;
      const r = s * 0.75;
      const sides = o.type === "octahedron" ? 6 : o.type === "icosahedron" ? 8 : 5;
      const pts = Array.from({ length: sides }, (_, k) => {
        const a = (k / sides) * Math.PI * 2 - Math.PI / 2;
        return `${sx + Math.cos(a) * r},${sy + Math.sin(a) * r}`;
      }).join(" ");
      shape = (
        <g>
          <polygon points={pts} fill={`url(#${gid})`} stroke={stroke} />
          {/* facets */}
          {Array.from({ length: sides }).map((_, k) => {
            const a1 = (k / sides) * Math.PI * 2 - Math.PI / 2;
            const x1 = sx + Math.cos(a1) * r;
            const y1 = sy + Math.sin(a1) * r;
            return <line key={k} x1={sx} y1={sy} x2={x1} y2={y1} stroke={lo} strokeOpacity="0.35" />;
          })}
        </g>
      );
      break;
    }
    case "text":
      shape = (
        <text
          x={sx}
          y={sy}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight={800}
          fontSize={Math.max(10, s * 0.55)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={fill}
          stroke={stroke}
          strokeWidth={0.5}
        >
          {(o.text ?? "TEXT").slice(0, 8)}
        </text>
      );
      break;
    default:
      shape = <circle cx={sx} cy={sy} r={s * 0.5} fill={fill} stroke={stroke} />;
  }

  return (
    <g key={i}>
      <defs>{grad}</defs>
      {glow}
      {shape}
    </g>
  );
}

// --- color utils ----------------------------------------------------------- //
function hexToRgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return { r: 128, g: 128, b: 128 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}
function darken(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}
function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function shift(hex: string, deg: number) {
  // very rough hue shift via channel rotation; cheap and good enough for accents
  const { r, g, b } = hexToRgb(hex);
  const t = (deg % 360) / 360;
  if (t < 0.33) return rgbToHex(g, b, r);
  if (t < 0.66) return rgbToHex(b, r, g);
  return rgbToHex((r + g) / 2, (g + b) / 2, (b + r) / 2);
}
