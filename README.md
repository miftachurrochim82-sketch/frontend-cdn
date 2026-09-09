# Frontend CDN & Backend Global Library v2.0
### Ekosistem Shared Assets & Engine Web App Google Apps Script (GAS) — Pemkab Trenggalek

Repository ini adalah standar terpadu frontend (*Vue 3 + Tailwind CSS*) dan backend (*Google Apps Script*) yang digunakan bersama oleh seluruh aplikasi web di lingkungan Pemerintah Kabupaten Trenggalek.

---

## 📦 Struktur Proyek

```text
frontend-cdn/
├── app-common.css / app-common.min.css     # CSS Global, Theme Token & Dark Mode
├── app-components.js / app-components.min.js # Shell UI (<app-login>, <app-sidebar>, <app-header>)
├── app-core.js / app-core.min.js           # Core App Engine (SSO, Bridge, Helpers, State)
├── app-modules.js / app-modules.min.js     # Modul Mandiri (<app-profile> SIMPEG & <app-settings>)
├── package.json                            # Build script minifikasi otomatis
│
└── backend/                                # Engine Backend Google Apps Script (GAS) v2.0
    ├── 00_MIGRATION_v2.md                  # Dokumentasi teknis changelog v2.0
    ├── 01_CoreFoundation.gs                # Engine Database Spreadsheet, Cache, Date & SIMPEG Helpers
    ├── 02_AuthBridge.gs                    # SSO Platform Ticket Exchanger, Token HMAC & Role Guard
    ├── 03_ProfileService.gs                # Handler Profil SIMPEG (get_my_profile, save_my_profile)
    ├── 04_ConfigService.gs                 # Handler Pengaturan Sistem Admin (get_config, save, delete)
    └── Code.gs                             # Entrypoint doGet() & Dispatcher handleAction()
```

---

## 🚀 Penggunaan Frontend (jsDelivr CDN)

### 1. Tag CDN di `Index.html`

Untuk performa maksimal dan efisiensi bandwidth, gunakan versi minifikasi (`.min.js` & `.min.css`):

```html
<!-- Di dalam <head>, setelah Tailwind CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-common.min.css">

<!-- Di akhir <body>, SETELAH vue.global.prod.js -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-modules.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-core.min.js"></script>
```

*(Catatan: Untuk lingkungan produksi yang stabil, disarankan mengganti `@main` dengan tag versi tetap, misalnya `@v2.0.0`).*

---

### 2. Contoh Lengkap `Index.html` Aplikasi GAS

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
  
  <!-- Shared CSS CDN -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-common.min.css">
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

    <!-- Toast Notification -->
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-item" :class="'toast-'+t.type">
        <span class="flex-1">{{ t.message }}</span>
      </div>
    </div>
  </div>

  <!-- Shared JS CDN -->
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-components.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-modules.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-core.min.js"></script>
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
        // Logika inisialisasi pasca-login (muat data, tabel, dsb.)
      }
    });
    app.mount('#app');
  </script>
</body>
</html>
```

---

## ⚙️ Penggunaan Backend (Google Apps Script)

1. Salin seluruh file di folder `backend/` ke dalam proyek Google Apps Script Anda (atau deploy via `clasp push`).
2. Atur **Script Properties** di Apps Script:
   - `SPREADSHEET_ID`: ID Spreadsheet database lokal aplikasi.
   - `MASTER_SPREADSHEET_ID`: ID Spreadsheet database master SIMPEG Pemkab.
   - `PLATFORM_VALIDATE_URL`: URL validasi tiket SSO SI-Platform.
3. Tambahkan *custom action handlers* Anda di dalam switch `handleAction` di file `backend/Code.gs`.

---

## 🛠️ Kompilasi & Minifikasi

Untuk melakukan minifikasi ulang setelah memodifikasi file JavaScript/CSS:

```bash
npm run build
```

---

## 📝 Lisensi & Hak Cipta

Dikelola untuk standarisasi web app oleh Pemerintah Kabupaten Trenggalek.
Lisensi: MIT.
