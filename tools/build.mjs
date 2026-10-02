#!/usr/bin/env node
// =====================================================================
// build.mjs — Bangun artefak CDN
//
//   node tools/build.mjs            bangun ulang app.min.js & app.min.css
//   node tools/build.mjs --check    bandingkan dengan artefak di disk,
//                                   exit 1 kalau beda (dipakai CI)
//
// Keluaran hanya DUA berkas. Aplikasi memuat keduanya, titik.
// Sebelum v3.0.0 ada 10 berkas sajian supaya aplikasi bisa memilih
// à-la-carte — tidak ada satu pun aplikasi yang memilih, keduanya
// selalu memuat kesepuluhnya. Modularitas itu hanya biaya.
// =====================================================================
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { minify as minifyJs } from "terser";
import CleanCSS from "clean-css";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "frontend");
const CHECK = process.argv.includes("--check");

// Sumber JS, digabung jadi satu bundel. Urutan penting: core dulu.
const JS_SOURCES = ["app-core.js", "app-components.js"];
const JS_BUNDLE = "app.min.js";
const CSS_SOURCE = "app.css";
const CSS_BUNDLE = "app.min.css";

// --------------------------------------------------- versi: satu sumber
const PKG = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const VERSION = PKG.version;

const VERSION_RULES = [
  [/(\bversion:\s*)'\d+\.\d+\.\d+'/g, `$1'${VERSION}'`],
  [/(\.version\s*=\s*)'\d+\.\d+\.\d+'/g, `$1'${VERSION}'`],
  [/(\bdefault:\s*)'v\d+\.\d+\.\d+'/g, `$1'v${VERSION}'`],
  [/__V__/g, VERSION],
];
const applyVersion = (t) => VERSION_RULES.reduce((a, [re, to]) => a.replace(re, to), t);

const versionDrift = [];
const drifted = [];

async function emit(outFile, output) {
  const path = join(SRC, outFile);
  if (!CHECK) return writeFile(path, output, "utf8");
  let current = null;
  try {
    current = await readFile(path, "utf8");
  } catch {
    /* belum ada */
  }
  if (current !== output) drifted.push(outFile);
}

// ------------------------------------------------------------------ JS
const pieces = [];
let jsRaw = 0;
for (const file of JS_SOURCES) {
  const original = await readFile(join(SRC, file), "utf8");
  const source = applyVersion(original);
  if (source !== original) {
    if (CHECK) versionDrift.push(file);
    else await writeFile(join(SRC, file), source, "utf8");
  }
  jsRaw += Buffer.byteLength(source);
  pieces.push(source);
}

const res = await minifyJs(pieces.join("\n;\n"), {
  compress: true,
  mangle: true,
  format: { comments: false },
});
if (res.error || typeof res.code !== "string") {
  console.error(`GAGAL minify JS: ${res.error ?? "keluaran kosong"}`);
  process.exit(1);
}
const jsOut = res.code;
await emit(JS_BUNDLE, jsOut);

// ----------------------------------------------------------------- CSS
const cssSrc = applyVersion(await readFile(join(SRC, CSS_SOURCE), "utf8"));
const cssRes = new CleanCSS({ level: 2 }).minify(cssSrc);
if (cssRes.errors.length) {
  console.error(`GAGAL minify CSS: ${cssRes.errors.join("; ")}`);
  process.exit(1);
}
await emit(CSS_BUNDLE, cssRes.styles);

// ------------------------------------------------------------- laporan
const kb = (n) => (n / 1024).toFixed(1) + " KB";
const pct = (a, b) => (((a - b) / a) * 100).toFixed(1) + "%";
const cssRaw = Buffer.byteLength(cssSrc);
const cssOut = Buffer.byteLength(cssRes.styles);

console.log(`${CHECK ? "Memeriksa" : "Membangun"} artefak CDN — versi ${VERSION}\n`);
console.log("  " + "bundel".padEnd(16) + "sumber".padStart(10) + "minify".padStart(10) + "hemat".padStart(9));
console.log("  " + "-".repeat(45));
console.log("  " + JS_BUNDLE.padEnd(16) + kb(jsRaw).padStart(10) + kb(Buffer.byteLength(jsOut)).padStart(10) + pct(jsRaw, Buffer.byteLength(jsOut)).padStart(9));
console.log("  " + CSS_BUNDLE.padEnd(16) + kb(cssRaw).padStart(10) + kb(cssOut).padStart(10) + pct(cssRaw, cssOut).padStart(9));
console.log("  " + "-".repeat(45));
const tf = jsRaw + cssRaw;
const tt = Buffer.byteLength(jsOut) + cssOut;
console.log("  " + "TOTAL".padEnd(16) + kb(tf).padStart(10) + kb(tt).padStart(10) + pct(tf, tt).padStart(9));

if (CHECK) {
  if (versionDrift.length) {
    console.error(`\nVersi tertinggal di: ${versionDrift.join(", ")}`);
    console.error(`package.json menyatakan ${VERSION}. Jalankan \`npm run build\`.`);
    process.exit(1);
  }
  if (drifted.length) {
    console.error(`\nArtefak basi: ${drifted.join(", ")}`);
    console.error("Jalankan `npm run build` lalu commit hasilnya.");
    process.exit(1);
  }
  console.log("\nArtefak sinkron dengan sumbernya.");
} else {
  console.log("\nSelesai — 2 artefak ditulis ke frontend/.");
}
