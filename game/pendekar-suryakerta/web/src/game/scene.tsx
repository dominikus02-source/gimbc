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
const cloth = new THREE.MeshStandardMaterial({ color: "#26313a", roughness: 0.82, metalness: 0 });
const clothLight = new THREE.MeshStandardMaterial({ color: "#596878", roughness: 0.78, metalness: 0 });
const leather = new THREE.MeshStandardMaterial({ color: "#241b18", roughness: 0.86, metalness: 0.04 });
const bronze = new THREE.MeshStandardMaterial({ color: "#b18a4a", roughness: 0.38, metalness: 0.68 });
const jade = new THREE.MeshStandardMaterial({ color: "#4f8d83", emissive: "#173c37", emissiveIntensity: 0.75, roughness: 0.28, metalness: 0.25 });
const skin = new THREE.MeshStandardMaterial({ color: "#a87355", roughness: 0.92, metalness: 0 });
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
  const sigil = useRef<THREE.Mesh>(null);
  const innerRing = useRef<THREE.Mesh>(null);
  const centerLight = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const pulse = 1 + Math.sin(world.time * 2.2) * 0.035;
    if (sigil.current) {
      sigil.current.rotation.z = world.time * 0.08;
      sigil.current.scale.setScalar(pulse);
      const mat = sigil.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(world.time * 2.2) * 0.04;
    }
    if (innerRing.current) {
      innerRing.current.rotation.z = -world.time * 0.16;
      innerRing.current.scale.setScalar(1 + Math.sin(world.time * 2.2) * 0.025);
    }
    if (centerLight.current) {
      centerLight.current.intensity = 7.5 + Math.sin(world.time * 2.2) * 1 + world.hitPulse * 4;
    }
  });
  return (
    <group>
      <pointLight ref={centerLight} color="#d8b56a" intensity={7.5} distance={17} position={[0, 5.8, 0]} />
      <pointLight color="#4f8d83" intensity={3.8} distance={14} position={[0, 3.2, -7]} />
      <pointLight color="#c45c4a" intensity={2.6} distance={12} position={[0, 3, 8]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
        <circleGeometry args={[22.4, 64]} />
        <meshStandardMaterial color="#303843" roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[20.5, 22.4, 64]} />
        <meshStandardMaterial color="#171c23" roughness={0.92} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[22.35, 22.35, 1.9, 64, 1, true]} />
        <meshStandardMaterial color="#1b2028" roughness={0.94} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[3.15, 3.55, 0.38, 32]} />
        <meshStandardMaterial color="#56606b" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh ref={sigil} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
        <torusGeometry args={[2.2, 0.055, 8, 48]} />
        <meshBasicMaterial color="#d6b46a" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh ref={innerRing} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, 0]}>
        <ringGeometry args={[1.12, 1.18, 32]} />
        <meshBasicMaterial color="#5ca69a" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[7.3, 13.1, 18.4].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026 + i * 0.002, 0]}>
          <ringGeometry args={[r, r + 0.055, 96]} />
          <meshBasicMaterial color={i === 2 ? "#394650" : "#697a7d"} transparent opacity={i === 2 ? 0.18 : 0.14 - i * 0.025} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {world.pillars.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh material={stoneDark} position={[0, 0.16, 0]} scale={[p.r * 1.22, 0.32, p.r * 1.22]} geometry={cylGeo} receiveShadow />
          <mesh material={stone} castShadow receiveShadow position={[0, p.h * 0.5, 0]} scale={[p.r, p.h, p.r]}>
            <cylinderGeometry args={[1, 1.06, 1, 10]} />
          </mesh>
          <mesh material={stoneDark} position={[0, p.h + 0.13, 0]} scale={[p.r * 1.18, 0.25, p.r * 1.18]}>
            <cylinderGeometry args={[1, 1, 1, 10]} />
          </mesh>
          <mesh material={bronze} position={[0, p.h + 0.29, 0]} scale={[p.r * 0.72, 0.05, p.r * 0.72]}>
            <cylinderGeometry args={[1, 1, 1, 10]} />
          </mesh>
          <mesh material={stoneDark} position={[p.r * 0.72, 0.18, p.r * 0.18]} rotation={[0, i, 0.4]} scale={[0.55, 0.28, 0.4]} geometry={boxGeo} />
        </group>
      ))}

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + 0.18;
        const x = Math.sin(a) * 18.2;
        const z = Math.cos(a) * 18.2;
        return (
          <group key={`altar-${i}`} position={[x, 0, z]} rotation={[0, -a, 0]}>
            <mesh material={stoneDark} position={[0, 0.48, 0]} scale={[0.38, 0.96, 0.38]} geometry={cylGeo} />
            <mesh material={bronze} position={[0, 1.02, 0]} scale={[0.23, 0.08, 0.23]} geometry={cylGeo} />
            <mesh material={ember} position={[0, 1.15, 0]} scale={[0.15, 0.2, 0.15]} geometry={sphGeo} />
            <pointLight color="#e07a4a" intensity={3.8} distance={7} position={[0, 1.35, 0]} />
          </group>
        );
      })}

      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.78;
        const x = Math.sin(a) * 15.8;
        const z = Math.cos(a) * 15.8;
        return (
          <group key={`banner-${i}`} position={[x, 0, z]} rotation={[0, a, 0]}>
            <mesh material={bronze} position={[0, 2.35, 0]} scale={[0.045, 2.1, 0.045]} geometry={cylGeo} />
            <mesh material={cloth} position={[0.25, 2.72, 0]} scale={[0.52, 0.62, 0.035]} geometry={boxGeo}>
              <meshStandardMaterial color={i % 2 ? "#2b4b50" : "#6a2924"} roughness={0.82} />
            </mesh>
            <mesh material={bronze} position={[0.25, 3.05, 0]} scale={[0.06, 0.06, 0.06]} geometry={sphGeo} />
          </group>
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <ringGeometry args={[18.9, 19.05, 96]} />
        <meshBasicMaterial color="#d6b46a" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
function Knight({ world }: { world: World }) {
  const ref = useRef<THREE.Group>(null);
  const sword = useRef<THREE.Group>(null);
  const cape = useRef<THREE.Mesh>(null);
  const scarf = useRef<THREE.Mesh>(null);
  const crystal = useRef<THREE.Mesh>(null);
  const shoulderL = useRef<THREE.Group>(null);
  const shoulderR = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = world.player;
    const g = ref.current;
    if (!g) return;
    const moving = Math.min(1, p.speed / 7.6);
    const bob = world.phase === "playing" && moving > 0.05 ? Math.sin(world.time * 13) * 0.05 * moving : 0;
    g.position.set(p.x, p.y + bob, p.z);
    g.rotation.y = p.yaw + Math.PI;
    if (sword.current) {
      const t = world.slashT > 0 ? world.slashT / world.slashDur : 0;
      const boost = world.player.attackStep === 2 ? 1.18 : world.player.attackStep === 1 ? 1.06 : 1;
      sword.current.rotation.z = t > 0 ? -Math.sin(t * Math.PI) * 1.75 * boost : -0.28;
      sword.current.rotation.x = t > 0 ? Math.sin(t * Math.PI) * 0.52 : 0.12;
    }
    if (cape.current) cape.current.rotation.x = 0.14 + Math.sin(world.time * 4.5) * 0.07;
    if (scarf.current) scarf.current.rotation.z = Math.sin(world.time * 5.5) * 0.08;
    if (crystal.current) {
      const mat = crystal.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.35 + Math.sin(world.time * 4) * 0.45;
    }
    const lean = Math.sin(world.time * 13) * 0.025 * moving;
    if (shoulderL.current) shoulderL.current.rotation.z = 0.04 + lean;
    if (shoulderR.current) shoulderR.current.rotation.z = -0.04 - lean;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <circleGeometry args={[0.68, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.34} depthWrite={false} />
      </mesh>

      {/* Siluet tubuh berlapis */}
      <mesh geometry={capGeo} material={leather} position={[0, 0.62, 0]} scale={[0.68, 0.76, 0.55]} castShadow />
      <mesh geometry={capGeo} material={cloth} position={[0, 0.76, 0]} scale={[0.54, 0.72, 0.48]} castShadow />
      <mesh geometry={boxGeo} material={steelDark} position={[0, 1.02, 0.03]} scale={[0.68, 0.46, 0.44]} castShadow />
      <mesh geometry={boxGeo} material={steel} position={[0, 1.12, 0.19]} scale={[0.46, 0.22, 0.07]} />

      {/* Bahu dan lengan */}
      <group ref={shoulderL} position={[-0.47, 1.16, 0]}>
        <mesh geometry={sphGeo} material={steel} scale={[0.22, 0.17, 0.26]} castShadow />
        <mesh geometry={capGeo} material={clothLight} position={[0, -0.24, 0]} scale={[0.25, 0.58, 0.25]} castShadow />
        <mesh geometry={sphGeo} material={leather} position={[0, -0.56, 0]} scale={[0.19, 0.18, 0.19]} />
      </group>
      <group ref={shoulderR} position={[0.47, 1.16, 0]}>
        <mesh geometry={sphGeo} material={steel} scale={[0.22, 0.17, 0.26]} castShadow />
        <mesh geometry={capGeo} material={clothLight} position={[0, -0.24, 0]} scale={[0.25, 0.58, 0.25]} castShadow />
        <mesh geometry={sphGeo} material={leather} position={[0, -0.56, 0]} scale={[0.19, 0.18, 0.19]} />
      </group>

      {/* Helm dengan visor */}
      <mesh geometry={sphGeo} material={steel} position={[0, 1.58, 0]} scale={[0.31, 0.34, 0.3]} castShadow />
      <mesh geometry={boxGeo} material={steelDark} position={[0, 1.53, 0.26]} scale={[0.3, 0.1, 0.07]} />
      <mesh geometry={boxGeo} material={leather} position={[0, 1.47, 0.29]} scale={[0.22, 0.035, 0.035]} />
      <mesh geometry={coneGeo} material={bronze} position={[0, 1.9, 0]} scale={[0.7, 0.52, 0.7]} />

      {/* Selendang dan emblem */}
      <mesh ref={cape} geometry={boxGeo} material={cloth} position={[0, 0.93, -0.32]} scale={[0.58, 0.94, 0.055]} castShadow />
      <mesh ref={scarf} geometry={boxGeo} material={clothLight} position={[0, 1.28, 0.27]} scale={[0.4, 0.08, 0.09]} />
      <mesh ref={crystal} material={jade} position={[0, 1.11, 0.27]} scale={[0.105, 0.15, 0.06]} geometry={boxGeo} />
      <mesh material={bronze} position={[0, 1.08, 0.275]} scale={[0.16, 0.035, 0.025]} geometry={boxGeo} />

      {/* Pedang */}
      <group ref={sword} position={[0.5, 0.91, 0.12]}>
        <mesh geometry={boxGeo} material={leather} scale={[0.085, 0.085, 0.24]} />
        <mesh geometry={boxGeo} material={bronze} position={[0, 0.02, 0.25]} scale={[0.23, 0.035, 0.055]} />
        <mesh geometry={boxGeo} material={steel} position={[0, 0.02, 0.72]} scale={[0.075, 0.028, 0.78]} />
        <mesh geometry={coneGeo} material={steel} position={[0, 0.02, 1.48]} rotation={[Math.PI, 0, 0]} scale={[0.42, 0.34, 0.42]} />
        <mesh geometry={sphGeo} material={ember} position={[0, 0.02, 0.25]} scale={[0.07, 0.07, 0.07]} />
      </group>
    </group>
  );
}

