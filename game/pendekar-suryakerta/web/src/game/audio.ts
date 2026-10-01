let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let music: GainNode | null = null;
let muted = false;
let musicTimer: number | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfx = ctx.createGain();
    music = ctx.createGain();
    sfx.gain.value = 0.7;
    music.gain.value = 0.18;
    master.gain.value = 0.85;
    sfx.connect(master);
    music.connect(master);
    master.connect(ctx.destination);
  }
  return ctx;
}

export function unlockAudio() {
  const c = ac();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  startPad();
}

export function setMuted(next: boolean) {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 0.85, ctx.currentTime, 0.04);
  }
}

export function isMuted() {
  return muted;
}

function envGain(duration: number, peak: number) {
  const c = ac();
  if (!c || !sfx) return null;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(peak, c.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  g.connect(sfx);
  return g;
}

function tone(freq: number, duration: number, type: OscillatorType, peak: number, slide?: number) {
  const c = ac();
  const g = envGain(duration, peak);
  if (!c || !g) return;
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), c.currentTime + duration);
  o.connect(g);
  o.start();
  o.stop(c.currentTime + duration + 0.02);
}

function noise(duration: number, peak: number, hp = 400) {
  const c = ac();
  const g = envGain(duration, peak);
  if (!c || !g) return;
  const n = c.createBuffer(1, Math.floor(c.sampleRate * duration), c.sampleRate);
  const data = n.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = n;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  src.connect(f);
  f.connect(g);
  src.start();
}

export const sfxPlay = {
  slash() {
    noise(0.08, 0.18, 900);
    tone(220 + Math.random() * 40, 0.09, "square", 0.07, 90);
  },
  hit() {
    tone(90 + Math.random() * 20, 0.12, "sawtooth", 0.12, 50);
    noise(0.06, 0.14, 200);
  },
  crit() {
    tone(240, 0.16, "square", 0.1, 420);
    noise(0.08, 0.16, 600);
  },
  hurt() {
    tone(160, 0.18, "sawtooth", 0.1, 70);
  },
  dash() {
    noise(0.14, 0.12, 500);
    tone(180, 0.12, "sine", 0.04, 80);
  },
  pickup() {
    tone(523, 0.08, "sine", 0.07);
    tone(784, 0.12, "sine", 0.05);
  },
  nova() {
    tone(110, 0.28, "sawtooth", 0.1, 40);
    noise(0.2, 0.14, 300);
  },
  snare() {
    tone(330, 0.22, "triangle", 0.08, 110);
  },
  death() {
    tone(80, 0.5, "sawtooth", 0.12, 30);
  },
  ui() {
    tone(520, 0.06, "sine", 0.05);
  },
  wave() {
    tone(196, 0.2, "triangle", 0.06);
    tone(294, 0.28, "sine", 0.04);
  },
  bossPhase() {
    tone(92, 0.34, "sawtooth", 0.09, 48);
    tone(196, 0.24, "triangle", 0.07, 110);
    noise(0.18, 0.08, 240);
  },
  win() {
    tone(392, 0.16, "sine", 0.06);
    tone(523, 0.22, "sine", 0.05);
    tone(659, 0.3, "sine", 0.04);
  },
};

function startPad() {
  const c = ac();
  if (!c || !music || musicTimer != null) return;
  const mk = (freq: number, detune: number) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    o.detune.value = detune;
    g.gain.value = 0.12;
    o.connect(g);
    g.connect(music!);
    o.start();
  };
  mk(110, -6);
  mk(164.8, 4);
  const notes = [196, 220, 261.6, 293.7, 329.6];
  const tick = () => {
    if (!ctx || muted) return;
    const n = notes[(Math.random() * notes.length) | 0]!;
    tone(n, 0.55, "sine", 0.035);
  };
  musicTimer = window.setInterval(tick, 2400);
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else if (!muted) void ctx.resume();
  });
}
