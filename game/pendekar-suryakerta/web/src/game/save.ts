const KEY = "suryakerta-arena-save-v1";
const SAVE_VERSION = 1;

export type SaveData = {
  version: number;
  bestSouls: number;
  bestWave: number;
};

const defaults: SaveData = { version: SAVE_VERSION, bestSouls: 0, bestWave: 0 };

function migrate(raw: SaveData): SaveData {
  const s = { ...defaults, ...raw };
  s.version = SAVE_VERSION;
  return s;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return migrate(JSON.parse(raw) as SaveData);
  } catch {
    return { ...defaults };
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: SAVE_VERSION }));
  } catch {
    /* mode privat / kuota penuh */
  }
}

export function recordRun(souls: number, wave: number): SaveData {
  const prev = loadSave();
  const next: SaveData = {
    version: SAVE_VERSION,
    bestSouls: Math.max(prev.bestSouls, souls),
    bestWave: Math.max(prev.bestWave, wave),
  };
  writeSave(next);
  return next;
}
