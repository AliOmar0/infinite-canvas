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
  const [active, setActive] = useState(eager);
  const [hovered, setHovered] = useState(false);

  // Eager mode (editor template browser) mounts when visible.
  useEffect(() => {
    if (!eager) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      onMouseEnter={() => { setHovered(true); setActive(true); }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setActive(true)}
      style={{ background: t.background }}
    >
      <FallbackArt t={t} />
      {active && (
        <Canvas
          shadows={false}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          frameloop={hovered || eager ? "always" : "demand"}
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: "transparent" }}
        >
          <SceneInner t={t} hovered={hovered} />
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
  const accent =
    t.objects.find((o) => (o.emissiveIntensity ?? 0) > 0.3)?.emissive ??
    t.lights?.find((l) => l.type !== "ambient" && l.color && l.color !== "#ffffff")?.color ??
    "#ffffff";
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 55% at 50% 55%, ${accent}55, transparent 70%), linear-gradient(180deg, transparent 60%, #00000066 100%)`,
        }}
      />
    </div>
  );
}
