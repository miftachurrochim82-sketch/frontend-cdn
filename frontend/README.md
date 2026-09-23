# Frontend CDN — Pustaka UI Bersama v2.9.1 (10 File — 1 CSS + 9 JS & 31 Opsi)
### Vue 3 + Tailwind CSS • Pemkab Trenggalek

Seluruh aplikasi ekosistem (si-kompetensi, si-pelaporan, si-platform, si-lahar, dan aplikasi baru) memuat UI dari folder ini via jsDelivr. **Satu nomor versi berlaku untuk semua berkas** — satu tag rilis (`v2.9.0`) mengunci 1 CSS + 7 JS sekaligus.

> Snippet siap salin untuk `Index.html` aplikasi baru: **[CDN_SNIPPET.md](CDN_SNIPPET.md)**.

---

## 🆕 Rilis v2.9.0 (2026-09-22) — 10 FILE (1 CSS + 9 JS) & 31 OPSI — Sekali Jalan

**Tujuan:** tutup 5 keluhan berulang (button/tab/filter/pagination/kolom) + kaya fitur + tema dinamis — tidak tambal-sulam lagi.

**RAK A — Fondasi (`app-common.css`):** `btn-ghost` (dipakai 67x tapi belum ada), `btn-sm/xs`, style `app-tabs` & `app-pagination`, preset kolom `col-S/M/L/XL` (90/150/220/260px), `input--sm`, `is-error/success`, `alert`, `breadcrumb`, `page-header`, `drawer`, `theme-picker` — 7 opsi

**RAK C — Layout (`app-layout.js` BARU):** `<app-breadcrumb>` (C1), `<app-page-header>` (C2)

**RAK D — UI (`app-ui.js` BARU):** `<app-tabs>` (D1 WAJIB), `<app-pagination>` (D2 WAJIB), `<app-badge>` extend `draft/baru/diproses/selesai/batal` (D3), `<app-alert>` (D4), `<app-confirm>` (D5), `<app-stat-card>` trend (D6)

**RAK E — Forms (`app-forms.js` BARU):** `<app-filter-bar>` upgrade debounce+date-range (E1), `<app-debounced-search>` (E3 WAJIB), `<app-date-picker>` (E4), `<app-file-upload>` drag&drop (E5), `<app-rich-editor>` (E6) — plus `<app-pegawai-picker>` existing

**RAK F — Data (`app-data.js` BARU):** `<app-crud-table>` upgrade sticky+preset (F1), `<app-detail-drawer>` (F2), `<app-export-button>` (F3), `<app-csv-import>` (F4), `<app-master-tree>` (F5), `<app-image-viewer>`/`<app-file-preview>` (F6)

**RAK G — Charts (`app-charts.js` BARU):** `<app-chart-line>` (G2), `<app-configurable-dashboard>` (G3) — plus `bar/doughnut` existing

**RAK H — Workflow (`app-workflow.js` BARU):** `<app-approval-panel>`/`<app-stepper>` (H1), `<app-audit-timeline>` (H2), ⭐ `<app-theme-picker>` + **Tema Dinamis Opsi B** (H4 WAJIB — pilih warna di Pengaturan, simpan ke `safeLocal` + `THEME_CODE`, apply via `AppCore.applyTheme()`)

**Core (`app-core.js`):** `AppCore.themes` (6 preset: emerald/sky/amber/violet/rose/teal) + `applyTheme()` + `getTheme()` + `getMyScope()` untuk menu "Saya" vs "Semua"

**Badge:** status baru `draft/baru/diproses/selesai/batal` — cermin `V_Utama` starter-kit

> Total: **dari 12 → 31 opsi** (+19), dari 4 → **10 file fisik (1 CSS + 9 JS)**, baris 2.850 → ~4.250 (+49%), minified ~135 KB (app ringan cuma load 60–80 KB via mix)

---

## 📦 Berkas (10 File Fisik — 1 CSS + 9 JS — 1 Toko, 1 Versi)

| Berkas | Isi | Dimuat via | Wajib? |
|---|---|---|---|
| `app-common.css` → `app-common.min.css` | Design tokens, CSS variables (tema via `--primary`), kelas util (`btn-ghost/sm/xs`, `col-S/M/L/XL`, `alert`, `breadcrumb`, `drawer`, `theme-picker`) + preset 6 tema | `<link>` di `<head>` | **WAJIB** semua app |
| `app-core.js` → `.min.js` | `AppCore`: `create()`, sesi aman, `loadLib()` on-demand, cache SWR, `AppCore.themes` + `applyTheme()` + `getMyScope()` | `<script>` sebelum `</body>` | **WAJIB** |
| `app-layout.js` → `.min.js` **BARU** | `app-breadcrumb`, `app-page-header` | `<script>` | WAjIB (layout) |
| `app-ui.js` → `.min.js` **BARU** | `app-tabs`, `app-pagination`, `app-alert`, `app-confirm` | `<script>` | WAJIB (feedback) |
| `app-forms.js` → `.min.js` **BARU** | `app-debounced-search`, `app-date-picker`, `app-file-upload`, `app-rich-editor`, `app-filter-bar-enhanced` | `<script>` | Jika ada form/filter |
| `app-data.js` → `.min.js` **BARU** | `app-detail-drawer`, `app-export-button`, `app-csv-import`, `app-master-tree`, `app-image-viewer/file-preview` | `<script>` | Jika ada tabel/data |
| `app-charts.js` → `.min.js` **BARU** | `app-chart-line`, `app-configurable-dashboard` (+ bar/doughnut existing) | `<script>` | Jika ada chart |
| `app-workflow.js` → `.min.js` **BARU** | `app-approval-panel/stepper`, `app-audit-timeline`, `app-theme-picker` (+ profile/settings) | `<script>` | Jika ada approval/tema |
| `app-components.js` → `.min.js` | **Bundle kompatibilitas** — tetap memuat 12 komponen inti (login/sidebar/header/badge/stat-card/modal/crud-table/empty/skeleton/filter-bar/chart/pegawai-picker) + merge otomatis 6 file baru | `<script>` | **WAJIB** (backward compat) |
| `app-modules.js` → `.min.js` | `app-profile`, `app-settings` (tetap, juga merge ke workflow) | `<script>` | Jika ada profil/pengaturan |

> **Mix sesuai kebutuhan:** App sederhana (SI-CUTI) → `common + core + layout + ui + forms` (5 file). App lengkap (SI-DOKUMEN) → semua 8 file. Tetap **1 tag `@v2.9.0`**.

Cek versi runtime di Console browser:
```javascript
AppCore.version        // "2.9.0"
AppComponents.version  // "2.9.0"
AppLayout.version      // "2.9.0"
AppUi.version          // "2.9.0"
AppForms.version       // "2.9.0"
AppData.version        // "2.9.0"
AppCharts.version      // "2.9.0"
AppWorkflow.version    // "2.9.0"
```

> Sejak v2.9.0, semua 8 file melaporkan **"2.9.0"** konsisten.

---

## 🧩 Katalog Komponen & Props (31 Opsi)

### `<app-badge>` — label status (v2.9.0: +draft/baru/diproses/selesai/batal)
| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `status` | String | `'menunggu'` | Menentukan warna + label otomatis. Sinonim diterima: `disetujui/approved/aktif/active/tuntas/success/selesai` (hijau), `menunggu/pending` (kuning), `proses/diproses/baru` (kuning), `revisi/revision/draft` (biru), `ditolak/rejected/inactive/batal` (merah), `definitif`, `plt`, `kosong` (netral) |
| `label` | String | `''` | Timpa teks otomatis dari `status` |
| `size` | String | `'sm'` | `'sm'` atau `'md'` |
| `icon` | String | `''` | Class Font Awesome opsional, mis. `fa-solid fa-check` |

> ⚠️ **Catatan default**: `status` default = `'menunggu'` (kuning). Untuk badge identitas (mis. nama pegawai), kirim `status=""` eksplisit agar warna netral (slate).

```html
<app-badge status="disetujui" />
<app-badge status="diproses" size="md" icon="fa-solid fa-clock" />
<app-badge status="selesai" />
```

### `<app-stat-card>` — kartu metrik KPI
| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `title` | String | `'Metrik'` | Judul kecil di atas |
| `value` | Number/String | `0` | Number otomatis diformat `toLocaleString('id-ID')` |
| `icon` | String | `'fa-solid fa-chart-simple'` | Ikon Font Awesome |
| `color` | String | `'emerald'` | Gradasi: `emerald` / `sky` / `amber` / `purple` / `rose` |
| `subtext` | String | `''` | Keterangan kecil di bawah nilai |

### Komponen Layout (BARU v2.9.0 — `app-layout.js`)
| Komponen | Props | Fungsi |
|---|---|---|
| `<app-breadcrumb>` | `items=[{label,to}]` + emit `navigate` | Navigasi `Home > Master > Kategori` |
| `<app-page-header>` | `title, subtitle, icon` + slot `actions`, `breadcrumb` | Header halaman seragam (judul + deskripsi + tombol kanan) |

### Komponen UI (BARU v2.9.0 — `app-ui.js`)
| Komponen | Props | Fungsi |
|---|---|---|
| `<app-tabs>` **WAJIB** | `tabs=[{id,label,icon,count}]`, `v-model` + emit `change` | Tab besar dengan garis bawah `var(--primary)`, badge count |
| `<app-pagination>` **WAJIB** | `page, totalPages, totalData, showInfo` + emit `change-page` | Pagination standalone (Prev/Next + info) |
| `<app-alert>` | `type=info/success/warning/danger`, `title, icon, dismissible` | Kotak info kuning/merah/hijau/biru di atas form |
| `<app-confirm>` | `show, title, message, type, loading` + emit `close/confirm` | Dialog "Yakin hapus?" — pakai `<app-modal>` di dalam |

### Komponen Forms (BARU v2.9.0 — `app-forms.js`)
| Komponen | Props | Fungsi |
|---|---|---|
| `<app-debounced-search>` **WAJIB** | `v-model, placeholder, delay=300, label` + emit `search` | Input cari dengan debounce 300ms |
| `<app-date-picker>` | `v-model, label, error, hint, required` | Wrapper `input type=date` dengan label & validasi |
| `<app-file-upload>` | `v-model (Array), accept, multiple, maxSizeMb, label, hint` + emit `change` | Drag & drop + preview + progress, untuk `T_LAMPIRAN` |
| `<app-rich-editor>` | `v-model, label, placeholder, rows` | Textarea + toolbar bold/italic/list minimal |
| `<app-filter-bar-enhanced>` | `filters, v-model` + emit `change/reset` | Upgrade filter-bar dengan debounce + date-range + span |

### Komponen Data (BARU v2.9.0 — `app-data.js`)
| Komponen | Props | Fungsi |
|---|---|---|
| `<app-detail-drawer>` | `show, title, subtitle` + emit `close` + slot `footer` | Slide dari kanan, lihat detail tanpa pindah halaman |
| `<app-export-button>` | `data, columns, filename, title, type=excel/pdf` | Tombol ekspor 1 klik via `AppCore.loadLib` |
| `<app-csv-import>` | `label, hint` + emit `import` | Tombol impor CSV + preview 5 baris + validasi |
| `<app-master-tree>` | `items, labelKey, parentKey` + slot `actions` | Pohon hierarki `parent→anak` untuk `M_KATEGORI` |
| `<app-image-viewer>` / `<app-file-preview>` | `src/show` atau `file/url` | Preview foto/PDF tanpa download |

### Komponen Charts (BARU v2.9.0 — `app-charts.js`)
| Komponen | Props | Fungsi |
|---|---|---|
| `<app-chart-line>` **BARU** | `labels, datasets, title, height, legend, colors, bare` | Grafik garis tren 12 bulan (Chart.js on-demand) |
| `<app-configurable-dashboard>` | `cards, charts` + slot | Grid 4 kartu + 4 chart yang bisa diatur |

### Komponen Workflow (BARU v2.9.0 — `app-workflow.js`)
| Komponen | Props | Fungsi |
|---|---|---|
| `<app-approval-panel>` / `<app-stepper>` | `steps=[{label,subtitle}], currentStep` | Stepper Langkah 1-2-3 untuk `T_APPROVAL` |
| `<app-audit-timeline>` | `items=[{title,waktu,aktor,status,deskripsi}]` | Garis waktu riwayat approval |
| `<app-theme-picker>` ⭐ **Opsi B** | `v-model` + emit `change` | Pilih tema 6 preset + custom, simpan ke `safeLocal` + `AppCore.applyTheme()` |

### Komponen Lama (tetap)
| Komponen | Fungsi |
|---|---|
| `<app-filter-bar>` *(v2.7.0; v2.8.0: `span`)* | Bar filter deklaratif (tetap, enhanced di `app-forms.js`) |
| `<app-empty-state>` *(v2.7.0)* | Keadaan kosong seragam |
| `<app-skeleton>` *(v2.7.0)* | Loading pulse: `type=lines/cards/table`, `count` |
| `<app-chart-bar>` / `<app-chart-doughnut>` *(v2.7.0)* | Chart kit bertema (tetap, line baru di `app-charts.js`) |
| `<app-pegawai-picker>` *(v2.7.0)* | Picker searchable master SIMPEG (tetap) |
| `<app-login>` / `<app-sidebar>` / `<app-header>` / `<app-modal>` / `<app-crud-table>` | Shell inti (tetap) |
| `<app-profile>` / `<app-settings>` *(app-modules)* | Profil & pengaturan (tetap, juga di `app-workflow.js`) |

---

## 🎨 Kelas Tombol & Util Kit (referensi lengkap v2.9.0)

Semua bawaan `app-common.css`, sudah punya varian light & dark — **jangan** ditulis ulang di `<style>` aplikasi.

| Kelas | Deskripsi |
|---|---|
| `.btn` | Base — inline-flex, gap, padding, radius, transisi |
| `.btn-primary` | Tombol utama (warna `--primary` aplikasi) |
| `.btn-secondary` | Tombol netral (background putih/slate) |
| `.btn-danger` | Tombol hapus/merah |
| `.btn-success` | Tombol setujui/hijau |
| `.btn-warning` | Tombol kuning |
| `.btn-info` | Tombol biru |
| `.btn-ghost` **BARU v2.9.0** | Tombol hantu transparan untuk TAB & filter (dipakai 67x tapi belum ada) — `.active` = `var(--primary)` |
| `.btn-sm` / `.btn-xs` **BARU v2.9.0** | Tombol kecil untuk tabel padat |
| `.btn-icon` *(v2.8.0)* | Tombol aksi ikon 32×32 (mis. edit di tabel) |
| `.btn-icon-danger` *(v2.8.0)* | Varian hapus untuk `.btn-icon` |
| `.btn-lg` *(v2.8.0)* | CTA besar (padding lebih lega, font lebih tebal) |
| `.btn-aksi` | Tombol aksi kecil di baris tabel (padding lebih rapat) |
| `.col-S` / `.col-M` / `.col-L` / `.col-XL` **BARU v2.9.0** | Preset lebar kolom `90/150/220/260px` — larang `min-w-[137px]` ngarang |
| `.input--sm` / `.select--sm` **BARU** | Input compact untuk form padat |
| `.is-error` / `.is-success` **BARU** | State validasi baku (border merah/hijau + bg) |
| `.alert` **BARU** | Kotak info `.alert-info/success/warning/danger` |
| `.breadcrumb` / `.page-header` **BARU** | Navigasi & header halaman seragam |
| `.app-tabs` / `.app-pagination` / `.drawer-*` / `.theme-swatch` **BARU** | Style untuk komponen baru |

> 📌 Untuk tombol yang tidak ada di daftar ini, pakai kelas Tailwind langsung atau ajukan promosi ke kit.

---

## 🛡️ Direktif & Helper (v2.9.0)

- **`v-can`** — gating elemen by role sesi, fail-closed (cermin `levelOf_` CoreLib v2.3.0)
- **`AppCore.paginate(list, page, perPage)`** & **`AppCore.pageCount(list, perPage)`** — paginasi sisi klien
- **`AppCore.themes` + `AppCore.applyTheme(codeOrObj)` + `AppCore.getTheme()` — tema dinamis Opsi B (6 preset + custom, simpan ke `safeLocal`)**
- **`AppCore.getMyScope()`** — helper scope "Saya" vs "Semua" (`{pegawai_id, email, role}`)
- **`this.appCode`** — identitas app dari config `AppCore.create({ appCode })`
- **`this.applyTheme(code)`** / **`this.getMyScope()`** — method instance Vue

---

## ⚙️ AppCore (app-core.js) v2.9.0

- **`AppCore.create({...})`** — factory instance Vue 3 dengan sesi aman. **Jangan pernah** mengakses `localStorage`/`sessionStorage` mentah — selalu lewat helper `safeSession`/`safeLocal`.
- **`AppCore.libs` + `loadLib()`** — registry pustaka berat (chart.js 4.4.1, xlsx 0.18.5, jspdf 2.5.1, autotable 3.8.2, pdf-lib 1.17.1) dimuat on-demand, versi terkunci.
- **`AppCore.themes`** — 6 preset tema + `applyTheme()` — untuk `<app-theme-picker>` Opsi B
- **`callServer(action, data)`** — memanggil `handleAction` GAS; otomatis menambahkan `_cacheBust`.
- **Cache SWR** — data SIMPEG ditampilkan dari cache lalu disegarkan di latar belakang.

---

## 🏗️ Build & Rilis

```bash
npm install
npm run build     # memperbarui seluruh berkas .min.* dari sumbernya (8 file)
```

Alur rilis (urutan WAJIB — pelajaran insiden tag v2.6.3):
1. Ubah sumber (`app-*.js` / `app-common.css`) + naikkan `version` internal & `package.json` → `2.9.0`.
2. `npm run build` → commit `.min.*` hasil build (8 file).
3. **Unggah SEMUA berkas ke GitHub dulu.**
4. **Baru buat tag** `v2.9.0` (GitHub → Releases). Tag yang dibuat sebelum unggahan = tag basi via jsDelivr.
5. Terakhir, ubah `Index.html` aplikasi konsumen agar menunjuk tag baru.

> jsDelivr meng-cache `@main` hingga 12 jam → aplikasi wajib memakai tag versi.
> Detail snippet & troubleshooting: [CDN_SNIPPET.md](CDN_SNIPPET.md).

### Riwayat rilis singkat
| Tag | Versi berkas | Perubahan |
|---|---|---|
| `v2.9.1` | `"2.9.1"` | **10 FILE (1 CSS + 9 JS) & 31 OPSI** — 6 file baru (layout/ui/forms/data/charts/workflow) + tema dinamis Opsi B + badge draft/baru/diproses/selesai/batal |
| `v2.8.1` | `"2.8.0"` | Patch konsistensi internal (T49) — fix `AppCore.version`/`AppModules.version` |
| `v2.8.0` | `"2.8.0"` | F2: promosi `.btn-icon`/`.btn-icon-danger`/`.btn-lg` ke kit; F1: `<app-filter-bar>` dukung `span` |
| `v2.7.0` | `"2.7.0"` | B1–B7: picker, chart kit, filter-bar, empty-state, skeleton, v-can, paginate helper |
| `v2.6.5` | `"2.6.5"` | AppBadge `icon`, `app-stat-card` baru, badge variants |
| `v2.6.0` | `"2.6.0"` | Registry `AppCore.libs` + `loadLib()` on-demand |
