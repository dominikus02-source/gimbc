import { useCallback, useRef, type PointerEvent } from "react";
import { Pause, Play, RotateCcw, Swords, Volume2, VolumeX } from "lucide-react";
import { cn } from "../lib/utils";
import { useHud } from "./hud";
import type { World } from "./sim";

function Bar({ value, max, tone }: { value: number; max: number; tone: "hp" | "stamina" | "xp" }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const fill = tone === "hp" ? "bg-hp" : tone === "stamina" ? "bg-stamina" : "bg-accent";
  return <div className="h-2 w-full overflow-hidden rounded-xs bg-raised"><div className={cn("h-full rounded-xs transition-[width] duration-150", fill)} style={{ width: `${pct}%` }} /></div>;
}

function SkillGem({ label, hotkey, ready }: { label: string; hotkey: string; ready: number }) {
  const r = Math.max(0, Math.min(1, ready));
  return (
    <div className="relative flex h-12 w-12 flex-col items-center justify-center rounded-md border border-border bg-surface/90">
      <span className="text-[10px] font-medium uppercase tracking-wide text-fg">{label}</span>
      <span className="text-[10px] text-subtle">{hotkey}</span>
      {r < 0.995 && <div className="pointer-events-none absolute inset-0 rounded-md bg-bg/70" style={{ clipPath: `inset(${r * 100}% 0 0 0)` }} />}
    </div>
  );
}

function Stick({ world }: { world: World }) {
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  const knob = useRef<HTMLDivElement>(null);
  const onDown = (e: PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, id: e.pointerId };
  };
  const onGerak = (e: PointerEvent) => {
    if (!origin.current || origin.current.id !== e.pointerId) return;
    const dx = e.clientX - origin.current.x;
    const dy = origin.current.y - e.clientY;
    const max = 42;
    const m = Math.hypot(dx, dy);
    const k = m > max ? max / m : 1;
    world.input.setStick((dx * k) / max, (dy * k) / max);
    if (knob.current) knob.current.style.transform = `translate(${dx * k}px, ${-dy * k}px)`;
  };
  const onUp = (e: PointerEvent) => {
    if (!origin.current || origin.current.id !== e.pointerId) return;
    origin.current = null;
    world.input.setStick(0, 0);
    if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
  };
  return <div data-ui className="relative h-[108px] w-[108px] touch-none rounded-full border border-border-strong bg-surface/55 shadow-[0_14px_40px_rgb(0_0_0_/_0.2)]" onPointerDown={onDown} onPointerMove={onGerak} onPointerUp={onUp} onPointerCancel={onUp}><div ref={knob} className="pointer-events-none absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/80" /></div>;
}

function TouchBtn({ label, onHold, className, ready = 1 }: { label: string; onHold: (v: boolean) => void; className?: string; ready?: number }) {
  const available = ready >= 0.995;
  return (
    <button type="button" data-ui aria-label={label} aria-disabled={!available}
      className={cn("relative h-14 min-w-14 touch-none rounded-xl border border-border-strong bg-surface/80 px-3 text-xs font-medium tracking-wide text-fg shadow-[0_10px_30px_rgb(0_0_0_/_0.18)] transition duration-100 active:scale-95", !available && "opacity-55", className)}
      onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); if (available) onHold(true); }}
      onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); onHold(false); }}
      onPointerCancel={() => onHold(false)}>
      <span className="relative z-10">{label}</span>
      {!available && <span className="absolute inset-x-0 bottom-1 text-[9px] tabular-nums text-subtle">{Math.max(1, Math.ceil((1 - ready) * 10))} dtk</span>}
    </button>
  );
}

export function Overlay({ world }: { world: World }) {
  const hud = useHud();
  const start = useCallback(() => world.start(), [world]);
  const playing = hud.phase === "playing";
  const showChrome = playing || hud.phase === "paused";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <div className="game-sheen" />
      <div className="game-vignette" style={{ opacity: 0.85 + hud.hurt * 0.4, boxShadow: hud.hurt > 0.2 ? "inset 0 0 80px rgb(196 92 74 / 0.35)" : undefined }} />

      {showChrome && (
        <header className="pointer-events-none flex items-start justify-between gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] md:p-6">
          <div className="game-panel w-44 space-y-2 rounded-2xl p-3 md:w-56">
            <div className="flex items-center justify-between text-[10px] font-medium tracking-wide text-muted uppercase"><span>Nyawa</span><span className="tabular-nums text-fg">{Math.ceil(hud.hp)}/{hud.maxHp}</span></div>
            <Bar value={hud.hp} max={hud.maxHp} tone="hp" />
            <div className="flex items-center justify-between text-[10px] font-medium tracking-wide text-muted uppercase"><span>Energi</span><span className="tabular-nums text-fg">{Math.ceil(hud.stamina)}</span></div>
            <Bar value={hud.stamina} max={hud.maxStamina} tone="stamina" />
            <div className="flex items-center justify-between text-[10px] font-medium tracking-wide text-muted uppercase"><span>Tingkat {hud.level}</span></div>
            <Bar value={hud.xp} max={hud.xpNext} tone="xp" />
          </div>
          <div className="flex items-start gap-2">
            {playing && <button type="button" className="game-chip pointer-events-auto rounded-xl p-2 text-muted" onClick={() => { world.phase = "paused"; world.publish(true); }} aria-label="Jeda"><Pause className="size-4" /></button>}
            <div className="game-panel flex flex-col items-end gap-1 rounded-2xl px-3 py-2">
              <p className="text-[10px] font-medium tracking-[0.18em] text-muted uppercase">Gelombang</p>
              <p className="font-display text-2xl leading-none text-fg tabular-nums">{hud.wave}</p>
              <p className="text-xs text-muted tabular-nums">{hud.souls} jiwa</p>
              <p className="text-[10px] text-subtle tabular-nums">Terbaik {hud.bestWave}</p>
            </div>
          </div>
        </header>
      )}

      {hud.banner && hud.phase !== "title" && <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 text-center"><p className="font-display text-4xl tracking-tight text-fg md:text-5xl">{hud.banner}</p></div>}

      {playing && hud.bossMaxHp > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-20 w-[min(560px,78vw)] -translate-x-1/2 md:top-5">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold tracking-[0.2em] text-muted uppercase"><span>Penjaga Besar</span><span>{hud.bossRage === 2 ? "Mengamuk" : hud.bossRage === 1 ? "Bangkit" : ""}</span></div>
          <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/45"><div className="h-full rounded-full bg-danger transition-[width] duration-100" style={{ width: `${Math.max(0, Math.min(100, (hud.bossHp / hud.bossMaxHp) * 100))}%` }} /></div>
        </div>
      )}

      {playing && hud.combo >= 3 && <div className="pointer-events-none absolute top-1/2 right-6 -translate-y-1/2 text-right"><p className="text-[10px] tracking-[0.2em] text-muted uppercase">Kombo</p><p className="font-display text-3xl text-fg tabular-nums">{hud.combo}</p></div>}

      {showChrome && (
        <footer className="mt-auto flex items-end justify-between gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">
          <div className="pointer-events-auto md:hidden"><Stick world={world} /></div>
          <div className="hidden items-center gap-2 md:flex">{hud.skills.map((s) => <SkillGem key={s.id} label={s.name} hotkey={s.hotkey} ready={s.ready} />)}</div>
          <div className="pointer-events-auto ml-auto grid grid-cols-3 items-end gap-2 md:hidden">
            <div className="col-span-3 flex justify-end gap-2">
              <TouchBtn label="Jurus" ready={hud.skills[0]?.ready ?? 1} onHold={(v) => (world.input.touchNova = v)} />
              <TouchBtn label="Jerat" ready={hud.skills[1]?.ready ?? 1} onHold={(v) => (world.input.touchSnare = v)} />
              <TouchBtn label="Tebas" ready={hud.skills[2]?.ready ?? 1} onHold={(v) => (world.input.touchRend = v)} />
            </div>
            <TouchBtn label="Lari Cepat" className="col-span-1" onHold={(v) => (world.input.touchDodge = v)} />
            <TouchBtn label="Serang" className="col-span-2 h-16 bg-accent text-accent-fg" onHold={(v) => (world.input.touchAttack = v)} />
          </div>
          <div className="pointer-events-auto hidden md:block"><button type="button" className="game-chip rounded-xl p-2 text-muted" onClick={() => world.toggleMute()} aria-label={hud.muted ? "Nyalakan suara" : "Matikan suara"}>{hud.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</button></div>
        </footer>
      )}
