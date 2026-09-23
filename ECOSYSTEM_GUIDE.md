# Panduan Frontend CDN v2.9.0 — Pemkab Trenggalek
### Satu Toko Perkakas untuk Semua Aplikasi (Vue 3 + Tailwind) — **1 CSS + 9 JS**

> **Repo ini = FRONTEND SAJA.** Backend `CoreLib` hidup di repo terpisah **[LIbrary-CoreLib](https://github.com/miftachurrochim82-sketch/LIbrary-CoreLib)** (pin **17**, v2.4.0 LIVE). Dokumen lama gabungan diarsipkan di [`ECOSYSTEM_GUIDE_LEGACY_2026-09-23.md`](ECOSYSTEM_GUIDE_LEGACY_2026-09-23.md) — jangan pakai lagi.

---

## 1. Ringkasan & Prinsip

Ekosistem app Pemkab Trenggalek pakai **frontend CDN terpusat** — semua app (si-kompetensi, si-pelaporan, si-lahar, si-dokumen, app baru dari `starter-kit`) load UI dari **satu versi yang sama** via jsDelivr. Hasil: tampilan seragam, dark mode sinkron, update sekali jalan.

**5 prinsip:**
1. **Satu versi untuk semua berkas** — 1 tag `v2.9.0` kunci **1 CSS + 9 JS** (total 10 file fisik, lihat §3).
2. **Zero render-blocking** — library berat (Chart.js, XLSX) load on-demand via `AppCore.loadLib()`.
3. **SWR cache** — data master SIMPEG load 0 ms setelah cache.
4. **Low-boilerplate** — cukup deklarasi komponen, tidak tulis ulang CSS/JS.
5. **Harmonis** — tema, ikon FA 6.5.2, dan dark mode sama di semua app.

---

## 2. Peta Ekosistem (fokus frontend)

```text
┌────────────────────────────────────────────┐
│  FRONTEND CDN v2.9.0 (repo ini, jsDelivr)  │
│  1 CSS + 9 JS (31 opsi) — 10 file fisik   │
│  Vue 3, Tailwind, FA 6.5.2, SWR, Theme     │
└──────────────────────┬─────────────────────┘
                       │  cdn.jsdelivr.net/gh/...@v2.9.0
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌──────────────────┐      ┌──────────────────────┐
│ Aplikasi Satelit │      │ starter-kit (cetak   │
│ si-lahar, si-    │      │ app baru, sudah pin  │
│ kompetensi, dll  │      │ CDN @v2.9.0 + CoreLib│
└──────────────────┘      └──────────────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
         ┌──────────────────────┐
         │  CoreLib v2.4.0      │  ← repo terpisah LIbrary-CoreLib
         │  (backend, bukan di  │     ID 1GmeYflf... pin 17
         │   repo ini)          │
         └──────────────────────┘
```

**Hubungan:** CDN = baju & furniture (UI). CoreLib = listrik & pondasi (DB, auth, SSO). App satelit pakai keduanya.

---

## 3. File CDN — 10 File Fisik (1 CSS + 9 JS) — 31 OPSI

> **Mudah diingat: 1 baju (CSS) + 9 perkakas (JS) = 10 file.** Dulu disebut “8 FILE” (hanya hitung 7 inti), sekarang **dibuat jelas 10 file** (9 js + 1 css) biar pemula tidak bingung — 7 file inti + 2 bundle lama compat = tetap 9 JS.

| # | File source | Min | Isi | Wajib? |
|---|---|---|---|---|
| 1 | `app-common.css` | `app-common.min.css` | Token `--primary`, tombol `btn-primary/ghost/sm/xs`, `col-S/M/L/XL`, `alert`, `breadcrumb`, `drawer`, 6 preset tema | **WAJIB** |
| 2 | `app-core.js` | `.min.js` | `AppCore.create()`, `safeSession/safeLocal`, `loadLib()`, SWR, `AppCore.themes` + `applyTheme()` + `getMyScope()` | **WAJIB** |
| 3 | `app-layout.js` | `.min.js` | `app-breadcrumb`, `app-page-header` | layout |
| 4 | `app-ui.js` | `.min.js` | `app-tabs`, `app-pagination`, `app-badge` (draft/baru/diproses/selesai/batal), `app-alert`, `app-confirm` | feedback |
| 5 | `app-forms.js` | `.min.js` | `app-filter-bar` (debounce+date-range), `app-debounced-search`, `app-date-picker`, `app-file-upload`, `app-rich-editor` | jika ada form |
| 6 | `app-data.js` | `.min.js` | `app-crud-table`, `app-detail-drawer`, `app-export-button`, `app-csv-import`, `app-master-tree`, `app-image-viewer` | jika ada data |
| 7 | `app-charts.js` | `.min.js` | `app-chart-bar/doughnut/line`, `app-configurable-dashboard` | jika ada chart |
| 8 | `app-workflow.js` | `.min.js` | `app-approval-panel/stepper`, `app-audit-timeline`, `app-theme-picker`, `app-profile/settings` (re-export) | jika ada workflow/tema |
| 9 | `app-components.js` | `.min.js` | **Bundle kompatibilitas** — gabungan 12 komponen inti lama (biar app lama tidak pecah) | opsional (compat) |
| 10 | `app-modules.js` | `.min.js` | **Bundle kompatibilitas** — `app-profile`, `app-settings` lama | opsional (compat) |
| + | `app-tailwind.min.css` | — | Tailwind v3.4.17 ter-compile (bahan mentah) | WAJIB bareng common |

> **Catatan pemula:** 9 JS = `app-core` (mesin) + 6 BARU (`layout/ui/forms/data/charts/workflow`) + 2 bundle lama (`components/modules` untuk app lama). App baru cukup load 7–8 file, tidak harus 9 sekaligus — pilih sesuai kebutuhan.

**Total baris v2.9.0:** ~4.250 (dari 2.850 di v2.8.1), minified ~135 KB (app ringan cuma load ~60 KB).

---

## 4. Cara Pakai (copy-paste)

> Selalu pakai **tag versi** `@v2.9.0`, jangan `@main` (cache 12 jam).

**Snippet lengkap ada di [`frontend/CDN_SNIPPET.md`](frontend/CDN_SNIPPET.md).** Contoh minimal di `Index.html`:

```html
<!-- di <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-common.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-tailwind.min.css">

<!-- sebelum </body> -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-components.min.js"></script>
<!-- pilih yang dibutuhkan -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-layout.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-ui.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-forms.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-data.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-charts.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-workflow.min.js"></script>
```

**Cek versi di console:** `AppCore.version` → harus `"2.9.0"`.

---

## 5. Katalog Komponen (ringkas)

- **Layout:** `app-breadcrumb`, `app-page-header`
- **UI:** `app-tabs` (WAJIB), `app-pagination` (WAJIB), `app-badge` (+ status baru), `app-alert`, `app-confirm`, `app-stat-card`, `app-empty-state`, `app-skeleton`
- **Forms:** `app-filter-bar`, `app-debounced-search`, `app-date-picker`, `app-file-upload`, `app-rich-editor`, `app-pegawai-picker` + direktif `v-can`
- **Data:** `app-crud-table` (col preset S/M/L/XL, sticky, pagination), `app-detail-drawer`, `app-export-button`, `app-master-tree`
- **Charts:** `app-chart-bar/doughnut/line`, `app-configurable-dashboard` (4 kartu + 4 chart + 4 panel)
- **Workflow:** `app-approval-panel`, `app-stepper`, `app-audit-timeline`, `app-theme-picker`

Detail props & contoh ada di [`frontend/README.md`](frontend/README.md).

---

## 6. Tema Dinamis (Opsi B)

User pilih warna di `Pengaturan` → simpan ke `safeLocal('THEME_CODE')` → `AppCore.applyTheme(code)` set `document.documentElement.style --primary`.

Preset: `emerald` `#065f46` (default), `sky` `#0c4a6e`, `amber` `#92400e`, `violet` `#5b21b6`, `rose` `#9f1239`, `teal` `#134e4a`. Tambah tema baru tinggal tambah di `AppCore.themes` + `app-common.css` variabel.

---

## 7. Deployment & Versioning

- **Satu tag untuk semua file:** `v2.9.0` (jsDelivr `@v2.9.0`) — kunci 1 CSS + 9 JS sekaligus. Jangan pecah versi per-file.
- **Rilis:** `git tag -a v2.9.0 -m "v2.9.0 10 FILE (1 CSS+9 JS) & 31 OPSI"` → `git push --tags` → tunggu jsDelivr ~5 menit → cek `https://cdn.jsdelivr.net/gh/...@v2.9.0/frontend/app-core.min.js` HTTP 200.
- **Pin di app:** `appsscript.json` / `Index.html` harus tulis eksplisit `@v2.9.0`, jangan `@main`.
- **Starter-kit** sudah pin `@v2.9.0` (v2.12.0). App baru cetak dari starter-kit, jangan copy manual.

---

## 8. Hubungan dengan Backend

Butuh auth/DB/role? Lihat repo terpisah **[LIbrary-CoreLib](https://github.com/miftachurrochim82-sketch/LIbrary-CoreLib)**:
- Guide backend: `LIbrary-CoreLib/ECOSYSTEM_GUIDE.md`
- Changelog: `LIbrary-CoreLib/src/00_MIGRATION_v2.md`
- Identitas: `CoreLib` ID `1GmeYflf...` pin **17** (v2.4.0, PASS 47)

Jangan cari folder `backend/` di repo ini — sudah **DIHAPUS 2026-09-19** (`2d5afab`).

---

## 9. Riwayat Versi (frontend saja)

| Versi | Tanggal | Inti |
|---|---|---|
| **v2.9.0** | 2026-09-23 | **10 FILE (1 CSS + 9 JS) & 31 OPSI** — 6 file baru + tema dinamis + badge baru |
| v2.8.1 | 2026-09-19 | Patch `AppCore.version` → `"2.8.0"` |
| v2.8.0 | 2026-09-18 | `btn-icon`, `filter-bar span` |
| v2.7.x | 2026-09-16 | filter-bar, chart kit, picker, skeleton |

Lengkap ada di [`ROADMAP_CDN.md`](ROADMAP_CDN.md). File lama gabungan ada di [`ECOSYSTEM_GUIDE_LEGACY_2026-09-23.md`](ECOSYSTEM_GUIDE_LEGACY_2026-09-23.md).

