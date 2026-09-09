# Frontend CDN & Backend Global Library v2.0
### Ekosistem Shared Assets & Engine Web App Google Apps Script (GAS) — Pemkab Trenggalek

Repository ini adalah standar terpadu frontend (*Vue 3 + Tailwind CSS*) dan backend (*Google Apps Script*) yang digunakan bersama oleh seluruh aplikasi web di lingkungan Pemerintah Kabupaten Trenggalek.

---

## 🏛️ Identitas Library Google Apps Script

| Properti | Nilai | Keterangan |
|---|---|---|
| **Script ID / Library ID** | `1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoKqpuucPJXgNZ9XBK06O7wgDkO` | ID Library Resmi Pemkab Trenggalek |
| **Identifier (Symbol)** | `CoreLib` | Simbol pemanggilan fungsi library di aplikasi |
| **Runtime** | `V8` | Standar modern Apps Script |
| **TimeZone** | `Asia/Jakarta` | WIB (Waktu Indonesia Barat) |

### OAuth Scopes yang Digunakan:
- `https://www.googleapis.com/auth/spreadsheets` (Akses Google Sheets DB)
- `https://www.googleapis.com/auth/drive` (Folder Evidence & Backup)
- `https://www.googleapis.com/auth/script.storage` (Script Properties & Sesi)
- `https://www.googleapis.com/auth/script.external_request` (SSO SI-Platform HTTP)
- `https://www.googleapis.com/auth/userinfo.email` & `openid` (Identitas Google)

---

## 📦 Struktur Folder Repository

```text
frontend-cdn/
│
├── 🤖 .github/
│   └── workflows/
│       └── deploy-gas.yml          # Skrip CI/CD otomatis deploy backend ke GAS via Google Clasp
│
├── 🎨 frontend/                     # KODE FRONTEND (SHARED CDN ASSETS)
│   ├── app-common.css              # Desain tema global, token CSS, dan dark mode
│   ├── app-common.min.css          # Versi minifikasi CSS (~6.7 KB)
│   ├── app-components.js           # Komponen Vue Shell (<app-login>, <app-sidebar>, <app-header>)
│   ├── app-components.min.js       # Versi minifikasi Shell UI
│   ├── app-modules.js              # Modul mandiri (<app-profile> SIMPEG & <app-settings>)
│   ├── app-modules.min.js          # Versi minifikasi modul mandiri
│   ├── app-core.js                 # Factory AppCore Vue 3 (Auth SSO, Bridge, Rupiah & Date Helpers)
│   └── app-core.min.js             # Versi minifikasi Core Engine (~6.4 KB)
│
├── 📋 backend/                      # KODE BACKEND GOOGLE APPS SCRIPT (v2.0)
│   ├── .clasp.json                 # File identitas proyek Apps Script lokal (Script ID)
│   ├── appsscript.json             # Manifest konfigurasi runtime V8, timezone, & OAuth scopes
│   ├── 00_MIGRATION_v2.md          # Panduan migrasi & changelog teknis
│   ├── 01_CoreFoundation.gs        # Engine Database Sheets, Aligned Column, Cache & SIMPEG Helpers
│   ├── 02_CoreGateway.gs           # Gateway Auth SSO, Session Cache, Role Guard & API CRUD
│   ├── 03_CoreServices.gs          # Profil SIMPEG, Konfigurasi, Drive Folder Provisioning & Setup
│   ├── 99_CoreTest.gs              # Automated Diagnostic & Regression Test Suite
│   └── Code.gs                     # Template Entrypoint doGet() & Dispatcher handleAction()
│
├── .clasp.json                     # Konfigurasi Clasp root (target folder backend)
├── .gitignore                      # Mengabaikan cache & node_modules
├── package.json                    # Script minifikasi (npm run build)
└── README.md                       # Dokumentasi lengkap & cara pemakaian
```

---

## 🚀 1. Penggunaan Frontend (jsDelivr CDN)

Salin tag CDN berikut ke dalam file `Index.html` aplikasi GAS Anda:

```html
<!-- CSS Global Minified (di <head>) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.0/frontend/app-common.min.css">

<!-- JS Components, Modules, & Core Minified (di akhir <body>) -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.0/frontend/app-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.0/frontend/app-modules.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.0/frontend/app-core.min.js"></script>
```

---

## ⚙️ 2. Penggunaan Backend di Aplikasi Dinas (Consumer Web App)

Ada **2 cara** menghubungkan backend ke aplikasi web GAS Anda:

### Cara A: Menggunakan Library GAS (Sangat Praktis & Tanpa Copy-Paste)
1. Buka editor Google Apps Script aplikasi dinas Anda.
2. Di sidebar kiri, klik **Libraries (+)** ➡️ Masukkan Script ID:
   ```text
   1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoKqpuucPJXgNZ9XBK06O7wgDkO
   ```
3. Pilih versi rilis terbaru ➡️ Beri Identifier: **`CoreLib`** ➡️ Klik **Save**.
4. Di file `Code.gs` aplikasi Anda, cukup tulis kode ringkas berikut:

```javascript
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('SI-PELAPORAN Kab. Trenggalek')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function handleAction(payload) {
  var props = PropertiesService.getScriptProperties();
  return CoreLib.dispatchAction(payload, {
    appCode: props.getProperty('APP_CODE') || 'SI-PELAPORAN',
    spreadsheetId: props.getProperty('SPREADSHEET_ID'),
    masterSsId: props.getProperty('MASTER_SPREADSHEET_ID'),
    platformApiUrl: props.getProperty('PLATFORM_API_URL'),
    headersMap: {
      // Sheet khusus aplikasi Anda:
      // PELAPORAN: ['id', 'nomor', 'judul', 'status', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at']
    }
  });
}
```

### Cara B: Copy-Paste / Clasp Clone
Salin seluruh file di folder `backend/` ke proyek Apps Script Anda, konfigurasikan `Script Properties`, dan panggil `dispatchAction(payload, getAppConfig_())`.

---

## 🔄 3. CI/CD Deployment Otomatis (GitHub Actions & Clasp)

Setiap perubahan di folder `backend/` yang di-push ke branch `main` akan otomatis di-deploy ke library Google Apps Script via GitHub Actions (`.github/workflows/deploy-gas.yml`).

---

## 📝 Lisensi

Dikelola untuk standarisasi web app oleh Pemerintah Kabupaten Trenggalek.
Lisensi: MIT.
