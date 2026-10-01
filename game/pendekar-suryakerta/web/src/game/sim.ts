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
    let bestD = range;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - p.x, e.z - p.z);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    if (best) p.yaw = Math.atan2(-(best.x - p.x), -(best.z - p.z));
  }

  private castNova() {
    const p = this.player;
    sfxPlay.nova();
    this.addTrauma(0.45);
    this.shockT = 0.42;
    this.shockX = p.x;
    this.shockZ = p.z;
    this.shockMax = 4.8;
    this.burst(p.x, 0.8, p.z, 30, 0.85, 0.42, 0.28, 1.7);
    this.shockwave(p.x, p.z, 4.3, 34 * this.mods.dmg);
  }

  private castSnare() {
    const p = this.player;
    sfxPlay.snare();
    this.burst(p.x, 0.6, p.z, 16, 0.55, 0.7, 0.72, 1.1);
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - p.x, e.z - p.z) < 5.2 + e.r) {
        e.stun = Math.max(e.stun, 1.35);
        this.hurtEnemy(e, 10 * this.mods.dmg, false);
      }
    }
  }

  private wakeBurn(dt: number) {
    const p = this.player;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - p.x, e.z - p.z) < 1.7 + e.r) {
        this.hurtEnemy(e, 18 * dt * this.mods.dmg, false);
      }
    }
  }

  private shockwave(x: number, z: number, r: number, dmg: number) {
    this.shockT = Math.max(this.shockT, 0.28);
    this.shockX = x;
    this.shockZ = z;
    this.shockMax = Math.max(this.shockMax, r + 0.35);
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - x, e.z - z) < r + e.r) this.hurtEnemy(e, dmg, false);
    }
  }

  private tickEnemies(dt: number) {
    const p = this.player;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.flash = Math.max(0, e.flash - dt);
      e.cd = Math.max(0, e.cd - dt);
      const prevWind = e.wind;
      e.wind = Math.max(0, e.wind - dt);
      const strike = prevWind > 0 && e.wind <= 0;
      e.stun = Math.max(0, e.stun - dt);
      e.stateT = Math.max(0, e.stateT - dt);
      if (e.stun > 0) continue;

      const dx = p.x - e.x;
      const dz = p.z - e.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      const nx = dx / dist;
      const nz = dz / dist;
      e.yaw = Math.atan2(-nx, -nz);

      if (e.kind === "shade") this.aiShade(e, dt, nx, nz, dist, strike);
      else if (e.kind === "brute") this.aiBrute(e, dt, nx, nz, dist, strike);
      else if (e.kind === "wisp") this.aiWisp(e, dt, nx, nz, dist, strike);
      else this.aiBoss(e, dt, nx, nz, dist, strike);
    }
  }

  private aiShade(e: Enemy, dt: number, nx: number, nz: number, dist: number, strike: boolean) {
    const side = e.state % 2 === 0 ? 1 : -1;
    if (dist > 1.45) {
      const flank = dist < 5.5 ? 0.22 : 0.08;
      this.moveEntity(e, (nx - nz * side * flank) * e.speed * dt, (nz + nx * side * flank) * e.speed * dt);
    }
    if (e.stateT <= 0) {
      e.state = (e.state + 1) % 2;
      e.stateT = 1.1 + this.rand() * 0.7;
    }
    if (dist < 1.65 && e.cd <= 0 && e.wind <= 0) {
      e.wind = 0.28;
      e.cd = 1.05;
      this.telegraphs.push({ x: e.x + nx * 0.45, z: e.z + nz * 0.45, r: 1.35, t: e.wind, max: e.wind, tone: "merah" });
      this.burst(e.x, 0.3, e.z, 4, 0.4, 0.75, 0.58, 0.7);
    }
    if (strike && dist < 1.95) this.hitPlayer(e.dmg, nx, nz);
  }

  private aiBrute(e: Enemy, dt: number, nx: number, nz: number, dist: number, strike: boolean) {
    if (dist > 2.3) this.moveEntity(e, nx * e.speed * dt, nz * e.speed * dt);
    if (dist < 2.8 && e.cd <= 0 && e.wind <= 0) {
      e.wind = 0.55;
      e.cd = 2.3;
      this.telegraphs.push({ x: e.x + nx * 1.2, z: e.z + nz * 1.2, r: 2.4, t: 0.55, max: 0.55, tone: "emas" });
      this.burst(e.x, 0.12, e.z, 5, 0.75, 0.3, 0.22, 0.35);
    }
    if (strike) {
      const p = this.player;
      if (Math.hypot(p.x - e.x, p.z - e.z) < 2.8) this.hitPlayer(e.dmg, nx, nz);
      this.addTrauma(0.28);
      this.burst(e.x, 0.2, e.z, 10, 0.45, 0.4, 0.35, 1.1);
    }
  }

  private aiWisp(e: Enemy, dt: number, nx: number, nz: number, dist: number, strike: boolean) {
    const ideal = 7.2;
    if (dist < ideal - 0.6) this.moveEntity(e, -nx * e.speed * dt, -nz * e.speed * dt);
    else if (dist > ideal + 0.8) this.moveEntity(e, nx * e.speed * 0.7 * dt, nz * e.speed * 0.7 * dt);
    else this.moveEntity(e, -nz * e.speed * 0.6 * dt, nx * e.speed * 0.6 * dt);
    e.y = 1.1 + Math.sin(this.time * 3 + e.x) * 0.18;
    if (e.cd <= 0 && e.wind <= 0) {
      e.wind = 0.42;
      e.cd = 1.65;
      this.telegraphs.push({ x: this.player.x, z: this.player.z, r: 0.75, t: e.wind, max: e.wind, tone: "biru" });
      this.burst(e.x, e.y, e.z, 5, 0.55, 0.5, 0.78, 0.9);
    }
    if (strike && e.wind <= 0) {
      this.fire(e.x, e.z, nx, nz, 9.5, 9);
    }
  }

  private aiBoss(e: Enemy, dt: number, nx: number, nz: number, dist: number, strike: boolean) {
    const hpRatio = e.hp / Math.max(1, e.maxHp);
    const nextRage = hpRatio <= 0.3 ? 2 : hpRatio <= 0.6 ? 1 : 0;
    if (nextRage > e.rage) {
      e.rage = nextRage;
      e.stun = 0;
      this.banner = nextRage === 2 ? "Penjaga Besar Mengamuk" : "Penjaga Besar Bangkit";
      this.bannerT = 1.8;
      this.addTrauma(0.65);
      sfxPlay.bossPhase();
      this.burst(e.x, 1.2, e.z, nextRage === 2 ? 34 : 24, 0.9, 0.28, 0.18, 1.8);
      for (const target of this.enemies) {
        if (target.alive && target !== e && Math.hypot(target.x - e.x, target.z - e.z) < (nextRage === 2 ? 3.2 : 2.4)) this.hurtEnemy(target, nextRage === 2 ? 12 : 8, false);
      }
    }
    const rageSpeed = e.rage === 2 ? 1.22 : e.rage === 1 ? 1.1 : 1;
    const rageDamage = e.rage === 2 ? 1.28 : e.rage === 1 ? 1.12 : 1;
    e.y = 0.15;
    if (e.stateT <= 0) {
      e.state = (e.state + 1) % 4;
      e.stateT = e.state === 2 ? 0.9 : 2.0 / rageSpeed;
    }
    if (e.state === 0) {
      if (dist > 2) this.moveEntity(e, nx * e.speed * rageSpeed * dt, nz * e.speed * rageSpeed * dt);
      if (dist < 2.6 && e.cd <= 0) {
        e.cd = 1.6 / rageSpeed;
        this.hitPlayer(e.dmg * rageDamage, nx, nz);
      }
    } else if (e.state === 1) {
      if (e.wind <= 0 && e.cd <= 0) {
        e.wind = e.rage === 2 ? 0.55 : 0.7;
        e.cd = 2 / rageSpeed;
        this.telegraphs.push({ x: this.player.x, z: this.player.z, r: e.rage === 2 ? 3.7 : 3.2, t: e.wind, max: e.wind, kind: "circle", tone: "merah" });
        this.burst(e.x, 0.35, e.z, 8, 0.8, 0.28, 0.2, 0.45);
      }
      if (strike) {
        const p = this.player;
        if (Math.hypot(p.x - e.x, p.z - e.z) < (e.rage === 2 ? 4 : 3.6)) this.hitPlayer(e.dmg * 1.3 * rageDamage, nx, nz);
        this.addTrauma(0.5);
      }
    } else if (e.state === 2) {
      if (e.cd <= 0) {
        e.cd = (e.rage === 2 ? 0.62 : 0.85);
        const count = e.rage === 2 ? 12 : 8;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2 + this.time;
          this.fire(e.x, e.z, Math.sin(a), Math.cos(a), e.rage === 2 ? 8.4 : 7.5, 11 * rageDamage);
        }
      }
    } else {
      if (e.wind <= 0 && e.cd <= 0) {
        e.wind = e.rage === 2 ? 0.32 : 0.46;
        e.cd = e.rage === 2 ? 1.45 : 1.85;
        e.chargeX = this.player.x;
        e.chargeZ = this.player.z;
        this.telegraphs.push({ x: e.x, z: e.z, r: e.rage === 2 ? 5.2 : 4.6, t: e.wind, max: e.wind, kind: "cone", yaw: e.yaw, width: e.rage === 2 ? 0.8 : 0.62, tone: "merah" });
        this.burst(e.x, 0.3, e.z, 12, 0.85, 0.32, 0.18, 1.2);
      }
      if (strike) {
        const dx = e.chargeX - e.x;
        const dz = e.chargeZ - e.z;
        const len = Math.hypot(dx, dz) || 1;
        const sx = dx / len;
        const sz = dz / len;
        this.moveEntity(e, sx * 4.2, sz * 4.2);
        const p = this.player;
        if (Math.hypot(p.x - e.x, p.z - e.z) < 2.25) this.hitPlayer(e.dmg * 0.9 * rageDamage, sx, sz);
        this.addTrauma(0.42);
        this.burst(e.x, 0.35, e.z, 16, 0.9, 0.34, 0.18, 1.4);
      }
    }
  }

  private fire(x: number, z: number, nx: number, nz: number, spd: number, dmg: number) {
    const pr = this.projs.find((p) => !p.alive);
    if (!pr) return;
    pr.alive = true;
    pr.x = x;
    pr.z = z;
    pr.px = x;
    pr.pz = z;
    pr.y = 1.05;
    pr.vx = nx * spd;
    pr.vz = nz * spd;
    pr.life = 2.4;
    pr.dmg = dmg;
    pr.r = 0.28;
  }

  private tickProjs(dt: number) {
    const p = this.player;
    for (const pr of this.projs) {
      if (!pr.alive) continue;
      pr.life -= dt;
      pr.px = pr.x;
      pr.pz = pr.z;
      pr.x += pr.vx * dt;
      pr.z += pr.vz * dt;
      if (pr.life <= 0 || Math.hypot(pr.x, pr.z) > ARENA + 1) {
        pr.alive = false;
        continue;
      }
      if (this.hitPillar(pr.x, pr.z, pr.r)) {
        pr.alive = false;
        this.burst(pr.x, pr.y, pr.z, 4, 0.45, 0.7, 0.7, 0.5);
        continue;
      }
      if (Math.hypot(pr.x - p.x, pr.z - p.z) < pr.r + p.r) {
        pr.alive = false;
        const dx = p.x - pr.x;
        const dz = p.z - pr.z;
        this.hitPlayer(pr.dmg, dx, dz);
      }
    }
  }

  private tickPickups(dt: number) {
    const p = this.player;
    for (const u of this.pickups) {
      if (!u.alive) continue;
      u.t += dt;
      u.y = 0.55 + Math.sin(u.t * 4) * 0.12;
      const dx = p.x - u.x;
      const dz = p.z - u.z;
      const d = Math.hypot(dx, dz);
      const mag = this.mods.magnet;
      if (d < mag) {
        const pull = (1 - d / mag) * 14 * dt;
        u.x += (dx / (d || 1)) * pull;
        u.z += (dz / (d || 1)) * pull;
      }
      if (d < 0.7) {
        u.alive = false;
        if (u.kind === "soul") {
          this.souls += u.val;
          this.xp += u.val;
          sfxPlay.pickup();
          this.checkLevel();
        } else {
          p.hp = Math.min(p.maxHp, p.hp + u.val);
          sfxPlay.pickup();
        }
      }
    }
  }

  private checkLevel() {
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level += 1;
      this.xpNext = Math.floor(this.xpNext * 1.25);
      this.player.maxHp += 8;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 24);
      this.banner = `Tingkat ${this.level}`;
      this.bannerT = 1.6;
      sfxPlay.win();
    }
  }

  private separateEnemies() {
    for (let i = 0; i < this.enemies.length; i++) {
      const a = this.enemies[i]!;
      if (!a.alive) continue;
      for (let j = i + 1; j < this.enemies.length; j++) {
        const b = this.enemies[j]!;
        if (!b.alive) continue;
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dz);
        const min = a.r + b.r + 0.08;
        if (d < min && d > 0.001) {
          const push = ((min - d) / 2) * 0.6;
          const nx = dx / d;
          const nz = dz / d;
          a.x -= nx * push;
          a.z -= nz * push;
          b.x += nx * push;
          b.z += nz * push;
        }
      }
    }
  }

  private checkWaveClear() {
    if (this.spawnQ.length > 0) return;
    if (this.enemies.some((e) => e.alive)) return;
    if (this.phase !== "playing") return;
    const flawless = this.waveDamageTaken <= 0.01;
    if (flawless) this.flawlessWaves += 1;
    const baseHeal = this.wave % 5 === 0 ? 20 : 14;
    const flawlessBonus = flawless ? 10 : 0;
    const recoveryBonus = this.player.hp / Math.max(1, this.player.maxHp) < 0.35 ? 10 : 0;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + baseHeal + flawlessBonus + recoveryBonus);
    this.player.stamina = this.player.maxStamina;
    if (flawless) this.souls += 8 + this.wave * 2;
    this.combo = 0;
    this.comboT = 0;
    this.choices = pickRelics(this.owned, () => this.rand(), 3, {
      wave: this.wave,
      level: this.level,
      hpRatio: this.player.hp / Math.max(1, this.player.maxHp),
      staminaRatio: this.player.stamina / Math.max(1, this.player.maxStamina),
      owned: this.owned,
    });
    this.phase = "pick";
    sfxPlay.win();
    this.publish(true);
  }

  private hitPlayer(dmg: number, dx: number, dz: number) {
