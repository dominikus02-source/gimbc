import { create } from "zustand";
import type { Relic } from "./relics";

export type Phase = "title" | "playing" | "pick" | "paused" | "dead";

export type SkillHud = {
  id: "nova" | "snare" | "rend";
  name: string;
  ready: number;
  hotkey: string;
};

export type HudState = {
  phase: Phase;
  hp: number;
  maxHp: number;
  bossHp: number;
  bossMaxHp: number;
  bossRage: number;
  stamina: number;
  maxStamina: number;
  souls: number;
  wave: number;
  combo: number;
  banner: string | null;
  skills: SkillHud[];
  choices: Relic[] | null;
  kills: number;
  runTime: number;
  bestSouls: number;
  bestWave: number;
  muted: boolean;
  hurt: number;
  xp: number;
  xpNext: number;
  level: number;
};

export const initialHud: HudState = {
  phase: "title",
  hp: 100,
  maxHp: 100,
  bossHp: 0,
  bossMaxHp: 0,
  bossRage: 0,
  stamina: 100,
  maxStamina: 100,
  souls: 0,
  wave: 0,
  combo: 0,
  banner: null,
  skills: [
    { id: "nova", name: "Jurus", ready: 1, hotkey: "Q" },
    { id: "snare", name: "Jerat", ready: 1, hotkey: "E" },
    { id: "rend", name: "Tebas", ready: 1, hotkey: "F" },
  ],
  choices: null,
  kills: 0,
  runTime: 0,
  bestSouls: 0,
  bestWave: 0,
  muted: false,
  hurt: 0,
  xp: 0,
  xpNext: 80,
  level: 1,
};

export const useHud = create<HudState>(() => initialHud);
