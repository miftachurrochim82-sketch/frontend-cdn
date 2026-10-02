#!/usr/bin/env node
// =====================================================================
// build.mjs — Build artefak CDN (minify JS + CSS)
//
//   node tools/build.mjs            bangun ulang semua artefak .min
//   node tools/build.mjs --check    bangun ke memori, bandingkan dengan
//                                   artefak di disk. Exit 1 kalau beda.
//                                   (dipakai CI — tidak menulis apa pun)
//
// Menggantikan for-loop bash di package.json: lintas-platform, punya
// exit code per file, dan melaporkan rasio kompresi.
// =====================================================================
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { minify as minifyJs } from "terser";
import CleanCSS from "clean-css";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "frontend");

// Modul JS yang dibangun. Urutan = urutan muat yang disarankan.
const JS_MODULES = [
  "app-core",
  "app-components",
  "app-modules",
  "app-layout",
  "app-ui",
  "app-forms",
  "app-data",
  "app-charts",
  "app-workflow",
];

// CSS yang punya sumber di repo ini.
//
// CATATAN: app-tailwind.min.css TIDAK dibangun di sini. File itu adalah
// keluaran Tailwind yang sudah jadi (vendored) dan tidak punya sumber di
// repo. Skrip lama menjalankan `cleancss -o app-tailwind.min.css
// app-tailwind.min.css` — membaca dan menulis file yang sama, berisiko
// mengosongkannya. Dihapus dengan sengaja.
const CSS_MODULES = ["app-common"];

const CHECK = process.argv.includes("--check");

// ---------------------------------------------------------------------
// Sinkronisasi versi — package.json adalah SATU-SATUNYA sumber kebenaran.
//
// Sebelumnya versi ditulis ulang manual di 16 tempat dan rutin desinkron:
// pada v2.9.2 artefak yang dirilis masih melaporkan dirinya '2.9.0'.
// Build sekarang menuliskannya otomatis ke sumber sebelum minify.
// ---------------------------------------------------------------------
const PKG = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const VERSION = PKG.version;

const VERSION_RULES = [
  // version: '2.9.0'               -> objek ekspor tiap modul
  [/(\bversion:\s*)'\d+\.\d+\.\d+'/g, `$1'${VERSION}'`],
  // global.AppComponents.version = '2.9.0'
  [/(\.version\s*=\s*)'\d+\.\d+\.\d+'/g, `$1'${VERSION}'`],
  // default: 'v2.9.0'              -> prop <app-login>, tampil di layar
  [/(\bdefault:\s*)'v\d+\.\d+\.\d+'/g, `$1'v${VERSION}'`],
];

/** Terapkan versi ke sumber. Mengembalikan teks hasil (tidak menulis). */
function applyVersion(text) {
  return VERSION_RULES.reduce((acc, [re, to]) => acc.replace(re, to), text);
}

const versionDrift = [];

const kb = (n) => (n / 1024).toFixed(1) + " KB";
const pct = (from, to) => (((from - to) / from) * 100).toFixed(1) + "%";

const results = [];
const drifted = [];
let failed = false;

async function emit(name, outFile, source, output) {
  const outPath = join(SRC, outFile);
  if (CHECK) {
    let current = null;
    try {
      current = await readFile(outPath, "utf8");
    } catch {
      /* belum ada */
    }
    if (current !== output) drifted.push(outFile);
  } else {
    await writeFile(outPath, output, "utf8");
  }
  results.push({
    name,
    from: Buffer.byteLength(source),
    to: Buffer.byteLength(output),
  });
}

for (const name of JS_MODULES) {
  const inFile = `${name}.js`;
  const original = await readFile(join(SRC, inFile), "utf8");
  const source = applyVersion(original);
  if (source !== original) {
    if (CHECK) versionDrift.push(inFile);
    else await writeFile(join(SRC, inFile), source, "utf8");
  }
  const res = await minifyJs(source, {
    compress: true,
    mangle: true,
    format: { comments: false },
  });
  if (res.error || typeof res.code !== "string") {
    console.error(`  GAGAL  ${inFile}: ${res.error ?? "keluaran kosong"}`);
    failed = true;
    continue;
  }
  await emit(inFile, `${name}.min.js`, source, res.code);
}

for (const name of CSS_MODULES) {
  const inFile = `${name}.css`;
  const source = await readFile(join(SRC, inFile), "utf8");
  const res = new CleanCSS({ level: 2, returnPromise: false }).minify(source);
  if (res.errors.length) {
    console.error(`  GAGAL  ${inFile}: ${res.errors.join("; ")}`);
    failed = true;
    continue;
  }
  await emit(inFile, `${name}.min.css`, source, res.styles);
}

// ---------------------------------------------------------------- laporan
console.log(
  (CHECK ? "Memeriksa artefak CDN" : "Membangun artefak CDN") +
    `  —  versi ${VERSION} (dari package.json)\n`
);
console.log("  " + "berkas".padEnd(24) + "sumber".padStart(10) + "minify".padStart(10) + "hemat".padStart(9));
console.log("  " + "-".repeat(53));
let totalFrom = 0;
let totalTo = 0;
for (const r of results) {
  totalFrom += r.from;
  totalTo += r.to;
  console.log("  " + r.name.padEnd(24) + kb(r.from).padStart(10) + kb(r.to).padStart(10) + pct(r.from, r.to).padStart(9));
}
console.log("  " + "-".repeat(53));
console.log("  " + "TOTAL".padEnd(24) + kb(totalFrom).padStart(10) + kb(totalTo).padStart(10) + pct(totalFrom, totalTo).padStart(9));

if (failed) {
  console.error("\nBuild gagal.");
  process.exit(1);
}

if (CHECK) {
  if (versionDrift.length) {
    console.error(`\nVersi tidak sinkron (${versionDrift.length}) — sumber masih memuat versi lama:`);
    for (const f of versionDrift) console.error(`    frontend/${f}`);
    console.error(`\npackage.json menyatakan ${VERSION}. Jalankan \`npm run build\` lalu commit hasilnya.`);
    process.exit(1);
  }
  if (drifted.length) {
    console.error(`\nArtefak basi (${drifted.length}) — tidak cocok dengan sumbernya:`);
    for (const f of drifted) console.error(`    frontend/${f}`);
    console.error("\nJalankan `npm run build` lalu commit hasilnya.");
    process.exit(1);
  }
  console.log("\nSemua artefak sinkron dengan sumbernya.");
} else {
  console.log(`\nSelesai — ${results.length} artefak ditulis ke frontend/.`);
}
