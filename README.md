# Frontend CDN & Backend Global Library v2.4.0
### Ekosistem Shared Assets & Engine Web App Google Apps Script (GAS) — Pemkab Trenggalek

Repository ini adalah standar terpadu frontend (*Vue 3 + Tailwind CSS + Font Awesome 6.5.2*) dan backend (*Google Apps Script CoreLib v2.0*) yang digunakan bersama oleh seluruh aplikasi web di lingkungan Pemerintah Kabupaten Trenggalek.

> 📖 **Panduan Lengkap Arsitektur & Pengembang**: Lihat **[`ECOSYSTEM_GUIDE.md`](./ECOSYSTEM_GUIDE.md)** untuk dokumentasi teknis mendalam mengenai CoreLib v2.0, Frontend CDN v2.4.0, SWR Caching, Alur SSO, dan CLI Generator Aplikasi.

---

## 🏛️ Arsitektur Ekosistem 4 Komponen Utama

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    1. frontend-cdn (Shared Core & CDN v2.4.0)               │
│   - Library Backend GAS: CoreLib (1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoK...)     │
│   - Shared Frontend CDN: app-common.min.css, app-components, app-core.js    │
│   - Font Awesome 6.5.2, SWR SIMPEG Cache, & On-Demand Dynamic Loaders       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 2. si-platform (SSO)    │  │ 3. app-starter-template │  │ 4. Aplikasi SKPD Satelit│
│ - Identity Provider     │  │ - CLI Scaffolding Tool  │  │ - SI-PELAPORAN          │
│ - Master Hub SIMPEG     │  │ - Declarative Routing   │  │ - SI-CUTI, SI-PERJADIN  │
│ - Portal ASN Launchpad  │  │ - 100% CoreLib v2.0     │  │ - Mengonsumsi SSO & SWR │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

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

## 📦 Struktur Folder Repository `frontend-cdn`

```text
frontend-cdn/
│
├── 🤖 .github/
│   └── workflows/
│       └── deploy-gas.yml          # Skrip CI/CD otomatis deploy backend ke GAS via Google Clasp
│
├── 🎨 frontend/                     # KODE FRONTEND (SHARED CDN ASSETS v2.4.0)
│   ├── app-common.css              # Desain tema global, token CSS, dan dark mode
│   ├── app-common.min.css          # Versi minifikasi CSS (~6.8 KB)
│   ├── app-components.js           # Komponen Vue Shell (<app-login>, <app-sidebar>, <app-header>, <app-crud-table>)
│   ├── app-components.min.js       # Versi minifikasi Shell UI (~16.3 KB)
│   ├── app-modules.js              # Modul mandiri (<app-profile> SIMPEG & <app-settings>)
│   ├── app-modules.min.js          # Versi minifikasi modul mandiri (~27.7 KB)
│   ├── app-core.js                 # Factory AppCore Vue 3 (SWR SIMPEG Cache, Dynamic Loaders, Bridge)
│   └── app-core.min.js             # Versi minifikasi Core Engine (~6.5 KB)
│
├── 📋 backend/                      # KODE BACKEND GOOGLE APPS SCRIPT (CoreLib v2.0)
│   ├── .clasp.json                 # File identitas proyek Apps Script lokal (Script ID)
│   ├── appsscript.json             # Manifest konfigurasi runtime V8, timezone, & OAuth scopes
│   ├── 00_MIGRATION_v2.md          # Panduan migrasi & changelog teknis
│   ├── 01_CoreFoundation.gs        # Engine Database Sheets, Physical Row Indexing, Cache & SIMPEG Helpers
│   ├── 02_CoreGateway.gs           # Gateway Auth SSO, Declarative Resource Router, Role Guard & API CRUD
│   ├── 03_CoreServices.gs          # Profil SIMPEG, Konfigurasi, Drive Folder Provisioning & Setup
│   ├── 99_CoreTest.gs              # Automated Diagnostic & Regression Test Suite
│   └── Code.gs                     # Template Entrypoint doGet() & Dispatcher handleAction()
│
├── 🛠️ app-starter-template/         # BOILERPLATE GENERATOR APLIKASI BARU
│   ├── bin/create-app.js           # CLI generator untuk membuat aplikasi SKPD baru
│   └── src/                        # Template aplikasi siap deploy
│
├── .clasp.json                     # Konfigurasi Clasp root (target folder backend)
├── .gitignore                      # Mengabaikan cache & build
├── package.json                    # Script minifikasi (npm run build)
├── ECOSYSTEM_GUIDE.md              # Dokumentasi arsitektur menyeluruh & panduan developer
└── README.md                       # Ringkasan proyek & cara pemakaian
```

---

## 🚀 1. Penggunaan Frontend (jsDelivr CDN v2.4.0)

Salin tag CDN berikut ke dalam file `Index.html` aplikasi GAS Anda:

```html
<!-- Typography & Font Awesome 6.5.2 Icons -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

<!-- CSS Global Minified (di <head>) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-common.min.css">

<!-- JS Components, Modules, & Core Minified (di akhir <body>) -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-modules.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-core.min.js"></script>
```

---

## ⚙️ 2. Penggunaan Backend di Aplikasi Dinas (Consumer Web App)

Hubungkan Library `CoreLib` di Google Apps Script (Script ID: `1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoKqpuucPJXgNZ9XBK06O7wgDkO`) dan deklarasikan resource:

```javascript
const AppRouter = CoreLib.declareResourceRouter({
  config: APP_CONFIG,
  resources: {
    'laporan': { table: 'LAPORAN', pkField: 'id', auditTrail: true }
  }
});

function handleAction(payload) {
  return AppRouter.dispatch(payload);
}
```

---

## 🛠️ 3. Membuat Aplikasi Baru dalam 1 Menit via CLI

```bash
cd app-starter-template
node bin/create-app.js \
  --code SIPERJADIN \
  --title "SI-PERJADIN" \
  --entity PERJADIN \
  --desc "Sistem Informasi Perjalanan Dinas ASN" \
  --dest ../si-perjadin
```

---

## 🔄 4. Repository Terkait dalam Ekosistem

1. **[si-platform](https://github.com/miftachurrochim82-sketch/si-platform)**: Portal SSO & Pusat Data Master SIMPEG.
2. **[si-pelaporan](https://github.com/miftachurrochim82-sketch/si-pelaporan)**: Sistem Informasi Pelaporan Pegawai Terintegrasi.
3. **[app-starter-template](./app-starter-template)**: Scaffolding Boilerplate untuk Pembuatan Aplikasi Baru.

---

## 📝 Lisensi

Dikelola untuk standarisasi web app oleh Pemerintah Kabupaten Trenggalek.
Lisensi: MIT.
