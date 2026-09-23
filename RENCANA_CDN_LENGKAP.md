# 📦 RENCANA CDN LENGKAP v2.9.0 — 10 FILE (1 CSS + 9 JS) & 31 OPSI (Update: +Tema Dinamis)
### Frontend CDN Pemkab Trenggalek — Sekali Jalan, Rapi, Tidak Tambal-Sulam
**Tanggal:** 22 September 2026 | **Dari:** v2.8.1 (2.850 baris, 4 file) → **v2.9.0 (target ~4.250 baris, 8 file, 31 opsi)** | **Status:** ✅ **SELESAI 2026-09-23 — RILIS v2.9.0 LIVE** (8 file & 31 opsi + Opsi B tema dinamis • jsDelivr @v2.9.0 HTTP 200)

> **Keputusan Anda:** 8 file & 30 opsi + **Opsi B Tema Dinamis via Pengaturan** — sekali jalan biar 5 app beda warna tanpa edit code & 2 tahun ke depan tidak bongkar lagi.

---

## BAGIAN 1: CDN ANDA SEKARANG — Fungsi Tiap File (Biar Tidak Abu-Abu)

> Analogi: CDN = **Toko Perkakas Bersama**. 1 toko, 1 versi (`@v2.9.0`). Semua app datang ke toko yang sama, ambil rak yang dibutuhkan.

| # | File Sekarang | Analogi | Isinya (12 komponen) | Ukuran | Wajib? |
|---|---|---|---|---|---|
| **1** | `app-common.css` | **Cat & Baju Standar** | Token `--primary`, tombol `btn-primary/secondary/danger`, `btn-icon` 32px, badge, sidebar, modal, `table-scroll` | 599 baris / 12 KB | **WAJIB** |
| **2** | `app-core.js` | **Listrik & Air** (mesin tak terlihat) | `AppCore.create()`, SSO tiket 5 menit, `safeSession/safeLocal` anti-error iframe, `loadLib('chart','xlsx')` on-demand, cache SWR SIMPEG | 841 baris / 13 KB | **WAJIB** |
| **3** | `app-components.js` | **Furniture Standar** (meja kursi lemari) | `app-login`, `sidebar`, `header`, `badge`, `stat-card`, `modal`, `crud-table`, `empty-state`, `skeleton`, `filter-bar`, `chart-bar/doughnut`, `pegawai-picker` + `v-can` + `paginate` | 907 baris / 38 KB | **WAJIB** |
| **4** | `app-modules.js` | **Ruangan Khusus** (aula) | `app-profile`, `app-settings` (halaman berat) | 512 baris / 28 KB | **OPSIONAL** |
| **5** | `app-tailwind.min.css` | **Bahan Mentah** (bata semen) | Tailwind v3.4.17 ter-compile (grid, spacing) | 42 KB | **WAJIB** (v2.11) |

**Cara pakai sekarang:**
```html
<link rel="stylesheet" href="...frontend-cdn@v2.9.0/frontend/app-common.min.css"> <!-- SELESAI: v2.8.1 → v2.9.0 -->
<script src="...frontend-cdn@v2.9.0/frontend/app-components.min.js"></script>
<script src="...frontend-cdn@v2.9.0/frontend/app-core.min.js"></script>
<script src="...frontend-cdn@v2.9.0/frontend/app-modules.min.js"></script> <!-- jika butuh Profil/Pengaturan -->
```
**Masalah:** Rak 1 & 3 bolong — tidak ada `btn-ghost`, `<app-tabs>`, `<app-pagination>` mandiri, preset kolom. Jadi tiap app ngarang sendiri → keluhan berulang Anda.

---

## BAGIAN 2: STRUKTUR BARU — 10 FILE (1 CSS + 9 JS) (1 Toko, 1 Versi, 8 Rak)

> Prinsip: **Tetap 1 repo, 1 tag `@v2.9.0`**. Tidak bikin repo micro terpisah (hindari neraka versi `tombol@v1 + tabel@v3`). Hanya rak di dalam toko yang ditata ulang — app tinggal **mix** ambil rak yang dibutuhkan.

### Peta 8 Rak Baru

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKO CDN v2.9.0 (@v2.9.0)                     │
│                  1 versi untuk semua file                       │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│ RAK A    │ RAK B    │ RAK C    │ RAK D    │ RAK E    │ RAK F    │
│ FONDASI  │ MESIN    │ TATA     │ FEEDBACK │ FORM     │ DATA     │
│ (CSS)    │ (CORE)   │ LETAK    │ & STATE  │ & FILTER │ & TABEL  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ RAK G    │ RAK H    │          MIX SESUAI KEBUTUHAN              │
│ CHART    │ WORKFLOW │  App ringan: A+B+C+D  ·  App lengkap: A-H  │
└──────────┴──────────┴───────────────────────────────────────────┘
```

| Rak | File Baru | Nama | Analogi | Isi | App Ringan (SI-CUTI) | App Lengkap (SI-DOKUMEN) |
|---|---|---|---|---|---|---|
| **A** | `app-common.css` | **FONDASI** | Cat & pondasi | Token warna, tombol, tabel dasar, preset kolom, scrollbar | ✅ | ✅ |
| **B** | `app-core.js` | **MESIN** | Listrik & air | SSO, cache SWR, `loadLib`, `safeSession` — **TETAP, tidak dipecah** | ✅ | ✅ |
| **C** | `app-layout.js` | **TATA LETAK** | Dinding & pintu | `app-login`, `sidebar`, `header`, `breadcrumb`, `page-header` | ✅ | ✅ |
| **D** | `app-ui.js` | **FEEDBACK & STATE** | Lampu & alarm | `badge`, `stat-card`, `modal`, `alert`, `confirm`, `skeleton`, `empty-state` + `v-can` | ✅ | ✅ |
| **E** | `app-forms.js` | **FORM & FILTER** | Dapur & kamar mandi | `filter-bar`, `pegawai-picker`, `debounced-search`, `date-picker`, `file-upload`, `rich-editor` | ☐ jika butuh form | ✅ |
| **F** | `app-data.js` | **DATA & TABEL** | Gudang & garasi | `crud-table` (upgrade), `tabs`, `pagination`, `detail-drawer`, `export-button`, `master-tree` | ☐ | ✅ |
| **G** | `app-charts.js` | **GRAFIK** | Ruang pamer | `chart-bar`, `doughnut`, `line` (baru), `configurable-dashboard` | ☐ | ☐ jika ada chart |
| **H** | `app-workflow.js` | **ALUR KERJA** | Ruang rapat | `approval-panel/stepper`, `audit-timeline`, `status-flow` + `app-profile/settings` (pindahan dari modules) | ☐ | ☐ jika ada approval |

**Total:** 1 CSS + 7 JS = **8 file**. `app-modules.js` lama **dilebur ke RAK H** biar tidak jadi 9 file. `app-components.js` lama **dipecah jadi C+D+F+G** biar tidak gemuk 1.400 baris.

**Cara mix baru (tetap 1 tag):**
```html
<!-- App Sederhana (hanya form cuti) -->
<link href="...@v2.9.0/frontend/app-common.min.css">
<script src="...@v2.9.0/frontend/app-core.min.js"></script>
<script src="...@v2.9.0/frontend/app-layout.min.js"></script>
<script src="...@v2.9.0/frontend/app-ui.min.js"></script>
<script src="...@v2.9.0/frontend/app-forms.min.js"></script>

<!-- App Lengkap (si-dokumen full) -->
<link href="...@v2.9.0/frontend/app-common.min.css">
<script src="...@v2.9.0/frontend/app-core.min.js"></script>
<script src="...@v2.9.0/frontend/app-layout.min.js"></script>
<script src="...@v2.9.0/frontend/app-ui.min.js"></script>
<script src="...@v2.9.0/frontend/app-forms.min.js"></script>
<script src="...@v2.9.0/frontend/app-data.min.js"></script>
<script src="...@v2.9.0/frontend/app-charts.min.js"></script>
<script src="...@v2.9.0/frontend/app-workflow.min.js"></script>
```

---

## BAGIAN 3: 30 OPSI — Daftar Lengkap per Rak (Siap Coret/Tambah)

> Legenda: 🔧 **WAJIB** = tutup keluhan berulang Anda | 💡 **KAYA** = biar sekali jalan tidak nyesel | ✅ **SUDAH ADA** (tinggal pindah rak / perkuat)

### RAK A — FONDASI (`app-common.css`) — 7 opsi

| # | Opsi | Status | Prioritas | Deskripsi 1 Kalimat untuk Anda |
|---|---|---|---|---|
| **A1** | `btn-ghost` | 🔧 WAJIB | TINGGI | Tombol transparan untuk TAB & filter — dipakai 67x tapi belum ada definisinya, jadi warna ngarang. |
| **A2** | `btn-sm` / `btn-xs` | 💡 KAYA | SEDANG | Tombol kecil untuk aksi di tabel padat (sekarang hanya ada `btn` normal & `btn-lg` besar). |
| **A3** | Style `<app-tabs>` | 🔧 WAJIB | TINGGI | Garis bawah `var(--primary)` saat tab aktif, bukan ganti warna tombol kecil. |
| **A4** | Style `<app-pagination>` | 🔧 WAJIB | TINGGI | Prev/Next + "hal 2/10" yang seragam di semua list. |
| **A5** | Preset kolom `col-S/M/L/XL` (90/150/220/260px) | 🔧 WAJIB | TINGGI | Larang `min-w-[137px]` ngarang — cukup `class="col-M"`. |
| **A6** | `input--sm`, `select--sm`, `form-label--sm` | 💡 KAYA | RENDAH | Form padat (banyak field) biar tidak terlalu tinggi. |
| **A7** | State `is-error`, `is-success` + `focus-ring` baku | 💡 KAYA | SEDANG | Input salah jadi border merah + pesan, tidak tiap app bikin sendiri. |

### RAK C — TATA LETAK (`app-layout.js`) — 4 opsi

| # | Opsi | Status | Prioritas | Deskripsi |
|---|---|---|---|---|
| **C1** | `<app-breadcrumb>` | 💡 KAYA | SEDANG | `Home > Master > Kategori` — navigasi atas halaman, sekarang tiap app bikin manual. |
| **C2** | `<app-page-header>` | 💡 KAYA | SEDANG | Judul + deskripsi + tombol aksi kanan yang seragam (sekarang tiap `V_` beda padding). |
| **C3** | `<app-login>` | ✅ ADA | — | Tetap, pindah dari components ke layout (lebih logis). |
| **C4** | `<app-sidebar>` + `<app-header>` | ✅ ADA | — | Tetap, pindah rak. Sudah matang. |

### RAK D — FEEDBACK & STATE (`app-ui.js`) — 7 opsi

| # | Opsi | Status | Prioritas | Deskripsi |
|---|---|---|---|---|
| **D1** | `<app-tabs>` (komponen) | 🔧 WAJIB | TINGGI | **Pengganti** `grid + button btn-ghost` kecil. Props: `tabs=[{id,label,icon,count}]`, `v-model`. |
| **D2** | `<app-pagination>` (komponen mandiri) | 🔧 WAJIB | TINGGI | Props: `page`, `totalPages`, `totalData` → emit `change-page`. Wajib di semua list. |
| **D3** | `<app-badge>` extend status `draft/baru/diproses/selesai/batal` | 🔧 WAJIB | TINGGI | Sekarang cuma `disetujui/menunggu/ditolak` — padahal starter-kit pakai 5 status transaksi. |
| **D4** | `<app-alert>` | 💡 KAYA | SEDANG | Kotak kuning/merah/hijau di atas form ("Data berhasil disimpan", "Gagal validasi"). |
| **D5** | `<app-confirm>` | 💡 KAYA | SEDANG | Dialog "Yakin hapus? Ya/Batal" — sekarang tiap app pakai `if(confirm())` mentah. |
| **D6** | `<app-stat-card>` + varian `trend` (+12%) | 💡 KAYA | RENDAH | Kartu KPI bisa tampilkan naik/turun dengan panah hijau/merah. |
| **D7** | `<app-empty-state>` & `<app-skeleton>` + `v-can` | ✅ ADA | — | Tetap, pindah rak. Tinggal wajibkan pakai. |

### RAK E — FORM & FILTER (`app-forms.js`) — 6 opsi

| # | Opsi | Status | Prioritas | Deskripsi |
|---|---|---|---|---|
| **E1** | `<app-filter-bar>` **UPGRADE** (debounce 300ms + date-range + span 2..4) | 🔧 WAJIB | TINGGI | Sekarang ada tapi jarang dipakai. Upgrade biar jadi satu-satunya cara bikin filter. |
| **E2** | `<app-pegawai-picker>` | ✅ ADA | — | Tetap, pindah rak. Cache SWR SIMPEG. |
| **E3** | `<app-debounced-search>` | 🔧 WAJIB | TINGGI | Input cari yang tunggu 300ms baru hit server — hemat request, untuk `V_Utama` & `V_Rtl`. |
| **E4** | `<app-date-picker>` | 💡 KAYA | SEDANG | Wrapper `input type=date` dengan label & error seragam (sekarang ada yang pakai `type=text` untuk tanggal). |
| **E5** | `<app-file-upload>` (drag & drop + preview + progress) | 💡 KAYA | TINGGI | Untuk `T_LAMPIRAN` — sekarang tiap app bikin upload sendiri, validasi size beda-beda. |
| **E6** | `<app-rich-editor>` (bold/italic/list minimal) | 💡 KAYA | RENDAH | Untuk deskripsi panjang — kalau app Anda butuh format teks. Bisa dicoret jika tidak perlu. |

### RAK F — DATA & TABEL (`app-data.js`) — 6 opsi

| # | Opsi | Status | Prioritas | Deskripsi |
|---|---|---|---|---|
| **F1** | `<app-crud-table>` **UPGRADE** (sticky header + sortable + col preset S/M/L) | 🔧 WAJIB | TINGGI | Sekarang ada tapi header belum sticky di semua app, lebar kolom masih ngarang. |
| **F2** | `<app-detail-drawer>` (slide dari kanan) | 💡 KAYA | TINGGI | Klik judul di tabel → drawer muncul lihat detail tanpa pindah halaman. Dipakai di ≥2 app, kandidat kuat. |
| **F3** | `<app-export-button>` (Excel/PDF 1 klik, pakai `AppCore.loadLib`) | 💡 KAYA | TINGGI | 1 tombol untuk 12 laporan L1-L12 — sekarang tiap laporan bikin tombol sendiri. |
| **F4** | `<app-csv-import>` + preview & validasi | 💡 KAYA | SEDANG | Impor massal — kalau butuh isi master 100 baris sekaligus. |
| **F5** | `<app-master-tree>` (pohon hierarki parent→anak) | 💡 KAYA | SEDANG | Untuk `M_KATEGORI` — sekarang tampil flat, susah lihat struktur. |
| **F6** | `<app-image-viewer>` / `<app-file-preview>` (preview foto/PDF) | 💡 KAYA | SEDANG | Untuk lampiran — klik file → preview tanpa download. |

### RAK G — GRAFIK (`app-charts.js`) — 3 opsi

| # | Opsi | Status | Prioritas | Deskripsi |
|---|---|---|---|---|
| **G1** | `<app-chart-bar>` & `<app-chart-doughnut>` | ✅ ADA | — | Tetap, pindah rak. Sudah matang. |
| **G2** | `<app-chart-line>` (tren 12 bulan) | 💡 KAYA | SEDANG | Untuk dashboard — sekarang hanya bar & doughnut, belum ada garis tren. |
| **G3** | `<app-configurable-dashboard>` (grid 4 kartu + 4 chart yang bisa diatur) | 💡 KAYA | RENDAH | Dashboard tiap app beda layout tanpa coding — bisa dicoret jika dirasa terlalu canggih. |

### RAK H — ALUR KERJA (`app-workflow.js`) — 4 opsi (+Tema Dinamis Opsi B)

| # | Opsi | Status | Prioritas | Deskripsi |
|---|---|---|---|---|
| **H1** | `<app-approval-panel>` / `<app-stepper>` (Langkah 1-2-3) | 💡 KAYA | TINGGI | Untuk `T_APPROVAL` & `V_Rtl` — tampilkan proses persetujuan berjenjang. Kandidat kuat. |
| **H2** | `<app-audit-timeline>` (garis waktu: siapa, kapan, status) | 💡 KAYA | SEDANG | Untuk riwayat approval — sekarang hanya tabel, kurang visual. |
| **H3** | `<app-profile>` & `<app-settings>` | ✅ ADA | — | Pindahan dari `app-modules.js` lama — tetap, masuk rak workflow karena sifatnya alur. |
| **H4** | `<app-theme-picker>` + **Tema Dinamis via Pengaturan** ⭐ **OPSI B (BARU)** | 🔧 WAJIB | TINGGI | **Pengaturan > Tema**: admin pilih warna (Hijau/Biru/Kuning/Ungu/Rose/Teal/Custom) → simpan ke `Script Properties` (`THEME_CODE` atau `THEME_JSON`) → app inject `--primary` otomatis tanpa edit `Index.html`. Mendukung 5 app beda warna + ganti tanpa deploy. |

---

## BAGIAN 4: RINGKASAN 31 OPSI (+Tema Dinamis)

| Rak | WAJIB (tutup keluhan + tema) | KAYA (sekali jalan) | SUDAH ADA | Total |
|---|---|---|---|---|
| **A Fondasi** | 4 (A1,A3,A4,A5) | 3 (A2,A6,A7) | 0 | **7** |
| **C Layout** | 0 | 2 (C1,C2) | 2 | **4** |
| **D Feedback** | 3 (D1,D2,D3) | 3 (D4,D5,D6) | 1 | **7** |
| **E Forms** | 2 (E1,E3) | 3 (E4,E5,E6) | 1 | **6** |
| **F Data** | 1 (F1) | 5 (F2-F6) | 0 | **6** |
| **G Charts** | 0 | 2 (G2,G3) | 1 | **3** |
| **H Workflow** | **1 (H4 Tema Dinamis)** | 2 (H1,H2) | 1 | **4** |
| **TOTAL** | **11 WAJIB** | **20 KAYA** | **6 ADA** | **31 (+6 ada = 37 total komponen di toko)** |

**Dampak ukuran:**
- Sekarang: 2.850 baris (4 file, 12 komponen)
- **v2.9.0 target: ~4.250 baris (8 file, 31 opsi)** → **+1.400 baris (+49%)**
- Minified total: **~135 KB** (masih di bawah 1 foto HP, dan app ringan hanya load 60 KB karena bisa mix)
- **Alarm ROADMAP:** CDN >3.800 tanpa adopsi ≥2 app = spekulatif → **Aman**, karena 11 WAJIB pasti dipakai semua app (termasuk tema dinamis untuk 5 app beda warna), 20 KAYA sudah ada pemicu ≥2 app (filter, upload, export, approval).

---

## BAGIAN 5: CARA MEMUTUSKAN — Silakan Coret/Tambah Santai

Anda tinggal balas santai, contoh:

> "Hmm, `E6 rich-editor` dan `G3 configurable-dashboard` kayaknya belum perlu — coret dulu. `H1 approval-panel` wajib. Tambah `app-qr-code` dong."

Atau:

> "Ambil semua 30 sekalian, gas."

Atau:

> "File 8 kebanyakan, balik ke 6 aja."

**Update 22 Sep malam — Opsi B Tema Dinamis DISETUJUI:** H4 `<app-theme-picker>` masuk sebagai WAJIB. Daftar final = **31 opsi**.
**Setelah ini saya akan:**
1. Kunci daftar final = **31 opsi (11 WAJIB + 20 KAYA)**
2. Kunci struktur file = **8 file**
3. Eksekusi **sekali jalan**: update 8 file → `npm run build` → update `contract_check.py` + `CDN_SNIPPET.md` → buat preview HTML before/after → siap tag `v2.9.0`

---

## LAMPIRAN: Contoh Mix 8 File

**App Sederhana (SI-CUTI):**
```html
<link href="...@v2.9.0/frontend/app-common.min.css">
<script src="...@v2.9.0/frontend/app-core.min.js"></script>
<script src="...@v2.9.0/frontend/app-layout.min.js"></script>
<script src="...@v2.9.0/frontend/app-ui.min.js"></script>
<script src="...@v2.9.0/frontend/app-forms.min.js"></script>
```

**App Menengah (SI-LAHAR):**
```html
<!-- tambah -->
<script src="...@v2.9.0/frontend/app-data.min.js"></script>
<script src="...@v2.9.0/frontend/app-charts.min.js"></script>
```

**App Lengkap (SI-DOKUMEN + Approval):**
```html
<!-- tambah lagi -->
<script src="...@v2.9.0/frontend/app-workflow.min.js"></script>
```
Semua tetap **1 tag `@v2.9.0`**, tidak ada `tombol@v1 + tabel@v2` campur aduk.

---

*Dokumen ini adalah rencana diskusi — belum dieksekusi. Coret/tambah dengan santai, nanti kita kunci dan eksekusi sekali jalan.*
