import { Clone, useGLTF } from "@react-three/drei";
import { Component, Suspense, type ReactNode } from "react";
import * as THREE from "three";

const TREE_URLS = {
  one: "/game/assets/suryakerta/vegetation/Tree_A_01.glb",
  two: "/game/assets/suryakerta/vegetation/Tree_A_02.glb",
  three: "/game/assets/suryakerta/vegetation/Tree_A_03.glb",
} as const;

const GATE_URL = "/game/assets/suryakerta/environment/silent_hill_front_gate.glb";
const BRIDGE_URL = "/game/assets/suryakerta/environment/stylized_bridge_low_poly.glb";

const TREE_PLACEMENTS = [
  ["one", -17, -14, 2.8, 0.12], ["two", -9, -18, 2.6, -0.32], ["three", 0, -19, 2.9, 0.24],
  ["one", 9, -18, 2.7, -0.18], ["two", 17, -13, 2.8, 0.32], ["three", 18, -5, 2.5, -0.24],
  ["one", 18, 4, 2.7, 0.18], ["two", 16, 13, 2.7, -0.36], ["three", 9, 17, 2.5, 0.2],
  ["one", 0, 18, 2.8, -0.28], ["two", -9, 18, 2.7, 0.35], ["three", -16, 13, 2.8, -0.14],
  ["one", -18, 5, 2.5, 0.26], ["two", -18, -4, 2.7, -0.3], ["three", -17, -8, 2.6, 0.16],
] as const;

function Tree({ url, position, scale, rotation }: {
  url: string;
  position: [number, number, number];
  scale: number;
  rotation: number;
}) {
  const { scene } = useGLTF(url);
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <Clone object={scene} castShadow receiveShadow />
    </group>
  );
}

function Gate() {
  const { scene } = useGLTF(GATE_URL);
  return (
    <group position={[0, -0.05, -17]} rotation={[0, Math.PI, 0]} scale={1.15}>
      <Clone object={scene} castShadow receiveShadow />
    </group>
  );
}

function Bridge() {
  const { scene } = useGLTF(BRIDGE_URL);
  return (
    <group position={[0, -0.05, 17]} rotation={[0, Math.PI, 0]} scale={0.85}>
      <Clone object={scene} castShadow receiveShadow />
    </group>
  );
}

class WorldAssetBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[Pendekar Suryakerta] Aset GLB gagal dimuat:", error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function AssetWorld() {
  return (
    <WorldAssetBoundary>
      <Suspense fallback={null}>
        {TREE_PLACEMENTS.map(([kind, x, z, scale, rotation], index) => (
          <Tree
            key={index}
            url={TREE_URLS[kind]}
            position={[x, 0, z]}
            scale={scale}
            rotation={rotation}
          />
        ))}
        <Gate />
        <Bridge />
      </Suspense>
    </WorldAssetBoundary>
  );
}

export function SuryakertaWorld() {
  return (
    <group>
      <AssetWorld />
      <hemisphereLight args={["#a7c2bd", "#172018", 0.55]} />
      <directionalLight color="#d7c29a" intensity={1.15} position={[-16, 18, -20]} />
      <pointLight color="#d49a5a" intensity={2.2} distance={18} position={[0, 4, -18]} />
      <pointLight color="#5f9b8d" intensity={1.5} distance={16} position={[0, 3, 18]} />
    </group>
  );
}
