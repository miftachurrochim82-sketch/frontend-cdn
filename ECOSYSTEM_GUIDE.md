# 🏛️ Panduan Arsitektur & Standar Pengembangan Aplikasi Ekosistem Pemkab Trenggalek
### Standar Terpadu CoreLib v2.2.3 • Frontend CDN v2.7.0 • Portal SSO SI-Platform • Starter Template

> **Dokumen Resmi Arsitektur & Standar Rekayasa Perangkat Lunak**  
> **Pemerintah Kabupaten Trenggalek — Dinas Komunikasi dan Informatika**  
> *Versi Ekosistem: 2.5.2 | Tahun: 2026*

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif & Prinsip Arsitektur](#1-ringkasan-eksekutif--prinsip-arsitektur)
2. [Peta Ekosistem & Matriks Komponen](#2-peta-ekosistem--matriks-komponen)
3. [Backend Core Foundation v2.2.3 (`CoreLib`)](#3-backend-core-foundation-v223-corelib)
   - [3.1 Skema Spreadsheet & Physical Row Indexing](#31-skema-spreadsheet--physical-row-indexing)
   - [3.2 Column-Aligned Schema Serialization](#32-column-aligned-schema-serialization)
   - [3.3 Namespace Database Caching](#33-namespace-database-caching)
   - [3.4 Declarative Resource Router](#34-declarative-resource-router)
   - [3.5 Standardisasi Waktu & ISO-8601 Canonical Format](#35-standardisasi-waktu--iso-8601-canonical-format)
4. [Frontend CDN v2.7.0 Shared Library](#4-frontend-cdn-v270-shared-library)
   - [4.1 Distribusi Aset CDN jsDelivr](#41-distribusi-aset-cdn-jsdelivr)
   - [4.2 On-Demand Library Lazy Loading](#42-on-demand-library-lazy-loading)
   - [4.3 Stale-While-Revalidate (SWR) SIMPEG Cache](#43-stale-while-revalidate-swr-simpeg-cache)
   - [4.4 Standarisasi Ikon Font Awesome 6.5.2 & Design Tokens](#44-standarisasi-ikon-font-awesome-652--design-tokens)
   - [4.5 Katalog Komponen Bersama (`<app-...>`)](#45-katalog-komponen-bersama-app-)
5. [Single Sign-On (SSO) & Protokol Keamanan](#5-single-sign-on-sso--protokol-keamanan)
   - [5.1 Alur Autentikasi Tiket SSO](#51-alur-autentikasi-tiket-sso)
   - [5.2 Autentikasi Mandiri (Direct Login)](#52-autentikasi-mandiri-direct-login)
   - [5.3 Role Guard & Hak Akses Berbasis Izin](#53-role-guard--hak-akses-berbasis-izin)
6. [Panduan Pembuatan Aplikasi Baru (template `backend/Code.gs`)](#6-panduan-pembuatan-aplikasi-baru-template-backendcodegs)
   - [6.1 Kerangka Awal](#61-kerangka-awal)
   - [6.2 Struktur Berkas Aplikasi Standar](#62-struktur-berkas-aplikasi-standar)
   - [6.3 Konfigurasi Script Properties](#63-konfigurasi-script-properties)
7. [Prosedur Deployment, CI/CD & Diagnostik](#7-prosedur-deployment-cicd--diagnostik)
   - [7.1 Deployment Google Apps Script](#71-deployment-google-apps-script)
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
│ 1. CoreLib Global Backend Library v2.2.3     │ 2. Frontend CDN v2.7.0 (jsDelivr)          │
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
│    - Portal App Launcher ASN               │  │    - Dibuat dari template Code.gs       │
└────────────────────────────────────────────┘  └─────────────────────────────────────────┘
```

### Matriks Repositori & Kategori

| Repositori | Peran | Dependensi Utama |
|---|---|---|
| `backend` (`CoreLib`) | Global Apps Script Library | GAS V8 Runtime, Google Sheets API, Drive API |
| `frontend` (`frontend-cdn`) | Shared CSS/JS Bundle CDN | Vue 3, Tailwind CSS, Font Awesome 6.5.2 |
| `si-platform` | Portal Pusat SSO & SIMPEG | Vue 3, Tailwind CSS, Font Awesome 6.5.2, `app-common.css` |
| `si-kompetensi` | Aplikasi Satelit Kompetensi ASN | `CoreLib` pin 12 + `developmentMode:true`, `frontend-cdn @v2.6.5` |
| `si-pelaporan` | Aplikasi Satelit Laporan | `CoreLib` pin 13 (pinned = v2.2.3), `frontend-cdn @v2.6.5` |
| ~~`backend/Code.gs`~~ (dihapus 2026-09-17 → starter-kit) | ~~Template kerangka aplikasi baru~~ | `CoreLib v2.2.3`, `frontend-cdn v2.6.5` |

---

## 3. Backend Core Foundation v2.2.3 (`CoreLib`)

> **v2.2.3 (2026-09-16)** ⭐: FIX keamanan `levelOf_` — fallback `|| 1` (yang mengangkat viewer/role tak dikenal ke level 1 dan meloloskannya di 9 gerbang akses) diganti fail-closed `lv === undefined ? 0 : lv`. Diverifikasi live: `testAll()` PASS 38 / FAIL 0, `[PASS] testRoleGateV222`.
>
> **v2.2.2 (2026-09-15)**: FIX `checkAuth` (`=== undefined → 0`), `dispatchAction` membuang `data._cacheBust`, penguatan `requireRole_`, test regresi `testRoleGateV222`. ⚠️ Fix `levelOf_` belum ikut terkirim di versi ini (test-nya mendahului fix-nya) — dilengkapi di v2.2.3.
>
> Changelog lengkap: [`backend/00_MIGRATION_v2.md`](backend/00_MIGRATION_v2.md).

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

## 4. Frontend CDN v2.7.0 Shared Library

### 4.1 Distribusi Aset CDN jsDelivr
Setiap aplikasi web cukup memuat tag berikut di file `Index.html`:

```html
<!-- ========== <head> : Pustaka pihak ketiga (WAJIB) ========== -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config = { darkMode: 'class' };</script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/vue@3.4.21/dist/vue.global.prod.js"></script>

<!-- Shared CDN Pemkab Trenggalek v2.6.5 — selalu pakai TAG VERSI, jangan @main -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.7.0/frontend/app-common.min.css">

<!-- Tema per aplikasi: override CSS variables di <style> lokal, mis.
     :root { --primary: #059669; --primary-dark: #047857; ... } -->

<!-- ========== Sebelum </body> : JS Shared CDN ========== -->
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.7.0/frontend/app-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.7.0/frontend/app-modules.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.7.0/frontend/app-core.min.js"></script>
```

> Salinan persis + aturan rilis: [`frontend/CDN_SNIPPET.md`](frontend/CDN_SNIPPET.md).

### 4.2 On-Demand Library Lazy Loading
Sejak v2.6.0, Frontend CDN mengeliminasi *render-blocking libraries*. Semua URL pustaka berat terpusat di registry `AppCore.libs` dengan **versi terkunci**, dimuat dinamis hanya saat dibutuhkan:

| Nama | Pustaka | Versi terkunci | Dipakai oleh |
|---|---|---|---|
| `chart` | Chart.js | 4.4.1 | `ensureChartLibrary()` |
| `xlsx` | SheetJS | 0.18.5 | `exportExcel()` |
| `jspdf` | jsPDF | 2.5.1 | `exportPDF()` |
| `autotable` | jsPDF-AutoTable | 3.8.2 | grup `pdf` |
| `pdflib` | pdf-lib | 1.17.1 | manual |
| `pdf` | grup jspdf+autotable | — | `exportPDF()` |

```javascript
// Di dalam methods Vue (instance buatan AppCore.create):
if (await this.loadLib('chart')) new Chart(ctx, {...});
await this.loadLib(['chart', 'xlsx']);        // beberapa sekaligus

// Dari luar instance Vue:
await AppCore.loadLib('xlsx');
```

### 4.3 Stale-While-Revalidate (SWR) SIMPEG Cache
Data Master SIMPEG (Pegawai, Jabatan, Unit Kerja) memiliki frekuensi perubahan rendah namun frekuensi baca tinggi. `app-core.min.js` mengimplementasikan strategi SWR:
1. **Langkah 1**: Render antarmuka secara instan (**0 ms**) menggunakan cache `localStorage`.
2. **Langkah 2**: Kirim panggilan *background refresh* asinkron ke server untuk memeriksa versi data terbaru.
3. **Langkah 3**: Jika server mengembalikan versi baru, perbarui data state dan simpan kembali ke storage tanpa mengganggu input pengguna.

> ⚠️ **Sejak v2.6.1 (fix bug produksi)**: seluruh akses storage WAJIB lewat helper `safeSession`/`safeLocal` dari `app-core` — akses `localStorage`/`sessionStorage` mentah melempar exception saat app dibuka di iframe SSO cross-site.

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
* `<app-stat-card>` *(baru v2.6.5)*: Kartu metrik KPI — props `title`, `value` (Number diformat `id-ID` otomatis), `icon` (default `fa-solid fa-chart-simple`), `color` (`emerald`/`sky`/`amber`/`purple`/`rose`), `subtext`.
* `<app-badge>`: Label status berwarna otomatis — props `status` (menerima sinonim: `disetujui/approved/aktif/menunggu/pending/proses/revisi/ditolak/inactive/definitif/plt/kosong`), `label` (timpa teks), `size` (`sm`/`md`), `icon` *(baru v2.6.5)*.
* `<app-modal>`: Dialog popup responsif berbasis animasi CSS.
* `<app-crud-table>`: Tabel data interaktif dengan pencarian cepat, pengurutan kolom, paginasi, tombol ekspor (Excel/PDF), dan aksi CRUD.
* `<app-filter-bar>` *(v2.7.0)*: Bar filter deklaratif (text/select/date) dengan v-model + emit `change`/`reset`.
* `<app-empty-state>` & `<app-skeleton>` *(v2.7.0)*: Keadaan kosong & loading pulse seragam (lines/cards/table).
* `<app-chart-bar>` / `<app-chart-doughnut>` *(v2.7.0)*: Chart kit bertema — Chart.js on-demand, warna & grid ikut dark mode.
* `<app-pegawai-picker>` *(v2.7.0)*: Picker searchable master SIMPEG berbasis cache SWR.
* Direktif `v-can` *(v2.7.0)*: Gating elemen UI by role sesi (fail-closed, cermin `levelOf_` CoreLib v2.2.3).
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
Hierarki role (`levelOf_`, fail-closed sejak **v2.2.3**): `admin` (3) > `verifikator` (2) > `user` (1) > `viewer` (0); role tak dikenal = 0. Setiap panggilan API divalidasi `checkAuth` + `requireRole_` di `02_CoreGateway.gs`:

```javascript
// Validasi di tingkat Handler Backend
function handleHapusLaporan(payload, session) {
  CoreLib.requireRole(session, ['SUPER_ADMIN', 'ADMIN']);
  // Eksekusi penghapusan data...
}
```

---

## 6. Panduan Pembuatan Aplikasi Baru (template `backend/Code.gs`)

> ⚠️ **UPDATE 2026-09-17:** template `backend/Code.gs` **DIHAPUS** — digantikan **starter-kit** (folder `/home/user/starter-kit/`, dicetak dari pola si-kompetensi/si-platform yang teruji; lihat README-nya untuk checklist app baru). Panduan di bawah dipertahankan sebagai referensi historis pola config-driven (`CoreLib.dispatchAction`).

### 6.1 Kerangka Awal
Tidak ada CLI generator — aplikasi baru dibuat manual dari dua cetakan di repo ini:

1. **Backend**: salin [`backend/Code.gs`](backend/Code.gs) ke proyek GAS aplikasi baru sebagai `Code.gs`. Isi `getAppConfig_()`: `appCode`, `appTitle`, `headersMap` (skema sheet), `pkFields`, `localHandlers` (endpoint bisnis khusus). Semua CRUD generik, auth SSO, dan setup otomatis sudah ditangani CoreLib (`dispatchAction`, `executeAppSetup`).
2. **Frontend**: salin blok `<head>`/`</body>` dari [`frontend/CDN_SNIPPET.md`](frontend/CDN_SNIPPET.md) ke `Index.html`, lalu bangun tampilan di `V_Layout.html` memakai komponen `<app-...>`.
3. **Library**: daftarkan CoreLib di `appsscript.json` (lihat 6.3).

### 6.2 Struktur Berkas Aplikasi Standar

Struktur nyata (contoh: repo `si-pelaporan`):

```text
si-cuti/
├── .clasp.json               # Konfigurasi target Script ID proyek GAS
├── .claspignore              # Whitelist berkas yang boleh di-push
├── package.json              # Script npm (clasp push/pull, set-script-id)
├── README.md                 # Dokumentasi operasional aplikasi
├── .github/workflows/
│   └── deploy-gas.yml        # CI/CD deploy saat push ke branch main
├── scripts/
│   └── set-script-id.js      # Helper isi .clasp.json otomatis
└── src/
    ├── appsscript.json       # Manifest V8 + dependensi library CoreLib
    ├── 01_ConfigAndBridge.gs # Konfigurasi konstanta & bridge CoreLib
    ├── 02_AppLogic.gs        # doGet, handleAction, custom handlers bisnis
    ├── 03_SeedData.gs        # Inisialisasi sheet & data awal
    ├── 99_TestSuite.gs       # Test suite aplikasi
    ├── Index.html            # Shell: CDN v2.6.5 + include V_Layout + mount Vue
    └── V_Layout.html         # SELURUH tampilan (arsitektur 2-berkas HTML)
```

### 6.3 Konfigurasi Script Properties
Buka Google Apps Script Editor ➡️ **Project Settings** ➡️ **Script Properties**, tambahkan key berikut:

| Key Property | Contoh Nilai | Deskripsi |
|---|---|---|
| `SPREADSHEET_ID` | `1abc12345xyz...` | ID Spreadsheet Google Sheets database lokal aplikasi |
| `MASTER_SPREADSHEET_ID` | `1simpeg_master_id...` | ID Spreadsheet Master SIMPEG Pemkab Trenggalek |
| `PLATFORM_API_URL` | `https://script.google.com/.../exec` | Endpoint URL deployment Web App SI-PLATFORM |
| `APP_CODE` | `SI-CUTI` | Kode aplikasi (dipakai `Code.gs`) |
| `APP_TITLE` | `SI-CUTI` | Judul aplikasi web |
| `ADMIN_EMAILS` | `a@x.go.id,b@x.go.id` | Whitelist role admin — **wajib diisi**, tidak ada default |
| `VERIFIKATOR_EMAILS` | `c@x.go.id` | Whitelist role verifikator |
| `ROOT_FOLDER_ID` dll. | *(opsional)* | Folder Drive; dibuat otomatis oleh `runSetup()`/`executeAppSetup` bila kosong |

Dan di `src/appsscript.json`, daftarkan library:

```json
"dependencies": {
  "libraries": [{
    "userSymbol": "CoreLib",
    "libraryId": "1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoKqpuucPJXgNZ9XBK06O7wgDkO",
    "version": "13"
  }]
}
```

> `developmentMode: true` = selalu pakai kode HEAD (untuk pengembangan, dipakai si-kompetensi).
> Tanpa `developmentMode` = terkunci di `version` (untuk produksi stabil, dipakai si-pelaporan).

---

## 7. Prosedur Deployment, CI/CD & Diagnostik

### 7.1 Deployment Google Apps Script
**Praktik berjalan (manual, aman untuk beginner)**: paste whole-file dari workspace/repo ke editor GAS (jangan find-replace manual), lalu unggah salinan ke GitHub via *Upload files* (jalur ini bebas kontaminasi CF challenge script).

**Alternatif otomatis via Clasp** (`.claspignore` repo `backend/` sudah memutihkan hanya 5 berkas library — `Code.gs` tidak akan pernah ter-push):
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

### 7.3 Menjalankan Automated Diagnostic Test Suite (CoreLib)
1. Buka editor Apps Script proyek **CoreLib**.
2. Jalankan **`testAll()`** (39 test; butuh Script Properties `SPREADSHEET_ID` + `MASTER_SPREADSHEET_ID`).
3. Hasil wajib: **`PASS: 38 / FAIL: 0 / SKIP: 1`** — SKIP = `testCacheIsolation` (normal, hanya jalan bila `TEST_SPREADSHEET_ID_B` di-set), dan `[PASS] testRoleGateV222` (regresi keamanan v2.2.3).
4. Diagnostik cepat: **`cekUpdateCorelib()`** — baris `❌ CoreLib is not defined` di dalamnya **normal** bila dijalankan di proyek CoreLib sendiri.
5. Catatan: menjalankan `runCoreTests()` langsung (tanpa `testAll`) menghasilkan `PASS: 21 / SKIP: 18` karena 18 test database butuh `ctx` — bukan pengganti `testAll()`.

---

## 8. Matriks Troubleshooting & Praktik Terbaik

| Gejala / Permasalahan | Kemungkinan Penyebab | Solusi yang Direkomendasikan |
|---|---|---|
| Data tertimpa saat update | Masih memakai indeks array terfilter lama | Pastikan menggunakan `CoreLib v2.2.3` yang mengadopsi `_row` physical index. |
| Role `viewer`/tak dikenal bisa akses fitur level user | `levelOf_` versi lama memakai fallback `\|\| 1` | Upgrade CoreLib ke **v2.2.3** (fail-closed) lalu simpan versi library & naikkan pin aplikasi. |
| Kolom di Spreadsheet bergeser/salah posisi | Array `setValues` diasumsikan urut | Pastikan proses simpan melewati `toAlignedRow_` yang membaca header baris 1. |
| Master SIMPEG lambat saat pertama kali dibuka | Cache browser kosong | SWR otomatis mengambil data lokal dan menyinkronkan di latar belakang; pastikan `MASTER_SPREADSHEET_ID` valid. |
| Tiket SSO menghasilkan error `INVALID_TICKET` | Tiket kedaluwarsa (> 5 menit) atau sudah dipakai | Arahkan pengguna kembali ke SI-PLATFORM untuk membuat tiket baru. |
| Ikon tidak muncul (kotak kosong) | Masih menggunakan class Phosphor (`ph ph-*`) | Ubah class ikon menjadi format Font Awesome 6.5.2 (`fa-solid fa-*`). |
| Bundle aplikasi berat saat initial load | Mengimpor XLSX / PDF / ChartJS di `<head>` | Hapus script berat dari `<head>`, gunakan `AppCore.loadLib('xlsx')` on-demand. |

---

## 🧭 Aturan "CoreLib First" + Contract-Check (C5, 2026-09-17)

**Aturan emas sebelum menulis kode baru di aplikasi mana pun:**

1. **Cari dulu di milik bersama.** Butuh fungsi util (normalisasi ID, parse tanggal, kode unik,
   cek role)? → CoreLib sudah punya. Butuh UI (tabel, modal, filter, chart, badge, sidebar)?
   → katalog komponen kit (`app-components.min.js` / `app-modules.min.js`) sudah punya.
   Duplikasi hanya sah untuk **logika bisnis** (mesin SKJ, JP 20/24, dsb.).
2. **Delegasi, jangan salin.** Wrapper lokal boleh, isinya wajib `return CoreLib.x(...)` —
   jangan pernah menyalin ulang badan fungsi milik CoreLib ke app.
3. **Kontrak = katalog.** Props komponen dan versi pin CDN adalah kontrak; perubahan harus
   aditif dan terdokumentasi di `frontend/README.md` + `CDN_SNIPPET.md`.
4. **Jalankan contract-check SEBELUM menyalin apa pun ke GAS:**
   ```bash
   python3 frontend-cdn/tools/contract_check.py
   ```
   Memeriksa: pin CDN per app · self-closing custom tag (=0) · tag kit tak dikenal ·
   Play CDN Tailwind (terlarang di app yang sudah Track D) · fungsi CoreLib-first tanpa
   delegasi · marker adopsi (ensureSheet/getDb/AppComponents) · kontaminasi Cloudflare.
   **Exit 0 = aman disalin; exit 1 = JANGAN deploy.**

---

## 📜 Kontak & Pemeliharaan
* **Pengelola Ekosistem**: Tim Pengembang TI — Dinas Komunikasi dan Informatika Kabupaten Trenggalek
* **Dokumentasi & Versi**: CoreLib v2.2.4 (GAS versi 14) • Frontend CDN v2.7.5 (diperbarui 2026-09-17)
* **Lisensi**: MIT License
