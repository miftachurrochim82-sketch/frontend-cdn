# Frontend CDN — Shared Assets untuk Web App GAS

Repository ini berisi aset frontend bersama yang digunakan oleh beberapa aplikasi web berbasis Google Apps Script (GAS) di lingkungan Pemerintah Kabupaten Trenggalek.

Tujuan utama: mengurangi duplikasi kode HTML/CSS/JS, mempermudah pemeliharaan, dan mempercepat pengembangan aplikasi baru.

## 📦 Isi Repository

| File | Fungsi |
|---|---|
| `app-common.css` | Kumpulan gaya global, tema, komponen UI, dan dark mode. |
| `app-components.js` | Komponen Vue siap pakai: Login, Sidebar, Header, Layout. |
| `app-modules.js` | Modul halaman mandiri (self-contained): `<app-profile>` & `<app-settings>`. |
| `app-core.js` | Factory function untuk inisialisasi Vue app dengan AppConfig. |

Ketergantungan eksternal (tetap dimuat dari CDN publik di `<head>` aplikasi): Tailwind Play CDN, Vue 3 global build, Font Awesome 6, Inter font. Library fitur (Chart.js, SheetJS, jsPDF) dimuat sesuai kebutuhan aplikasi.

## 🚀 Cara Penggunaan

### 1. Akses melalui jsDelivr

Gunakan URL berikut di dalam `Index.html` aplikasi GAS (untuk produksi disarankan pin tag, mis. `@v1.0.0`, menggantikan `@main`):

```html
<!-- CSS bersama (di <head>, setelah Tailwind) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-common.css">

<!-- Komponen & core (di akhir <body>, SETELAH vue.global.prod.js) -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-components.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-modules.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-core.js"></script>
```

Pemakaian modul mandiri di body (menggantikan file A7/A9 lokal):

```html
<app-profile v-if="currentPage === 'profil'"></app-profile>
<app-settings v-if="currentPage === 'pengaturan' && isAdmin"></app-settings>
```

> Catatan: jsDelivr membaca langsung dari GitHub. Setelah push + tag baru,
> URL `@TAG` langsung aktif (cache ±12 jam; paksa refresh dengan menaikkan
> versi tag, jangan menimpa tag lama).

### 2. Contoh `Index.html` aplikasi GAS

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
  <!-- CDN BERSAMA -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-common.css">
</head>
<body>
  <div id="app" v-cloak>
    <app-login v-if="!token" :is-processing="isProcessing" :error-message="errorMessage"
               :app-title="appTitle" :instansi="'Pemerintah Kabupaten Trenggalek'"
               :logo-svg="brand.logoSvg" @login="goToPlatform"></app-login>

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
          <?!= include('A4_Dashboard'); ?>
          <!-- halaman lain khas aplikasi (tetap file lokal GAS) -->
        </main>
      </div>
    </div>

    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-item" :class="'toast-'+t.type">
        <span class="flex-1">{{ t.message }}</span>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-components.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-core.js"></script>
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
        ]}
      ],
      pageIcons: { dashboard: 'fa-solid fa-gauge-high', pelaporan: 'fa-solid fa-file-lines' },
      onNavigate: (vm, page) => { /* loader per halaman */ },
      initApp: async (vm) => { /* muat dashboard, referensi, dst. */ },
      mixins: [ /* data & method khas aplikasi */ ]
    });
    app.mount('#app');
  </script>
</body>
</html>
```

### 3. Kontrak backend yang harus dipenuhi tiap aplikasi

| Aksi | Kegunaan |
|---|---|
| `exchange_platform_ticket` | `{ticket}` → `{token, user}` (SSO) |
| `get_my_profile` | validasi sesi tersimpan saat reload |
| `logout` | hapus sesi server |
| Respons `{code:'UNAUTHORIZED'}` | memicu reset sesi otomatis di frontend |

Bridge: `google.script.run.handleAction({action, data, token})`.

## 🧩 Komponen yang tersedia

| Tag | Deskripsi |
|---|---|
| `<app-login>` | Layar SSO (tombol "Masuk via SI-Platform", state loading & error). |
| `<app-sidebar>` | Navigasi samping: collapse desktop, drawer mobile, grup menu, badge user, logout. |
| `<app-header>` | Top bar: hamburger, breadcrumb halaman, toggle dark mode, status online, identitas user. |
| `<app-profile>` | Modul mandiri: kartu profil SIMPEG + edit kontak (muat data sendiri saat tampil). |
| `<app-settings>` | Modul mandiri (admin): tabel konfigurasi + modal tambah/edit + hapus. Gate akses via `isAdmin` di template aplikasi. |

## 📝 Kebijakan versi

- Gunakan tag semver (`v1.0.0`, `v1.1.0`, …) — **jangan** menimpa tag lama.
- Perubahan merusak (nama props/events berubah) → naikkan MAJOR.
- Aplikasi GAS menunjuk tag spesifik, jadi update repo tidak merusak aplikasi yang sudah live sampai tagnya dinaikkan.
