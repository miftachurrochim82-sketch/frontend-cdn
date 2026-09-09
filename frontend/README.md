# Frontend CDN Shared Library (v2.2.5) — Pemkab Trenggalek

Pustaka komponen antarmuka bersama (shared UI components, design tokens, dan application lifecycle bootstrap) untuk ekosistem aplikasi Pemerintah Kabupaten Trenggalek berbasis Vue 3 dan Google Apps Script.

---

## 📦 Berkas Distribusi CDN (jsDelivr)

### CSS (Design Tokens & Utility Classes)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.5/frontend/app-common.min.css">
```

### JavaScript Components & Application Core
```html
<!-- Komponen UI Bersama: AppLogin, AppSidebar, AppHeader -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.5/frontend/app-components.min.js"></script>

<!-- Modul Standar: Profil Saya & Pengaturan Sistem -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.5/frontend/app-modules.min.js"></script>

<!-- Framework Bootstrap Aplikasi Terpadu -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.5/frontend/app-core.min.js"></script>
```

---

## 🚀 Penggunaan Dasar

```javascript
const app = AppCore.create({
  appTitle: 'NAMA APLIKASI',
  storagePrefix: 'app_slug',
  initialPage: 'dashboard',
  platformUrl: 'https://script.google.com/macros/s/.../exec',
  menu: [
    { name: 'Utama', items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' }
    ]}
  ],
  mixins: [MyCustomAppMixin]
});

app.mount('#app');
```

---

## 🏛️ Lisensi
Hak Cipta © 2026 Pemerintah Kabupaten Trenggalek.
