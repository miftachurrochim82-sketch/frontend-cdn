# Frontend CDN — Pustaka UI Bersama v2.9.0

### Vue 3 + Tailwind CSS • Pemkab Trenggalek

Seluruh aplikasi ekosistem memuat UI dari folder ini melalui jsDelivr. Satu nomor versi berlaku untuk semua berkas, sehingga aplikasi yang memakai CDN tidak perlu memikirkan file per file.

> Snippet siap salin untuk aplikasi baru: [CDN_SNIPPET.md](CDN_SNIPPET.md)

---

## Rilis v2.9.0

Versi ini membawa rilis utama untuk desain UI dan komponen yang lebih seragam, termasuk layout, form, data table, chart, workflow, dan tema dinamis.

### Yang baru di v2.9.0

- `app-layout.js`: `app-breadcrumb`, `app-page-header`
- `app-ui.js`: `app-tabs`, `app-pagination`, `app-alert`, `app-confirm`
- `app-forms.js`: `app-debounced-search`, `app-date-picker`, `app-file-upload`, `app-rich-editor`, `app-filter-bar`
- `app-data.js`: `app-detail-drawer`, `app-export-button`, `app-csv-import`, `app-master-tree`, `app-image-viewer`
- `app-charts.js`: `app-chart-line`, `app-configurable-dashboard`
- `app-workflow.js`: `app-approval-panel`, `app-audit-timeline`, `app-theme-picker`
- `app-common.css`: tombol ghost, tombol kecil, preset lebar kolom, design token, dan style umum
- `AppCore`: tema dinamis, helper scope, cache, dan pembaruan utilitas frontend

Total perubahan:
- 31 opsi komponen dan utilitas
- 1 CSS + 9 JavaScript
- satu tag versi untuk semua berkas

---

## Struktur berkas

```text
frontend/
├── app-common.css
├── app-common.min.css
├── app-core.js
├── app-core.min.js
├── app-components.js
├── app-components.min.js
├── app-modules.js
├── app-modules.min.js
├── app-layout.js
├── app-layout.min.js
├── app-ui.js
├── app-ui.min.js
├── app-forms.js
├── app-forms.min.js
├── app-data.js
├── app-data.min.js
├── app-charts.js
├── app-charts.min.js
├── app-workflow.js
├── app-workflow.min.js
├── README.md
├── CDN_SNIPPET.md
└── ...
```

Catatan:
- `app-common.css` adalah stylesheet utama
- semua berkas `.min.*` adalah hasil build yang dipakai di production
- satu tag versi `v2.9.0` berlaku untuk seluruh aset

---

## Aset utama

### CSS
- `app-common.css` / `app-common.min.css`

### JavaScript
- `app-core.js`
- `app-components.js`
- `app-modules.js`
- `app-layout.js`
- `app-ui.js`
- `app-forms.js`
- `app-data.js`
- `app-charts.js`
- `app-workflow.js`

Jadi secara umum, repo ini terdiri dari:
- 1 CSS utama
- 9 JavaScript utama
- 31 opsi komponen/utilitas

---

## Cara pakai

Contoh include CDN untuk aplikasi baru:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-common.min.css">

<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-layout.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-ui.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-forms.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-data.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-charts.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-workflow.min.js"></script>
```

Gunakan tag versi, bukan `@main`.

---

## Komponen utama

### `app-core`
- `AppCore.create()`
- `AppCore.themes`
- `AppCore.applyTheme()`
- `AppCore.getMyScope()`
- `AppCore.loadLib()`
- cache dan helper aman untuk storage
- integrasi dengan library berat secara on-demand

### `app-layout`
- `app-breadcrumb`
- `app-page-header`

### `app-ui`
- `app-tabs`
- `app-pagination`
- `app-alert`
- `app-confirm`

### `app-forms`
- `app-debounced-search`
- `app-date-picker`
- `app-file-upload`
- `app-rich-editor`
- `app-filter-bar`

### `app-data`
- `app-detail-drawer`
- `app-export-button`
- `app-csv-import`
- `app-master-tree`
- `app-image-viewer`

### `app-charts`
- `app-chart-line`
- `app-configurable-dashboard`

### `app-workflow`
- `app-approval-panel`
- `app-stepper`
- `app-audit-timeline`
- `app-theme-picker`

---

## Kelas util CSS utama

Beberapa kelas yang sering dipakai:

- `.btn`
- `.btn-primary`
- `.btn-secondary`
- `.btn-danger`
- `.btn-success`
- `.btn-warning`
- `.btn-info`
- `.btn-ghost`
- `.btn-sm`
- `.btn-xs`
- `.page-header`
- `.breadcrumb`
- `.alert`
- `.col-S`
- `.col-M`
- `.col-L`
- `.col-XL`

---

## Build lokal

```bash
npm ci
npm run build
```

Perintah di atas akan memperbarui semua berkas hasil build di folder `frontend/`.

---

## Release history

| Tag | Keterangan |
|---|---|
| `v2.9.0` | Rilis utama: layout, UI, form, data, chart, workflow, dan tema dinamis |
| `v2.8.1` | Fix konsistensi versi internal |
| `v2.8.0` | Fitur style dan filter bar |
| `v2.7.0` | Komponen baru awal |
| `v2.6.5` | Registry dan badge |
| `v2.6.0` | Registry library on-demand |

---

## Catatan penting

- Gunakan tag versi untuk production.
- Jangan memakai `@main` untuk aplikasi yang sudah berjalan.
- Semua file CDN harus memakai versi yang sama pada satu proyek.
- Jika ada perubahan besar di frontend, buat release versi baru.

---

## Dokumentasi lain

- [CDN_SNIPPET.md](CDN_SNIPPET.md)
- [README.md](../README.md)
```
