import { Canvas, ThreeEvent } from "@react-three/fiber";
import {
  Environment,
  Grid,
  OrbitControls,
  TransformControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useState } from "react";
import * as THREE from "three";
import { SceneObject, useEditor } from "@/lib/editor-store";

function Primitive({ obj }: { obj: SceneObject }) {
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const selectedId = useEditor((s) => s.selectedId);
  const selectObject = useEditor((s) => s.selectObject);
  const updateObject = useEditor((s) => s.updateObject);
  const isSelected = selectedId === obj.id;

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectObject(obj.id);
  };

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

  const meshEl = (
    <mesh
      ref={setMesh}
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial
        color={obj.color}
        metalness={obj.metalness}
        roughness={obj.roughness}
      />
    </mesh>
  );

  if (!isSelected || obj.type === "plane") return meshEl;

  return (
    <>
      {meshEl}
      {mesh && (
        <TransformControls
          object={mesh}
          mode="translate"
          size={0.7}
          onObjectChange={() => {
            if (!mesh) return;
            updateObject(obj.id, {
              position: [mesh.position.x, mesh.position.y, mesh.position.z],
              rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
              scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
            });
          }}
        />
      )}
    </>
  );
}

export function Viewport() {
  const objects = useEditor((s) => s.objects);
  const environment = useEditor((s) => s.environment);
  const showGrid = useEditor((s) => s.showGrid);
  const selectObject = useEditor((s) => s.selectObject);

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} onPointerMissed={() => selectObject(null)}>
      <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={45} />
      <Suspense fallback={null}>
        <Environment preset={environment} background={false} />
        <ambientLight intensity={0.2} />
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
