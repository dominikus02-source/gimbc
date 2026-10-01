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
