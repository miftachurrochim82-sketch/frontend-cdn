# Ekosistem Aplikasi Pemerintah Kabupaten Trenggalek
### Platform Single Sign-On (SSO), Master Data & Aplikasi Terpadu

Repositori ini adalah **master bersama** ekosistem: memuat pustaka frontend CDN (`frontend/`), **salinan sumber resmi library backend `CoreLib`** (`backend/`), dan seluruh dokumentasi arsitektur. Berbasis **Google Apps Script (GAS)**, **Vue 3**, dan **Tailwind CSS**.

---

## 📌 Versi Aktif

| Paket | Versi | Catatan |
|---|---|---|
| **CoreLib** (backend GAS library, `backend/`) | `v2.3.0` | ⭐ Util sadar-WIB: `todayIsoLocal()`, `dateKey10()` (fix bug UTC-vs-WIB `todayIso()` lama). Util publik: `paginate()`, `matchSearch()`. Aditif murni — perilaku lama tidak berubah. Pin GAS: **15**. |
| **Frontend CDN** (`frontend/`, satu versi untuk semua berkas) | `v2.8.1` | Patch konsistensi internal (T49): `AppCore.version`/`AppModules.version` diselaraskan ke `"2.8.0"`. Tag rilis `v2.8.1`, versi berkas tetap `"2.8.0"`. |

<details>
<summary>Riwayat versi sebelumnya</summary>

| Versi | Tanggal | Perubahan |
|---|---|---|
| CDN v2.8.1 | 2026-09-19 | FIX T49: `version` internal di `app-core.js` dan `app-modules.js` diselaraskan ke `"2.8.0"` (dari `"2.7.4"`). Tidak ada perubahan perilaku. |
| CoreLib v2.3.0 | 2026-09-19 | ⭐ C3: `todayIsoLocal_()` + `dateKey10_()` (fix bug UTC-vs-WIB). C1/C2: `paginate_()` + `matchSearch_()` (util publik). Wrapper publik `CoreLib.todayIsoLocal/dateKey10/paginate/matchSearch`. Verifikasi live: `testAll()` PASS 42 / FAIL 0 / SKIP 1. Versi 15. |
| CDN v2.8.0 | 2026-09-18 | F2: `.btn-icon`/`.btn-icon-danger`/`.btn-lg` promosi dari A0_Style si-lahar ke app-common.css (light+dark). F1: `<app-filter-bar>` dukung `span` 2..4 per filter. Harness: simulasi SSO 20/20 PASS. |
| CoreLib v2.2.4 | 2026-09-16/17 | Aditif murni (Batch 3 ROADMAP) — `CoreLib.ensureSheet`, `CoreLib.getDb`/`masterDbFor_`, opsi `decorate` pada delegasi `initDatabase`. Verifikasi live: PASS 38 / FAIL 0 / SKIP 1. |
| CDN v2.7.1–v2.7.5 | 2026-09-16/17 | Hotfix beruntun: prop `bare` chart; fix bootstrap `AppCore.loadLib`; picker `source`+nama; blur-race + `type=button` picker. |
| CDN v2.7.0 | 2026-09-16 | Gelombang 1 Batch 1: 6 komponen/fitur horizontal baru (filter-bar, empty-state, skeleton, chart kit, pegawai-picker, v-can, paginate helper, appCode). |
| CoreLib v2.2.3 | 2026-09-16 | ⭐ FIX keamanan `levelOf_` fail-closed (viewer/role tak dikenal = level 0, bukan 1). Terverifikasi live: `testAll()` PASS 38 / FAIL 0. |
| CoreLib v2.2.2 | 2026-09-15 | FIX `checkAuth` fail-closed (`=== undefined → 0`), `dispatchAction` buang `_cacheBust`, penguatan `requireRole_`, test regresi `testRoleGateV222`. ⚠️ Fix `levelOf_` belum ikut terkirim → dilengkapi di v2.2.3. |
| CoreLib v2.2.1 | 2026-09-15 | FIX `genUniqueCode_` (regex `reAnyNumber` buggy). |
| CDN v2.6.4 | 2026-09 | Satu nomor versi ekosistem untuk semua berkas; pelajaran tag-setelah-unggah. |
| CDN v2.6.0 | 2026-09 | Registry pustaka `AppCore.libs` + `loadLib()` on-demand (chart/xlsx/jspdf/autotable/pdflib). |

</details>

> Aplikasi konsumen memuat aset via jsDelivr dengan **tag versi** (`@v2.8.1`), bukan `@main`.
> Berkas `.min.*` dijamin sinkron dengan sumbernya oleh `npm run build`.

> **Catatan versi CDN**: sejak v2.8.1, ketiga bundle (`app-components`, `app-core`, `app-modules`) melaporkan `version: "2.8.0"` secara konsisten. Tag rilis (`v2.8.1`) mewakili nomor rilis di GitHub; `"2.8.0"` mewakili nomor versi berkas (generasi kode).

---

## 🗂️ Struktur Repositori

```text
frontend-cdn/
├── frontend/               # Pustaka CDN (CSS + Vue 3 components)
│   ├── app-common.css      # Design tokens & kelas util bersama (termasuk .btn-icon/.btn-lg v2.8.0)
│   ├── app-components.js   # <app-login> <app-sidebar> <app-header> <app-badge>
│   │                       # <app-stat-card> <app-modal> <app-crud-table>
│   │                       # <app-empty-state> <app-skeleton> <app-filter-bar>
│   │                       # <app-chart-bar> <app-chart-doughnut> <app-pegawai-picker>
│   ├── app-modules.js      # <app-profile> <app-settings>
│   ├── app-core.js         # AppCore: create(), safeSession/safeLocal, loadLib, SWR cache
│   ├── *.min.*             # Hasil build — yang dimuat aplikasi via jsDelivr
│   ├── README.md           # Katalog komponen & props lengkap
│   └── CDN_SNIPPET.md      # Snippet <head>/</body> standar untuk app baru
├── backend/                # ★ SALINAN SUMBER RESMI library GAS "CoreLib" v2.3.0
│   ├── 01_CoreFoundation.gs   # Engine DB Sheets, cache, tanggal ISO-8601, tanggal sadar-WIB (§7b), util publik (§11b)
│   ├── 02_CoreGateway.gs      # SSO auth, role guard, dispatchAction/router
│   ├── 03_CoreServices.gs     # CRUD generik, config service, app setup
│   ├── 99_CoreTest.gs         # Test suite (testAll = 43 test, PASS 42 + SKIP 1)
│   ├── appsscript.json        # Manifest library
│   ├── (Code.gs DIHAPUS 2026-09-17 — template app baru pindah ke starter-kit/)
│   ├── 00_MIGRATION_v2.md     # ★ Dokumen master CoreLib (changelog, rilis, kontrak, publik API)
│   └── .claspignore           # Hanya 5 file library yang boleh ter-push
├── tests/                  # Simulasi integrasi SSO (Node.js)
├── tools/contract_check.py # Penjaga kontrak sebelum salin ke GAS (exit 0 = aman)
├── ECOSYSTEM_GUIDE.md      # Panduan arsitektur lengkap ekosistem
├── ROADMAP_CDN.md          # Roadmap & log rilis CDN
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
│SI-KOMPETENSI │        │ SI-PELAPORAN │        │   SI-LAHAR   │
│ (Kompetensi) │        │ (Pelaporan)  │        │ (e-Kinerja)  │
└──────────────┘        └──────────────┘        └──────────────┘
        Semua aplikasi satelit memakai CoreLib (backend)
        + frontend-cdn (UI) yang sama dari repo ini.
```

---

## 📦 Daftar Proyek & Repositori Resmi

| Proyek | Deskripsi | Dependensi dari repo ini | Tautan |
|---|---|---|---|
| **`si-platform`** | Portal SSO, User Management, Role RBAC, Storage & Audit Log | CDN `@v2.7.5` (CSS + JS kit; Track A–E selesai) | [GitHub](https://github.com/miftachurrochim82-sketch/si-platform) |
| **`si-kompetensi`** | Riwayat & Analisis Pengembangan Kompetensi ASN | CDN `@v2.7.5` + CoreLib pin 12 (devMode, auto HEAD) | [GitHub](https://github.com/miftachurrochim82-sketch/si-kompetensi) |
| **`si-pelaporan`** | Manajemen & Verifikasi Pelaporan Kinerja ASN | CDN `@v2.7.5` + CoreLib pin 13 (pinned = v2.2.3) | [GitHub](https://github.com/miftachurrochim82-sketch/si-pelaporan) |
| **`si-lahar`** | e-Kinerja Harian ASN: rencana, realisasi, verifikasi, Paspor Kinerja | CDN `@v2.8.1` + CoreLib pin 15 (`v2.3.0`) | [GitHub](https://github.com/miftachurrochim82-sketch/si-lahar) |
| **`frontend-cdn`** | Master bersama: CDN frontend + sumber CoreLib | — | repo ini |

---

## 🚀 Keunggulan Arsitektur Include Modular (standar berlaku)

1. **`Index.html` = shell tipis**: pin CDN (tag versi), identitas tema per aplikasi, dan daftar include modul **satu tingkat** — tanpa logika bisnis.
2. **View & logika terpisah per modul**: halaman = modul `V_*.html`, logika = modul `J_*.html`; pola **seragam lintas aplikasi** (standar si-lahar) — masalah pada "1 file yang hampir sama" antar app jadi mudah ditelusuri.
3. **Aman untuk Apps Script**: semua include satu tingkat dari `Index.html` (tanpa *nested include* / *recursion error*); struktur berkas editor GAS tetap ramping, nyaman dikelola dari browser tablet.
4. **Pustaka terpusat via CDN jsDelivr**: semua aplikasi berbagi `<app-sidebar>`, `<app-header>`, `<app-badge>`, `<app-stat-card>`, `<app-login>`, `<app-modal>`, `<app-crud-table>`, `<app-profile>`, `<app-settings>`.
5. **Backend terpusat via CoreLib**: satu library GAS untuk auth SSO, role guard, CRUD generik, dan test suite — aplikasi satelit tinggal konfigurasi.

> **Catatan warisan**: si-pelaporan masih memakai pola lama 2-berkas (`V_Layout.html` = seluruh tampilan). Itu utang konvergensi yang terdokumentasi, **bukan** standar untuk aplikasi baru.

---

## 📚 Dokumentasi

| Dokumen | Isi |
|---|---|
| [`ECOSYSTEM_GUIDE.md`](ECOSYSTEM_GUIDE.md) | Panduan arsitektur lengkap (backend, frontend, SSO, deployment, troubleshooting) |
| [`backend/00_MIGRATION_v2.md`](backend/00_MIGRATION_v2.md) | **Master CoreLib**: changelog v2.0→v2.3.0, prosedur rilis, kontrak keamanan, publik API |
| [`frontend/README.md`](frontend/README.md) | Katalog komponen & props |
| [`frontend/CDN_SNIPPET.md`](frontend/CDN_SNIPPET.md) | Snippet pemuatan CDN standar untuk aplikasi baru |
| [`ROADMAP_CDN.md`](ROADMAP_CDN.md) | Roadmap & log rilis CDN/CoreLib |
