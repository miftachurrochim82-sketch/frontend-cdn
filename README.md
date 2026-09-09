# Frontend CDN & Backend Global Library v2.0
### Ekosistem Shared Assets & Engine Web App Google Apps Script (GAS) — Pemkab Trenggalek

Repository ini adalah standar terpadu frontend (*Vue 3 + Tailwind CSS*) dan backend (*Google Apps Script*) yang digunakan bersama oleh seluruh aplikasi web di lingkungan Pemerintah Kabupaten Trenggalek.

---

## 📦 Struktur Folder Repository

```text
frontend-cdn/
├── .github/
│   └── workflows/
│       └── deploy-gas.yml          # Skrip CI/CD otomatis kirim backend ke Google Apps Script via Clasp
│
├── .clasp.json                     # Identitas konfigurasi Clasp root
├── package.json                    # Script build minifikasi otomatis frontend (npm run build)
│
├── 🎨 frontend/                     # KODE FRONTEND (SHARED CDN ASSETS)
│   ├── app-common.css              # Desain tema global, token CSS, dan dark mode
│   ├── app-common.min.css          # Versi minifikasi CSS (~6.7 KB)
│   ├── app-components.js           # Komponen Vue Shell (<app-login>, <app-sidebar>, <app-header>)
│   ├── app-components.min.js       # Versi minifikasi Shell UI
│   ├── app-modules.js              # Modul mandiri (<app-profile> SIMPEG & <app-settings>)
│   ├── app-modules.min.js          # Versi minifikasi modul mandiri
│   ├── app-core.js                 # Factory AppCore Vue 3 (Auth SSO, Bridge, Helper)
│   └── app-core.min.js             # Versi minifikasi Core Engine (~6.4 KB)
│
└── 📋 backend/                      # KODE BACKEND GOOGLE APPS SCRIPT
    ├── .clasp.json                 # File identitas proyek Apps Script lokal
    ├── appsscript.json             # Manifest konfigurasi runtime & izin Apps Script
    ├── 00_MIGRATION_v2.md          # Panduan migrasi & changelog teknis v2.0
    ├── 01_CoreFoundation.gs        # Engine Database Sheets, Aligned Column, Cache & SIMPEG Helpers
    ├── 02_CoreGateway.gs           # Gateway Auth SSO, Session Cache, Role Guard & API CRUD
    ├── 03_CoreServices.gs          # Profil SIMPEG, Konfigurasi, Drive Folder Provisioning & Setup
    ├── 99_CoreTest.gs              # Automated Diagnostic & Regression Test Suite
    └── Code.gs                     # Template Entrypoint doGet() & Dispatcher handleAction()
```

---

## 🚀 Cara Penggunaan Frontend (jsDelivr CDN)

### 1. Tag CDN di `Index.html`

Tambahkan tag berikut ke dalam `Index.html` aplikasi GAS Anda:

```html
<!-- Di dalam <head>, setelah Tailwind Play CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/frontend/app-common.min.css">

<!-- Di akhir <body>, SETELAH vue.global.prod.js -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/frontend/app-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/frontend/app-modules.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/frontend/app-core.min.js"></script>
```

*(Catatan: Untuk produksi disarankan menggunakan tag versi tetap seperti `@v2.1.0` alih-alih `@main`).*

---

### 2. Contoh Lengkap `Index.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SI-PELAPORAN</title>
  <script>try{ if(localStorage.getItem('sipelaporan_dark')==='true') document.documentElement.classList.add('dark'); }catch(e){}</script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={darkMode:'class'};</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  
  <!-- CSS BERSAMA DARI CDN -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/frontend/app-common.min.css">
</head>
<body>
  <div id="app" v-cloak>
    <!-- Layar Login SSO -->
    <app-login v-if="!token" :is-processing="isProcessing" :error-message="errorMessage"
               :app-title="appTitle" :instansi="'Pemerintah Kabupaten Trenggalek'"
               :logo-svg="brand.logoSvg" @login="goToPlatform"></app-login>

    <!-- Shell Aplikasi -->
    <div v-if="token" class="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900">
      <app-sidebar :collapsed="sidebarCollapsed" :mobile-open="sidebarMobileOpen"
                   :dark="isDarkMode" :current-page="currentPage" :is-admin="isAdmin"
                   :user="currentUser" :brand="brand" :menu="menu"
                   @navigate="navigateTo" @toggle="toggleSidebar"
                   @close="sidebarMobileOpen=false" @logout="logout"></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div class="px-4 sm:px-6 pt-4 shrink-0">
          <app-header :dark="isDarkMode" :app-title="appTitle" :current-page="currentPage"
                      :page-icons="pageIcons" :user="currentUser"
                      @toggle-dark="toggleDarkMode" @toggle-mobile="sidebarMobileOpen=!sidebarMobileOpen"
                      @navigate="navigateTo"></app-header>
        </div>
        <main class="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <!-- Modul Mandiri (Self-Contained) -->
          <app-profile v-if="currentPage === 'profil'"></app-profile>
          <app-settings v-if="currentPage === 'pengaturan' && isAdmin"></app-settings>

          <!-- Halaman Spesifik Aplikasi -->
          <div v-if="currentPage === 'dashboard'" class="card p-6">
            <h2 class="text-xl font-bold">Dashboard {{ appTitle }}</h2>
            <p class="text-sm text-slate-500 mt-2">Konten spesifik aplikasi dimuat di sini.</p>
          </div>
        </main>
      </div>
    </div>

    <!-- Toast Notification Global -->
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-item" :class="'toast-'+t.type">
        <span class="flex-1">{{ t.message }}</span>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT BERSAMA DARI CDN -->
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/frontend/app-components.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/frontend/app-modules.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/frontend/app-core.min.js"></script>
  <script>
    const app = AppCore.create({
      appTitle: 'SI-PELAPORAN',
      storagePrefix: 'sipelaporan',
      platformUrl: 'https://script.google.com/macros/s/XXXX/exec',
      brand: { title: 'SI-PELAPORAN', subtitle: 'Pemkab Trenggalek', logoChar: 'P', logoIcon: 'fa-solid fa-file-lines' },
      menu: [
        { name: 'Utama', items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' },
          { id: 'pelaporan', label: 'Pelaporan', icon: 'fa-solid fa-file-lines' }
        ]},
        { name: 'Sistem', items: [
          { id: 'pengaturan', label: 'Pengaturan', icon: 'fa-solid fa-gear', adminOnly: true }
        ]}
      ],
      pageIcons: { dashboard: 'fa-solid fa-gauge-high', pelaporan: 'fa-solid fa-file-lines', profil: 'fa-solid fa-id-card', pengaturan: 'fa-solid fa-gear' },
      initApp: async (vm) => {
        // Panggil data awal jika diperlukan
      }
    });
    app.mount('#app');
  </script>
</body>
</html>
```

---

## ⚙️ Deployment Otomatis Backend (CI/CD Clasp)

Repository ini telah dilengkapi dengan GitHub Actions workflow `.github/workflows/deploy-gas.yml`. Setiap kali Anda melakukan *push* ke branch `main`, kode backend akan otomatis ter-deploy ke Google Apps Script target.

### Konfigurasi GitHub Secrets:
1. Buka repository di GitHub ➡️ **Settings** ➡️ **Secrets and variables** ➡️ **Actions**.
2. Tambahkan Secrets berikut:
   * **`CLASPRC_JSON`**: Isi konten file `~/.clasprc.json` Anda (hasil login clasp lokal `clasp login`).
   * **`CLASP_SCRIPT_ID`**: ID Script Google Apps Script tujuan deploy Anda.

---

## 🛠️ Minifikasi Frontend

Untuk melakukan *build* ulang file minifikasi di folder `frontend/`:

```bash
npm run build
```

---

## 📝 Lisensi

Dikelola untuk standarisasi web app oleh Pemerintah Kabupaten Trenggalek.
Lisensi: MIT.
