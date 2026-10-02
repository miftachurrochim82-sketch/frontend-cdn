# Riwayat Versi

Satu-satunya riwayat versi untuk repo ini. Sebelumnya informasi ini tersebar di
enam dokumen dengan isi yang saling bertentangan.

Format: tag git = versi paket = versi runtime yang dilaporkan `AppComponents.version`.
Sejak v2.9.3 ketiganya dijamin identik oleh `npm run check` di CI.

---

## v3.0.1 — 2026-10-02

### Diperbaiki
- **jsDelivr menyajikan CSS mentah 24 KB, bukan artefak 11 KB kita.**
  Untuk permintaan `*.min.css`, jsDelivr mengabaikan berkas yang ada di
  repo dan membuat versi minify sendiri dari `app.css` di folder yang
  sama. Proses itu gagal (`Failed to minify the file using clean-css
  v5.3.3`) sehingga ia menyajikan sumber apa adanya.
- Sumber dipindah ke `src/`; `frontend/` kini hanya berisi dua artefak
  sajian. Tanpa `app.css` bersebelahan, jsDelivr menyajikan berkas kita.

**v3.0.0 jangan dipakai** — tag tetap ada tapi CSS-nya tersaji mentah.
Gunakan `@v3.0.1`.

---

## v3.0.0 — 2026-10-02

**Perubahan besar: 10 berkas sajian → 2.** Dasarnya pengukuran pemakaian nyata
pada kedua aplikasi konsumen (`starter-kit`, `si-data`), bukan perkiraan.

### Data yang mendasari
- Dari **38 komponen**, hanya **11** yang dipanggil. 27 nol pemakai.
- Kedua aplikasi memuat **kesepuluh** berkas CDN, padahal 6 di antaranya
  (`app-layout`, `app-ui`, `app-forms`, `app-data`, `app-charts`,
  `app-modules`) tidak menyumbang satu pun komponen terpakai.
- Arsitektur 10 berkas dibuat agar aplikasi bisa memilih à-la-carte.
  Tidak ada konsumen yang memilih — modularitasnya hanya biaya.

### Dihapus
- 27 komponen tanpa pemakai: `app-alert`, `app-approval-panel`,
  `app-audit-timeline`, `app-breadcrumb`, `app-chart-line`,
  `app-configurable-dashboard`, `app-confirm`, `app-crud-table`,
  `app-csv-import`, `app-date-picker`, `app-debounced-search`,
  `app-detail-drawer`, `app-export-button`, `app-file-preview`,
  `app-file-upload`, `app-filter-bar`, `app-filter-bar-enhanced`,
  `app-image-viewer`, `app-master-tree`, `app-page-header`,
  `app-pagination`, `app-pegawai-picker`, `app-profile`,
  `app-rich-editor`, `app-settings`, `app-stepper`, `app-tabs`.
- 83 kelas CSS yatim (tidak dirujuk aplikasi maupun template komponen
  yang dipertahankan). Kelas `badge-*` ternyata mati sejak `app-badge`
  beralih ke kelas utilitas Tailwind.
- `app-tailwind.min.css` — 43 KB, tidak dimuat siapa pun; kedua aplikasi
  meng-inline Tailwind ter-compile sendiri.
- `tools/contract_check.py` — 226 baris yang menjaga 7 aplikasi, 5 di
  antaranya sudah tidak dikembangkan. Skrip ini membuat repo pustaka
  mengenal konsumennya (dependensi terbalik) dan menjadi sumber
  kebenaran ketiga untuk katalog komponen.

### Diubah
- `app-common.css` → `app.css`; bundel tunggal `app.min.css`.
- `app-core.js` + `app-components.js` → bundel tunggal `app.min.js`.
- `app-theme-picker` dipindah dari `app-workflow.js` ke `app-components.js`.
- `preview.html` ditulis ulang untuk 11 komponen.

### Dampak ukuran

| | sebelum (dimuat tiap app) | sesudah |
|---|---|---|
| Berkas HTTP | 10 | **2** |
| Total artefak | 132.0 KB | **56.9 KB** (−57%) |
| Komponen | 38 | 11 |
| Berkas di repo | 36 | 17 |

### Migrasi
Ganti kesepuluh tag `<script>`/`<link>` dengan dua baris pada README.
Aplikasi yang belum siap cukup tetap menunjuk `@v2.9.3`.

---

## v2.9.3 — 2026-10-02

Rilis perbaikan infrastruktur. **Tidak ada perubahan perilaku komponen.**

### Diperbaiki
- **Artefak `.min` kini benar-benar diminify.** Delapan dari sembilan `*.min.js`
  dan `app-common.min.css` sebelumnya adalah salinan byte-identik dari
  sumbernya — hanya `app-core.min.js` yang valid. Total artefak turun dari
  180.8 KB ke 136.1 KB (−24%; −22% setelah gzip).
- **Versi runtime tidak lagi desinkron.** Rilis v2.9.2 melaporkan dirinya
  sebagai `'2.9.0'` (dan `app-core` sebagai `'2.9.1'`). Versi kini disuntikkan
  dari `package.json` ke 16 literal saat build.
- Bug `build:css` yang membaca dan menulis `app-tailwind.min.css` — file yang
  sama — dihapus. File itu vendored dan tidak dibangun ulang.

### Diubah
- `for`-loop bash di `package.json` diganti `tools/build.mjs` (lintas-platform,
  exit code per file, laporan rasio kompresi).
- CI: `npm run build` yang hasilnya dibuang → `npm run check` yang membandingkan
  artefak dengan sumbernya, plus `node --check` tiap artefak.
- `.gitignore` ditulis ulang sebagai daftar abaikan biasa, menggantikan pola
  `**/**` + negasi yang tidak berfungsi.
- Dokumentasi dikonsolidasi dari 7 berkas (118 KB) menjadi 3:
  `README.md`, `docs/COMPONENTS.md`, `CHANGELOG.md`.
- `preview-v2.9.0.html` dan `preview-v2.9.2.html` digabung menjadi satu
  `preview.html` yang membaca versinya sendiri saat runtime.

### Dihapus
- `frontend/package.json` — paket kedua tanpa `scripts`/`dependencies` dengan
  nama berbeda (`@trenggalekkab/...` vs `@miftachurrochim82/...`).
- Dependensi `clean-css-cli`, diganti `clean-css` (dipakai lewat API).

---

## v2.9.2 — 2026-09-26

Pin kontrak diseragamkan ke 2.9.2 untuk seluruh aplikasi konsumen
(si-kompetensi, si-platform, si-pelaporan). Melengkapi 10 file & 31 opsi.

> Catatan: artefak rilis ini tidak diminify dan melaporkan versi runtime
> `'2.9.0'`. Keduanya diperbaiki di v2.9.3.

## v2.9.1 — 2026-09-23

Helper scope pada `AppCore`: `getMyScope()` mengembalikan string, `setMyScope()` ditambahkan.

## v2.9.0 — 2026-09-22

**Rilis besar — 10 file (1 CSS + 9 JS) & 31 opsi.**

- Enam berkas modul baru: `app-layout`, `app-ui`, `app-forms`, `app-data`,
  `app-charts`, `app-workflow` — semuanya otomatis merge ke `AppComponents`.
- Tema dinamis (Opsi B): `AppCore.themes`, `applyTheme()`, `<app-theme-picker>`.
- `<app-badge>` menerima status baru: draft, baru, diproses, selesai, batal.
- Kelas `btn-ghost`.

## v2.8.1 — 2026-09-19

Patch konsistensi internal (T49): `AppCore.version` diselaraskan ke `"2.8.0"`.
Tanpa perubahan perilaku.

## v2.8.0 — 2026-09-18

- Kelas tombol `.btn-icon`, `.btn-icon-danger`, `.btn-lg`.
- `<app-filter-bar>` mendukung `span` per filter.

## v2.7.0 — 2026-09-16

Batch B1–B7: `<app-pegawai-picker>`, chart kit, `<app-filter-bar>`,
`<app-empty-state>`, `<app-skeleton>`, direktif `v-can`, helper paginate.

> Tag `v2.7.2` dan `v2.7.3` menunjuk commit yang sama (`b892ff4`).

## v2.6.5 — 2026-09

Prop `icon` pada `<app-badge>`; komponen `<app-stat-card>` baru.

## v2.6.0 — 2026-09

Registry pustaka `AppCore.libs` + `loadLib()` untuk pemuatan on-demand
(Chart.js, XLSX, jsPDF, PDFLib).

> Catatan operasional: tag `v2.6.3` sempat menunjuk isi komponen v2.6.0 karena
> berkas diunggah setelah tag dibuat.

---

Dokumen perencanaan historis yang lebih rinci ada di [`docs/arsip/`](docs/arsip/).
