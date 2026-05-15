import type { Template } from "@/lib/editor-store";

/**
 * Minimal SVG silhouette preview of a template scene.
 * Projects 3D objects to 2D using a simple isometric-ish projection
 * and draws shape-appropriate primitives so every template looks distinct.
 */
export function TemplatePreview({ t }: { t: Template }) {
  const W = 320;
  const H = 180;
  const cx = W / 2;
  const groundY = H * 0.78;

  // Project [x, y, z] -> screen
  const project = (p: [number, number, number]) => {
    const [x, y, z] = p;
    const scale = 26;
    const sx = cx + (x - z * 0.55) * scale;
    const sy = groundY - y * scale - z * 0.32 * scale;
    return [sx, sy] as const;
  };

  // Detect emissive accent for glow stops
  const accent =
    t.objects.find((o) => o.emissiveIntensity && o.emissiveIntensity > 0.3)?.emissive ??
    t.lights?.find((l) => l.type !== "ambient" && l.color !== "#ffffff")?.color ??
    "#ffffff";

  // Sort back-to-front by z
  const sorted = [...t.objects]
    .map((o, i) => ({ o, i }))
    .sort((a, b) => a.o.position[2] - b.o.position[2]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id={`bg-${t.id}`} cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="55%" stopColor={t.background} stopOpacity="1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id={`floor-${t.id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={t.background} stopOpacity="0.0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`glow-${t.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky / background */}
      <rect width={W} height={H} fill={t.background} />
      <rect width={W} height={H} fill={`url(#bg-${t.id})`} />

      {/* Floor band */}
      <rect x={0} y={groundY} width={W} height={H - groundY} fill={`url(#floor-${t.id})`} />
      <line x1={0} y1={groundY} x2={W} y2={groundY} stroke="#fff" strokeOpacity="0.08" />

      {/* Soft accent halo */}
      <ellipse cx={cx} cy={groundY - 30} rx={W * 0.45} ry={26} fill={`url(#glow-${t.id})`} opacity="0.7" />

      {/* Objects */}
      {sorted.map(({ o, i }) => {
        if (o.type === "plane") return null;
        const [sx, sy] = project(o.position);
        const s = Math.max(o.scale[0], o.scale[1], o.scale[2]) * 22;
        const fill = o.color;
        const stroke = "rgba(255,255,255,0.18)";
        const emissiveGlow =
          o.emissiveIntensity && o.emissiveIntensity > 0.2 ? (
            <circle key={`g${i}`} cx={sx} cy={sy} r={s * 1.4} fill={o.emissive} opacity={Math.min(0.45, o.emissiveIntensity * 0.18)} />
          ) : null;

        let shape: React.ReactNode = null;
        switch (o.type) {
          case "sphere":
            shape = <circle cx={sx} cy={sy} r={s * 0.6} fill={fill} stroke={stroke} />;
            break;
          case "box":
            shape = (
              <rect
                x={sx - s * 0.55}
                y={sy - s * 0.55 * o.scale[1] / Math.max(o.scale[0], 0.1)}
                width={s * 1.1}
                height={s * 1.1 * o.scale[1] / Math.max(o.scale[0], 0.1)}
                fill={fill}
                stroke={stroke}
                rx={2}
              />
            );
            break;
          case "cylinder":
            shape = (
              <rect x={sx - s * 0.4} y={sy - s * 0.7} width={s * 0.8} height={s * 1.4} fill={fill} stroke={stroke} rx={s * 0.4} />
            );
            break;
          case "cone":
            shape = (
              <polygon points={`${sx},${sy - s * 0.7} ${sx - s * 0.55},${sy + s * 0.55} ${sx + s * 0.55},${sy + s * 0.55}`} fill={fill} stroke={stroke} />
            );
            break;
          case "torus":
            shape = (
              <ellipse cx={sx} cy={sy} rx={s * 0.7} ry={s * 0.22} fill="none" stroke={fill} strokeWidth={Math.max(2, s * 0.16)} />
            );
            break;
          case "torusKnot":
            shape = (
              <g stroke={fill} strokeWidth={Math.max(2, s * 0.12)} fill="none">
                <ellipse cx={sx} cy={sy} rx={s * 0.6} ry={s * 0.5} transform={`rotate(20 ${sx} ${sy})`} />
                <ellipse cx={sx} cy={sy} rx={s * 0.6} ry={s * 0.5} transform={`rotate(-20 ${sx} ${sy})`} />
              </g>
            );
            break;
          case "icosahedron":
          case "dodecahedron":
          case "octahedron": {
            const r = s * 0.6;
            const sides = o.type === "octahedron" ? 4 : o.type === "icosahedron" ? 6 : 5;
            const pts = Array.from({ length: sides }, (_, k) => {
              const a = (k / sides) * Math.PI * 2 - Math.PI / 2;
              return `${sx + Math.cos(a) * r},${sy + Math.sin(a) * r}`;
            }).join(" ");
            shape = <polygon points={pts} fill={fill} stroke={stroke} />;
            break;
          }
          case "text":
            shape = (
              <text
                x={sx} y={sy}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontWeight={700}
                fontSize={s * 0.7}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={fill}
                stroke={stroke}
              >
                {(o.text ?? "TEXT").slice(0, 6)}
              </text>
            );
            break;
        }

        return (
          <g key={i}>
            {emissiveGlow}
            {shape}
          </g>
        );
      })}

      {/* Light dots in upper corner */}
      <g opacity="0.7">
        {(t.lights ?? []).slice(0, 4).map((l, i) =>
          l.type === "ambient" ? null : (
            <circle key={i} cx={10 + i * 8} cy={10} r={2.4} fill={l.color} />
          )
        )}
      </g>
    </svg>
  );
}
