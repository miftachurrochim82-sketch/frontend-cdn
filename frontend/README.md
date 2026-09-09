# Frontend CDN Shared Library (v2.4.0) — Pemkab Trenggalek

Pustaka komponen antarmuka bersama (*shared UI components, smart data tables, high-performance master SIMPEG auto-cache with SWR, on-demand library loaders, universal exporters, design tokens, dan application lifecycle bootstrap*) untuk ekosistem aplikasi Pemerintah Kabupaten Trenggalek berbasis Vue 3 dan Google Apps Script.

---

## 📦 Berkas Distribusi CDN (jsDelivr)

### CSS (Design Tokens & Utility Classes)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-common.min.css">
```

### JavaScript Components & High-Performance Core
```html
<!-- Resource pre-connect hints untuk performa maksimal -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">

<!-- Komponen UI Bersama: AppLogin, AppSidebar, AppHeader, AppBadge, AppStatCard, AppModal, AppCrudTable -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-components.min.js"></script>

<!-- Modul Standar: Profil Saya & Pengaturan Sistem -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-modules.min.js"></script>

<!-- Framework Bootstrap Aplikasi Terpadu (High-Performance Core with SWR Cache) -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-core.min.js"></script>
```

---

## ⚡ Fitur Performa Unggulan di v2.4.0

1. **On-Demand Script Lazy Loading**:
   - Pustaka berat (*SheetJS/XLSX ~800KB*, *jsPDF/AutoTable ~400KB*, dan *Chart.js ~250KB*) **tidak perlu dimuat di `<head>`**.
   - Dimuat secara dinamis saat tombol ekspor atau grafik dirender pertama kali, memangkas ukuran awal halaman web lebih dari **1.4 MB**!
2. **Stale-While-Revalidate (SWR) LocalStorage SIMPEG Cache**:
   - Master data SIMPEG disajikan **0 ms (instant render)** langsung dari cache lokal peramban.
   - Sinkronisasi pembaruan data ke server berjalan di latar belakang (*background sync*) tanpa membekukan antarmuka pengguna.
3. **In-Flight Request Deduplication**:
   - Mencegah *duplicate API round-trips* ke backend Google Apps Script ketika beberapa komponen meminta data identik secara bersamaan.
4. **Universal Exporters Bawaan**:
   - `this.exportExcel(data, fileName, sheetName)`: Ekspor Excel otomatis on-demand.
   - `this.exportPDF(columns, data, fileName, title)`: Ekspor PDF otomatis on-demand.
5. **Universal SIMPEG Lookups**:
   - `this.namaPegawai(id)`, `this.namaUnit(id)`, `this.namaJabatan(id)`: Akses instan ke identitas referensi.

---

## 🚀 Penggunaan Dasar

```javascript
const app = AppCore.create({
  appTitle: 'SI-PELAPORAN',
  storagePrefix: 'sipelaporan',
  initialPage: 'dashboard',
  platformUrl: 'https://script.google.com/macros/s/.../exec',
  menu: [
    { name: 'Utama', items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' },
      { id: 'pelaporan', label: 'Pelaporan', icon: 'fa-solid fa-file-lines' }
    ]}
  ],
  mixins: [MyCustomAppMixin]
});

app.mount('#app');
```

---

## 🏛️ Lisensi
Hak Cipta © 2026 Pemerintah Kabupaten Trenggalek.
