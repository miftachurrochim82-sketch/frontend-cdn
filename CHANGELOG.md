# Riwayat Versi

Satu-satunya riwayat versi untuk repo ini. Sebelumnya informasi ini tersebar di
enam dokumen dengan isi yang saling bertentangan.

Format: tag git = versi paket = versi runtime yang dilaporkan `AppComponents.version`.
Sejak v2.9.3 ketiganya dijamin identik oleh `npm run check` di CI.

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
