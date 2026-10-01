import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { World } from "./sim";

const stone = new THREE.MeshStandardMaterial({ color: "#606771", roughness: 0.88, metalness: 0.08 });
const stoneDark = new THREE.MeshStandardMaterial({ color: "#383e47", roughness: 0.92, metalness: 0.06 });
const steel = new THREE.MeshStandardMaterial({ color: "#8a919b", roughness: 0.38, metalness: 0.62 });
const steelDark = new THREE.MeshStandardMaterial({ color: "#515963", roughness: 0.5, metalness: 0.45 });
const ember = new THREE.MeshStandardMaterial({ color: "#c45c4a", emissive: "#c45c4a", emissiveIntensity: 1.4, roughness: 0.35 });
const cloth = new THREE.MeshStandardMaterial({ color: "#353a42", roughness: 0.9, metalness: 0 });
const shadeMat = new THREE.MeshStandardMaterial({ color: "#1a2224", roughness: 0.55, metalness: 0.2, emissive: "#0d2a28", emissiveIntensity: 0.4 });
const bruteMat = new THREE.MeshStandardMaterial({ color: "#59616b", roughness: 0.78, metalness: 0.15 });
const wispMat = new THREE.MeshStandardMaterial({ color: "#6a9a94", emissive: "#6a9a94", emissiveIntensity: 1.6, roughness: 0.3, transparent: true, opacity: 0.92 });
const bossMat = new THREE.MeshStandardMaterial({ color: "#34383f", roughness: 0.5, metalness: 0.25, emissive: "#3a1814", emissiveIntensity: 0.55 });
const soulMat = new THREE.MeshStandardMaterial({ color: "#c5cdc8", emissive: "#c5cdc8", emissiveIntensity: 1.1, roughness: 0.25 });
const heartMat = new THREE.MeshStandardMaterial({ color: "#c45c4a", emissive: "#c45c4a", emissiveIntensity: 1.2, roughness: 0.3 });
const projMat = new THREE.MeshStandardMaterial({ color: "#8ec4be", emissive: "#6a9a94", emissiveIntensity: 2 });
const slashMat = new THREE.MeshBasicMaterial({ color: "#f2efe8", transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
const teleMat = new THREE.MeshBasicMaterial({ color: "#c45c4a", transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false });
const partMat = new THREE.MeshBasicMaterial({ vertexColors: true });

const capGeo = new THREE.CapsuleGeometry(0.28, 0.62, 4, 10);
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const sphGeo = new THREE.SphereGeometry(1, 12, 10);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 12);
const coneGeo = new THREE.ConeGeometry(0.18, 0.9, 5);
const ringGeo = new THREE.RingGeometry(0.4, 1, 24);
const slashGeo = new THREE.RingGeometry(0.48, 1.05, 32, 1, -0.9, 1.8);
const shockGeo = new THREE.RingGeometry(0.72, 0.78, 64);
const coneTeleGeo = new THREE.CircleGeometry(1, 32, -0.45, 0.9);
const partGeo = new THREE.SphereGeometry(1, 6, 5);
const trailGeo = new THREE.CylinderGeometry(0.045, 0.025, 1, 6);

function SimLoop({ world }: { world: World }) {
  useFrame(({ camera }, dt) => {
    world.step(dt);
    const c = world.camera;
    camera.position.set(c.x, c.y, c.z);
    camera.lookAt(c.lx, c.ly, c.lz);
    if (camera instanceof THREE.PerspectiveCamera) {
      const nextFov = world.getCameraFov();
      if (Math.abs(camera.fov - nextFov) > 0.05) {
        camera.fov += (nextFov - camera.fov) * Math.min(1, dt * 14);
        camera.updateProjectionMatrix();
      }
    }
  });
  return null;
}

function Arena({ world }: { world: World }) {
  return (
    <group>
      <pointLight color="#f0d49a" intensity={7} distance={15} position={[0, 5.5, 0]} />
      <pointLight color="#6a9a94" intensity={4.2} distance={11} position={[0, 2.5, -5]} />
      <pointLight color="#d06a4e" intensity={2.2} distance={10} position={[0, 2.5, 7]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <circleGeometry args={[22.4, 56]} />
        <meshStandardMaterial color="#4a505b" roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <ringGeometry args={[20.6, 22.35, 56]} />
        <meshStandardMaterial color="#2f353e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[22.35, 22.35, 1.8, 48, 1, true]} />
        <meshStandardMaterial color="#353b44" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[3.1, 3.4, 0.36, 24]} />
        <meshStandardMaterial color="#626a74" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[2.15, 0.045, 8, 32]} />
        <meshStandardMaterial color="#c45c4a" emissive="#c45c4a" emissiveIntensity={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[7.4, 7.48, 64]} />
        <meshBasicMaterial color="#6f7f80" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
        <ringGeometry args={[13.2, 13.28, 64]} />
        <meshBasicMaterial color="#6f7f80" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      {world.pillars.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh material={stone} castShadow receiveShadow position={[0, p.h * 0.5, 0]} scale={[p.r, p.h, p.r]}>
            <cylinderGeometry args={[1, 1.08, 1, 8]} />
          </mesh>
          <mesh material={stoneDark} position={[0, p.h + 0.12, 0]} scale={[p.r * 1.15, 0.24, p.r * 1.15]}>
            <cylinderGeometry args={[1, 1, 1, 8]} />
          </mesh>
          <mesh material={stoneDark} position={[p.r * 0.7, 0.18, p.r * 0.2]} rotation={[0, i, 0.4]} scale={[0.55, 0.28, 0.4]} geometry={boxGeo} />
        </group>
      ))}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        const x = Math.sin(a) * 18.4;
        const z = Math.cos(a) * 18.4;
        return (
          <group key={`brazier-${i}`} position={[x, 0, z]}>
            <mesh material={stoneDark} position={[0, 0.45, 0]} scale={[0.32, 0.9, 0.32]} geometry={cylGeo} />
            <mesh material={ember} position={[0, 1.05, 0]} scale={[0.22, 0.22, 0.22]} geometry={sphGeo} />
            <pointLight color="#e07a4a" intensity={5.5} distance={9} position={[0, 1.3, 0]} />
          </group>
        );
      })}
    </group>
  );
}

function Knight({ world }: { world: World }) {
  const ref = useRef<THREE.Group>(null);
  const sword = useRef<THREE.Group>(null);
  const cape = useRef<THREE.Mesh>(null);
  const crystal = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const p = world.player;
    const g = ref.current;
    if (!g) return;
    const moving = Math.min(1, p.speed / 7.6);
    const bob = world.phase === "playing" && moving > 0.05 ? Math.sin(world.time * 13) * 0.045 * moving : 0;
    g.position.set(p.x, p.y + bob, p.z);
    g.rotation.y = p.yaw + Math.PI;
    if (sword.current) {
      const t = world.slashT > 0 ? world.slashT / world.slashDur : 0;
      const stepBoost = world.player.attackStep === 2 ? 1.18 : world.player.attackStep === 1 ? 1.06 : 1;
      sword.current.rotation.z = t > 0 ? -Math.sin(t * Math.PI) * 1.7 * stepBoost : -0.35;
      sword.current.rotation.x = t > 0 ? Math.sin(t * Math.PI) * 0.5 : 0.2;
    }
    if (cape.current) cape.current.rotation.x = 0.18 + Math.sin(world.time * 5) * 0.08;
    if (crystal.current) {
      const mat = crystal.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + Math.sin(world.time * 4) * 0.35;
    }
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <circleGeometry args={[0.55, 12]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh geometry={capGeo} material={steel} position={[0, 0.85, 0]} castShadow />
      <mesh geometry={boxGeo} material={steelDark} position={[0, 1.05, 0.02]} scale={[0.62, 0.42, 0.38]} castShadow />
      <mesh geometry={boxGeo} material={steel} position={[-0.38, 1.18, 0]} scale={[0.22, 0.16, 0.32]} castShadow />
      <mesh geometry={boxGeo} material={steel} position={[0.38, 1.18, 0]} scale={[0.22, 0.16, 0.32]} castShadow />
      <mesh geometry={sphGeo} material={steel} position={[0, 1.52, 0]} scale={[0.24, 0.26, 0.24]} castShadow />
      <mesh geometry={boxGeo} material={steelDark} position={[0, 1.5, 0.16]} scale={[0.28, 0.12, 0.1]} />
      <mesh ref={crystal} material={ember} position={[0, 1.08, 0.22]} scale={[0.09, 0.14, 0.07]} geometry={boxGeo} />
      <mesh ref={cape} geometry={boxGeo} material={cloth} position={[0, 0.95, -0.28]} scale={[0.5, 0.85, 0.06]} />
      <group ref={sword} position={[0.42, 0.92, 0.18]}>
        <mesh geometry={boxGeo} material={steelDark} scale={[0.08, 0.08, 0.22]} />
        <mesh geometry={boxGeo} material={steel} position={[0, 0.02, 0.55]} scale={[0.06, 0.025, 0.85]} />
        <mesh material={ember} position={[0, 0.02, 0.22]} scale={[0.07, 0.07, 0.07]} geometry={sphGeo} />
      </group>
    </group>
  );
}

function Enemies({ world }: { world: World }) {
  return (
    <>
      {world.enemies.map((_, i) => (
        <EnemyView key={i} world={world} index={i} />
      ))}
    </>
  );
}

function EnemyView({ world, index }: { world: World; index: number }) {
  const ref = useRef<THREE.Group>(null);
  const shade = useRef<THREE.Group>(null);
  const brute = useRef<THREE.Group>(null);
  const wisp = useRef<THREE.Group>(null);
  const boss = useRef<THREE.Group>(null);
  const hpFill = useRef<THREE.Mesh>(null);
  const hpBg = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  useFrame(() => {
    const e = world.enemies[index];
    const g = ref.current;
    if (!e || !g) return;
    g.visible = e.alive;
    if (!e.alive) return;
    g.position.set(e.x, e.y, e.z);
    g.rotation.y = e.yaw + Math.PI;
    const lit = e.flash > 0 || e.wind > 0.05;
    const hitScale = e.flash > 0 ? 1 + Math.min(0.08, e.flash * 0.7) : 1;
    const rageScale = e.kind === "boss" ? 1 + e.rage * 0.035 : 1;
    const idlePulse = 1 + Math.sin(world.time * 5 + index) * 0.025;
    if (shade.current) {
      shade.current.visible = e.kind === "shade";
      shade.current.scale.setScalar(idlePulse);
    }
    if (brute.current) brute.current.scale.setScalar(e.kind === "brute" ? 1 + Math.sin(world.time * 3 + index) * 0.012 : 1);
    if (brute.current) brute.current.visible = e.kind === "brute";
    if (wisp.current) wisp.current.visible = e.kind === "wisp";
    if (boss.current) {
      boss.current.visible = e.kind === "boss";
      if (e.kind === "boss") {
        const pulse = 1 + Math.sin(world.time * (3.5 + e.rage * 2)) * (0.018 + e.rage * 0.008);
        boss.current.scale.setScalar(pulse);
      }
    }
    g.scale.setScalar((lit ? 1.06 : 1) * hitScale * rageScale);
    const hpRatio = Math.max(0, Math.min(1, e.hp / Math.max(1, e.maxHp)));
    const showHp = e.kind === "boss" || hpRatio < 0.999;
    if (hpFill.current && hpBg.current) {
      hpFill.current.visible = showHp;
      hpBg.current.visible = showHp;
      hpFill.current.scale.x = Math.max(0.001, hpRatio);
      hpFill.current.position.x = -0.72 * (1 - hpRatio);
      hpFill.current.lookAt(camera.position);
      hpBg.current.lookAt(camera.position);
    }
  });
  return (
    <group ref={ref} visible={false}>
      <mesh ref={hpBg} position={[0, 2.05, 0]} scale={[1.55, 0.12, 1]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#111317" transparent opacity={0.78} depthWrite={false} />
      </mesh>
      <mesh ref={hpFill} position={[0, 2.05, 0.01]} scale={[1.55, 0.12, 1]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#c45c4a" transparent opacity={0.95} depthWrite={false} />
      </mesh>
