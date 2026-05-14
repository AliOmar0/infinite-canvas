import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Grid,
  OrbitControls,
  TransformControls,
  PerspectiveCamera,
  Text3D,
  Center,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
  Pixelation,
} from "@react-three/postprocessing";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SceneObject, useEditor } from "@/lib/editor-store";

function Primitive({ obj }: { obj: SceneObject }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const selectedId = useEditor((s) => s.selectedId);
  const selectObject = useEditor((s) => s.selectObject);
  const updateObject = useEditor((s) => s.updateObject);
  const playing = useEditor((s) => s.playing);
  const isSelected = selectedId === obj.id;

  useFrame((_, dt) => {
    if (!playing) return;
    const target = groupRef.current ?? meshRef.current;
    if (!target) return;
    target.rotation.x += obj.spin[0] * dt;
    target.rotation.y += obj.spin[1] * dt;
    target.rotation.z += obj.spin[2] * dt;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectObject(obj.id);
  };

  const material = (
    <meshStandardMaterial
      color={obj.color}
      metalness={obj.metalness}
      roughness={obj.roughness}
    />
  );

  let body;
  if (obj.type === "text") {
    body = (
      <group
        ref={groupRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        onClick={onClick}
      >
        <Center>
          <Text3D
            font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
            size={0.8}
            height={0.18}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.012}
            bevelSegments={4}
          >
            {obj.text || "TEXT"}
            {material}
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
        case "plane": return <planeGeometry args={[1, 1]} />;
      }
    })();
    body = (
      <mesh
        ref={(m) => { meshRef.current = m; setMesh(m); }}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        {geometry}
        {material}
      </mesh>
    );
  }

  if (!isSelected || obj.type === "plane") return body;

  // Use the appropriate target for transform controls
  const transformTarget = obj.type === "text" ? groupRef.current : mesh;

  return (
    <>
      {body}
      {transformTarget && (
        <TransformControls
          object={transformTarget}
          mode="translate"
          size={0.7}
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

export function Viewport() {
  const objects = useEditor((s) => s.objects);
  const environment = useEditor((s) => s.environment);
  const showGrid = useEditor((s) => s.showGrid);
  const background = useEditor((s) => s.background);
  const fx = useEditor((s) => s.fx);
  const selectObject = useEditor((s) => s.selectObject);

  const enabledFx = fx.bloom || fx.chromatic || fx.vignette || fx.noise || fx.pixelate;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onPointerMissed={() => selectObject(null)}
    >
      <color attach="background" args={[background]} />
      <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={45} />
      <ScreenshotBridge />
      <Suspense fallback={null}>
        <Environment preset={environment} background={false} />
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
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
        {objects.map((o) => (
          <Primitive key={o.id} obj={o} />
        ))}

        {enabledFx && (
          <EffectComposer>
            <>
              {fx.bloom && (
                <Bloom intensity={fx.bloomIntensity} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
              )}
              {fx.chromatic && (
                <ChromaticAberration offset={new THREE.Vector2(fx.chromaticOffset, fx.chromaticOffset)} radialModulation={false} modulationOffset={0} />
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
