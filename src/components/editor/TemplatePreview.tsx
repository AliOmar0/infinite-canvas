import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Template, SceneObject, SceneLight, ToneMapping } from "@/lib/editor-store";
import { getTexture } from "@/lib/textures";

/**
 * Real WebGL mini-render of a template scene.
 * - Mounts only when the card scrolls into view (IntersectionObserver)
 * - Auto-orbits slowly, on-demand frameloop so cost stays low when paused
 * - Reuses the same materials/lights as the editor for a true preview
 */
export function TemplatePreview({ t, eager = false }: { t: Template; eager?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timer = useRef<number | null>(null);

  // Eager mode (editor template browser) mounts when card scrolls into view,
  // staggered so we don't spin up 22 contexts at once.
  useEffect(() => {
    if (!eager) return;
    const el = wrapRef.current;
    if (!el) return;
    let timeoutId: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // small jitter so multiple cards don't init in one frame
            timeoutId = window.setTimeout(() => setActive(true), Math.random() * 250);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "150px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [eager]);

  const onEnter = () => {
    setHovered(true);
    setActive(true);
    if (timer.current) { window.clearTimeout(timer.current); timer.current = null; }
  };
  const onLeave = () => {
    setHovered(false);
    // unmount the canvas a moment after hover ends so we don't leak GL contexts
    if (!eager) {
      timer.current = window.setTimeout(() => setActive(false), 600);
    }
  };

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      style={{ background: t.background }}
    >
      <FallbackArt t={t} />
      {active && (
        <Canvas
          shadows={false}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          frameloop="always"
          className="absolute inset-0 animate-fade-in"
          style={{ background: "transparent" }}
        >
          <SceneInner t={t} hovered={hovered || eager} />
        </Canvas>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------- //

const TONE_MAP: Record<ToneMapping, THREE.ToneMapping> = {
  neutral: THREE.NeutralToneMapping,
  aces: THREE.ACESFilmicToneMapping,
  agx: THREE.AgXToneMapping,
  cineon: THREE.CineonToneMapping,
  linear: THREE.LinearToneMapping,
};

function SceneInner({ t, hovered }: { t: Template; hovered: boolean }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = TONE_MAP[t.toneMapping ?? "aces"];
    gl.toneMappingExposure = t.exposure ?? 1;
  }, [gl, t.toneMapping, t.exposure]);

  // Background fill (matches template background, since canvas is alpha)
  useEffect(() => {
    return () => {};
  }, []);

  const fx = { ...t.fx };
  const bloomOn = fx.bloom !== false;

  return (
    <>
      <color attach="background" args={[t.background]} />
      <PreviewCamera hovered={hovered} />
      <Suspense fallback={null}>
        <Environment preset={t.environment} background={false} environmentIntensity={1} />
        {(t.lights ?? defaultLights).map((l, i) => (
          <PreviewLight key={i} light={l} />
        ))}
        <ContactShadows position={[0, 0.005, 0]} opacity={0.5} scale={20} blur={2.5} far={8} resolution={256} />
        {t.objects.map((o, i) => (
          <PreviewObject key={i} obj={o} />
        ))}
        {bloomOn && (
          <EffectComposer enableNormalPass={false}>
            <Bloom intensity={(fx.bloomIntensity ?? 0.6) * 0.8} luminanceThreshold={0.25} luminanceSmoothing={0.9} mipmapBlur />
            {fx.vignette !== false ? (
              <Vignette eskil={false} offset={0.2} darkness={0.6} />
            ) : <></>}
          </EffectComposer>
        )}
      </Suspense>
    </>
  );
}

const defaultLights: Omit<SceneLight, "id">[] = [
  { name: "amb", type: "ambient", position: [0, 0, 0], color: "#ffffff", intensity: 0.3, castShadow: false },
  { name: "key", type: "directional", position: [5, 6, 4], color: "#ffffff", intensity: 1.2, castShadow: false },
];

function PreviewCamera({ hovered }: { hovered: boolean }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!camRef.current) return;
    t.current += dt * (hovered ? 0.5 : 0.18);
    const r = 7;
    camRef.current.position.x = Math.sin(t.current) * r;
    camRef.current.position.z = Math.cos(t.current) * r;
    camRef.current.position.y = 3 + Math.sin(t.current * 0.5) * 0.4;
    camRef.current.lookAt(0, 1, 0);
  });
  return <PerspectiveCamera ref={camRef} makeDefault position={[5, 3.5, 5]} fov={38} />;
}

function PreviewLight({ light }: { light: Omit<SceneLight, "id"> }) {
  if (light.type === "ambient") {
    return <ambientLight color={light.color} intensity={light.intensity} />;
  }
  if (light.type === "directional") {
    return <directionalLight position={light.position} color={light.color} intensity={light.intensity} />;
  }
  if (light.type === "point") {
    return (
      <pointLight
        position={light.position}
        color={light.color}
        intensity={light.intensity}
        distance={light.distance ?? 0}
        decay={light.decay ?? 1}
      />
    );
  }
  return (
    <spotLight
      position={light.position}
      color={light.color}
      intensity={light.intensity}
      angle={light.angle ?? Math.PI / 6}
      penumbra={light.penumbra ?? 0.3}
      distance={light.distance ?? 0}
      decay={light.decay ?? 1}
    />
  );
}

function PreviewObject({ obj }: { obj: Omit<SceneObject, "id"> }) {
  const ref = useRef<THREE.Mesh>(null);
  const baseY = obj.position[1];
  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    m.rotation.x += obj.spin[0] * dt;
    m.rotation.y += obj.spin[1] * dt;
    m.rotation.z += obj.spin[2] * dt;
    if (obj.bob > 0) {
      m.position.y = baseY + Math.sin(state.clock.elapsedTime * 1.5) * obj.bob;
    }
  });

  const map = useMemo(() => {
    const tex = getTexture(obj.texture);
    if (!tex) return null;
    const c = tex.clone();
    c.needsUpdate = true;
    c.repeat.set(obj.textureRepeat, obj.textureRepeat);
    return c;
  }, [obj.texture, obj.textureRepeat]);

  const geometry = (() => {
    switch (obj.type) {
      case "box": return <boxGeometry args={[1, 1, 1]} />;
      case "sphere": return <sphereGeometry args={[0.5, 48, 48]} />;
      case "cylinder": return <cylinderGeometry args={[0.5, 0.5, 1, 48]} />;
      case "cone": return <coneGeometry args={[0.5, 1, 48]} />;
      case "torus": return <torusGeometry args={[0.5, 0.18, 24, 64]} />;
      case "torusKnot": return <torusKnotGeometry args={[0.4, 0.14, 96, 20]} />;
      case "icosahedron": return <icosahedronGeometry args={[0.6, 1]} />;
      case "octahedron": return <octahedronGeometry args={[0.6, 0]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[0.6, 0]} />;
      case "plane": return <planeGeometry args={[1, 1]} />;
      case "text": return <boxGeometry args={[1.2, 0.6, 0.3]} />; // simple text stand-in for preview perf
      default: return <sphereGeometry args={[0.5, 32, 32]} />;
    }
  })();

  return (
    <mesh ref={ref} position={obj.position} rotation={obj.rotation} scale={obj.scale}>
      {geometry}
      <meshPhysicalMaterial
        color={obj.color}
        metalness={obj.metalness}
        roughness={obj.roughness}
        emissive={obj.emissive}
        emissiveIntensity={obj.emissiveIntensity}
        clearcoat={obj.clearcoat}
        clearcoatRoughness={obj.clearcoatRoughness}
        transmission={obj.transmission}
        ior={obj.ior}
        thickness={obj.thickness}
        envMapIntensity={obj.envMapIntensity}
        map={map ?? undefined}
        transparent={obj.transmission > 0}
      />
    </mesh>
  );
}

// --------------------------------------------------------------------------- //
// Static fallback (shown until canvas paints).                                //
// --------------------------------------------------------------------------- //

function FallbackArt({ t }: { t: Template }) {
  const W = 320, H = 240;
  const bg = t.background || "#0a0a0a";
  const isLight = luminance(bg) > 0.55;
  const accent =
    t.objects.find((o) => (o.emissiveIntensity ?? 0) > 0.3)?.emissive ??
    t.lights?.find((l) => l.type !== "ambient" && l.color && l.color !== "#ffffff")?.color ??
    (isLight ? "#7aa7ff" : "#ffffff");
  const secondary =
    t.lights?.filter((l) => l.type !== "ambient" && l.color !== "#ffffff" && l.color !== accent)[0]?.color ??
    shift(accent, 40);
  const floor = isLight ? darken(bg, 0.08) : darken(bg, 0.35);

  const drawables = t.objects.filter((o) => o.type !== "plane");
  const bounds = drawables.reduce(
    (b, o) => {
      const r = Math.max(o.scale[0], o.scale[1], o.scale[2]) * 0.7;
      b.minX = Math.min(b.minX, o.position[0] - r);
      b.maxX = Math.max(b.maxX, o.position[0] + r);
      b.maxY = Math.max(b.maxY, o.position[1] + o.scale[1]);
      return b;
    },
    { minX: 0, maxX: 0, maxY: 1 },
  );
  const worldW = Math.max(bounds.maxX - bounds.minX, 2);
  const worldH = Math.max(bounds.maxY, 2);
  const cx = W / 2;
  const groundY = H * 0.72;
  const scale = Math.min((W * 0.65) / (worldW + 1), (H * 0.55) / (worldH + 1));
  const offsetX = -((bounds.minX + bounds.maxX) / 2);
  const project = (p: [number, number, number]) => {
    const [x, y, z] = p;
    return [cx + (x + offsetX - z * 0.45) * scale, groundY - y * scale - z * 0.28 * scale] as const;
  };
  const sorted = [...drawables].sort((a, b) => a.position[2] - b.position[2]);
  const id = t.id.replace(/[^a-z0-9_-]/gi, "");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={lighten(bg, isLight ? -0.05 : 0.08)} />
          <stop offset="60%" stopColor={bg} />
          <stop offset="100%" stopColor={lighten(bg, isLight ? 0.05 : 0.18)} />
        </linearGradient>
        <radialGradient id={`sun-${id}`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={accent} stopOpacity={isLight ? 0.35 : 0.6} />
          <stop offset="55%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`rim-${id}`} cx="82%" cy="78%" r="60%">
          <stop offset="0%" stopColor={secondary} stopOpacity={isLight ? 0.25 : 0.45} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`floor-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={floor} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id={`pool-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`soft-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <rect width={W} height={H} fill={`url(#sky-${id})`} />
      <rect width={W} height={H} fill={`url(#sun-${id})`} />
      <rect width={W} height={H} fill={`url(#rim-${id})`} />
      <line x1="0" y1={groundY} x2={W} y2={groundY} stroke={isLight ? "#000" : "#fff"} strokeOpacity="0.08" />
      <rect x="0" y={groundY} width={W} height={H - groundY} fill={`url(#floor-${id})`} />
      <ellipse cx={cx} cy={groundY + (H - groundY) * 0.45} rx={W * 0.42} ry={(H - groundY) * 0.7} fill={`url(#pool-${id})`} />

      {/* Reflections */}
      <g opacity="0.35" filter={`url(#soft-${id})`}>
        {sorted.map((o, i) => {
          const [sx, sy] = project(o.position);
          const reflY = groundY + (groundY - sy) * 0.55;
          const s = Math.max(o.scale[0], o.scale[1], o.scale[2]) * scale * 0.55;
          return <ellipse key={i} cx={sx} cy={reflY} rx={s * 0.55} ry={s * 0.18} fill={o.color} />;
        })}
      </g>

      {/* Contact shadows */}
      <g>
        {sorted.map((o, i) => {
          const [sx] = project([o.position[0], 0, o.position[2]]);
          const s = Math.max(o.scale[0], o.scale[1], o.scale[2]) * scale * 0.55;
          return <ellipse key={i} cx={sx} cy={groundY + 2} rx={s * 0.7} ry={s * 0.15} fill="#000" opacity={isLight ? 0.25 : 0.55} />;
        })}
      </g>

      {/* Objects (simple shaded silhouettes) */}
      {sorted.map((o, i) => {
        const [sx, sy] = project(o.position);
        const s = Math.max(o.scale[0], o.scale[1], o.scale[2]) * scale * 0.55;
        const fill = o.color;
        const hi = lighten(fill, 0.25);
        const lo = darken(fill, 0.35);
        const gid = `g-${id}-${i}`;
        const ei = o.emissiveIntensity ?? 0;
        const glow = ei > 0.2 ? <circle cx={sx} cy={sy} r={s * 1.6} fill={o.emissive} opacity={Math.min(0.55, ei * 0.22)} /> : null;
        let shape: React.ReactNode = null;

        if (o.type === "sphere" || o.type === "icosahedron" || o.type === "dodecahedron" || o.type === "octahedron") {
          shape = <circle cx={sx} cy={sy} r={s * 0.7} fill={`url(#${gid})`} stroke="rgba(255,255,255,0.18)" />;
        } else if (o.type === "box" || o.type === "plane") {
          const w = s * 1.2;
          const h = s * 1.2 * (o.scale[1] / Math.max(o.scale[0], 0.1));
          shape = (
            <g>
              <rect x={sx - w / 2} y={sy - h / 2} width={w} height={h} fill={`url(#${gid})`} stroke="rgba(255,255,255,0.18)" rx={2} />
              <polygon points={`${sx + w / 2},${sy - h / 2} ${sx + w / 2 + 6},${sy - h / 2 - 5} ${sx + w / 2 + 6},${sy + h / 2 - 5} ${sx + w / 2},${sy + h / 2}`} fill={lo} opacity={0.85} />
            </g>
          );
        } else if (o.type === "cylinder") {
          const w = s * 0.9, h = s * 1.5;
          shape = (
            <g>
              <rect x={sx - w / 2} y={sy - h / 2} width={w} height={h} fill={`url(#${gid})`} stroke="rgba(255,255,255,0.18)" rx={w / 2} />
              <ellipse cx={sx} cy={sy - h / 2} rx={w / 2} ry={w / 6} fill={hi} />
            </g>
          );
        } else if (o.type === "cone") {
          shape = <polygon points={`${sx},${sy - s * 0.8} ${sx - s * 0.6},${sy + s * 0.55} ${sx + s * 0.6},${sy + s * 0.55}`} fill={`url(#${gid})`} stroke="rgba(255,255,255,0.18)" />;
        } else if (o.type === "torus" || o.type === "torusKnot") {
          shape = (
            <g fill="none">
              <ellipse cx={sx} cy={sy} rx={s * 0.85} ry={s * 0.26} stroke={lo} strokeWidth={Math.max(2, s * 0.22)} />
              <ellipse cx={sx} cy={sy - 2} rx={s * 0.85} ry={s * 0.26} stroke={hi} strokeWidth={Math.max(1.5, s * 0.1)} opacity={0.7} />
            </g>
          );
        } else if (o.type === "text") {
          shape = (
            <text x={sx} y={sy} fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={800} fontSize={Math.max(10, s * 0.55)} textAnchor="middle" dominantBaseline="middle" fill={fill} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5}>
              {(o.text ?? "TEXT").slice(0, 8)}
            </text>
          );
        }
        return (
          <g key={i}>
            <defs>
              <radialGradient id={gid} cx="35%" cy="30%" r="80%">
                <stop offset="0%" stopColor={hi} />
                <stop offset="55%" stopColor={fill} />
                <stop offset="100%" stopColor={lo} />
              </radialGradient>
            </defs>
            {glow}
            {shape}
          </g>
        );
      })}
    </svg>
  );
}

// --- color utils ----------------------------------------------------------- //
function hexToRgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return { r: 128, g: 128, b: 128 };
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
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
  const { r, g, b } = hexToRgb(hex);
  const t = (deg % 360) / 360;
  if (t < 0.33) return rgbToHex(g, b, r);
  if (t < 0.66) return rgbToHex(b, r, g);
  return rgbToHex((r + g) / 2, (g + b) / 2, (b + r) / 2);
}
