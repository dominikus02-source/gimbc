import { Detailed, Clone, Gltf, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
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
const ALL_TREE_URLS = Object.values(TREE_URLS).flat();

const BRIDGE_URL = "/game/assets/suryakerta/environment/stylized_bridge_low_poly.glb";

const TREE_PLACEMENTS = [
  { kind: "one", x: -17, z: -14, s: 2.8, r: 0.12 },
  { kind: "two", x: -9, z: -18, s: 2.6, r: -0.32 },
  { kind: "three", x: 0, z: -19, s: 2.9, r: 0.24 },
  { kind: "one", x: 9, z: -18, s: 2.7, r: -0.18 },
  { kind: "two", x: 17, z: -13, s: 2.8, r: 0.32 },
  { kind: "three", x: 18, z: -5, s: 2.5, r: -0.24 },
  { kind: "one", x: 18, z: 4, s: 2.7, r: 0.18 },
  { kind: "two", x: 16, z: 13, s: 2.7, r: -0.36 },
  { kind: "three", x: 9, z: 17, s: 2.5, r: 0.2 },
  { kind: "one", x: 0, z: 18, s: 2.8, r: -0.28 },
  { kind: "two", x: -9, z: 18, s: 2.7, r: 0.35 },
  { kind: "three", x: -16, z: 13, s: 2.8, r: -0.14 },
  { kind: "one", x: -18, z: 5, s: 2.5, r: 0.26 },
  { kind: "two", x: -18, z: -4, s: 2.7, r: -0.3 },
  { kind: "three", x: -17, z: -8, s: 2.6, r: 0.16 },
  { kind: "one", x: -14, z: 1, s: 2.3, r: -0.4 },
  { kind: "two", x: 14, z: 0, s: 2.3, r: 0.44 },
  { kind: "three", x: 13, z: -7, s: 2.2, r: -0.2 },
] as const;

function TreeSet({ urls }: { urls: readonly [string, string, string] }) {
  const [high, mid, low] = useGLTF(urls);
  return (
    <Detailed distances={[0, 18, 34]}>
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
    <group position={[0, -0.05, -15]} rotation={[0, Math.PI, 0]} scale={1.15}>
      <Gltf src={GATE_URL} castShadow receiveShadow />
    </group>
  );
}

function SuryakertaBridge() {
  return (
    <group position={[0, -0.05, 15]} rotation={[0, Math.PI, 0]} scale={0.85}>
      <Gltf src={BRIDGE_URL} castShadow receiveShadow />
    </group>
  );
}

function DistantForest() {
  const haze = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#17251f",
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), []);

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

function AssetWorld() {
  return (
    <Suspense fallback={null}>
      {TREE_PLACEMENTS.map((tree, index) => (
        <Tree
          key={index}
          kind={tree.kind}
          position={[tree.x, 0, tree.z]}
          scale={tree.s}
          rotation={tree.r}
        />
      ))}
      <SuryakertaGate />
      <SuryakertaBridge />
    </Suspense>
  );
}

export function SuryakertaWorld() {
  return (
    <group>
      <DistantForest />
      <AssetWorld />
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
