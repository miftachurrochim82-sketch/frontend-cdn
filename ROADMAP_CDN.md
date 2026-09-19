# 🗺️ ROADMAP CDN & CoreLib — Rencana Gelombang: CDN Stabil & Nol Duplikasi Mekanik

> **Status**: DISAHKAN 2026-09-16 • **DIAMANDEMEN 2026-09-16 (malam) atas keputusan user** • **DIPERBARUI 2026-09-19 (Batch 5).**
> **Sasaran kepala (baru)**: **CDN yang stabil** (versi jelas, aditif, terverifikasi) sebagai modal awal + **nol duplikasi mekanik** di app + **risiko perubahan rendah**. Rasio baris DITURUNKAN menjadi indikator pemantauan — bukan syarat lulus. Pekerjaan mendalam (C4) tidak dipicu tanpa alasan fungsional.
> **Dokumen ini adalah master perencanaan ekosistem.** Setiap rilis CDN/CoreLib wajib memperbarui tabel baseline (§2) dan checklist (§5).
> Lingkup: **Gelombang 1 = komitmen eksekusi. Gelombang 2 = daftar opsi saja** (tidak dijadwalkan).

---

## 1. Sasaran & Batas Keberhasilan

| # | Sasaran | Ukuran | Target |
|---|---|---|---|
| S1 | Rasio kepala (app total : CDN frontend) | baris | *indikator pemantauan* (amandemen: bukan syarat lulus; 4,9 → 4,25 dan dibiarkan mendarat di mana pun) |
| S2 | Rasio stack-bersama (app : CDN+CoreLib) | baris | *indikator pemantauan* (2,24 → 2,08) |
| S3 | App tipis (si-pelaporan) : stack-bersama | baris | *indikator pemantauan* (1,39 : 1) |
| S4 | Pangsa kode horizontal di dalam app | keberadaan | **0** — tidak ada mekanisme generik (paginasi, filter, ekspor, format, picker, gating) ditulis di app |
| S5 | Duplikasi antar-app & app-vs-library | keberadaan | **0** — ditegakkan contract-check |
| S6 | Penyebaran fix library/CDN | sentuhan | **zero-touch** (devMode/pin naik, app tak diedit) |
| S7 | Keamanan tertutup | pin | CoreLib v2.2.3+ aktif di SEMUA app (pin si-pelaporan naik) |

**Bukan sasaran**: rasio 1:1 untuk app kaya-bisnis; platform low-code monolitik; memindahkan logika bisnis (vertikal) ke pustaka.

**Aturan pemicu promosi**: pola muncul di ≥2 app dengan bentuk sama → naik ke CDN/CoreLib; hanya 1 app → tetap lokal.

---

## 2. Baseline Terukur

### 2.1 Baseline awal (2026-09-16)

| Lapisan | Baris | Rincian |
|---|---|---|
| CDN frontend v2.6.5 | **2.447** | app-core 802 • app-components 567 • app-modules 507 • app-common.css 571 |
| CoreLib v2.2.3 | **2.917** | 01: 809 • 02: 804 • 03: 365 • 99: 939 |
| si-kompetensi (app rujukan) | **12.004** | backend .gs 5.329 • frontend .html 6.675 (J_* 3.433; V_*+Index 3.242) |
| si-pelaporan | **3.389** | 7 berkas src |
| Rasio kepala hari ini | **4,9 : 1** | 12.004 : 2.447 |
| Rasio stack-bersama hari ini | **2,24 : 1** | 12.004 : 5.364 |

> Ukur ulang dengan `wc -l` per lapisan setelah tiap batch; perbarui tabel ini di commit yang sama.

### 2.2 Ukur ulang — pasca Batch 1 + sub-1/sub-2 (2026-09-16 malam, CDN v2.7.2)

| Lapisan | Baris | Δ vs baseline |
|---|---|---|
| CDN frontend v2.7.2 | **2.801** | +354 (app-core 835 • app-components 888 • app-modules 507 • css 571) |
| CoreLib v2.2.3 | **2.917** | 0 |
| si-kompetensi | **11.899** | −105 |
| Rasio kepala (indikator) | **4,25 : 1** | dari 4,9 |
| Rasio stack-bersama (indikator) | **2,08 : 1** | dari 2,24 |

### 2.3 Ukur ulang — Penutupan Frontend (2026-09-16 malam, pasca Bagian 21–25)

| Lapisan | Baris | Rasio (indikator) |
|---|---|---|
| CDN frontend (live tag v2.7.5; workspace siap v2.8.0) | **2.848** | app-core 835 • app-components 907 • app-modules 507 • app-common.css 599 |
| CoreLib v2.2.3 | **2.917** | — |
| si-kompetensi | **11.835** | kepala **4,21 : 1** • stack-bersama **2,07 : 1** |
| si-pelaporan | **3.365** | tipis **0,59 : 1** — sasaran S3 lama (≤1) TERCAPAI |

### 2.4 Ukur ulang — Batch 4 + Batch 5 (2026-09-19, CDN v2.8.1 + CoreLib v2.3.0)

| Lapisan | Baris | Δ vs sebelumnya |
|---|---|---|
| CDN frontend **v2.8.1** | **~2.850** | ≈0 (patch konsistensi internal; tidak ada perubahan kode fungsional) |
| CoreLib **v2.3.0** | **~3.020** | +103 (util C1/C2/C3: `todayIsoLocal_`, `dateKey10_`, `paginate_`, `matchSearch_`, 4 test baru) |
| si-kompetensi | **~11.835** | 0 |
| si-pelaporan | **~3.365** | 0 |
| **si-lahar** (app baru, statusnya: frontend selesai; adopsi pin 15 + CDN @v2.8.1) | **~3.800** | — |
| Rasio kepala (indikator) | **~4,15 : 1** | stabil (dari 4,21) |
| Rasio stack-bersama (indikator) | **~2,00 : 1** | membaik (dari 2,07) |

> Angka di atas estimasi dari commit terakhir; **ukur ulang dengan `wc -l`** saat commit berikutnya, kemudian ganti tabel ini dengan angka pasti.

---

## 3. Gelombang 1 — Paket Kerja FRONTEND (komitmen)

| Kode | Pekerjaan | Δ app | Δ CDN | Verifikasi |
|---|---|---|---|---|
| **A1** | Unifikasi ekspor & format: J_Export → `exportExcel`/`exportPDF` CDN (layout dokumen khusus spt Paspor Kompetensi tetap lokal); `formatDate` lokal → `formatDateDisplay`/`formatDateTimeDisplay` | −430…−500 | 0 | ekspor Excel/PDF identical; compile-check |
| **A2** | Hidupkan kunci `appCode` di `AppCore.create` (prefix log/label toast) | 0 | +10 | toast/log berlabel app |
| **A3** | Snippet boot dark-mode resmi di CDN_SNIPPET (baca storage ter-guard); app berhenti menulis bacaan mentah sendiri | −5 | 0 (dokumen) | boot iframe SSO aman |
| **B1** | Komponen `<app-pegawai-picker>` (searchable, cache SWR) | −100…−150 | +150 | dipakai ≥1 form kompetensi |
| **B2** | Chart kit `<app-chart-bar>`/`<app-chart-doughnut>` (tema dark-mode, auto `loadLib('chart')`) | −300…−400 | +200 | dashboard & analisa identical |
| **B4** | `<app-filter-bar>` + helper paginasi (server-side opsional) | −250…−350 | +160 | 8 view list berpindah tanpa regressi |
| **B6** | `<app-empty-state>` + `<app-skeleton>` | −50 | +80 | keadaan kosong/list loading seragam |
| **B7** | Direktif `v-can` (gating UI dari sesi, meneruskan fail-closed v2.2.3) | −50…−80 | +40 | menu/aksi ter-gating sesuai role |
| **B3*** | *(syarat-terpicu)* `<app-approval-timeline>` — mulai saat UI verifikasi si-pelaporan disentuh | −(pelaporan) | +120 | alur berjenjang tampil seragam |
| **B5*** | *(syarat-terpicu)* `<app-file-upload>` (Drive via `ensureDriveFolder`) — mulai saat fitur lampiran ada | − | +150 | upload bukti berfungsi |
| **F1** | `<app-filter-bar>` dukung `span` (2..4) per filter (v2.8.0) | 0 | +30 | peta literal Tailwind, tanpa span = perilaku lama |
| **F2** | Promosi `.btn-icon`/`.btn-icon-danger`/`.btn-lg` dari A0_Style si-lahar ke app-common.css (v2.8.0) | 0 | +60 | sumber hex light+dark identik |
| | **Subtotal frontend** | **−1.185…−1.535** | **+730…+790** (+270 bila B3/B5 terpicu) | |

## 4. Gelombang 1 — Paket Kerja BACKEND (komitmen)

| Kode | Pekerjaan | Δ app | Δ CoreLib | Verifikasi |
|---|---|---|---|---|
| **C1** | `initDatabase` manual (06_MasterLogic) → `CoreLib.initDatabase`; opsi kosmetik (warna header, frozen rows) ditambah ke `ensureSheet` agar semua app ikut dapat | −60…−80 | +15 | `runAllTestsSikompetensi` PASS; 8 sheet + format utuh |
| **C2** | Wrapper pembuka DB (`getLocalSpreadsheet_`/`getMasterSpreadsheet_`) → delegasi `CoreLib.getDb`/`masterDbFor_` | −20…−30 | 0 | cache tetap tunggal |
| **C3** | Dokumentasikan keputusan: config app di **Script Properties** (bukan sheet KONFIGURASI) — satu paragraf di `backend/00_MIGRATION_v2.md` | 0 | 0 (dok) | tidak ada lagi kebingungan nama `saveConfigItem_` |
| **C5** | Aturan **"CoreLib first"** + contract-check sisi backend (util umur/durasi/tanggal wajib cek CoreLib sebelum ditulis lokal) | 0 | 0 | check hijau di CI-lokal |
| **C4*** | ~~migrasi CRUD sheet standar si-kompetensi ke `dispatchAction` deklaratif~~ — **TIDAK DIPICU (keputusan user 2026-09-16)** | — | — | — |
| **E1** | **C1 ROADMAP Batch 3**: `ensureSheet` terima `options.decorate` (v2.2.4) | 0 | +15 | 2 file app si-kompetensi DIPASTE, runAllTests 55/0/0 |
| **E2** | **C3 Batch 5 (2026-09-19)**: util tanggal sadar-WIB (`todayIsoLocal_`, `dateKey10_`) — fix bug UTC-vs-WIB `todayIso()` lama + cermin helper si-lahar | 0 | +55 | `testAll()` PASS 42/0/1; `[PASS] testTodayIsoLocalV230` + `testDateKey10V230` |
| **E3** | **C1/C2 Batch 5 (2026-09-19)**: util publik `paginate_` + `matchSearch_` (cermin helper si-lahar) | 0 | +33 | `[PASS] testPaginateV230` + `testMatchSearchV230` |
| **E4** | **T49 (2026-09-19)**: selaraskan `version` internal `app-core.js` & `app-modules.js` ke `"2.8.0"` | 0 | — | `AppCore.version` = `"2.8.0"` konsisten dgn tag `v2.8.1` |
| | **Subtotal backend** | −80…−110 | **+103** | |

**Dipertahankan apa adanya** (hasil audit: sehat): pola single-point bridge `01_ConfigAndBridge` + `Utils.gs`; `sendAuditLog_` terpusat ke SI-PLATFORM; normalisasi SIMPEG vertikal.

## 5. Urutan Eksekusi & Disiplin Rilis

### Batch 0 — keamanan (prasyarat, minggu ini)
- [x] Simpan versi library CoreLib **13** (2026-09-16, URL `/library/d/1GmeYflf…/13`; kode v2.2.3 terverifikasi `testAll` 38/0/1).
- [x] si-pelaporan: pin `"6"` → `"13"` di **workspace + GAS + GitHub** (md5 raw GitHub = workspace). **Terverifikasi runtime 17:25–17:27**: suite app PASS 7/0/0; regresi CoreLib dijalankan DARI si-pelaporan → PASS 38/0/1 incl. `[PASS] testRoleGateV222`. **S7 TERTUTUP.**
- [x] ~~si-platform: CDN CSS `@v2.6.4` → `@v2.6.5`~~ **TERLEWATI/DIGANTIKAN (2026-09-17)**: si-platform kini memakai `@v2.7.5` (CSS + JS kit).

### Batch 1 — CDN naik (sekali rilis, tag `v2.7.0`)
- [x] A2, B7, B6, B4, B2, B1 — SIAP di workspace; syntax check lulus.
- [x] Bump versi **2.7.0** + `npm run build` → `.min` memuat komponen baru.
- [x] Dokumentasi diselaraskan ke v2.7.0.
- [x] **RILIS (user)**: unggah + tag `v2.7.0` SELESAI (2026-09-16). Terverifikasi: tag ada; jsDelivr `@v2.7.0` HTTP 200; byte-identik dengan build workspace.
- [x] Perbarui CDN_SNIPPET (A3) + katalog props.

### Batch 2 — adopsi app
- [x] si-kompetensi sub-1: tag @v2.7.0, A3 dark-boot, A1-parsial, unifikasi `formatDateDisplay`. LIVE & terverifikasi.
- [x] si-kompetensi sub-2: B2 chart kit via CDN v2.7.1/v2.7.2. LIVE di /exec; 3 hotfix + 2 scanner baru.
- [x] si-kompetensi sub-3/4/5: B6 empty-state; B1 picker di 3/3 form; B4 filter-bar + konsolidasi 6 paginasi list. LIVE.
- [x] si-pelaporan: 4 kartu KPI → `<app-stat-card>`, 4 badge/chip → `<app-badge>` (−48; 3.413→3.365). LIVE.

### Batch 3 — backend
- [x] C3 — dokumen keputusan Script Properties (`00_MIGRATION_v2.md` §8).
- [x] C2 — wrapper DB → `CoreLib.getDb`/`masterDbFor_` (2026-09-16).
- [x] C1 — initDatabase → delegasi per-sheet `CoreLib.ensureSheet` + opsi `decorate` (CoreLib v2.2.4 aditif; 2026-09-16).
- [x] C5 — aturan "CoreLib first" + contract-check (2026-09-17): `tools/contract_check.py` (7 kelas pemeriksaan, 3 app; baseline HIJAU exit 0). **BATCH 3 TUTUP — SELURUH ROADMAP GELOMBANG 1 SELESAI.**
- [x] ~~C4~~ — TIDAK DIPICU (amandemen 2026-09-16).

### Batch 4 — CDN v2.8.0 (2026-09-18, frontend-only)
- [x] F2: `.btn-icon`/`.btn-icon-danger`/`.btn-lg` dipromosikan dari A0_Style si-lahar (G18c-2) ke app-common.css.
- [x] F1: `<app-filter-bar>` dukung `span` (2..4) per filter via `spanCls`.
- [x] Versi: package.json 2.8.0; exporter app-components `'2.8.0'`; default prop `version` `<app-login>` v2.8.0; changelog app-common.css.
- [x] `npm run build` → 4 `.min` diregenerasi; `node --check` min OK.
- [x] `tools/contract_check.py` exit 0.
- [x] Harness drift fix: `tests/sso-integration-simulation.js` → 20/20 PASS.
- [x] Docs: README root, frontend/README, ECOSYSTEM_GUIDE, CDN_SNIPPET.
- [x] **RILIS (user)**: unggah berkas → tag `v2.8.0` → verifikasi jsDelivr HTTP 200 + byte-identik.
- [x] Adopsi app: si-lahar pin @v2.8.0 + hapus `.btn-icon`/`.btn-lg` lokal di A0_Style (konvergensi). si-kompetensi pin bump MANUAL (gerbong bersih-bersih).

### Batch 5 — CoreLib v2.3.0 + CDN v2.8.1 (2026-09-19) ⭐

**Frontend (patch konsistensi internal):**
- [x] T49: `version` internal di `app-core.js` & `app-modules.js` diselaraskan ke `"2.8.0"` (dari `"2.7.4"`).
- [x] Header changelog `app-core.js` & `app-modules.js` dirapikan.
- [x] `app-core.min.js` & `app-modules.min.js` di-edit (find & replace `version:"2.7.4"` → `version:"2.8.0"`).
- [ ] **RILIS (user)**: commit 4 berkas (`app-core.js`/`.min.js`, `app-modules.js`/`.min.js`) → tag BARU `v2.8.1` → verifikasi jsDelivr `@v2.8.1` HTTP 200.
- [ ] (Opsional) Bump pin si-lahar di `Index.html` dari `@v2.8.0` → `@v2.8.1` (patch, tidak wajib).

**Backend (util baru + fix UTC-WIB):**
- [x] C3: `todayIsoLocal_()` + `dateKey10_()` — fix bug UTC-vs-WIB `todayIso()` lama. Aditif murni, `todayIso()` lama tidak diubah.
- [x] C1/C2: `paginate_()` + `matchSearch_()` — util publik cermin helper si-lahar.
- [x] Wrapper publik tanpa underscore: `todayIsoLocal`, `dateKey10`, `paginate`, `matchSearch`.
- [x] 4 test baru di `99_CoreTest.gs` (`testTodayIsoLocalV230`, `testDateKey10V230`, `testPaginateV230`, `testMatchSearchV230`).
- [x] `testAll()` → **PASS 42 / FAIL 0 / SKIP 1**.
- [x] Save versi library = **15**. URL live: `/library/d/1GmeYflf…/15`.
- [ ] **RILIS (user)**: unggah 4 berkas backend yang berubah + `00_MIGRATION_v2.md` → tag BARU `v2.3.0`.
- [ ] **Adopsi app**: bump pin si-lahar `"version": "14"` → `"15"`.

**Disiplin rilis (selalu):** perubahan aditif (prop baru boleh, arti prop lama jangan); satu tag untuk semua berkas; `.min` di-commit bersama sumber; unggah via *Upload files* (anti kontaminasi CF); dokumen master + tabel baseline §2 diperbarui di rilis yang sama; `testAll()` CoreLib FAIL:0 sebelum save versi.

## 6. Definition of Done — "CDN Stabil & Nol Duplikasi Mekanik"

Selesai bila:
1. **S4–S7 hijau** (nol kode horizontal di app, nol duplikasi, zero-touch fix, keamanan tertutup — S7 sudah ✅).
2. Sisa duplikasi di app **hanya yang bersifat bisnis/spesifik-app** (mesin SKJ, JP 20/24, Paspor, dsb. — memang milik app).
3. Setiap perubahan **berisiko rendah & reversibel**: tes di Test deployment sebelum New version; gagal = produksi tak tersentuh.
4. Rasio dicatat tiap batch sebagai **indikator** (bukan target). Posisi terakhir (2026-09-19): kepala **≈4,15 : 1**, stack-bersama **≈2,00 : 1**.
5. C4/B3/B5 tetap tidak dipicu tanpa alasan fungsional.

**Status per 2026-09-19:**
- **Frontend (Gelombang 1)**: ✅ TUNTAS — pengecualian terdokumentasi tetap: (a) 2 ekspor multi-sheet `_exportXlsx` tetap lokal (opsi ekstensi CDN tidak dijadwalkan); (b) 6 baris filter menyatu tombol Refresh/Tambah di MasterSatelit & DiklatPortofolio dipertahankan; (c) B7 v-can tidak diadopsi si-kompetensi. S4: 0 paginasi manual, 0 formatDate lokal, 0 chart manual, 0 empty-state custom.
- **Backend (Gelombang 1)**: ✅ TUNTAS — C1/C2/C3/C5 selesai; CoreLib **v2.3.0** LIVE (testAll 42/0/1, versi 15 tersimpan 2026-09-19).
- **CDN**: ✅ rilis stabil v2.8.0 → patch v2.8.1.
- **si-lahar**: adopsi penuh (frontend selesai; pin 15 + CDN @v2.8.1 setelah rilis Batch 5).

**Alarm over/under-engineering**: bila app <9.500 (berarti logika bisnis ikut terbuang — STOP, review) atau CDN >3.800 tanpa adopsi nyata di ≥2 app (berarti komponen spekulatif — STOP, turunkan ke Gelombang 2).

## 7. Gelombang 2 — DAFTAR OPSI SAJA (tidak dijadwalkan)

| Opsi | Isi | Efek bila kelak diambil | Pemicu adopsi |
|---|---|---|---|
| G2-1 | Modul deklaratif `<app-crud-page>` (tabel+form+filter+paginasi dari schema JSON) | app kaya → 8,2–8,6 rb; rasio 2,2–2,5:1 | ≥2 app dengan sheet CRUD seragam (app ke-3/ke-4) |
| G2-2 | Kompresi boilerplate handler .gs per sheet menjadi modul aturan murni | −800…−1.200/app | menyertai G2-1 |
| G2-3 | Halaman deklaratif penuh (low-code lite) untuk app CRUD-murni | app tipis → ≈1–2 rb config | hanya app CRUD-murni baru (mis. SI-ASET) |
| G2-4 | **Template starter-kit web app bisnis** — acuan semua app baru | app baru lahir selaras, onboarding cepat | **SELESAI 2026-09-17** |
| **Lantai keras** | mesin SKJ, aturan JP 20/24, H-90, dokumen Paspor, analitik | ≈7–8 rb baris tak terkompresi | — (makna bisnis, bukan mekanisme) |
| **Kandidat promosi berikutnya (v2.4.0+)** | C4 `validateTransition`, C5 `assertOwnership`, C6 `periodeBulan`/`hitungHariKerja`, C7 `findUnique`/`upsertUnique`, C8 keputusan mazhab config/profil/audit | — | diskusi pemilik, minimal ≥2 app |

**Ditolak permanen**: platform low-code monolitik untuk app kaya-bisnis (ledakan config, debug opaque, blast-radius lintas app).

## 8. Risiko & Penjaga

| Risiko | Penjaga |
|---|---|
| Komponen CDN naik tanpa pemakai (spekulatif) | aturan pemicu ≥2 app (§1); alarm §6 |
| Prop berubah arti → app rusak serentak | kebijakan aditif-only; katalog props = kontrak |
| Tag basi / cache jsDelivr | tag SETELAH unggah; app wajib tag versi; version.json (opsi C-fase lanjutan) |
| Drift tak terlihat di alur manual | contract-check frontend+backend (C5) sebelum deploy |
| Kontaminasi editor web | Upload files, jangan paste |
| Keamanan tertinggal pin | Batch 0 wajib menutup S7 sebelum batch lain |
| Versi internal CDN ≠ tag rilis | T49 ditutup di v2.8.1 (bump internal ke `"2.8.0"` + tag patch terpisah) |
| Bug UTC-vs-WIB berulang di app | v2.3.0: gunakan `todayIsoLocal()`/`dateKey10()` untuk form/validasi user; `todayIso()` tetap UTC hanya untuk keperluan server-side |

---

## 9. Rilis Terkini — Referensi Cepat

| Komponen | Versi | Tag | URL | Verifikasi |
|---|---|---|---|---|
| CoreLib | v2.3.0 | v2.3.0 | `/library/d/1GmeYflf…/15` | `testAll()` PASS 42 / FAIL 0 / SKIP 1 |
| Frontend CDN | v2.8.1 | v2.8.1 | jsDelivr `@v2.8.1` | `AppCore.version` = `"2.8.0"` konsisten |
| si-lahar | — | — | — | CoreLib pin 15 + CDN `@v2.8.1` |

---

*Referensi audit: STATUS_PROYEK.md (2026-09-16: audit sinkron frontend, audit backend app-vs-CoreLib, verifikasi live v2.2.3). Audit terakhir: 2026-09-19 (Batch 5 — CoreLib v2.3.0 + CDN v2.8.1). Checklist salin-manual: DAFTAR_SALIN.md.*
