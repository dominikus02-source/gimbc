import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clone, Html, useGLTF } from "@react-three/drei";
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

const LANDSCAPE_URL = "/game/assets/world/DuniaBahasaWorld.glb";

function LandscapeWorld() {
  const { scene } = useGLTF(LANDSCAPE_URL);

  const landscape = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      const name = object.name.toLowerCase();
      const materials = "material" in object && object.material
        ? Array.isArray(object.material) ? object.material : [object.material]
        : [];
      const materialNames = materials
        .map((material) => (material as THREE.Material).name?.toLowerCase?.() ?? "")
        .join(" ");

      const isTallHouse =
        name.includes("rumahpanggung") ||
        name.includes("rumah_panggung") ||
        name.includes("rumah-panggung") ||
        name.includes("stilt_house") ||
        name.includes("stilt-house") ||
        name.includes("tall_house") ||
        name.includes("tall-house");

      const isSnow =
        name.includes("snow") ||
        name.includes("salju") ||
        name.includes("winter") ||
        name.includes("frost") ||
        name.includes("ice");

      if (isTallHouse || isSnow || materialNames.includes("snow") || materialNames.includes("salju")) {
        object.visible = false;
      }
    });
    return clone;
  }, [scene]);

  return <Clone object={landscape} castShadow receiveShadow />;
}

useGLTF.preload(LANDSCAPE_URL);

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
      const boost = world.player.attackStep === 2 ? 1.18 : world.player.attackStep === 1 ? 1.06 : 1;
      sword.current.rotation.z = t > 0 ? -Math.sin(t * Math.PI) * 1.7 * boost : -0.35;
      sword.current.rotation.x = t > 0 ? Math.sin(t * Math.PI) * 0.5 : 0.2;
    }
    if (cape.current) cape.current.rotation.x = 0.18 + Math.sin(world.time * 5) * 0.08;
    if (crystal.current) {
      const mat = crystal.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.1 + Math.sin(world.time * 4) * 0.3;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <circleGeometry args={[0.62, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* kaki dan sepatu */}
      <mesh material={leather} position={[-0.2, 0.38, 0.02]} scale={[0.18, 0.5, 0.2]} castShadow geometry={capGeo} />
      <mesh material={leather} position={[0.2, 0.38, 0.02]} scale={[0.18, 0.5, 0.2]} castShadow geometry={capGeo} />
      <mesh material={steelDark} position={[-0.2, 0.16, 0.16]} scale={[0.2, 0.13, 0.34]} castShadow geometry={boxGeo} />
      <mesh material={steelDark} position={[0.2, 0.16, 0.16]} scale={[0.2, 0.13, 0.34]} castShadow geometry={boxGeo} />

      {/* jubah dan lapisan baju */}
      <mesh material={leather} position={[0, 0.7, 0]} scale={[0.54, 0.72, 0.42]} castShadow geometry={capGeo} />
      <mesh material={cloth} position={[0, 0.76, 0.02]} scale={[0.47, 0.62, 0.38]} castShadow geometry={capGeo} />
      <mesh material={bronze} position={[0, 0.93, 0.36]} scale={[0.27, 0.16, 0.035]} geometry={boxGeo} />
      <mesh material={leather} position={[0, 0.94, 0.02]} scale={[0.58, 0.075, 0.46]} geometry={boxGeo} />
      <mesh material={jade} ref={crystal} position={[0, 0.96, 0.28]} scale={[0.1, 0.14, 0.06]} geometry={boxGeo} />

      {/* bahu, lengan, dan sarung tangan */}
      <mesh material={steel} position={[-0.48, 0.98, 0]} scale={[0.25, 0.18, 0.3]} castShadow geometry={boxGeo} />
      <mesh material={steel} position={[0.48, 0.98, 0]} scale={[0.25, 0.18, 0.3]} castShadow geometry={boxGeo} />
      <mesh material={clothLight} position={[-0.5, 0.73, 0]} scale={[0.16, 0.35, 0.18]} geometry={capGeo} />
      <mesh material={clothLight} position={[0.5, 0.73, 0]} scale={[0.16, 0.35, 0.18]} geometry={capGeo} />
      <mesh material={leather} position={[-0.5, 0.5, 0.08]} scale={[0.14, 0.14, 0.16]} geometry={sphGeo} />
      <mesh material={leather} position={[0.5, 0.5, 0.08]} scale={[0.14, 0.14, 0.16]} geometry={sphGeo} />

      {/* kepala, rambut, pelindung wajah */}
      <mesh material={leather} position={[0, 1.43, 0]} scale={[0.3, 0.34, 0.29]} castShadow geometry={sphGeo} />
      <mesh material={steel} position={[0, 1.5, 0]} scale={[0.34, 0.18, 0.32]} castShadow geometry={sphGeo} />
      <mesh material={steelDark} position={[0, 1.42, 0.25]} scale={[0.28, 0.11, 0.08]} geometry={boxGeo} />
      <mesh material={leather} position={[0, 1.41, 0.31]} scale={[0.19, 0.025, 0.025]} geometry={boxGeo} />
      <mesh material={bronze} position={[0, 1.58, 0.02]} scale={[0.24, 0.035, 0.16]} geometry={boxGeo} />

      {/* kain belakang */}
      <mesh ref={cape} geometry={boxGeo} material={cloth} position={[0, 0.8, -0.32]} scale={[0.5, 0.95, 0.07]} castShadow />
      <mesh material={jade} position={[0, 1.12, -0.39]} scale={[0.12, 0.2, 0.035]} geometry={boxGeo} />

      {/* pedang */}
      <group ref={sword} position={[0.48, 0.74, 0.18]}>
        <mesh geometry={boxGeo} material={steelDark} scale={[0.08, 0.08, 0.22]} />
        <mesh geometry={boxGeo} material={steel} position={[0, 0.02, 0.55]} scale={[0.065, 0.025, 0.85]} />
        <mesh material={bronze} position={[0, 0.02, 0.22]} scale={[0.08, 0.07, 0.07]} geometry={sphGeo} />
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
      <hemisphereLight args={["#dbe4ea", "#3a302a", 0.82]} />
      <ambientLight intensity={0.38} />
      <directionalLight castShadow position={[14, 24, 10]} intensity={2.2} color="#c2ced6" shadow-mapSize={[1024, 1024]} shadow-camera-near={2} shadow-camera-far={70} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} />
      <LandscapeWorld />
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
