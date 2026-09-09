# Frontend CDN Shared Library (v2.3.0) — Pemkab Trenggalek

Pustaka komponen antarmuka bersama (*shared UI components, smart data tables, master SIMPEG auto-cache, universal exporters, design tokens, dan application lifecycle bootstrap*) untuk ekosistem aplikasi Pemerintah Kabupaten Trenggalek berbasis Vue 3 dan Google Apps Script.

---

## 📦 Berkas Distribusi CDN (jsDelivr)

### CSS (Design Tokens & Utility Classes)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.3.0/frontend/app-common.min.css">
```

### JavaScript Components & Application Core
```html
<!-- Komponen UI Bersama: AppLogin, AppSidebar, AppHeader, AppBadge, AppStatCard, AppModal, AppCrudTable -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.3.0/frontend/app-components.min.js"></script>

<!-- Modul Standar: Profil Saya & Pengaturan Sistem -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.3.0/frontend/app-modules.min.js"></script>

<!-- Framework Bootstrap Aplikasi Terpadu (dengan SIMPEG Cache & Lookup Helpers) -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.3.0/frontend/app-core.min.js"></script>
```

---

## ✨ Fitur Baru di v2.3.0

1. **Smart In-Memory & LocalStorage SIMPEG Cache**:
   - `this.lookupPegawai(id)` & `this.namaPegawai(id)`: Lookup nama & profil pegawai instan.
   - `this.lookupUnit(id)` & `this.namaUnit(id)`: Lookup nama OPD / Unit Kerja.
   - `this.lookupJabatan(id)` & `this.namaJabatan(id)`: Lookup nama formasi jabatan.
   - `this.loadMasterSIMPEG(forceReload)`: Prefetch otomatis seluruh data master kepegawaian.
2. **Universal Exporters (Built-in)**:
   - `this.exportExcel(data, fileName, sheetName)`: Ekspor Excel otomatis tanpa boilerplate.
   - `this.exportPDF(columns, data, fileName, title)`: Ekspor PDF otomatis dengan tabel bergaris.
3. **Smart Reusable Components**:
   - `<app-crud-table>`: Tabel data deklaratif lengkap dengan search, filter status, pagination, dan tombol ekspor.
   - `<app-modal>`: Dialog modal dengan animasi lembut dan responsive max-width.
   - `<app-stat-card>`: Kartu metrik KPI dashboard.
   - `<app-badge>`: Badge status terstandarisasi.

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
