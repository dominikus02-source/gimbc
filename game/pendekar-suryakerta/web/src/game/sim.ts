import { Input } from "./input";
import { isMuted, setMuted, sfxPlay, unlockAudio } from "./audio";
import { loadSave, recordRun, type SaveData } from "./save";
import { pickRelics, type Relic } from "./relics";
import { useHud, type HudState, type Phase } from "./hud";

const ARENA = 22;
const STEP = 1 / 60;
const MAX_ENEMIES = 22;
const MAX_PROJ = 28;
const MAX_PICK = 40;
const MAX_PART = 96;
const MAX_FLOAT = 18;

export type Kind = "shade" | "brute" | "wisp" | "boss";

export type Enemy = {
  alive: boolean;
  kind: Kind;
  x: number;
  z: number;
  y: number;
  yaw: number;
  hp: number;
  maxHp: number;
  r: number;
  speed: number;
  dmg: number;
  cd: number;
  wind: number;
  stun: number;
  flash: number;
  state: number;
  stateT: number;
  hitId: number;
  rage: number;
  chargeX: number;
  chargeZ: number;
};

export type Proj = {
  alive: boolean;
  x: number;
  z: number;
  px: number;
  pz: number;
  y: number;
  vx: number;
  vz: number;
  life: number;
  dmg: number;
  r: number;
};

export type Pickup = {
  alive: boolean;
  x: number;
  z: number;
  y: number;
  vy: number;
  kind: "soul" | "heart";
  val: number;
  t: number;
};

export type Particle = {
  alive: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
  size: number;
  r: number;
  g: number;
  b: number;
};

export type DmgFloat = {
  alive: boolean;
  x: number;
  y: number;
  z: number;
  text: string;
  life: number;
  crit: boolean;
};

export type Pillar = { x: number; z: number; r: number; h: number };

export type Telegraph = { x: number; z: number; r: number; t: number; max: number; kind?: "circle" | "cone"; yaw?: number; width?: number; tone?: "merah" | "emas" | "biru" };

type Player = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  r: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  speed: number;
  atkT: number;
  atkCd: number;
  combo: number;
  comboT: number;
  dodgeT: number;
  invuln: number;
  flash: number;
  lunge: number;
  novaCd: number;
  snareCd: number;
  rendCd: number;
  staDelay: number;
  hitId: number;
  dashX: number;
  dashZ: number;
  attackStep: number;
  attackChainT: number;
};

type Mods = {
  dmg: number;
  speed: number;
  taken: number;
  lifesteal: number;
  magnet: number;
  atkSpd: number;
  crit: number;
  wake: boolean;
  shock: boolean;
  thorns: number;
  staminaRegen: number;
};

const BASE_MODS: Mods = {
  dmg: 1,
  speed: 1,
  taken: 1,
  lifesteal: 0,
  magnet: 2.4,
  atkSpd: 1,
  crit: 0,
  wake: false,
  shock: false,
  thorns: 0,
  staminaRegen: 1,
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function angDiff(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

export class World {
  phase: Phase = "title";
  time = 0;
  runTime = 0;
  input = new Input();
  player: Player = this.freshPlayer();
  enemies: Enemy[] = [];
  projs: Proj[] = [];
  pickups: Pickup[] = [];
  particles: Particle[] = [];
  floats: DmgFloat[] = [];
  pillars: Pillar[] = [];
  telegraphs: Telegraph[] = [];
  camera = { x: 0, y: 8, z: 14, lx: 0, ly: 1.1, lz: 0 };
  wave = 0;
  souls = 0;
  combo = 0;
  comboT = 0;
  kills = 0;
  waveDamageTaken = 0;
  waveStartedAt = 0;
  flawlessWaves = 0;
  xp = 0;
  xpNext = 80;
  level = 1;
  banner: string | null = "Pendekar Suryakerta";
  bannerT = 0;
  choices: Relic[] | null = null;
  owned = new Set<string>();
  mods: Mods = { ...BASE_MODS };
  trauma = 0;
  hitstop = 0;
  hurt = 0;
  acc = 0;
  seed = 1;
  spawnQ: { kind: Kind; delay: number }[] = [];
  reducedMotion = false;
  save: SaveData = loadSave();
  slashT = 0;
  slashDur = 0.18;
  slashYaw = 0;
  perfectT = 0;
  shockT = 0;
  shockX = 0;
  shockZ = 0;
  shockMax = 0;
  hitPulse = 0;
  pubAcc = 0;
  attackRange = 2.25;
  comboDamageCap = 0.18;
  waveGrace = 0;

  constructor() {
    for (let i = 0; i < MAX_ENEMIES; i++) this.enemies.push(this.mkEnemy());
    for (let i = 0; i < MAX_PROJ; i++) this.projs.push(this.mkProj());
    for (let i = 0; i < MAX_PICK; i++) this.pickups.push(this.mkPick());
    for (let i = 0; i < MAX_PART; i++) this.particles.push(this.mkPart());
    for (let i = 0; i < MAX_FLOAT; i++) this.floats.push(this.mkFloat());
    this.buildArena();
  }

  mount() {
    this.input.mount();
    this.reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.wireControls();
    this.publish(true);
  }

  unmount() {
    this.input.unmount();
    if (typeof window !== "undefined") delete window.__controlsTest;
  }

  start() {
    unlockAudio();
    sfxPlay.ui();
    this.resetRun();
    this.phase = "playing";
    this.snapCamera();
    this.banner = "Gelombang 1";
    this.bannerT = 2.2;
    this.beginWave();
    this.waveGrace = 1.2;
    this.publish(true);
  }

  restart() {
    this.start();
  }

  choose(id: string) {
    if (this.phase !== "pick" || !this.choices) return;
    const relic = this.choices.find((c) => c.id === id);
    if (!relic) return;
    sfxPlay.ui();
    this.applyRelic(relic);
    this.choices = null;
    this.phase = "playing";
    this.beginWave();
    this.publish(true);
  }

  toggleMute() {
    setMuted(!isMuted());
    this.publish(true);
  }

  step(dt: number) {
    const d = Math.min(dt, 0.1);
    this.input.poll();
    this.time += d;

    if (this.phase === "title") {
      this.stepTitle(d);
      this.tickVfx(d);
      this.syncCamera(d);
      this.maybePublish(d);
      return;
    }

    if (this.phase === "paused") {
      if (this.input.justPause || this.input.justConfirm) {
        this.phase = "playing";
        this.publish(true);
      }
      this.syncCamera(d);
      this.maybePublish(d);
      return;
    }

    if (this.phase === "dead" || this.phase === "pick") {
      this.tickVfx(d);
      this.syncCamera(d);
      this.maybePublish(d);
      return;
    }

    if (this.input.justPause) {
      this.phase = "paused";
      this.publish(true);
      return;
    }

    if (this.hitstop > 0) {
      this.hitstop -= d;
      this.tickVfx(d * 0.35);
      this.syncCamera(d);
      return;
    }

    this.acc += d;
    let steps = 0;
    while (this.acc >= STEP && steps < 5) {
      this.fixed(STEP);
      this.acc -= STEP;
      steps++;
    }
    this.tickVfx(d);
    this.syncCamera(d);
    this.maybePublish(d);
  }
    if (this.input.justPause) {
      this.phase = "paused";
      this.publish(true);
      return;
    }

    if (this.hitstop > 0) {
      this.hitstop -= d;
      this.tickVfx(d * 0.35);
      this.syncCamera(d);
      return;
    }

    this.acc += d;
    let steps = 0;
    while (this.acc >= STEP && steps < 5) {
      this.fixed(STEP);
      this.acc -= STEP;
      steps++;
    }
    this.tickVfx(d);
    this.syncCamera(d);
    this.maybePublish(d);
  }

  private wireControls() {
    if (typeof window === "undefined") return;
    window.__controlsTest = {
      getYaw: () => this.player.yaw,
      getSpeed: () => this.player.speed,
      setKeys: (codes: string[]) => this.input.setInjected(codes),
    };
  }

  private freshPlayer(): Player {
    return {
      x: 0,
      y: 0,
      z: 0,
      yaw: 0,
      r: 0.42,
      hp: 100,
      maxHp: 100,
      stamina: 100,
      maxStamina: 100,
      speed: 0,
      atkT: 0,
      atkCd: 0,
      combo: 0,
      comboT: 0,
      dodgeT: 0,
      invuln: 0,
      flash: 0,
      lunge: 0,
      novaCd: 0,
      snareCd: 0,
      rendCd: 0,
      staDelay: 0,
      hitId: 1,
      dashX: 0,
      dashZ: -1,
      attackStep: 0,
      attackChainT: 0,
    };
  }

  private resetRun() {
    this.player = this.freshPlayer();
    this.mods = { ...BASE_MODS };
    this.owned.clear();
    this.wave = 0;
    this.souls = 0;
    this.combo = 0;
    this.comboT = 0;
    this.kills = 0;
    this.xp = 0;
    this.xpNext = 80;
    this.level = 1;
    this.runTime = 0;
    this.trauma = 0;
    this.hitstop = 0;
    this.hurt = 0;
    this.spawnQ = [];
    this.telegraphs = [];
    this.choices = null;
    this.seed = (Date.now() % 1_000_000) + 1;
    for (const e of this.enemies) e.alive = false;
    for (const p of this.projs) p.alive = false;
    for (const p of this.pickups) p.alive = false;
    for (const p of this.particles) p.alive = false;
    for (const f of this.floats) f.alive = false;
  }

  private beginWave() {
    this.wave += 1;
    this.waveDamageTaken = 0;
    this.waveStartedAt = this.runTime;
    this.waveGrace = 1.35;
    this.banner = this.wave % 5 === 0 ? "Penjaga Besar" : `Gelombang ${this.wave}`;
    this.bannerT = 2.4;
    sfxPlay.wave();
    const plan = this.wavePlan(this.wave);
    const queue: Kind[] = [];
    let shades = plan.shades;
    let wisps = plan.wisps;
    let brutes = plan.brutes;
    while (shades > 0 || wisps > 0 || brutes > 0) {
      if (shades > 0) { queue.push("shade"); shades--; }
      if (wisps > 0 && (queue.length % 2 === 0 || shades === 0)) { queue.push("wisp"); wisps--; }
      if (brutes > 0 && (queue.length % 4 === 0 || (shades === 0 && wisps === 0))) { queue.push("brute"); brutes--; }
    }
    let delay = 0.25;
    const cadence = this.wave % 5 === 0 ? 0.34 : Math.max(0.16, 0.28 - Math.min(this.wave, 8) * 0.012);
    for (const kind of queue) {
      this.spawnQ.push({ kind, delay });
      delay += cadence + (kind === "brute" ? 0.14 : kind === "wisp" ? 0.05 : 0);
    }
    if (plan.boss) this.spawnQ.push({ kind: "boss", delay: delay + 0.65 });
  }

  private wavePlan(w: number) {
    if (w % 5 === 0) {
      const cycle = Math.floor(w / 5);
      return {
        shades: Math.min(5, 1 + cycle),
        wisps: Math.min(3, 1 + Math.floor(cycle * 0.5)),
        brutes: Math.min(2, 1 + Math.floor(cycle * 0.35)),
        boss: 1,
      };
    }

    const base = Math.min(8, 3 + Math.floor(w * 0.72));
    const shadeHeavy = w % 3 === 1;
    const wispHeavy = w % 3 === 2;
    const bruteHeavy = w % 3 === 0;
    const pressure = Math.min(2, Math.floor(w / 7));
    return {
      shades: Math.min(10, base + (shadeHeavy ? 2 : 0) + pressure),
      wisps: w >= 2 ? Math.min(5, 1 + Math.floor(w * 0.38) + (wispHeavy ? 1 : 0)) : 0,
      brutes: w >= 3 ? Math.min(3, Math.max(1, Math.floor((w + 1) * 0.28)) + (bruteHeavy ? 1 : 0)) : 0,
      boss: 0,
    };
  }

  private stepTitle(dt: number) {
    this.player.yaw += dt * 0.35;
    this.player.y = Math.sin(this.time * 1.4) * 0.05;
    if (this.input.justConfirm) this.start();
  }

  private fixed(dt: number) {
    this.runTime += dt;
    this.waveGrace = Math.max(0, this.waveGrace - dt);
    if (this.bannerT > 0) {
      this.bannerT -= dt;
      if (this.bannerT <= 0) this.banner = null;
    }
    this.tickSpawn(dt);
    this.tickPlayer(dt);
    this.tickEnemies(dt);
    this.tickProjs(dt);
    this.tickPickups(dt);
    this.separateEnemies();
    this.checkWaveClear();
  }

  private tickSpawn(dt: number) {
    for (let i = this.spawnQ.length - 1; i >= 0; i--) {
      const s = this.spawnQ[i]!;
      s.delay -= dt;
      if (s.delay <= 0) {
        this.spawnEnemy(s.kind);
        this.spawnQ.splice(i, 1);
      }
    }
  }

  private tickPlayer(dt: number) {
    const p = this.player;
    const inp = this.input;
    p.atkT = Math.max(0, p.atkT - dt);
    p.atkCd = Math.max(0, p.atkCd - dt);
    p.dodgeT = Math.max(0, p.dodgeT - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.flash = Math.max(0, p.flash - dt);
    p.lunge = Math.max(0, p.lunge - dt);
    p.novaCd = Math.max(0, p.novaCd - dt);
    p.snareCd = Math.max(0, p.snareCd - dt);
    p.rendCd = Math.max(0, p.rendCd - dt);
    p.comboT = Math.max(0, p.comboT - dt);
    this.comboT = Math.max(0, this.comboT - dt);
    this.slashT = Math.max(0, this.slashT - dt);
    this.slashDur = Math.max(0.14, this.slashDur);
    this.perfectT = Math.max(0, this.perfectT - dt);
    p.attackChainT = Math.max(0, p.attackChainT - dt);
    if (p.attackChainT <= 0) p.attackStep = 0;
    this.shockT = Math.max(0, this.shockT - dt);
    this.hitPulse = Math.max(0, this.hitPulse - dt * 4.5);
    if (this.comboT <= 0) this.combo = 0;
    if (p.comboT <= 0) p.combo = 0;
    this.hurt = Math.max(0, this.hurt - dt * 1.6);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);

    p.staDelay = Math.max(0, p.staDelay - dt);
    if (p.staDelay <= 0) p.stamina = Math.min(p.maxStamina, p.stamina + 28 * this.mods.staminaRegen * dt);

    const moveSpd = 7.6 * this.mods.speed;
    const { fx, fz, rx, rz } = this.moveBasis();

    let wishX = rx * inp.moveX + fx * inp.moveY;
    let wishZ = rz * inp.moveX + fz * inp.moveY;
    const wishLen = Math.hypot(wishX, wishZ);
    if (wishLen > 1) {
      wishX /= wishLen;
      wishZ /= wishLen;
    }

    if (p.dodgeT > 0) {
      const dur = 0.32;
      const k = Math.sin((1 - p.dodgeT / dur) * Math.PI);
      p.y = k * 0.38;
      const ds = 16.5 * this.mods.speed;
      this.moveEntity(p, p.dashX * ds * dt, p.dashZ * ds * dt);
      p.speed = ds;
      if (this.mods.wake) this.wakeBurn(dt);
    } else {
      p.y *= 1 - Math.min(1, dt * 12);
      if (wishLen > 0.08 && p.atkT <= 0.05) {
        p.yaw = Math.atan2(-wishX, -wishZ);
      }
      const busy = p.atkT > 0.08;
      const spd = busy ? moveSpd * 0.45 : moveSpd;
      const mx = wishX * spd;
      const mz = wishZ * spd;
      const px = p.x;
      const pz = p.z;
      this.moveEntity(p, mx * dt, mz * dt);
      p.speed = Math.hypot(p.x - px, p.z - pz) / dt;
      if (p.lunge > 0) {
        const nf = -Math.sin(p.yaw);
        const nz = -Math.cos(p.yaw);
        this.moveEntity(p, nf * 10 * dt, nz * 10 * dt);
      }
    }

    if (inp.justDodge && p.dodgeT <= 0 && p.stamina >= 22) {
      p.stamina -= 22;
      p.staDelay = 0.55;
      p.dodgeT = 0.32;
      p.invuln = 0.28;
      if (wishLen > 0.1) {
        p.yaw = Math.atan2(-wishX, -wishZ);
        p.dashX = wishX;
        p.dashZ = wishZ;
      } else {
        p.dashX = fx;
        p.dashZ = fz;
      }
      sfxPlay.dash();
      this.burst(p.x, 0.4, p.z, 8, 0.55, 0.55, 0.5, 0.9);
    }

    const atkSpd = this.mods.atkSpd;
    if (inp.justAttack && p.atkCd <= 0 && p.dodgeT <= 0) {
      const step = p.attackChainT > 0 ? Math.min(2, p.attackStep + 1) : 0;
      p.attackStep = step;
      p.attackChainT = 0.78 / atkSpd;
      const mult = step === 2 ? 1.42 : step === 1 ? 1.12 : 1;
      this.doMelee(mult, step);
      p.atkT = (step === 2 ? 0.4 : 0.28) / atkSpd;
      p.atkCd = (step === 2 ? 0.46 : 0.34) / atkSpd;
    }
    if (inp.justRend && p.rendCd <= 0 && p.dodgeT <= 0) {
      this.faceNearest(3.4);
      p.attackStep = 2;
      p.attackChainT = 0;
      this.doMelee(1.85, 2);
      p.atkT = 0.42;
      p.rendCd = 5.5;
      p.lunge = 0.16;
      sfxPlay.slash();
    }
    if (inp.justNova && p.novaCd <= 0) {
      this.castNova();
      p.novaCd = 8;
    }
    if (inp.justSnare && p.snareCd <= 0) {
      this.castSnare();
      p.snareCd = 7;
    }
  }

  private doMelee(mult: number, step = 0) {
    const p = this.player;
    p.hitId += 1;
    this.faceNearest(this.attackRange + 0.8);
    this.slashDur = mult > 1.4 ? 0.28 : step === 1 ? 0.22 : 0.18;
    this.slashT = this.slashDur;
    this.slashYaw = p.yaw;
    sfxPlay.slash();
    const range = this.attackRange * (mult > 1.4 ? 1.25 : 1);
    const arc = 1.15;
    let hits = 0;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = e.x - p.x;
      const dz = e.z - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist > range + e.r) continue;
      const ang = Math.atan2(-dx, -dz);
      if (Math.abs(angDiff(ang, p.yaw)) > arc && dist > 1.05) continue;
      const dmg = (18 + step * 3) * this.mods.dmg * mult;
      this.hurtEnemy(e, dmg, true);
      hits++;
    }
    if (hits > 0) {
      p.lunge = step === 2 ? 0.2 : 0.1;
      if (this.mods.shock) this.shockwave(p.x, p.z, 1.7, 8 * this.mods.dmg);
    }
  }

  private moveBasis() {
    const p = this.player;
    let fx = p.x - this.camera.x;
    let fz = p.z - this.camera.z;
    const len = Math.hypot(fx, fz) || 1;
    fx /= len;
    fz /= len;
    return { fx, fz, rx: -fz, rz: fx };
  }

  private snapCamera() {
    const p = this.player;
    const ff = -Math.sin(p.yaw);
    const fz = -Math.cos(p.yaw);
    this.camera.x = p.x - ff * 11.2;
    this.camera.y = p.y + 6.4;
    this.camera.z = p.z - fz * 11.2;
    this.camera.lx = p.x;
    this.camera.ly = p.y + 1.15;
    this.camera.lz = p.z;
  }

  private faceNearest(range: number) {
    const p = this.player;
    let best: Enemy | null = null;
