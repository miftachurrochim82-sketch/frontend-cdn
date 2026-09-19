# Ekosistem Aplikasi Pemerintah Kabupaten Trenggalek
### Platform Single Sign-On (SSO), Master Data & Aplikasi Terpadu

Repositori ini adalah **master bersama** ekosistem: memuat pustaka frontend CDN (`frontend/`), **salinan sumber resmi library backend `CoreLib`** (`backend/`), dan seluruh dokumentasi arsitektur. Berbasis **Google Apps Script (GAS)**, **Vue 3**, dan **Tailwind CSS**.

---

## 📌 Versi Aktif

| Paket | Versi | Catatan |
|---|---|---|
| **CoreLib** (backend GAS library, `backend/`) | `v2.2.4` | ⭐ FIX keamanan `levelOf_` fail-closed (viewer/role tak dikenal = level 0, bukan 1). Terverifikasi live 2026-09-17: `testAll()` PASS 38 / FAIL 0. |
| **Frontend CDN** (`frontend/`, satu versi untuk semua berkas) | `v2.8.0` | 13 komponen + `.btn-icon`/`.btn-icon-danger`/`.btn-lg`, filter-bar `span`, chart kit, pegawai-picker, dll. |

<details>
<summary>Riwayat versi sebelumnya</summary>

| Versi | Tanggal | Perubahan |
|---|---|---|
| CDN v2.8.0 | 2026-09-18 | Gelombang 1 Batch 4: Promosi `.btn-icon`/`.btn-icon-danger`/`.btn-lg` dari A0_Style si-lahar ke app-common.css; `<app-filter-bar>` dukung `span` (2..4). |
| CoreLib v2.2.4 | 2026-09-16/17 | Aditif murni (Batch 3 ROADMAP) — `CoreLib.ensureSheet`, `CoreLib.getDb`/`masterDbFor_`, opsi `decorate` pada delegasi `initDatabase`. |
| CDN v2.7.0 | 2026-09-16 | Gelombang 1 Batch 1: 6 komponen/fitur horizontal baru (filter-bar, empty-state, skeleton, chart kit, pegawai-picker, v-can, paginate helper, appCode). |
| CoreLib v2.2.3 | 2026-09-16 | ⭐ FIX keamanan `levelOf_` fail-closed. |
| CoreLib v2.2.2 | 2026-09-15 | FIX `checkAuth` fail-closed (`=== undefined → 0`), `dispatchAction` buang `_cacheBust`, penguatan `requireRole_`. |
| CoreLib v2.2.1 | 2026-09-15 | FIX `genUniqueCode_` (regex `reAnyNumber` buggy). |
| CDN v2.6.4 | 2026-09 | Satu nomor versi ekosistem untuk semua berkas; pelajaran tag-setelah-unggah. |
| CDN v2.6.0 | 2026-09 | Registry pustaka `AppCore.libs` + `loadLib()` on-demand (chart/xlsx/jspdf/autotable/pdflib). |

</details>

> Aplikasi konsumen memuat aset via jsDelivr dengan **tag versi** (`@v2.8.0`), bukan `@main`.
> Berkas `.min.*` dijamin sinkron dengan sumbernya oleh `npm run build`.

---

## 🗂️ Struktur Repositori

```text
frontend-cdn/
├── frontend/               # Pustaka CDN (CSS + Vue 3 components)
│   ├── app-common.css      # Design tokens & kelas util bersama
│   ├── app-components.js   # <app-login> <app-sidebar> <app-header> <app-badge>
│   │                       # <app-stat-card> <app-modal> <app-crud-table>
│   ├── app-modules.js      # <app-profile> <app-settings>
│   ├── app-core.js         # AppCore: create(), safeSession/safeLocal, loadLib, SWR cache
│   ├── *.min.*             # Hasil build — yang dimuat aplikasi via jsDelivr
│   ├── README.md           # Katalog komponen & props lengkap
│   └── CDN_SNIPPET.md      # Snippet <head>/</body> standar untuk app baru
├── backend/                # ★ SALINAN SUMBER RESMI library GAS "CoreLib" v2.2.4
│   ├── 01_CoreFoundation.gs   # Engine DB Sheets, cache, tanggal, helper SIMPEG
│   ├── 02_CoreGateway.gs      # SSO auth, role guard, dispatchAction/router
│   ├── 03_CoreServices.gs     # CRUD generik, config service, app setup
│   ├── 99_CoreTest.gs         # Test suite (testAll = 39 test)
│   ├── appsscript.json        # Manifest library
│   ├── (Code.gs DIHAPUS 2026-09-17 — template app baru pindah ke starter-kit/)
│   ├── 00_MIGRATION_v2.md     # ★ Dokumen master CoreLib (changelog, rilis, kontrak)
│   └── .claspignore           # Hanya 5 file library yang boleh ter-push
├── tests/                  # Simulasi integrasi SSO (Node.js)
├── ECOSYSTEM_GUIDE.md      # Panduan arsitektur lengkap ekosistem
└── package.json            # Skrip build (npm run build)
```

> **Penting**: yang ada di proyek GAS `CoreLib` HANYA `appsscript.json` + `01`/`02`/`03`/`99`.
> `00_MIGRATION_v2.md` sengaja hanya hidup di GitHub. Template app baru = **starter-kit** (menggantikan `Code.gs`, 2026-09-17).

---

## 🏛️ Arsitektur Ekosistem Terpadu

```text
┌──────────────────────────────────────────────────────────────┐
│             SI-PLATFORM (Portal SSO & Master Hub)            │
│           - Menerbitkan & memvalidasi Tiket SSO              │
│           - Database Master: USERS, ROLES, APPLICATIONS      │
│           - File Storage & Notifikasi Terpusat               │
└──────────────────────────────┬───────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│SI-KOMPETENSI │        │ SI-PELAPORAN │        │   (app baru  │
│ (Kompetensi) │        │ (Pelaporan)  │        │ via starter)│
└──────────────┘        └──────────────┘        └──────────────┘
        Semua aplikasi satelit memakai CoreLib (backend)
        + frontend-cdn (UI) yang sama dari repo ini.
```

---

## 📦 Daftar Proyek & Repositori Resmi

| Proyek | Deskripsi | Dependensi dari repo ini | Tautan |
|---|---|---|---|
| **`si-platform`** | Portal SSO, User Management, Role RBAC, Storage & Audit Log | `app-common.css` `@v2.6.4` (CSS only) | [GitHub](https://github.com/miftachurrochim82-sketch/si-platform) |
| **`si-kompetensi`** | Riwayat & Analisis Pengembangan Kompetensi ASN | CDN `@v2.6.5` + CoreLib v12 (`developmentMode: true`) | [GitHub](https://github.com/miftachurrochim82-sketch/si-kompetensi) |
| **`si-pelaporan`** | Manajemen & Verifikasi Pelaporan Kinerja ASN | CDN `@v2.6.5` + CoreLib v13 (pinned = v2.2.3) | [GitHub](https://github.com/miftachurrochim82-sketch/si-pelaporan) |
| **`frontend-cdn`** | Master bersama: CDN frontend + sumber CoreLib | — | repo ini |

---

## 🚀 Keunggulan Arsitektur 2-Berkas HTML (Single Include)

1. **Ringan & Bebas Bug di Apps Script**:
   - GAS hanya memproses **satu kali include** (`<?!= include('V_Layout'); ?>`) di dalam `Index.html`.
   - Menghilangkan risiko *nested include* / *recursion error*.
2. **Nyaman dikelola di browser tablet**: struktur berkas editor GAS tetap ramping.
3. **Pustaka terpusat via CDN jsDelivr**: semua aplikasi berbagi `<app-sidebar>`, `<app-header>`, `<app-badge>`, `<app-stat-card>`, `<app-login>`, `<app-modal>`, `<app-crud-table>`, `<app-profile>`, `<app-settings>`.
4. **Backend terpusat via CoreLib**: satu library GAS untuk auth SSO, role guard, CRUD generik, dan test suite — aplikasi satelit tinggal konfigurasi.

---

## 📚 Dokumentasi

| Dokumen | Isi |
|---|---|
| [`ECOSYSTEM_GUIDE.md`](ECOSYSTEM_GUIDE.md) | Panduan arsitektur lengkap (backend, frontend, SSO, deployment, troubleshooting) |
| [`backend/00_MIGRATION_v2.md`](backend/00_MIGRATION_v2.md) | **Master CoreLib**: changelog v2.0→v2.2.3, prosedur rilis, kontrak keamanan |
| [`frontend/README.md`](frontend/README.md) | Katalog komponen & props |
| [`frontend/CDN_SNIPPET.md`](frontend/CDN_SNIPPET.md) | Snippet pemuatan CDN standar untuk aplikasi baru |
