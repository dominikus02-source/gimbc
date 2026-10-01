import { Detailed, Clone, Gltf, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const TREE_URLS = {
  one: [
    "/game/assets/suryakerta/vegetation/Tree_A_01.glb",
    "/game/assets/suryakerta/vegetation/Tree_A_01_LOD1.glb",
    "/game/assets/suryakerta/vegetation/Tree_A_01_LOD2.glb",
  ],
  two: [
    "/game/assets/suryakerta/vegetation/Tree_A_02.glb",
    "/game/assets/suryakerta/vegetation/Tree_A_02_LOD1.glb",
    "/game/assets/suryakerta/vegetation/Tree_A_02_LOD2.glb",
  ],
  three: [
    "/game/assets/suryakerta/vegetation/Tree_A_03.glb",
    "/game/assets/suryakerta/vegetation/Tree_A_03_LOD1.glb",
    "/game/assets/suryakerta/vegetation/Tree_A_03_LOD2.glb",
  ],
} as const;

const GATE_URL = "/game/assets/suryakerta/environment/silent_hill_front_gate.glb";
const BRIDGE_URL = "/game/assets/suryakerta/environment/stylized_bridge_low_poly.glb";

const TREE_PLACEMENTS = [
  { kind: "one", x: -18, z: -18, s: 2.2, r: 0.12 },
  { kind: "two", x: -11, z: -23, s: 1.9, r: -0.32 },
  { kind: "three", x: -3, z: -27, s: 2.1, r: 0.24 },
  { kind: "one", x: 8, z: -26, s: 2.0, r: -0.18 },
  { kind: "two", x: 18, z: -20, s: 2.3, r: 0.32 },
  { kind: "three", x: 23, z: -10, s: 1.8, r: -0.24 },
  { kind: "one", x: 25, z: 0, s: 2.1, r: 0.18 },
  { kind: "two", x: 23, z: 11, s: 2.2, r: -0.36 },
  { kind: "three", x: 17, z: 20, s: 1.9, r: 0.2 },
  { kind: "one", x: 7, z: 25, s: 2.1, r: -0.28 },
  { kind: "two", x: -5, z: 26, s: 2.0, r: 0.35 },
  { kind: "three", x: -17, z: 21, s: 2.2, r: -0.14 },
  { kind: "one", x: -24, z: 10, s: 1.8, r: 0.26 },
  { kind: "two", x: -25, z: -2, s: 2.1, r: -0.3 },
  { kind: "three", x: -23, z: -11, s: 1.9, r: 0.16 },
  { kind: "one", x: -15, z: 6, s: 1.6, r: -0.4 },
  { kind: "two", x: 15, z: 6, s: 1.7, r: 0.44 },
  { kind: "three", x: 12, z: -7, s: 1.55, r: -0.2 },
] as const;

function TreeSet({ urls }: { urls: readonly [string, string, string] }) {
  const [high, mid, low] = useGLTF(urls);
  return (
    <Detailed distances={[0, 14, 27]}>
      <Clone object={high.scene} castShadow receiveShadow />
      <Clone object={mid.scene} castShadow receiveShadow />
      <Clone object={low.scene} castShadow receiveShadow />
    </Detailed>
  );
}

function Tree({ kind, position, scale, rotation }: {
  kind: keyof typeof TREE_URLS;
  position: [number, number, number];
  scale: number;
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <TreeSet urls={TREE_URLS[kind]} />
    </group>
  );
}

function SuryakertaGate() {
  return (
    <group position={[0, -0.05, -25.5]} rotation={[0, Math.PI, 0]} scale={5.2}>
      <Gltf src={GATE_URL} castShadow receiveShadow />
    </group>
  );
}

function SuryakertaBridge() {
  return (
    <group position={[0, -0.05, 25]} rotation={[0, Math.PI, 0]} scale={2.35}>
      <Gltf src={BRIDGE_URL} castShadow receiveShadow />
    </group>
  );
}

function DistantForest() {
  const haze = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      color: "#17251f",
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    return material;
  }, []);

  return (
    <group>
      <mesh position={[0, 8, -38]} scale={[34, 13, 1]} material={haze}>
        <planeGeometry args={[2, 1]} />
      </mesh>
      <mesh position={[31, 7, -10]} rotation={[0, -Math.PI / 2, 0]} scale={[24, 10, 1]} material={haze}>
        <planeGeometry args={[2, 1]} />
      </mesh>
      <mesh position={[-31, 7, -10]} rotation={[0, Math.PI / 2, 0]} scale={[24, 10, 1]} material={haze}>
        <planeGeometry args={[2, 1]} />
      </mesh>
    </group>
  );
}

export function SuryakertaWorld() {
  return (
    <group>
      <DistantForest />
      <SuryakertaGate />
      <SuryakertaBridge />
      {TREE_PLACEMENTS.map((tree, index) => (
        <Tree
          key={index}
          kind={tree.kind}
          position={[tree.x, 0, tree.z]}
          scale={tree.s}
          rotation={tree.r}
        />
      ))}
      <hemisphereLight args={["#a7c2bd", "#172018", 0.42]} />
      <directionalLight
        color="#d7c29a"
        intensity={0.8}
        position={[-16, 18, -20]}
      />
      <pointLight color="#d49a5a" intensity={1.8} distance={18} position={[0, 4, -18]} />
      <pointLight color="#5f9b8d" intensity={1.2} distance={16} position={[0, 3, 18]} />
    </group>
  );
}

useGLTF.preload(TREE_URLS.one);
useGLTF.preload(TREE_URLS.two);
useGLTF.preload(TREE_URLS.three);
useGLTF.preload(GATE_URL);
useGLTF.preload(BRIDGE_URL);
