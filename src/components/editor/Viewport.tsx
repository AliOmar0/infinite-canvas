import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Grid,
  OrbitControls,
  TransformControls,
  PerspectiveCamera,
  Text3D,
  Center,
  ContactShadows,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
  Pixelation,
  DepthOfField,
} from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SceneObject, SceneLight, useEditor, ToneMapping } from "@/lib/editor-store";
import { getTexture } from "@/lib/textures";

const TONE_MAP: Record<ToneMapping, THREE.ToneMapping> = {
  neutral: THREE.NeutralToneMapping,
  aces: THREE.ACESFilmicToneMapping,
  agx: THREE.AgXToneMapping,
  cineon: THREE.CineonToneMapping,
  linear: THREE.LinearToneMapping,
};

function Material({ obj }: { obj: SceneObject }) {
  const map = useMemo(() => {
    const t = getTexture(obj.texture);
    if (!t) return null;
    const c = t.clone();
    c.needsUpdate = true;
    c.repeat.set(obj.textureRepeat, obj.textureRepeat);
    return c;
  }, [obj.texture, obj.textureRepeat]);

  return (
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
  );
}

function Primitive({ obj }: { obj: SceneObject }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const selectedId = useEditor((s) => s.selectedId);
  const selectObject = useEditor((s) => s.selectObject);
  const updateObject = useEditor((s) => s.updateObject);
  const playing = useEditor((s) => s.playing);
  const isSelected = selectedId === obj.id;
  const baseY = useRef(obj.position[1]);

  useEffect(() => { baseY.current = obj.position[1]; }, [obj.position]);

  useFrame((state, dt) => {
    if (!playing) return;
    const target = groupRef.current ?? meshRef.current;
    if (!target) return;
    target.rotation.x += obj.spin[0] * dt;
    target.rotation.y += obj.spin[1] * dt;
    target.rotation.z += obj.spin[2] * dt;
    if (obj.bob > 0) {
      target.position.y = baseY.current + Math.sin(state.clock.elapsedTime * 1.5) * obj.bob;
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectObject(obj.id);
  };

  let body;
  if (obj.type === "text") {
    body = (
      <group ref={groupRef} position={obj.position} rotation={obj.rotation} scale={obj.scale} onClick={onClick}>
        <Center>
          <Text3D
            font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
            size={0.8} height={0.18} curveSegments={12}
            bevelEnabled bevelThickness={0.02} bevelSize={0.012} bevelSegments={4}
          >
            {obj.text || "TEXT"}
            <Material obj={obj} />
          </Text3D>
        </Center>
      </group>
    );
  } else {
    const geometry = (() => {
      switch (obj.type) {
        case "box": return <boxGeometry args={[1, 1, 1]} />;
        case "sphere": return <sphereGeometry args={[0.5, 64, 64]} />;
        case "cylinder": return <cylinderGeometry args={[0.5, 0.5, 1, 64]} />;
        case "cone": return <coneGeometry args={[0.5, 1, 64]} />;
        case "torus": return <torusGeometry args={[0.5, 0.18, 32, 96]} />;
        case "torusKnot": return <torusKnotGeometry args={[0.4, 0.14, 128, 24]} />;
        case "icosahedron": return <icosahedronGeometry args={[0.6, 1]} />;
        case "octahedron": return <octahedronGeometry args={[0.6, 0]} />;
        case "dodecahedron": return <dodecahedronGeometry args={[0.6, 0]} />;
        case "plane": return <planeGeometry args={[1, 1]} />;
      }
    })();
    body = (
      <mesh
        ref={(m) => { meshRef.current = m; setMesh(m); }}
        position={obj.position} rotation={obj.rotation} scale={obj.scale}
        onClick={onClick}
        castShadow={obj.castShadow}
        receiveShadow={obj.receiveShadow}
      >
        {geometry}
        <Material obj={obj} />
      </mesh>
    );
  }

  if (!isSelected || obj.type === "plane") return body;

  const transformTarget = obj.type === "text" ? groupRef.current : mesh;
  return (
    <>
      {body}
      {transformTarget && (
        <TransformControls
          object={transformTarget} mode="translate" size={0.7}
          onObjectChange={() => {
            if (!transformTarget) return;
            updateObject(obj.id, {
              position: [transformTarget.position.x, transformTarget.position.y, transformTarget.position.z],
              rotation: [transformTarget.rotation.x, transformTarget.rotation.y, transformTarget.rotation.z],
              scale: [transformTarget.scale.x, transformTarget.scale.y, transformTarget.scale.z],
            });
          }}
        />
      )}
    </>
  );
}

function Light({ light }: { light: SceneLight }) {
  if (light.type === "ambient") {
    return <ambientLight color={light.color} intensity={light.intensity} />;
  }
  if (light.type === "directional") {
    return (
      <directionalLight
        position={light.position}
        color={light.color}
        intensity={light.intensity}
        castShadow={light.castShadow}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    );
  }
  if (light.type === "point") {
    return (
      <pointLight
        position={light.position}
        color={light.color}
        intensity={light.intensity}
        distance={light.distance ?? 0}
        decay={light.decay ?? 1}
        castShadow={light.castShadow}
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
      castShadow={light.castShadow}
    />
  );
}

function ScreenshotBridge() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    (window as unknown as { __captureViewport?: () => string }).__captureViewport = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    };
    return () => {
      delete (window as unknown as { __captureViewport?: () => string }).__captureViewport;
    };
  }, [gl, scene, camera]);
  return null;
}

function Tonemap() {
  const { gl } = useThree();
  const toneMapping = useEditor((s) => s.toneMapping);
  const exposure = useEditor((s) => s.exposure);
  useEffect(() => {
    gl.toneMapping = TONE_MAP[toneMapping];
    gl.toneMappingExposure = exposure;
  }, [gl, toneMapping, exposure]);
  return null;
}

export function Viewport() {
  const objects = useEditor((s) => s.objects);
  const lights = useEditor((s) => s.lights);
  const environment = useEditor((s) => s.environment);
  const envIntensity = useEditor((s) => s.envIntensity);
  const showGrid = useEditor((s) => s.showGrid);
  const showShadows = useEditor((s) => s.showShadows);
  const background = useEditor((s) => s.background);
  const fx = useEditor((s) => s.fx);
  const selectObject = useEditor((s) => s.selectObject);

  const enabledFx = fx.bloom || fx.chromatic || fx.vignette || fx.noise || fx.pixelate || fx.dof;

  return (
    <Canvas
      shadows={showShadows}
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onPointerMissed={() => selectObject(null)}
    >
      <color attach="background" args={[background]} />
      <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={45} />
      <ScreenshotBridge />
      <Tonemap />
      <Suspense fallback={null}>
        <Environment preset={environment} background={false} environmentIntensity={envIntensity} />
        {lights.map((l) => <Light key={l.id} light={l} />)}
        {showGrid && (
          <Grid
            args={[40, 40]}
            cellColor="#1a1a1a"
            sectionColor="#2a2a2a"
            fadeDistance={30}
            fadeStrength={1.5}
            infiniteGrid
            position={[0, 0.001, 0]}
          />
        )}
        {showShadows && (
          <ContactShadows position={[0, 0.005, 0]} opacity={0.5} scale={30} blur={2.5} far={10} />
        )}
        {objects.map((o) => <Primitive key={o.id} obj={o} />)}

        {enabledFx && (
          <EffectComposer>
            <>
              {fx.bloom && (
                <Bloom intensity={fx.bloomIntensity} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
              )}
              {fx.chromatic && (
                <ChromaticAberration offset={new THREE.Vector2(fx.chromaticOffset, fx.chromaticOffset)} radialModulation={false} modulationOffset={0} />
              )}
              {fx.dof && (
                <DepthOfField focusDistance={fx.dofFocus / 100} focalLength={0.05} bokehScale={fx.dofBokeh} />
              )}
              {fx.pixelate && <Pixelation granularity={fx.pixelSize} />}
              {fx.noise && <Noise opacity={fx.noiseOpacity} />}
              {fx.vignette && <Vignette eskil={false} offset={0.1} darkness={0.9} />}
            </>
          </EffectComposer>
        )}
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={40}
      />
    </Canvas>
  );
}
