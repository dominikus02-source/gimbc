import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const partsDir = path.join(root, ".source");
const names = ["part-00","part-01","part-02","part-03","part-04-00","part-04-01"];
const encoded = names.map((name) => fs.readFileSync(path.join(partsDir, name), "utf8").trim()).join("");
const archive = zlib.gunzipSync(Buffer.from(encoded, "base64"));
const tmp = path.join(root, ".grok-source.tgz");
fs.writeFileSync(tmp, archive);
execFileSync("tar", ["-xf", tmp, "-C", root], { stdio: "inherit" });
fs.rmSync(tmp, { force: true });

const replace = (file, changes) => {
  const p = path.join(root, file);
  let s = fs.readFileSync(p, "utf8");
  for (const [from, to] of changes) s = s.split(from).join(to);
  fs.writeFileSync(p, s);
};

replace("src/game/Overlay.tsx", [
  ['import { Jeda, Play, RotateCcw, Swords, Volume2, VolumeX } from "lucide-react";','import { Pause, Play, RotateCcw, Swords, Volume2, VolumeX } from "lucide-react";'],
  ["<Jeda className=\"size-4\" />","<Pause className=\"size-4\" />"],
  ["world.toggleMatikan suara()","world.toggleMute()"],
  [">Ashveil</h1>",">Pendekar Suryakerta</h1>"],
  ["<span>Level {hud.level}</span>","<span>Tingkat {hud.level}</span>"],
  ['<TouchBtn label="Nova"','<TouchBtn label="Jurus"'],
  ['<TouchBtn label="Dash"','<TouchBtn label="Lari"'],
  ["<dt>Dash</dt>","<dt>Lari Cepat</dt>"],
  ["<dt>Jurusan</dt>","<dt>Jurus</dt>"],
  ["Q nova · E jerat · F tebas","Q jurus · E jerat · F tebas"],
  ["· wave {hud.bestGelombang} ·","· gelombang {hud.bestGelombang} ·"],
  ['<h2 className="font-display text-3xl tracking-tight">Jedad</h2>','<h2 className="font-display text-3xl tracking-tight">Jeda</h2>'],
  ['<dt className="text-subtle">Souls</dt>','<dt className="text-subtle">Jiwa</dt>'],
  ['<dt className="text-subtle">Felled</dt>','<dt className="text-subtle">Dikalahkan</dt>'],
  ["onPointerGerak={onGerak}","onPointerMove={onGerak}"]
]);

replace("src/game/sim.ts", [
  ['banner: string | null = "Ashveil";','banner: string | null = "Pendekar Suryakerta";'],
  ['this.banner = "Wave 1";','this.banner = "Gelombang 1";'],
  ['this.wave % 5 === 0 ? "Harbinger" : `Wave ${this.wave}`','this.wave % 5 === 0 ? "Penjaga Besar" : `Gelombang ${this.wave}`'],
  ['this.banner = `Level ${this.level}`;','this.banner = `Tingkat ${this.level}`;']
]);

replace("src/game/relics.ts", [
  ["Ember Edge","Tepi Bara"],["Melee strikes deal 25% more damage.","Serangan jarak dekat menghasilkan 25% lebih banyak kerusakan."],
  ["Windstep","Langkah Angin"],["Move and dash 18% faster.","Bergerak dan lari cepat 18% lebih cepat."],
  ["Blood Price","Harga Darah"],["Recover 12% of damage dealt.","Pulihkan 12% dari kerusakan yang diberikan."],
  ["Soul Magnet","Magnet Jiwa"],["Souls pull in from much farther.","Jiwa tertarik dari jarak yang lebih jauh."],
  ["Second Skin","Kulit Kedua"],["Incoming damage reduced by 18%.","Kerusakan yang diterima berkurang 18%."],
  ["Frenzy Sigil","Segel Amarah"],["Attacks recover 20% faster.","Serangan pulih 20% lebih cepat."],
  ["Cinder Wake","Jejak Bara"],["Dash scorches nearby foes.","Lari cepat membakar musuh di sekitar."],
  ["Crit Mark","Tanda Kritis"],["20% chance for a double strike.","Peluang 20% untuk menghasilkan serangan ganda."],
  ["Deep Lungs","Napas Panjang"],["+35 stamina and faster recovery.","+35 stamina dan pemulihan lebih cepat."],
  ["Thorn Oath","Sumpah Duri"],["Attackers take 20% of the blow back.","Penyerang menerima kembali 20% dari serangannya."],
  ["Ash Salve","Ramuan Bara"],["Restore vitality and gain 40 souls.","Pulihkan tenaga dan dapatkan 40 jiwa."],
  ["Kindling","Nyala Bara"],["Permanent +8% damage.","+8% kerusakan permanen."],
  ["Gale Sip","Teguk Angin"],["Permanent +8% move speed.","+8% kecepatan bergerak permanen."]
]);

console.log("Pendekar Suryakerta source siap dibangun.");
