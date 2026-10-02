# Katalog Komponen

Referensi lengkap 31 komponen & props untuk Frontend CDN Pemkab Trenggalek.
Untuk cara memuat CDN dan daftar modul, lihat [`../README.md`](../README.md).
Untuk riwayat versi, lihat [`../CHANGELOG.md`](../CHANGELOG.md).

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

---

## Registry pustaka (`AppCore.libs`)

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
