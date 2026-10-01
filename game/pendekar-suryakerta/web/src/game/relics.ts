export type Relic = {
  id: string;
  name: string;
  desc: string;
};

export const RELICS: Relic[] = [
  { id: "ember-edge", name: "Tepi Bara", desc: "Serangan jarak dekat menghasilkan 25% lebih banyak kerusakan." },
  { id: "iron-veil", name: "Selubung Besi", desc: "Tambah 40 batas nyawa dan pulihkan nyawa sepenuhnya." },
  { id: "windstep", name: "Langkah Angin", desc: "Bergerak dan lari cepat 18% lebih cepat." },
  { id: "blood-price", name: "Harga Darah", desc: "Pulihkan 12% dari kerusakan yang diberikan." },
  { id: "soul-magnet", name: "Magnet Jiwa", desc: "Jiwa tertarik dari jarak yang lebih jauh." },
  { id: "second-skin", name: "Kulit Kedua", desc: "Kerusakan yang diterima berkurang 18%." },
  { id: "frenzy", name: "Segel Amarah", desc: "Serangan pulih 20% lebih cepat." },
  { id: "cinder-wake", name: "Jejak Bara", desc: "Lari cepat membakar musuh di sekitar." },
  { id: "aftershock", name: "Guncangan Balik", desc: "Serangan memancarkan gelombang kejut singkat." },
  { id: "crit-mark", name: "Tanda Kritis", desc: "Peluang 20% untuk menghasilkan serangan ganda." },
  { id: "deep-lungs", name: "Napas Panjang", desc: "+35 stamina dan pemulihan lebih cepat." },
  { id: "thorn-oath", name: "Sumpah Duri", desc: "Penyerang menerima kembali 20% dari serangannya." },
];

export type RelicContext = {
  wave?: number;
  level?: number;
  hpRatio?: number;
  staminaRatio?: number;
  owned?: Set<string>;
};

export function pickRelics(owned: Set<string>, rand: () => number, count = 3, context: RelicContext = {}): Relic[] {
  const pool = RELICS.filter((r) => !owned.has(r.id));
  if (pool.length === 0) {
    return [
      { id: "surge-hp", name: "Ramuan Bara", desc: "Pulihkan tenaga dan dapatkan 40 jiwa." },
      { id: "surge-dmg", name: "Nyala Bara", desc: "+8% kerusakan permanen." },
      { id: "surge-spd", name: "Teguk Angin", desc: "+8% kecepatan bergerak permanen." },
    ];
  }
  const hp = context.hpRatio ?? 1;
  const stamina = context.staminaRatio ?? 1;
  const wave = context.wave ?? 1;
  const level = context.level ?? 1;

  const score = (r: Relic) => {
    let value = rand() * 0.35;
    if (hp < 0.45 && (r.id === "iron-veil" || r.id === "second-skin" || r.id === "blood-price")) value += 1.25;
    if (stamina < 0.4 && r.id === "deep-lungs") value += 1.2;
    if (wave >= 5 && (r.id === "ember-edge" || r.id === "crit-mark" || r.id === "aftershock")) value += 0.25;
    if (level >= 4 && (r.id === "windstep" || r.id === "frenzy")) value += 0.18;
    if (owned.has("cinder-wake") && r.id === "windstep") value += 0.35;
    if (owned.has("aftershock") && r.id === "ember-edge") value += 0.3;
    if (owned.has("crit-mark") && r.id === "frenzy") value += 0.3;
    return value;
  };

  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, Math.min(count, pool.length));
}
