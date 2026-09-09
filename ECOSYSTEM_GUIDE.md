# 🏛️ Panduan Arsitektur & Standar Pengembangan Aplikasi Ekosistem Pemkab Trenggalek
### Standar Terpadu CoreLib v2.0 • Frontend CDN v2.4.0 • Portal SSO SI-Platform • Starter Template

> **Dokumen Resmi Arsitektur & Standar Rekayasa Perangkat Lunak**  
> **Pemerintah Kabupaten Trenggalek — Dinas Komunikasi dan Informatika**  
> *Versi Ekosistem: 2.4.0 | Tahun: 2026*

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif & Prinsip Arsitektur](#1-ringkasan-eksekutif--prinsip-arsitektur)
2. [Peta Ekosistem & Matriks Komponen](#2-peta-ekosistem--matriks-komponen)
3. [Backend Core Foundation v2.0 (`CoreLib`)](#3-backend-core-foundation-v20-corelib)
   - [3.1 Skema Spreadsheet & Physical Row Indexing](#31-skema-spreadsheet--physical-row-indexing)
   - [3.2 Column-Aligned Schema Serialization](#32-column-aligned-schema-serialization)
   - [3.3 Namespace Database Caching](#33-namespace-database-caching)
   - [3.4 Declarative Resource Router](#34-declarative-resource-router)
   - [3.5 Standardisasi Waktu & ISO-8601 Canonical Format](#35-standardisasi-waktu--iso-8601-canonical-format)
4. [Frontend CDN v2.4.0 Shared Library](#4-frontend-cdn-v240-shared-library)
   - [4.1 Distribusi Aset CDN jsDelivr](#41-distribusi-aset-cdn-jsdelivr)
   - [4.2 On-Demand Library Lazy Loading](#42-on-demand-library-lazy-loading)
   - [4.3 Stale-While-Revalidate (SWR) SIMPEG Cache](#43-stale-while-revalidate-swr-simpeg-cache)
   - [4.4 Standarisasi Ikon Font Awesome 6.5.2 & Design Tokens](#44-standarisasi-ikon-font-awesome-652--design-tokens)
   - [4.5 Katalog Komponen Bersama (`<app-...>`)](#45-katalog-komponen-bersama-app-)
5. [Single Sign-On (SSO) & Protokol Keamanan](#5-single-sign-on-sso--protokol-keamanan)
   - [5.1 Alur Autentikasi Tiket SSO](#51-alur-autentikasi-tiket-sso)
   - [5.2 Autentikasi Mandiri (Direct Login)](#52-autentikasi-mandiri-direct-login)
   - [5.3 Role Guard & Hak Akses Berbasis Izin](#53-role-guard--hak-akses-berbasis-izin)
6. [Panduan Pembuatan Aplikasi Baru (`app-starter-template`)](#6-panduan-pembuatan-aplikasi-baru-app-starter-template)
   - [6.1 CLI Generator (`create-app.js`)](#61-cli-generator-create-appjs)
   - [6.2 Struktur Berkas Aplikasi Standar](#62-struktur-berkas-aplikasi-standar)
   - [6.3 Konfigurasi Script Properties](#63-konfigurasi-script-properties)
7. [Prosedur Deployment, CI/CD & Diagnostik](#7-prosedur-deployment-cicd--diagnostik)
   - [7.1 Deployment Google Apps Script via Clasp](#71-deployment-google-apps-script-via-clasp)
   - [7.2 Pipeline CI/CD GitHub Actions](#72-pipeline-cicd-github-actions)
   - [7.3 Menjalankan Automated Diagnostic Test Suite](#73-menjalankan-automated-diagnostic-test-suite)
8. [Matriks Troubleshooting & Praktik Terbaik](#8-matriks-troubleshooting--praktik-terbaik)

---

## 1. Ringkasan Eksekutif & Prinsip Arsitektur

Ekosistem aplikasi web Pemerintah Kabupaten Trenggalek dirancang di atas infrastruktur serverless **Google Apps Script (V8 Runtime)** dengan penyimpanan **Google Sheets** dan frontend reaktif modern berbasis **Vue 3**, **Tailwind CSS**, dan **Font Awesome 6.5.2**.

### 💎 5 Prinsip Utama Rekayasa
1. **Single Source of Truth**: Data master kepegawaian (SIMPEG: Pegawai, Jabatan, Unit Kerja) dikelola terpusat di `si-platform` dan diakses langsung oleh aplikasi satelit melalui spreadsheet master ID tanpa duplikasi sheet lokal.
2. **Zero Inconsistent State**: Operasi penulisan, pembaruan, dan penghapusan data pada Google Sheets menggunakan nomor baris fisik (`_row`) dan pemetaan kolom dinamis (`toAlignedRow_`), mengeliminasi bug data race dan penimpaan kolom.
3. **High Performance & Instant Load**: Frontend memanfaatkan arsitektur *Stale-While-Revalidate* (SWR) dan *On-Demand Dynamic Loaders*, memotong ukuran awal bundle hingga 1.4 MB dan menghasilkan waktu muat 0 ms untuk data master yang ter-cache.
4. **Declarative & Low-Boilerplate**: Pembuatan endpoint CRUD tidak lagi memerlukan ratusan baris kode repetitif, melainkan cukup mendeklarasikan resource melalui `CoreLib.declareResourceRouter()`.
5. **Harmonious Visual Identity**: Seluruh aplikasi di lingkungan Pemkab Trenggalek memiliki antarmuka, komponen, tema (termasuk Dark Mode terpadu), dan sistem ikon Font Awesome yang seragam.

---

## 2. Peta Ekosistem & Matriks Komponen

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SHARED FOUNDATION LAYER                               │
├────────────────────────────────────────────┬────────────────────────────────────────────┤
│ 1. CoreLib Global Backend Library v2.0     │ 2. Frontend CDN v2.4.0 (jsDelivr)          │
│    ID: 1GmeYflfMpRa1iTVgFHRD6K1DMoxc9Oo... │    CSS: app-common.min.css                 │
│    - Physical Row Database Engine          │    JS : app-components.min.js              │
│    - Declarative Resource Router           │         app-modules.min.js                 │
│    - SSO HMAC Auth Bridge & Role Guard     │         app-core.min.js (SWR Engine)       │
└────────────────────────────────────────────┴────────────────────────────────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
┌────────────────────────────────────────────┐  ┌─────────────────────────────────────────┐
│ 3. SI-PLATFORM (Portal SSO & Master Hub)   │  │ 4. APLIKASI SATELIT SKPD / CONSUMER     │
│    - Single Sign-On Identity Provider      │  │    Contoh:                              │
│    - Master Kepegawaian (SIMPEG)           │  │    - SI-PELAPORAN (Laporan Kinerja)     │
│    - RBAC: Manajemen User, Role, Izin      │  │    - SI-CUTI, SI-PERJADIN, SI-ASET, dll │
│    - Portal App Launcher ASN               │  │    - Dibuat via `app-starter-template`  │
└────────────────────────────────────────────┘  └─────────────────────────────────────────┘
```

### Matriks Repositori & Kategori

| Repositori | Peran | Dependensi Utama |
|---|---|---|
| `backend` (`CoreLib`) | Global Apps Script Library | GAS V8 Runtime, Google Sheets API, Drive API |
| `frontend` (`frontend-cdn`) | Shared CSS/JS Bundle CDN | Vue 3, Tailwind CSS, Font Awesome 6.5.2 |
| `si-platform` | Portal Pusat SSO & SIMPEG | Vue 3, Tailwind CSS, Font Awesome 6.5.2, `app-common.css` |
| `si-pelaporan` | Aplikasi Satelit Laporan | `CoreLib v2.0`, `frontend-cdn v2.4.0` |
| `app-starter-template` | Boilerplate & Scaffolding CLI | `create-app.js`, `CoreLib v2.0`, `frontend-cdn v2.4.0` |

---

## 3. Backend Core Foundation v2.0 (`CoreLib`)

Library backend terdistribusi resmi Pemkab Trenggalek:
* **Script ID / Library ID**: `1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoKqpuucPJXgNZ9XBK06O7wgDkO`
* **Identifier**: `CoreLib`
* **Runtime**: Apps Script V8 (Timezone: `Asia/Jakarta`)

### 3.1 Skema Spreadsheet & Physical Row Indexing
Di versi 2.0, `CoreLib` menghentikan metode lama yang mengandalkan indeks array terfilter untuk operasi `update` dan `delete`. Seluruh data yang dibaca menyertakan properti internal `_row` yang merefleksikan nomor baris absolut di Google Sheet (baris 1 adalah header, data dimulai baris 2).

```javascript
// Operasi update presisi baris fisik pada CoreLib
function updateRecordPreserved_(sheet, rowNumber, alignedRowValues) {
  // Langsung menargetkan baris fisik tanpa memindai ulang seluruh sheet
  sheet.getRange(rowNumber, 1, 1, alignedRowValues.length).setValues([alignedRowValues]);
}
```

### 3.2 Column-Aligned Schema Serialization
Fungsi `toAlignedRow_` memetakan objek JavaScript ke kolom spreadsheet berdasarkan urutan nama header aktual di Sheet baris 1. Hal ini menjamin integritas data meskipun urutan kolom di Spreadsheet diubah oleh administrator.

```text
Spreadsheet Headers: ['id', 'nama', 'nip', 'unit_id', 'created_at']
Object Data        : { nip: '1988...', nama: 'Budi', id: 'UUID-01', created_at: '2026-...' }
Aligned Array      : ['UUID-01', 'Budi', '1988...', '', '2026-...']
```

### 3.3 Namespace Database Caching
Untuk menghindari konflik antar database saat satu script mengakses beberapa spreadsheet, CacheService di-namespace secara unik:
* **Key Format**: `sheetData_{SPREADSHEET_ID}_{SHEET_NAME}`
* **TTL Caching**: Otomatis hingga 21.600 detik (6 jam) dengan auto-invalidation saat ada operasi `INSERT`, `UPDATE`, `SOFT_DELETE`, atau `HARD_DELETE`.

### 3.4 Declarative Resource Router
Aplikasi satelit cukup mendeklarasikan entity dan tabelnya tanpa menulis handler CRUD manual.

```javascript
// Contoh deklarasi resource router pada Aplikasi Satelit (01_ConfigAndBridge.gs)
const AppRouter = CoreLib.declareResourceRouter({
  config: APP_CONFIG,
  resources: {
    // CRUD Otomatis: list, create, update, delete, get, summary, export
    'pelaporan': {
      table: 'PELAPORAN',
      pkField: 'id',
      auditTrail: true,
      requireAuth: true,
      allowedRoles: ['ADMIN', 'OPERATOR', 'USER']
    },
    'kategori': {
      table: 'KATEGORI',
      pkField: 'id',
      auditTrail: true,
      requireAuth: true,
      allowedRoles: ['ADMIN']
    }
  },
  customHandlers: {
    // Custom endpoint bisnis spesifik
    'verifikasi_laporan': function(payload, session) {
      return handleVerifikasiLaporan(payload, session);
    }
  }
});
```

Dispatcher pada `Code.gs` cukup memanggil:
```javascript
function handleAction(payload) {
  return AppRouter.dispatch(payload);
}
```

### 3.5 Standardisasi Waktu & ISO-8601 Canonical Format
* **Penyimpanan di Database (Google Sheet)**: Selalu dalam format ISO-8601 UTC string (`YYYY-MM-DDTHH:mm:ss.sssZ`).
* **Format Tampilan Pengguna**: Diformat di sisi frontend via helper `this.formatDate(val)` menjadi `DD/MM/YYYY` atau `DD MMMM YYYY, HH:mm WIB`.

---

## 4. Frontend CDN v2.4.0 Shared Library

### 4.1 Distribusi Aset CDN jsDelivr
Setiap aplikasi web cukup memuat tag berikut di file `Index.html`:

```html
<!-- 1. Resource Pre-connect Hints -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">

<!-- 2. Typography & Unified Font Awesome 6.5.2 -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

<!-- 3. Tailwind CSS & Vue 3 Runtime -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          brand: {
            50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981',
            600: '#059669', 700: '#047857', 900: '#064e3b'
          }
        },
        fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
      }
    }
  };
</script>

<!-- 4. Shared Trenggalek Design System & Component Library (v2.4.0) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-common.min.css">
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-modules.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.4.0/frontend/app-core.min.js"></script>
```

### 4.2 On-Demand Library Lazy Loading
Frontend CDN v2.4.0 mengeliminasi *render-blocking libraries*. Pustaka eksternal berukuran besar dimuat secara dinamis hanya saat dibutuhkan:

```javascript
// Memuat SheetJS (XLSX) hanya saat pengguna mengklik ekspor Excel
await AppCore.loadScript('xlsx'); // Otomatis mengunduh https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js

// Memuat jsPDF & AutoTable hanya saat pengguna mengekspor PDF
await AppCore.loadScript('jspdf');
await AppCore.loadScript('jspdf-autotable');

// Memuat Chart.js hanya saat dashboard analitik dirender
await AppCore.loadScript('chartjs');
```

### 4.3 Stale-While-Revalidate (SWR) SIMPEG Cache
Data Master SIMPEG (Pegawai, Jabatan, Unit Kerja) memiliki frekuensi perubahan rendah namun frekuensi baca tinggi. `app-core.min.js` mengimplementasikan strategi SWR:
1. **Langkah 1**: Render antarmuka secara instan (**0 ms**) menggunakan cache `localStorage`.
2. **Langkah 2**: Kirim panggilan *background refresh* asinkron ke server untuk memeriksa versi data terbaru.
3. **Langkah 3**: Jika server mengembalikan versi baru, perbarui data state dan simpan kembali ke `localStorage` tanpa mengganggu input pengguna.

### 4.4 Standarisasi Ikon Font Awesome 6.5.2 & Design Tokens
Seluruh ikon wajib menggunakan class Font Awesome 6.5.2 (`fa-solid fa-*`):

| Kategori Menu / Fitur | Class Ikon Standar |
|---|---|
| Dashboard / Beranda | `fa-solid fa-gauge-high` |
| Modul Aplikasi / Master Hub | `fa-solid fa-shapes` |
| Manajemen Pegawai / User | `fa-solid fa-users-gear` |
| Hak Akses / Roles / Security | `fa-solid fa-shield-halved` |
| Katalog Izin / Permissions | `fa-solid fa-key` |
| Berkas / File Storage | `fa-solid fa-folder-open` |
| Notifikasi / Bell | `fa-solid fa-bell` |
| Audit Trail / Log Aktivitas | `fa-solid fa-clipboard-list` |
| Pengaturan Global / Settings | `fa-solid fa-gear` |
| Tombol Tambah Data | `fa-solid fa-plus` |
| Tombol Edit | `fa-solid fa-pen-to-square` |
| Tombol Hapus | `fa-solid fa-trash-can` |
| Tombol Ekspor Excel | `fa-solid fa-file-excel` |
| Tombol Ekspor PDF | `fa-solid fa-file-pdf` |
| Tombol Simpan | `fa-solid fa-floppy-disk` |
| Status Sukses / Berhasil | `fa-solid fa-circle-check text-emerald-500` |
| Status Peringatan / Warning | `fa-solid fa-triangle-exclamation text-amber-500` |
| Status Bahaya / Error | `fa-solid fa-circle-xmark text-rose-500` |

### 4.5 Katalog Komponen Bersama (`<app-...>`)
* `<app-login>`: Layar autentikasi mandiri dan Single Sign-On launcher.
* `<app-sidebar>`: Navigasi responsif dengan collapse mode dan indikator role.
* `<app-header>`: Topbar dengan Dark Mode switch, notifikasi, dan profil user.
* `<app-stat-card>`: Kartu ringkasan metrik KPI dengan persentase tren.
* `<app-badge>`: Label status berwarna standar (success, warning, danger, info, neutral).
* `<app-modal>`: Dialog popup responsif berbasis animasi CSS.
* `<app-crud-table>`: Tabel data interaktif dengan pencarian cepat, pengurutan kolom, paginasi, tombol ekspor (Excel/PDF), dan aksi CRUD.
* `<app-profile>`: Modul profil ASN mandiri dengan data terverifikasi SIMPEG.
* `<app-settings>`: Modul pengaturan konfigurasi sistem berbasis tabs.

---

## 5. Single Sign-On (SSO) & Protokol Keamanan

### 5.1 Alur Autentikasi Tiket SSO

```text
[ Pengguna ] ──── 1. Buka SI-PLATFORM ───► [ Portal SI-PLATFORM ]
                                                    │
                                             2. Login Berhasil
                                                    │
                                             3. Generate Ticket SSO
                                                (Valid 5 Menit)
                                                    │
[ Pengguna ] ◄─── 4. Redirect ke URL App ───────────┘
                       (?ticket=ST-xxxx)
     │
     ▼
[ Aplikasi Satelit (Frontend) ]
     │
     └─── 5. Panggil Server App: exchangeTicket('ST-xxxx')
                 │
                 ▼
          [ Backend GAS Satelit ] ─── 6. HTTP POST Validate Ticket ───► [ Backend SI-PLATFORM ]
                                                                               │
                                                                        7. Verifikasi & Return
                                                                           User Profile + Roles
                                                                               │
          [ Backend GAS Satelit ] ◄── 8. Status: VALID + User Data ────────────┘
                 │
                 ├── 9. Buat Token Sesi HMAC Lokal (Valid 8 Jam)
                 │
                 ▼
[ Aplikasi Satelit (Frontend) ] ◄── 10. Kembalikan Sesi Aktif
     │
     └── 11. Simpan ke sessionStorage & Redirect ke Dashboard (0 ms)
```

### 5.2 Autentikasi Mandiri (Direct Login)
Jika aplikasi diakses tanpa tiket SSO (misal pengujian lokal atau akun darurat), sistem mendukung otentikasi mandiri berbasis `USER_CREDENTIALS` lokal dengan hashing password aman.

### 5.3 Role Guard & Hak Akses Berbasis Izin
Setiap panggilan API ke backend divalidasi oleh `CoreLib.requireAuth()` dan `CoreLib.requireRole()`:

```javascript
// Validasi di tingkat Handler Backend
function handleHapusLaporan(payload, session) {
  CoreLib.requireRole(session, ['SUPER_ADMIN', 'ADMIN']);
  // Eksekusi penghapusan data...
}
```

---

## 6. Panduan Pembuatan Aplikasi Baru (`app-starter-template`)

### 6.1 CLI Generator (`create-app.js`)
Gunakan generator interaktif atau argumen CLI untuk membuat repository aplikasi baru:

```bash
# Masuk ke folder template
cd /home/user/app-starter-template

# Jalankan CLI Generator
node bin/create-app.js \
  --code SICUTI \
  --title "SI-CUTI" \
  --entity CUTI \
  --desc "Sistem Informasi Manajemen Pengajuan Cuti Pegawai" \
  --dest ../si-cuti
```

Generator otomatis mengonfigurasi nama entity, skema router, navigasi frontend, dan test suite.

### 6.2 Struktur Berkas Aplikasi Standar

```text
si-cuti/
├── .clasp.json               # Konfigurasi target Google Apps Script Script ID
├── appsscript.json           # Manifest V8 + Library CoreLib
├── package.json              # Script npm untuk clasp push/pull
├── README.md                 # Dokumentasi operasional aplikasi
├── .github/workflows/
│   └── deploy.yml            # CI/CD otomatis saat push ke branch main
└── src/
    ├── 01_ConfigAndBridge.gs # Konfigurasi konstanta, bridge, & deklarasi resource
    ├── 02_AppLogic.gs        # HTTP entrypoint doGet, custom handlers bisnis
    ├── 03_SeedData.gs        # Inisialisasi tabel Google Sheets dan data dummy
    ├── 99_TestSuite.gs       # Test suite otomatis pengujian endpoint & CoreLib
    ├── Index.html            # Shell aplikasi Vue 3 + Tailwind + CDN v2.4.0
    ├── A4_Dashboard.html     # Modul Ringkasan Dashboard & KPI
    ├── A5_MainModule.html    # Modul CRUD Data Utama (<app-crud-table>)
    └── A8_MasterData.html    # Modul data referensi master SIMPEG
```

### 6.3 Konfigurasi Script Properties
Buka Google Apps Script Editor ➡️ **Project Settings** ➡️ **Script Properties**, tambahkan key berikut:

| Key Property | Contoh Nilai | Deskripsi |
|---|---|---|
| `SPREADSHEET_ID` | `1abc12345xyz...` | ID Spreadsheet Google Sheets database lokal aplikasi |
| `MASTER_SPREADSHEET_ID` | `1simpeg_master_id...` | ID Spreadsheet Master SIMPEG Pemkab Trenggalek |
| `PLATFORM_API_URL` | `https://script.google.com/.../exec` | Endpoint URL deployment Web App SI-PLATFORM |
| `APP_TITLE` | `SI-CUTI` | Judul aplikasi web |

---

## 7. Prosedur Deployment, CI/CD & Diagnostik

### 7.1 Deployment Google Apps Script via Clasp
1. Instal Google Clasp di komputer Anda:
   ```bash
   npm install -g @google/clasp
   clasp login
   ```
2. Hubungkan proyek dengan Script ID target:
   ```bash
   clasp clone "SCRIPT_ID_DARI_GOOGLE_APPS_SCRIPT"
   ```
3. Lakukan upload kode sumber:
   ```bash
   npm run push
   ```

### 7.2 Pipeline CI/CD GitHub Actions
Setiap repository aplikasi yang dibuat melalui template telah dilengkapi `.github/workflows/deploy.yml`:
* **Secrets yang Dibutuhkan**:
  * `CLASPRC_JSON`: Konten file `~/.clasprc.json` yang diperoleh setelah `clasp login`.
  * `SCRIPT_ID`: ID Proyek Google Apps Script tujuan.
* **Trigger**: Otomatis melakukan verifikasi sintaks dan `clasp push` setiap kali ada commit ke branch `main`.

### 7.3 Menjalankan Automated Diagnostic Test Suite
1. Buka Apps Script Editor di peramban.
2. Pada dropdown fungsi di toolbar atas, pilih **`runLibraryTests`** (atau `setupApp` untuk inisialisasi awal).
3. Klik tombol **Run**.
4. Buka **Execution Log** untuk memastikan seluruh pengujian berstatus `PASSED (100%)`.

---

## 8. Matriks Troubleshooting & Praktik Terbaik

| Gejala / Permasalahan | Kemungkinan Penyebab | Solusi yang Direkomendasikan |
|---|---|---|
| Data tertimpa saat update | Masih memakai indeks array terfilter lama | Pastikan menggunakan `CoreLib v2.0` yang mengadopsi `_row` physical index. |
| Kolom di Spreadsheet bergeser/salah posisi | Array `setValues` diasumsikan urut | Pastikan proses simpan melewati `toAlignedRow_` yang membaca header baris 1. |
| Master SIMPEG lambat saat pertama kali dibuka | Cache browser kosong | SWR otomatis mengambil data lokal dan menyinkronkan di latar belakang; pastikan `MASTER_SPREADSHEET_ID` valid. |
| Tiket SSO menghasilkan error `INVALID_TICKET` | Tiket kedaluwarsa (> 5 menit) atau sudah dipakai | Arahkan pengguna kembali ke SI-PLATFORM untuk membuat tiket baru. |
| Ikon tidak muncul (kotak kosong) | Masih menggunakan class Phosphor (`ph ph-*`) | Ubah class ikon menjadi format Font Awesome 6.5.2 (`fa-solid fa-*`). |
| Bundle aplikasi berat saat initial load | Mengimpor XLSX / PDF / ChartJS di `<head>` | Hapus script berat dari `<head>`, gunakan `AppCore.loadScript('xlsx')` on-demand. |

---

## 📜 Kontak & Pemeliharaan
* **Pengelola Ekosistem**: Tim Pengembang TI — Dinas Komunikasi dan Informatika Kabupaten Trenggalek
* **Dokumentasi & Versi**: v2.4.0 (Tahun 2026)
* **Lisensi**: MIT License
