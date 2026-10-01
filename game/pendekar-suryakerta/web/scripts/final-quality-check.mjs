import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const src = path.join(root, "src");
const files = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(ent.name)) files.push(p);
  }
}
walk(src);

const syntaxErrors = [];
for (const file of files) {
  const result = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
    },
  });
  for (const d of result.diagnostics ?? []) {
    if (d.category === ts.DiagnosticCategory.Error) {
      syntaxErrors.push(`${path.relative(root, file)}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
    }
  }
}

const visibleFiles = [
  path.join(root, "index.html"),
  path.join(src, "game", "Overlay.tsx"),
  path.join(src, "game", "relics.ts"),
  path.join(src, "game", "sim.ts"),
];
const forbidden = /\b(?:Wave|Level|Stamina|Vitality|Start|Resume|Attack|Dash|Souls|Best|Felled|Fight|Relic|Choose|Sound|Mute|Unmute|Continue|Game Over)\b/;
const englishHits = [];
for (const file of visibleFiles) {
  const source = fs.readFileSync(file, "utf8");
  const literals = [];
  for (const m of source.matchAll(/>([^<{\n]+)</g)) literals.push(m[1]);
  for (const m of source.matchAll(/(?:label|aria-label|title)=[\"']([^\"']+)[\"']/g)) literals.push(m[1]);
  if (literals.some((text) => forbidden.test(text))) englishHits.push(path.relative(root, file));
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
const staleDeps = deps.filter((d) => ["@tanstack/", "better-auth", "nitro", "pg", "jose"].some((x) => d.startsWith(x)));
const required = ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei", "zustand", "vite"];
const missing = required.filter((d) => !deps.includes(d));

const result = {
  ok: syntaxErrors.length === 0 && englishHits.length === 0 && staleDeps.length === 0 && missing.length === 0,
  files: files.length,
  syntaxErrors,
  englishHits,
  staleDeps,
  missing,
};
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
