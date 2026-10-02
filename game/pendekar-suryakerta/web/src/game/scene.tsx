import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { World } from "./sim";
import { SuryakertaWorld } from "./world/SuryakertaWorld";

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
      <mesh geometry={capGeo} material={leather} position={[0, 0.72, 0]} scale={[0.72, 0.82, 0.58]} castShadow />
      <mesh geometry={capGeo} material={cloth} position={[0, 0.82, 0]} scale={[0.58, 0.72, 0.5]} castShadow />
      <mesh geometry={capGeo} material={steel} position={[0, 0.92, 0]} scale={[0.5, 0.55, 0.46]} castShadow />
      <mesh geometry={boxGeo} material={steelDark} position={[0, 1.08, 0.02]} scale={[0.68, 0.44, 0.42]} castShadow />
      <mesh geometry={boxGeo} material={bronze} position={[0, 1.08, 0.23]} scale={[0.34, 0.16, 0.045]} />
      <mesh geometry={boxGeo} material={steel} position={[-0.43, 1.2, 0]} scale={[0.25, 0.18, 0.34]} castShadow />
      <mesh geometry={boxGeo} material={steel} position={[0.43, 1.2, 0]} scale={[0.25, 0.18, 0.34]} castShadow />
      <mesh geometry={boxGeo} material={clothLight} position={[-0.43, 0.98, 0]} scale={[0.18, 0.3, 0.2]} />
      <mesh geometry={boxGeo} material={clothLight} position={[0.43, 0.98, 0]} scale={[0.18, 0.3, 0.2]} />
      <mesh geometry={sphGeo} material={steel} position={[0, 1.52, 0]} scale={[0.24, 0.26, 0.24]} castShadow />
      <mesh geometry={boxGeo} material={steelDark} position={[0, 1.5, 0.16]} scale={[0.28, 0.12, 0.1]} />
      <mesh geometry={boxGeo} material={leather} position={[0, 1.47, 0.22]} scale={[0.2, 0.035, 0.035]} />
      <mesh ref={crystal} material={jade} position={[0, 1.08, 0.22]} scale={[0.1, 0.15, 0.07]} geometry={boxGeo} />
      <mesh material={bronze} position={[0, 1.08, 0.27]} scale={[0.16, 0.035, 0.025]} geometry={boxGeo} />
      <mesh ref={cape} geometry={boxGeo} material={cloth} position={[0, 0.95, -0.3]} scale={[0.56, 0.92, 0.06]} castShadow />
      <group ref={sword} position={[0.42, 0.92, 0.18]}>
        <mesh geometry={boxGeo} material={steelDark} scale={[0.08, 0.08, 0.22]} />
        <mesh geometry={boxGeo} material={steel} position={[0, 0.02, 0.55]} scale={[0.06, 0.025, 0.85]} />
        <mesh material={bronze} position={[0, 0.02, 0.22]} scale={[0.07, 0.07, 0.07]} geometry={sphGeo} />
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
      <group ref={shade}>
        <mesh geometry={capGeo} material={shadeMat} position={[0, 0.7, 0]} scale={[0.85, 0.85, 0.85]} castShadow />
        <mesh geometry={sphGeo} material={shadeMat} position={[0, 1.28, 0]} scale={[0.22, 0.22, 0.22]} />
        <mesh material={ember} position={[-0.08, 1.3, 0.16]} scale={[0.04, 0.04, 0.04]} geometry={sphGeo} />
        <mesh material={ember} position={[0.08, 1.3, 0.16]} scale={[0.04, 0.04, 0.04]} geometry={sphGeo} />
      </group>
      <group ref={brute}>
        <mesh geometry={boxGeo} material={bruteMat} position={[0, 0.85, 0]} scale={[1.15, 1.5, 0.85]} castShadow />
        <mesh geometry={boxGeo} material={steelDark} position={[0, 1.7, 0]} scale={[0.7, 0.45, 0.6]} />
        <mesh geometry={boxGeo} material={bruteMat} position={[-0.7, 1.15, 0]} scale={[0.35, 0.9, 0.4]} />
        <mesh geometry={boxGeo} material={bruteMat} position={[0.7, 1.15, 0]} scale={[0.35, 0.9, 0.4]} />
      </group>
      <group ref={wisp}>
        <mesh geometry={sphGeo} material={wispMat} scale={[0.38, 0.38, 0.38]} />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.52, 0.03, 6, 16]} />
          <meshStandardMaterial color="#c5cdc8" emissive="#8aa8a4" emissiveIntensity={0.8} />
        </mesh>
        <pointLight color="#8ec4be" intensity={2.2} distance={4.5} />
      </group>
      <group ref={boss}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <torusGeometry args={[1.45, 0.055, 8, 36]} />
          <meshBasicMaterial color="#c45c4a" transparent opacity={0.55} depthWrite={false} />
        </mesh>
        <mesh geometry={capGeo} material={bossMat} position={[0, 1.35, 0]} scale={[1.6, 1.8, 1.6]} castShadow />
        <mesh geometry={coneGeo} material={bossMat} position={[0, 2.55, 0]} scale={[2.4, 1.4, 2.4]} />
        <mesh material={ember} position={[0, 1.7, 0.55]} scale={[0.18, 0.12, 0.08]} geometry={boxGeo} />
        <mesh geometry={sphGeo} material={ember} position={[0, 2.15, 0.35]} scale={[0.16, 0.16, 0.16]} />
        <pointLight color="#c45c4a" intensity={3.6} distance={5.5} />
      </group>
    </group>
  );
}

function Pickups({ world }: { world: World }) {
  const soul = useRef<THREE.InstancedMesh>(null);
  const heart = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    let s = 0;
    let h = 0;
    for (const u of world.pickups) {
      if (!u.alive) continue;
      dummy.position.set(u.x, u.y, u.z);
      dummy.rotation.set(world.time * 2, u.t * 3, 0.4);
      dummy.scale.setScalar(u.kind === "heart" ? 0.18 : 0.14);
      dummy.updateMatrix();
      const mesh = u.kind === "heart" ? heart.current : soul.current;
      const idx = u.kind === "heart" ? h++ : s++;
      mesh?.setMatrixAt(idx, dummy.matrix);
    }
    if (soul.current) {
      soul.current.count = s;
      soul.current.instanceMatrix.needsUpdate = true;
    }
    if (heart.current) {
      heart.current.count = h;
      heart.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <>
      <instancedMesh ref={soul} args={[sphGeo, soulMat, 40]} frustumCulled={false} />
      <instancedMesh ref={heart} args={[sphGeo, heartMat, 16]} frustumCulled={false} />
    </>
  );
}

function Projectiles({ world }: { world: World }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    let i = 0;
    const m = mesh.current;
    if (!m) return;
    for (const p of world.projs) {
      if (!p.alive) continue;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(0.22);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      i++;
    }
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[sphGeo, projMat, 28]} frustumCulled={false} />;
}

function ProjectileTrails({ world }: { world: World }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    for (let i = 0; i < 28; i++) {
      const m = refs.current[i];
      const p = world.projs[i];
      if (!m || !p || !p.alive) {
        if (m) m.visible = false;
        continue;
      }
      const dx = p.x - p.px;
      const dz = p.z - p.pz;
      const len = Math.max(0.12, Math.hypot(dx, dz) * 1.9);
      m.visible = true;
      m.position.set((p.x + p.px) * 0.5, p.y, (p.z + p.pz) * 0.5);
      m.scale.set(1, len, 1);
      m.rotation.set(Math.PI / 2, Math.atan2(dx, dz), 0);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(0.42, p.life * 0.22);
    }
  });
  return (
    <>
      {Array.from({ length: 28 }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} geometry={trailGeo} visible={false}>
          <meshBasicMaterial color="#8ec4be" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function Particles({ world }: { world: World }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    let i = 0;
    for (const p of world.particles) {
      if (!p.alive) continue;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.size * (p.life / p.max));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      color.setRGB(p.r, p.g, p.b);
      m.setColorAt(i, color);
      i++;
    }
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[partGeo, partMat, 96]} frustumCulled={false} />;
}

function DamageNumbers({ world }: { world: World }) {
  return (
    <>
      {world.floats.map((f, i) => {
        if (!f.alive) return null;
        return (
          <Html key={i} position={[f.x, f.y, f.z]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
            <div className={f.crit ? "damage-number damage-number-crit" : "damage-number"} style={{ opacity: Math.min(1, f.life * 2.2), transform: `translateY(${(0.7 - f.life) * -12}px)` }}>
              {f.crit ? "✦ " : ""}{f.text}
            </div>
          </Html>
        );
      })}
    </>
  );
}

function PerfectDodgeFx({ world }: { world: World }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const active = world.perfectT > 0;
    m.visible = active;
    if (!active) return;
    const k = 1 - world.perfectT / 0.22;
    m.position.set(world.player.x, 0.12, world.player.z);
    m.scale.setScalar(0.8 + k * 1.8);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = (1 - k) * 0.85;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.46, 0.58, 40]} />
      <meshBasicMaterial color="#d6eee9" transparent opacity={0.85} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ShockwaveFx({ world }: { world: World }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const active = world.shockT > 0;
    m.visible = active;
    if (!active) return;
    const progress = 1 - world.shockT / 0.42;
    const scale = 0.45 + progress * (world.shockMax / 0.78);
    m.position.set(world.shockX, 0.075, world.shockZ);
    m.scale.setScalar(scale);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, (1 - progress) * 0.6);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} geometry={shockGeo} visible={false}>
      <meshBasicMaterial color="#c5cdc8" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function SlashFx({ world }: { world: World }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const on = world.slashT > 0 && world.phase === "playing";
    m.visible = on;
    if (!on) return;
    const p = world.player;
    const fx = -Math.sin(world.slashYaw);
    const fz = -Math.cos(world.slashYaw);
    m.position.set(p.x + fx * 1.1, 0.95, p.z + fz * 1.1);
    m.rotation.set(-Math.PI / 2, 0, world.slashYaw);
    const mat = m.material as THREE.MeshBasicMaterial;
    const progress = Math.max(0, Math.min(1, world.slashT / world.slashDur));
    mat.opacity = progress * 0.55;
    const stepScale = world.player.attackStep === 2 ? 1.18 : world.player.attackStep === 1 ? 1.07 : 1;
    m.scale.setScalar(1.7 * stepScale);
  });
  return <mesh ref={ref} geometry={slashGeo} material={slashMat} scale={[1.7, 1.7, 1.7]} visible={false} />;
}

function Telegraphs({ world }: { world: World }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    for (let i = 0; i < 8; i++) {
      const mesh = refs.current[i];
      const t = world.telegraphs[i];
      if (!mesh) continue;
      if (!t) {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;
      mesh.position.set(t.x, 0.06, t.z);
      const k = 1 - t.t / t.max;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + k * 0.38;
      mat.color.set(t.tone === "emas" ? "#e0a84a" : t.tone === "biru" ? "#6aa8b5" : "#c45c4a");
      if (t.kind === "cone") {
        mesh.geometry = coneTeleGeo;
        mesh.rotation.set(-Math.PI / 2, 0, (t.yaw ?? 0));
        mesh.scale.set(t.r, t.r * (t.width ?? 0.72), t.r);
      } else {
        mesh.geometry = ringGeo;
        mesh.rotation.set(-Math.PI / 2, 0, 0);
        mesh.scale.set(t.r, t.r, t.r);
      }
    }
  });
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} rotation={[-Math.PI / 2, 0, 0]} geometry={ringGeo} material={teleMat.clone()} visible={false} />
      ))}
    </>
  );
}


function WorldDressing() {
  const trees = [
    [-15, -12, 0.72], [-10, -15, 0.62], [0, -16, 0.7], [10, -15, 0.64], [15, -12, 0.72],
    [-17, -4, 0.68], [17, -3, 0.7], [-18, 6, 0.62], [18, 7, 0.68],
    [-13, 13, 0.62], [0, 16, 0.7], [13, 13, 0.64],
  ] as const;

  const rocks = [
    [-12, -9, 0.9], [12, -10, 0.75], [-16, 2, 0.7], [16, 4, 0.8],
    [-11, 11, 0.65], [11, 12, 0.7],
  ] as const;

  const lanterns = [
    [-10.5, -12.5], [10.5, -12.5], [-15.5, 5.5], [15.5, 6],
  ] as const;

  return (
    <group>
      {trees.map(([x, z, s], i) => (
        <group key={i} position={[x, 0.05, z]} scale={s} frustumCulled={false}>
          <mesh position={[0, 1.45, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.3, 2.9, 7]} />
            <meshStandardMaterial color="#4a3022" roughness={0.92} />
          </mesh>
          <mesh position={[-0.42, 2.8, 0]} rotation={[0, 0, -0.08]} castShadow>
            <coneGeometry args={[1.35, 2.5, 9]} />
            <meshStandardMaterial color="#173e33" roughness={0.9} />
          </mesh>
          <mesh position={[0.38, 3.35, -0.04]} rotation={[0, 0, 0.08]} castShadow>
            <coneGeometry args={[1.18, 2.35, 9]} />
            <meshStandardMaterial color="#245849" roughness={0.88} />
          </mesh>
          <mesh position={[0, 4.05, 0.02]} castShadow>
            <coneGeometry args={[0.82, 1.7, 9]} />
            <meshStandardMaterial color="#34705a" roughness={0.84} />
          </mesh>
        </group>
      ))}

      {rocks.map(([x, z, s], i) => (
        <mesh key={`rock-${i}`} position={[x, 0.18, z]} scale={s} rotation={[0.08, i * 0.7, -0.05]} castShadow>
          <icosahedronGeometry args={[0.75, 1]} />
          <meshStandardMaterial color="#4b514d" roughness={0.96} />
        </mesh>
      ))}

      <group position={[0, 0, -15]} scale={0.56}>
        <mesh position={[-3.1, 3.1, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.7, 6.2, 8]} />
          <meshStandardMaterial color="#4a3424" roughness={0.9} />
        </mesh>
        <mesh position={[3.1, 3.1, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.7, 6.2, 8]} />
          <meshStandardMaterial color="#4a3424" roughness={0.9} />
        </mesh>
        <mesh position={[0, 6.15, 0]} castShadow>
          <boxGeometry args={[7.5, 0.75, 0.9]} />
          <meshStandardMaterial color="#8b6337" roughness={0.72} metalness={0.12} />
        </mesh>
        <mesh position={[0, 4.65, 0]} castShadow>
          <boxGeometry args={[5.6, 0.42, 0.72]} />
          <meshStandardMaterial color="#624324" roughness={0.82} />
        </mesh>
        <mesh position={[0, 5.4, 0.04]}>
          <boxGeometry args={[2.7, 0.7, 0.12]} />
          <meshStandardMaterial color="#a77b42" roughness={0.7} metalness={0.08} />
        </mesh>
      </group>

      {lanterns.map(([x, z], i) => (
        <group key={`lantern-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 1.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.11, 2.5, 6]} />
            <meshStandardMaterial color="#3a2921" roughness={0.9} />
          </mesh>
          <mesh position={[0, 2.45, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.28, 0.48, 8]} />
            <meshStandardMaterial
              color="#7b4a25"
              emissive="#d58b42"
              emissiveIntensity={0.8}
              roughness={0.65}
            />
          </mesh>
          <pointLight color="#d89a58" intensity={0.9} distance={6} position={[0, 2.45, 0]} />
        </group>
      ))}

      <group position={[0, 0, 15]} scale={0.72}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <boxGeometry args={[7.5, 5.5, 0.35]} />
          <meshStandardMaterial color="#5e5b52" roughness={0.96} />
        </mesh>
        {[-2.6, -1.3, 0, 1.3, 2.6].map((x) => (
          <mesh key={x} position={[x, 0.2, 0]}>
            <boxGeometry args={[0.14, 0.35, 5.6]} />
            <meshStandardMaterial color="#9d7848" roughness={0.76} />
          </mesh>
        ))}
      </group>

      <hemisphereLight args={["#a9c4bd", "#141b18", 0.34]} />
      <directionalLight color="#d6bc8d" intensity={0.62} position={[-14, 15, -18]} />
    </group>
  );
}

export function GameCanvas({ world }: { world: World }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 44, near: 0.12, far: 140, position: [0, 7.4, 12.8] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#080a0d");
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.22;
      }}
    >
      <SimLoop world={world} />
      <fog attach="fog" args={["#11151a", 18, 52]} />
      <hemisphereLight args={["#dbe4ea", "#3a302a", 0.82]} />
      <ambientLight intensity={0.38} />
      <directionalLight castShadow position={[14, 24, 10]} intensity={2.2} color="#c2ced6" shadow-mapSize={[1024, 1024]} shadow-camera-near={2} shadow-camera-far={70} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} />
      <Stars radius={90} depth={40} count={900} factor={2.4} saturation={0.15} fade speed={0.3} />
      <Arena world={world} />
      <SuryakertaWorld />
      <Knight world={world} />
      <Enemies world={world} />
      <Pickups world={world} />
      <Projectiles world={world} />
      <ProjectileTrails world={world} />
      <Particles world={world} />
      <SlashFx world={world} />
      <PerfectDodgeFx world={world} />
      <ShockwaveFx world={world} />
      <DamageNumbers world={world} />
      <Telegraphs world={world} />
    </Canvas>
  );
}
