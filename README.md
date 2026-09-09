# Frontend CDN & Backend Global Library v2.2.5
### Ekosistem Shared Assets & Engine Web App Google Apps Script (GAS) — Pemkab Trenggalek

Repository ini adalah standar terpadu frontend (*Vue 3 + Tailwind CSS*) dan backend (*Google Apps Script*) yang digunakan bersama oleh seluruh aplikasi web di lingkungan Pemerintah Kabupaten Trenggalek.

---

## 🏛️ Arsitektur Ekosistem 3 Repository

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    1. frontend-cdn (Shared Core & CDN)                      │
│   - Library Backend GAS: CoreLib (1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoK...)     │
│   - Shared Frontend CDN: app-common.min.css, app-components, app-core.js    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌─────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
│     2. si-platform (Portal & SIMPEG)    │     │      3. si-pelaporan (App Pelaporan)    │
│ - Identity Provider & SSO Ticket Issuer │     │ - CRUD Pelaporan, Verifikasi & Analisa  │
│ - Master Hub: Pegawai, Unit, & Jabatan  │     │ - Konsumsi SSO & Master Data SIMPEG     │
│ - Beranda App Launcher ASN Trenggalek   │     │ - UI Khusus Operasional Pegawai         │
└─────────────────────────────────────────┘     └─────────────────────────────────────────┘
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
├── 🎨 frontend/                     # KODE FRONTEND (SHARED CDN ASSETS)
│   ├── app-common.css              # Desain tema global, token CSS, dan dark mode
│   ├── app-common.min.css          # Versi minifikasi CSS (~6.8 KB)
│   ├── app-components.js           # Komponen Vue Shell (<app-login>, <app-sidebar>, <app-header>)
│   ├── app-components.min.js       # Versi minifikasi Shell UI (~16.3 KB)
│   ├── app-modules.js              # Modul mandiri (<app-profile> SIMPEG & <app-settings>)
│   ├── app-modules.min.js          # Versi minifikasi modul mandiri (~27.7 KB)
│   ├── app-core.js                 # Factory AppCore Vue 3 (Auth SSO, Bridge, Rupiah & Date Helpers)
│   └── app-core.min.js             # Versi minifikasi Core Engine (~6.5 KB)
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
├── .gitignore                      # Mengabaikan cache & standalone repos
├── package.json                    # Script minifikasi (npm run build)
└── README.md                       # Dokumentasi lengkap & cara pemakaian
```

---

## 🚀 1. Penggunaan Frontend (jsDelivr CDN)

Salin tag CDN berikut ke dalam file `Index.html` aplikasi GAS Anda:

```html
<!-- CSS Global Minified (di <head>) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.5/frontend/app-common.min.css">

<!-- JS Components, Modules, & Core Minified (di akhir <body>) -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.5/frontend/app-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.5/frontend/app-modules.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.2.5/frontend/app-core.min.js"></script>
```

---

## ⚙️ 2. Penggunaan Backend di Aplikasi Dinas (Consumer Web App)

Hubungkan Library `CoreLib` di Google Apps Script (Script ID: `1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoKqpuucPJXgNZ9XBK06O7wgDkO`) dan panggil `CoreLib.dispatchAction(payload, config)`.

---

## 🔄 3. Repository Terkait dalam Ekosistem

1. **[si-platform](https://github.com/miftachurrochim82-sketch/si-platform)**: Portal SSO & Pusat Data Master SIMPEG.
2. **[si-pelaporan](https://github.com/miftachurrochim82-sketch/si-pelaporan)**: Sistem Informasi Pelaporan Pegawai Terintegrasi.
3. **[si-dilan](https://github.com/miftachurrochim82-sketch/si-dilan)**: Sistem Informasi Diklat & Pelatihan ASN.

---

## 📝 Lisensi

Dikelola untuk standarisasi web app oleh Pemerintah Kabupaten Trenggalek.
Lisensi: MIT.
