# 📋 Snippet Standar Pemuatan CDN — v2.9.2 (10 File & 31 Opsi)

> **Salin blok di bawah ini ke `Index.html` setiap web app baru.**
> v2.9.2 = 10 file (1 CSS + 7 JS) — 1 tag `@v2.9.2` untuk semua file.

---

## 1. Blok standar `<head>` — WAJIB

```html
  <!-- ========== Pustaka pihak ketiga (WAJIB) ========== -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { darkMode: 'class' };</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/vue@3.5.42/dist/vue.global.prod.js"></script>

  <!-- ========== Shared CDN Pemkab Trenggalek v2.9.0 ==========
       ATURAN:
       1. Pakai TAG VERSI (mis. @v2.9.2), JANGAN @main.
          -> @main di-cache jsDelivr hingga 12 jam, update Anda tidak
             langsung terlihat dan tiap app bisa dapat versi berbeda.
       2. Pakai berkas .min (sudah di-build & di-commit di repo ini).
       3. JANGAN muat chart.js / xlsx / jspdf / pdf-lib di sini.
          Semua itu dimuat otomatis saat dibutuhkan lewat AppCore.loadLib().
  -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-common.min.css">
```

## 2. Blok standar sebelum `</body>` — 10 FILE (1 CSS + 9 JS — Mix Sesuai Kebutuhan)

### App Sederhana (SI-CUTI — hanya form, tanpa chart/approval)
```html
  <!-- Shared CDN: JS Inti (WAJIB) -->
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-core.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-components.min.js"></script>
  <!-- Modular (pilih yang dibutuhkan) -->
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-layout.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-ui.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-forms.min.js"></script>

  <!-- Local App JS -->
  <?!= include('J_State'); ?>
  <?!= include('J_Helpers'); ?>
  <?!= include('J_Api'); ?>
  <?!= include('J_Actions'); ?>
  <?!= include('J_App'); ?>
```

### App Lengkap (SI-DOKUMEN — full fitur, 31 opsi)
```html
  <!-- Shared CDN: JS Lengkap (8 file) -->
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-core.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-components.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-layout.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-ui.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-forms.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-data.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-charts.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-workflow.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.2/frontend/app-modules.min.js"></script>

  <!-- Local App JS -->
  <?!= include('J_State'); ?>
  <?!= include('J_Helpers'); ?>
  <?!= include('J_Api'); ?>
  <?!= include('J_Actions'); ?>
  <?!= include('J_App'); ?>
```

> **Catatan:** Urutan bebas — `AppCore.create()` membaca `window.AppComponents`, `AppLayout`, `AppUi`, `AppForms`, `AppData`, `AppCharts`, `AppWorkflow`, `AppModules` saat `create()` dipanggil. Semua file **1 tag `@v2.9.2`**.

---

## 2b. Komponen Baru v2.9.0 (31 Opsi)

| Fitur | File | Contoh |
|---|---|---|
| `<app-tabs>` **WAJIB** | `app-ui` | `<app-tabs :tabs="[{id:'semua',label:'Semua',count:12},{id:'saya',label:'Saya',count:3}]" v-model="tab" />` |
| `<app-pagination>` **WAJIB** | `app-ui` | `<app-pagination :page="page" :total-pages="8" :total-data="95" @change-page="load" />` |
| `<app-alert>` / `<app-confirm>` | `app-ui` | `<app-alert type="warning" title="Perhatian">Isi</app-alert>` |
| `<app-breadcrumb>` / `<app-page-header>` | `app-layout` | `<app-breadcrumb :items="[{label:'Home',to:'dashboard'},{label:'Kategori'}]" />` |
| `<app-debounced-search>` **WAJIB** | `app-forms` | `<app-debounced-search v-model="q" :delay="300" @search="load" />` |
| `<app-date-picker>` / `<app-file-upload>` / `<app-rich-editor>` | `app-forms` | `<app-file-upload v-model="files" :max-size-mb="10" />` |
| `<app-detail-drawer>` / `<app-export-button>` / `<app-master-tree>` / `<app-image-viewer>` | `app-data` | `<app-detail-drawer :show="show" title="Detail" @close="show=false"><slot/></app-detail-drawer>` |
| `<app-chart-line>` **BARU** | `app-charts` | `<app-chart-line :labels="bln" :datasets="ds" title="Tren" />` |
| `<app-approval-panel>` / `<app-audit-timeline>` | `app-workflow` | `<app-approval-panel :steps="steps" :current-step="1" />` |
| `<app-theme-picker>` ⭐ **Opsi B** | `app-workflow` | `<app-theme-picker v-model="theme" @change="applyTheme" />` |
| `AppCore.themes` + `applyTheme()` | `app-core` | `AppCore.applyTheme('sky')` atau `AppCore.applyTheme({primary:'#0284c7',...})` |
| `AppCore.getMyScope()` | `app-core` | `this.getMyScope()` → `{pegawai_id, email, role}` untuk filter "Saya" |
| Kelas `btn-ghost` / `btn-sm/xs` / `col-S/M/L/XL` | `app-common` | `<button class="btn btn-ghost">Tab</button>` / `<th class="col-M">Nama</th>` |

Katalog props lengkap: [`README.md`](README.md) folder ini.

---

## 3. Registry pustaka (`AppCore.libs`) — tetap v2.9.0

Semua URL pustaka berat kini **terpusat di satu tempat** dan dimuat on-demand.

| Nama | Pustaka | Versi terkunci | Muat otomatis oleh |
|---|---|---|---|
| `chart` | Chart.js | 4.4.1 | `ensureChartLibrary()` |
| `xlsx` | SheetJS | 0.18.5 | `exportExcel()` |
| `jspdf` | jsPDF | 2.5.1 | `exportPDF()` |
| `autotable` | jsPDF-AutoTable | 3.8.2 | `exportPDF()` (lewat grup `pdf`) |
| `pdflib` | pdf-lib | 1.17.1 | — (panggil manual) |
| `pdf` | *grup*: jspdf + autotable | — | `exportPDF()` |

### Cara pakai

```javascript
// Di dalam methods Vue (instance app buatan AppCore.create):
async renderGrafik() {
  if (!(await this.loadLib('chart'))) return;
  new Chart(ctx, { /* ... */ });
}
// Tema dinamis Opsi B:
this.applyTheme('sky'); // atau 'emerald'/'amber'/'violet'/'rose'/'teal'
```

---

## 4. Masalah yang diperbaiki di v2.9.0

- **5 keluhan berulang hilang:** `btn-ghost` (67x dipakai tapi belum ada), `<app-tabs>` (pengganti `grid+btn` kecil), `<app-pagination>` standalone, preset kolom `col-S/M/L/XL` (larang `min-w-[137px]` ngarang), `<app-filter-bar>` debounce
- **Tema dinamis Opsi B:** 5 app bisa beda warna tanpa edit `Index.html` — pilih di `Pengaturan > Tema` → simpan ke `safeLocal` → `AppCore.applyTheme()` inject `--primary` otomatis
- **Menu "Saya":** `AppCore.getMyScope()` + toggle `Semua/Saya` untuk laporan/analisa personal

---

## 5. Cek cepat setelah update

Buka aplikasi, jalankan di Console browser:

```javascript
AppCore.version        // harus "2.9.0"
AppComponents.version  // harus "2.9.0"
AppLayout.version      // harus "2.9.0"
AppUi.version          // harus "2.9.0"
AppForms.version       // harus "2.9.0"
AppData.version        // harus "2.9.0"
AppCharts.version      // harus "2.9.0"
AppWorkflow.version    // harus "2.9.0"
Object.keys(AppCore.themes) // ['emerald','sky','amber','violet','rose','teal']
```

Kalau `AppCore.version` masih versi lama, berarti jsDelivr belum menyegarkan cache — paksa dengan menaikkan query string (`?v=2.9.0`) atau tunggu.

---

## 6. Riwayat versi CDN

| Tag | Versi berkas | Perubahan kunci |
|---|---|---|
| `v2.9.1` | `"2.9.1"` | **10 FILE (1 CSS + 9 JS) & 31 OPSI** — 6 file baru (layout/ui/forms/data/charts/workflow) + `btn-ghost` + tabs/pagination + badge draft/baru/diproses/selesai/batal + tema dinamis Opsi B |
| `v2.8.1` | `"2.8.0"` | Patch konsistensi internal (T49) |
| `v2.8.0` | `"2.8.0"` | F2: `.btn-icon`/`.btn-icon-danger`/`.btn-lg`; F1: `<app-filter-bar>` dukung `span` |
| `v2.7.0` | `"2.7.0"` | B1–B7: picker, chart kit, filter-bar, empty-state, skeleton, v-can, paginate helper |
| `v2.6.5` | `"2.6.5"` | AppBadge `icon`, `app-stat-card` baru |
| `v2.6.0` | `"2.6.0"` | Registry `AppCore.libs` + `loadLib()` on-demand |
