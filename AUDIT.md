# AUDIT — `frontend-cdn` @ v2.9.2

Tanggal audit: 2026-10-02 · Commit: `6c2ea09` · Ukuran repo: 668 KB · 36 file

---

## Ringkasan Eksekutif

Repo ini **bukan kasus over-engineering klasik** (tidak ada interface/factory bertingkat).
Masalah sebenarnya ada di tiga tempat lain, dan satu di antaranya adalah **bug produksi aktif**:

| # | Temuan | Tingkat |
|---|--------|---------|
| 1 | 8 dari 9 file `.min.js` + `.min.css` **bukan hasil minify** — hanya salinan byte-identik | 🔴 **Kritis** |
| 2 | CI menjalankan `npm run build` lalu **membuang hasilnya** — tidak commit, tidak verifikasi | 🔴 **Kritis** |
| 3 | `.gitignore` memakai `**/**` lalu di-negasi — rapuh & sudah diakui tidak berfungsi di komentarnya sendiri | 🟠 Tinggi |
| 4 | Versi tersebar di **11 tempat** tanpa satu sumber kebenaran; sudah desinkron hari ini | 🟠 Tinggi |
| 5 | 7 file Markdown, 118 KB, saling tumpang tindih & saling bertentangan | 🟡 Sedang |
| 6 | `tools/contract_check.py` — repo pustaka mengenal 7 aplikasi konsumennya (dependensi terbalik) | 🟡 Sedang |
| 7 | 2 `package.json` dengan nama paket berbeda | 🟡 Sedang |
| 8 | File `preview-vX.Y.Z.html` beranak tiap rilis | 🟢 Rendah |

**~160 KB dari 668 KB (24%) repo adalah duplikasi murni.**

---

## 1. 🔴 `.min.js` palsu — bug produksi

Verifikasi md5, 9 file identik dengan sumbernya:

```
44ed058…  frontend/app-data.js
44ed058…  frontend/app-data.min.js      ← byte-identik
```

| File | Status |
|------|--------|
| `app-core.min.js` | ✅ benar-benar diminify (41.6 KB → 16.5 KB, sesuai `terser` hari ini) |
| `app-components.min.js` | ❌ salinan mentah — 51.8 KB |
| `app-modules.min.js` | ❌ salinan mentah — 33.0 KB |
| `app-common.min.css` | ❌ salinan mentah — 32.7 KB |
| `app-forms` · `app-data` · `app-workflow` · `app-charts` · `app-ui` · `app-layout` | ❌ semua salinan mentah |

**Dampak nyata:** 7 aplikasi GAS (si-kompetensi, si-platform, si-arsip-2026, si-lahar, si-dokumen, si-pelaporan, starter-kit) memuat `*.min.js` lewat jsDelivr dengan 160 KB artefak yang tidak diminify.

> **Koreksi (setelah Batch 1 dieksekusi).** Estimasi awal saya "55–65%" **terlalu optimis**. Angka sebenarnya setelah minify dijalankan:
>
> | | mentah | gzip (yang benar-benar ditransfer) |
> |---|---|---|
> | sebelum | 180.8 KB | 47.6 KB |
> | sesudah | 136.1 KB | 36.9 KB |
> | **hemat** | **43.7 KB (24%)** | **10.5 KB (22%)** |
>
> Lebih kecil dari dugaan karena `app-components.js` dan `app-modules.js` sebagian besar berisi **template HTML sebagai string** — terser tidak bisa memampatkan isi string, dan gzip sudah menangani pengulangannya. Tetap perbaikan nyata dan gratis, tapi bukan angka dramatis.

**Akar masalah:** file-file ini pernah di-upload manual lewat web GitHub (lihat commit `412e604`, `1647b8b`, `84b2a41` — *"Add files via upload"*), sehingga `npm run build` tidak pernah benar-benar dijalankan untuk mereka.

**Bonus bug:** `build:css` berisi
```
cleancss -o frontend/app-tailwind.min.css frontend/app-tailwind.min.css || true
```
Membaca dan menulis file yang sama → berisiko mengosongkan file. Diselamatkan hanya oleh `|| true`.

---

## 2. 🔴 CI yang tidak menjaga apa pun

`.github/workflows/frontend-ci.yml` melakukan `npm ci` → `npm run build` → **selesai**. Hasil build tidak di-commit, tidak di-upload, dan **tidak dibandingkan** dengan artefak yang ada di repo.

Artinya CI akan **selalu hijau** meski `.min.js` yang di-commit basi atau — seperti sekarang — tidak diminify sama sekali. Ini keamanan semu: lebih berbahaya daripada tidak ada CI, karena memberi rasa aman palsu.

Tambahan: `build:js` adalah `for`-loop bash di dalam `package.json`. Tidak portabel (gagal di Windows/PowerShell), tidak bisa di-debug, dan tidak punya exit-code per file.

---

## 3. 🟠 `.gitignore` yang melawan dirinya sendiri

```gitignore
**/**            # abaikan SEMUA
!frontend/
!frontend/**
...
package.json     # ← diabaikan, padahal ter-track
*.md             # ← diabaikan, padahal ter-track
.github/**       # ← diabaikan, padahal ter-track
```

Komentar di barisnya sendiri sudah mengakui: *"File CDN tetap ter-commit walau pattern ini ada, karena sudah ter-track sebelum .gitignore"*.

Ini **ranjau**: begitu ada yang menjalankan `git rm --cached` atau meng-clone ulang lalu menambah file, perilakunya tak terduga. File penting (`package.json`, CI, docs) akan diam-diam tidak ikut ter-commit.

---

## 4. 🟠 Versi tersebar di 11 tempat — dan sudah desinkron

| Lokasi | Nilai |
|--------|-------|
| `package.json` | **2.9.2** |
| `frontend/package.json` | 2.9.2 (nama paket beda!) |
| `app-core.js` | **2.9.1** ⚠️ |
| `app-components.js`, `app-modules.js`, `app-ui.js`, `app-layout.js`, `app-forms.js`, `app-data.js`, `app-charts.js`, `app-workflow.js` | **2.9.0** ⚠️ (8 file) |
| `ECOSYSTEM_GUIDE.md` judul | v2.9.0 |
| `frontend/README.md` judul | v2.9.1 |
| `tools/contract_check.py` | pin "2.9.2" ×7 |
| `preview-*.html` | nama file v2.9.0 & v2.9.2 |

Aplikasi yang memeriksa `AppComponents.version` hari ini akan membaca **2.9.0** padahal memuat tag `@v2.9.2`. Sudah salah, sekarang juga.

Ditambah: tag `v2.7.2` dan `v2.7.3` menunjuk commit yang sama (`b892ff4`).

---

## 5. 🟡 Dokumentasi 118 KB yang saling bertabrakan

| File | Ukuran | Masalah |
|------|--------|---------|
| `README.md` | 12 KB | mencampur 17 versi berbeda, sebagian tentang ekosistem (bukan CDN) |
| `ECOSYSTEM_GUIDE.md` | 9.7 KB | tumpang tindih dengan README |
| `ECOSYSTEM_GUIDE_LEGACY_2026-09-23.md` | **36 KB** | arsip — sudah ada di git history, tak perlu di tree |
| `ROADMAP_CDN.md` | 19.6 KB | rencana historis Batch 0–6, sudah selesai |
| `RENCANA_CDN_LENGKAP.md` | 16.4 KB | rencana pra-implementasi — **sudah terlaksana**, kini hanya noise |
| `frontend/README.md` | 15.3 KB | katalog komponen (satu-satunya yang benar-benar referensi API) |
| `frontend/CDN_SNIPPET.md` | 9 KB | snippet — 80% sudah ada di `frontend/README.md` |

Kontradiksi aktif: judul menyebut **"8 FILE"**, isi menyebut **"10 File Fisik (1 CSS + 9 JS)"** — di dokumen yang sama (`RENCANA_CDN_LENGKAP.md`, `app-components.js` baris 2–16).

> Untuk pengguna baru, tidak ada satu pun titik masuk yang jelas. Harus baca 7 dokumen untuk tahu cara memuat 10 file.

---

## 6. 🟡 `contract_check.py` — dependensi terbalik

Ini bagian yang paling pas disebut **over-engineered**, tapi bukan karena abstraksinya — karena **arahnya terbalik**.

Repo pustaka CDN berisi daftar hardcoded 7 aplikasi konsumennya, lengkap dengan path absolut dan nama file internal mereka:

```python
HOME = "/home/user"                           # hanya jalan di 1 mesin
{"name": "si-dokumen", "markers": [("17_RtlApi.gs", "RTL_TRANSISI_LEGAL_")]}
```

Konsekuensi:
- Pustaka **tidak bisa berubah tanpa menyentuh repo pustaka** setiap kali ada app baru/pindah folder.
- `KIT_TAGS` (38 tag) adalah **sumber kebenaran ketiga** untuk katalog komponen — setelah kode JS dan `frontend/README.md`. Tiga tempat harus diupdate manual tiap tambah komponen.
- Skrip ini tidak dipanggil CI sama sekali. Hanya manual, di satu mesin.

Yang benar-benar milik repo ini hanya pemeriksaan **generik** (self-closing tag, tag tak dikenal). Sisanya milik repo konsumen atau repo orkestrasi terpisah.

---

## 7. 🟡 Dua `package.json`, dua identitas

| | root | `frontend/` |
|---|---|---|
| name | `@miftachurrochim82/frontend-cdn` | `@trenggalekkab/frontend-cdn` |
| main | `frontend/app-core.js` | `app-core.min.js` |

`frontend/package.json` tidak punya `scripts` maupun `dependencies` — tidak berfungsi apa pun, tapi membuat npm/jsDelivr/bundler bisa salah mengenali root paket. Hapus saja.

---

## 8. 🟢 `preview-vX.Y.Z.html`

Dua file 190 baris, berbeda hanya pada **8 baris string versi**. Pola ini melahirkan satu file baru tiap rilis. Cukup satu `preview.html` yang membaca versi dari satu konstanta (atau dari tag git).

---

# Rencana Refactor

Diurutkan: dampak tertinggi & risiko terendah dulu. Tiap batch berdiri sendiri dan bisa dirilis terpisah.

### Batch 1 — Perbaiki build (risiko: rendah, dampak: 🔴 tinggi)
1. Ganti `scripts` bash-loop → `tools/build.mjs` (lintas-platform, exit code jelas).
2. Perbaiki bug `build:css` yang menulis ke file input.
3. **Jalankan build sebenarnya** → regenerasi 9 `.min.js` + 1 `.min.css`.
4. Tambah step CI `npm run build && git diff --exit-code frontend/` → CI **gagal** kalau artefak basi.

➡️ *Hasil: ukuran unduhan 7 aplikasi turun ±55–65%. Rilis sebagai `v2.9.3`.*

### Batch 2 — Satu sumber versi (risiko: rendah)
1. `package.json` jadi satu-satunya sumber.
2. Build menyuntik versi ke tiap bundle (`version: '__VERSION__'` → diganti saat build).
3. Hapus `frontend/package.json`.
4. Tambah cek CI: tidak boleh ada versi hardcoded tersisa.

### Batch 3 — Bersihkan repo (risiko: rendah)
1. Tulis ulang `.gitignore` jadi allowlist normal (~8 baris, tanpa `**/**`).
2. Pindahkan `ECOSYSTEM_GUIDE_LEGACY_*.md`, `ROADMAP_CDN.md`, `RENCANA_CDN_LENGKAP.md` → `docs/arsip/` (atau hapus — git history tetap menyimpannya).
3. Gabung `preview-*.html` → satu `preview.html`.

➡️ *Repo turun dari 36 → ~22 file.*

### Batch 4 — Dokumentasi: 7 → 3 (risiko: rendah)
| Dokumen baru | Isi |
|---|---|
| `README.md` | Apa ini, cara pakai (snippet 10 file), link ke dua dokumen lain. Maks 100 baris. |
| `docs/COMPONENTS.md` | Katalog 31 opsi + props (dari `frontend/README.md`) |
| `CHANGELOG.md` | Riwayat versi — satu tempat, bukan tersebar di 6 file |

Semua klaim jumlah file diseragamkan: **10 file (1 CSS + 9 JS), 31 opsi**.

### Batch 5 — Pindahkan `contract_check.py` (risiko: sedang — perlu keputusanmu)
- **Pecah dua**: bagian generik (self-closing, tag tak dikenal) tetap di sini sebagai linter yang membaca katalog dari kode JS — bukan dari list hardcoded.
- Bagian spesifik-aplikasi (`APPS`, pin versi, markers) → pindah ke repo orkestrasi/ekosistem, atau jadi file config `apps.json` di luar repo ini.
- Hapus `HOME = "/home/user"` → pakai argumen CLI.

### Batch 6 — Opsional, perlu diskusi
- Pertimbangkan menggabung `app-ui` + `app-layout` (2.7 KB) + `app-forms` → satu bundle. 9 request HTTP untuk total 206 KB tidak optimal; tapi ini mengubah kontrak publik, jadi butuh rilis mayor `v3.0.0`.
- Boilerplate merge `global.AppComponents = global.AppComponents || {}` diulang 6×. Bisa jadi satu helper kecil di `app-core`, tapi menambah urutan-muat wajib — **trade-off, tidak otomatis lebih baik.**

---

## Yang sebaiknya TIDAK diubah

Agar jelas — beberapa hal yang terlihat "berlebihan" sebenarnya sudah tepat:

- **Pemisahan 9 file JS** itu masuk akal untuk CDN à-la-carte: app sederhana cukup muat 3 file. Jangan digabung jadi satu bundle raksasa.
- **IIFE + `var` + tanpa build tooling modern** itu pilihan benar untuk target Google Apps Script HTML Service. Jangan "modernisasi" ke ESM/Vite.
- **Commit artefak `.min`** memang perlu — jsDelivr menyajikan langsung dari tag git. Yang salah bukan commit-nya, tapi artefaknya tidak pernah dibangun ulang.
- `package-lock.json` 490 baris untuk 2 devDeps itu normal.
- Katalog komponen di `frontend/README.md` berkualitas baik — pertahankan, cukup dipindah.

---

## Langkah berikutnya

Batch 1 saja sudah memperbaiki bug produksi yang menyentuh 7 aplikasi. Saya sarankan mulai dari sana.
