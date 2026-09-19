# 🗺️ ROADMAP CDN & CoreLib — Rencana Gelombang: CDN Stabil & Nol Duplikasi Mekanik

> **Status**: DISAHKAN 2026-09-16 • **DIAMANDEMEN 2026-09-16 (malam) atas keputusan user**.
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
| S7 | Keamanan tertutup | pin | CoreLib v2.2.3 aktif di SEMUA app (pin si-pelaporan naik) |

**Bukan sasaran**: rasio 1:1 untuk app kaya-bisnis; platform low-code monolitik; memindahkan logika bisnis (vertikal) ke pustaka.

**Aturan pemicu promosi**: pola muncul di ≥2 app dengan bentuk sama → naik ke CDN/CoreLib; hanya 1 app → tetap lokal.

---

## 2. Baseline Terukur (2026-09-16)

| Lapisan | Baris | Rincian |
|---|---|---|
| CDN frontend v2.6.5 | **2.447** | app-core 802 • app-components 567 • app-modules 507 • app-common.css 571 |
| CoreLib v2.2.3 | **2.917** | 01: 809 • 02: 804 • 03: 365 • 99: 939 |
| si-kompetensi (app rujukan) | **12.004** | backend .gs 5.329 • frontend .html 6.675 (J_* 3.433; V_*+Index 3.242) |
| si-pelaporan | **3.389** | 7 berkas src |
| Rasio kepala hari ini | **4,9 : 1** | 12.004 : 2.447 |
| Rasio stack-bersama hari ini | **2,24 : 1** | 12.004 : 5.364 |

> Ukur ulang dengan `wc -l` per lapisan setelah tiap batch; perbarui tabel ini di commit yang sama.

**Ukur ulang 2026-09-16 malam (pasca Batch 1 + sub-1/sub-2, CDN v2.7.2):**

| Lapisan | Baris | Δ vs baseline |
|---|---|---|
| CDN frontend v2.7.2 | **2.801** | +354 (app-core 835 • app-components 888 • app-modules 507 • css 571) |
| CoreLib v2.2.3 | **2.917** | 0 |
| si-kompetensi | **11.899** | −105 |
| Rasio kepala (indikator) | **4,25 : 1** | dari 4,9 |
| Rasio stack-bersama (indikator) | **2,08 : 1** | dari 2,24 |

**Ukur ulang PENUTUPAN FRONTEND (2026-09-16 malam, pasca Bagian 21–25):**

| Lapisan | Baris | Rasio (indikator) |
|---|---|---|
| CDN frontend (live tag v2.7.5; workspace siap v2.8.0) | **2.848** | app-core 835 • app-components 907 • app-modules 507 • app-common.css 599 |
| CoreLib v2.2.3 | **2.917** | — |
| si-kompetensi | **11.835** | kepala **4,21 : 1** • stack-bersama **2,07 : 1** |
| si-pelaporan | **3.365** | tipis **0,59 : 1** — sasaran S3 lama (≤1) TERCAPAI |

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
| | **Subtotal frontend** | **−1.185…−1.535** | **+640…+700** (+270 bila B3/B5 terpicu) | |

## 4. Gelombang 1 — Paket Kerja BACKEND (komitmen)

| Kode | Pekerjaan | Δ app | Δ CoreLib | Verifikasi |
|---|---|---|---|---|
| **C1** | `initDatabase` manual (06_MasterLogic) → `CoreLib.initDatabase`; opsi kosmetik (warna header, frozen rows) ditambah ke `ensureSheet` agar semua app ikut dapat | −60…−80 | +15 | `runAllTestsSikompetensi` PASS; 8 sheet + format utuh |
| **C2** | Wrapper pembuka DB (`getLocalSpreadsheet_`/`getMasterSpreadsheet_`) → delegasi `CoreLib.getDb`/`masterDbFor_` | −20…−30 | 0 | cache tetap tunggal |
| **C3** | Dokumentasikan keputusan: config app di **Script Properties** (bukan sheet KONFIGURASI) — satu paragraf di `backend/00_MIGRATION_v2.md` | 0 | 0 (dok) | tidak ada lagi kebingungan nama `saveConfigItem_` |
| **C5** | Aturan **"CoreLib first"** + contract-check sisi backend (util umur/durasi/tanggal wajib cek CoreLib sebelum ditulis lokal) | 0 | 0 | check hijau di CI-lokal |
| **C4*** | ~~migrasi CRUD sheet standar si-kompetensi ke `dispatchAction` deklaratif~~ — **TIDAK DIPICU (keputusan user 2026-09-16: risiko tinggi pada logika bisnis produksi, manfaat hanya angka)** | — | — | — |
| | **Subtotal backend** | −80…−110 (inti) / −480…−910 (dengan C4) | +15 | |

**Dipertahankan apa adanya** (hasil audit: sehat): pola single-point bridge `01_ConfigAndBridge` + `Utils.gs`; `sendAuditLog_` terpusat ke SI-PLATFORM (melengkapi `appendAuditLog` lokal, bukan duplikat); normalisasi SIMPEG vertikal.

## 5. Urutan Eksekusi & Disiplin Rilis

**Batch 0 — keamanan (prasyarat, minggu ini):**
- [x] Simpan versi library CoreLib **13** (2026-09-16, URL `/library/d/1GmeYflf…/13`; kode v2.2.3 terverifikasi `testAll` 38/0/1).
- [x] si-pelaporan: pin `"6"` → `"13"` di **workspace + GAS + GitHub** (md5 raw GitHub = workspace). **Terverifikasi runtime 17:25–17:27**: suite app PASS 7/0/0 (ReadOnlyMaster & AuthSSO_Negatif lulus); diagnostik sehat; **regresi CoreLib dijalankan DARI si-pelaporan → PASS 38/0/1 incl. `[PASS] testRoleGateV222`** = pin 13 benar menyebarkan v2.2.3. **S7 TERTUTUP.**
- [x] ~~si-platform: CDN CSS `@v2.6.4` → `@v2.6.5`~~ **TERLEWATI/DIGANTIKAN (2026-09-17)**: si-platform kini memakai `@v2.7.5` (CSS + JS kit) lewat Track B & kit Tahap 1–4; Track A–E si-platform selesai (Tailwind compiled, split 04a–d, runAllTests 21/21 PASS).

**Batch 1 — CDN naik (sekali rilis, tag `v2.7.0`):**
- [x] A2 (appCode terekspos), B7 (directive `v-can` fail-closed), B6 (`app-empty-state`+`app-skeleton`), B4 (`app-filter-bar`+`AppCore.paginate/pageCount`) — SIAP di workspace, syntax check lulus; versi tetap 2.6.5 s/d rilis.
- [x] B2 (`app-chart-bar`/`app-chart-doughnut`, Chart.js on-demand + ikut dark mode via event `appcore:dark`) & B1 (`app-pegawai-picker` berbasis cache SWR) — SIAP di workspace; registrasi 13 komponen; node --check lulus.
- [x] Bump versi **2.7.0** (4 berkas internal + package.json) + `npm run build` → `.min` memuat komponen baru.
- [x] Dokumentasi diselaraskan ke v2.7.0 (frontend/README, CDN_SNIPPET + seksi 2b baru, ECOSYSTEM_GUIDE, README root + riwayat).
- [x] **RILIS (user)**: unggah + tag `v2.7.0` SELESAI (2026-09-16). Terverifikasi: tag ada di GitHub; jsDelivr `@v2.7.0` HTTP 200 untuk 3 bundle; isi byte-identik dengan build workspace (selisih hanya trailing-newline standar unggahan GitHub).
- [x] `npm run build` → `.min` di-commit → unggah semua berkas dulu, lalu tag (dilakukan di rilis v2.7.0).
- [x] Perbarui CDN_SNIPPET (A3) + katalog props di `frontend/README.md` (selesai di v2.7.0; prop `bare` menyusul di v2.7.1).

**Batch 2 — adopsi app:**
- [x] si-kompetensi sub-1 (2026-09-16): tag @v2.7.0, A3 dark-boot, A1-parsial (5 ekspor single-sheet → `exportExcel`; 2 multi-sheet tetap lokal s/d opsi ekstensi), unifikasi `formatDateDisplay`. LIVE & terverifikasi.
- [x] si-kompetensi sub-2 (2026-09-16): B2 chart kit di V_Dashboard via CDN v2.7.1 (`bare`) + v2.7.2 (fix bootstrap `AppCore.loadLib`). LIVE di /exec & terverifikasi; 3 hotfix selesai (self-closing, prefiks `_`, method-root) + 2 scanner baru di compile-check.
- [x] si-kompetensi sub-3/4/5 (2026-09-16): B6 empty-state (2 blok custom terakhir → <app-empty-state>); B1 picker di 3/3 form pegawai (+guard validasi eksplisit; kit fix v2.7.3 source/nama, v2.7.4→v2.7.5 blur-race+type=button); B4 filter-bar di V_UsulanDiklat + V_AnalisaGap + konsolidasi 6 paginasi list → AppCore.paginate/pageCount. TIDAK DIADOPSI (terdokumentasi): B7 v-can (gating role existing memadai) & 6 baris filter-ber-tombol MasterSatelit/DiklatPortofolio (kit tanpa slot aksi); A1 sisa 2 ekspor multi-sheet tetap lokal. LIVE: user konfirmasi + md5 GitHub identik.
- [x] si-pelaporan (2026-09-16): 4 kartu KPI → <app-stat-card>, 4 badge/chip → <app-badge> (−48; 3.413→3.365). B3 tidak terpicu. LIVE & terverifikasi.

**Batch 3 — backend:**
- [x] C3 — dokumen keputusan Script Properties (`backend/00_MIGRATION_v2.md` §8).
- [x] C2 — wrapper DB → `CoreLib.getDb`/`masterDbFor_` (2026-09-16; −12 baris app; fallback lama utuh).
- [x] C1 — initDatabase → delegasi per-sheet `CoreLib.ensureSheet` + opsi `decorate` (CoreLib v2.2.4 aditif; 2026-09-16; −10 baris app). DEVIASI terdokumentasi: `CoreLib.initDatabase` TIDAK dipakai utuh — selalu memaksa buat AUDIT_LOGS/KONFIGURASI/MAIN_DATA yang tidak dipakai si-kompetensi.
- [x] C5 — aturan "CoreLib first" + contract-check (2026-09-17): `tools/contract_check.py` (7 kelas pemeriksaan, 3 app; baseline HIJAU exit 0 dengan 2 warn Play-CDN yang jujur; negative-test 5/5 pelanggaran tertangkap) + seksi aturan di ECOSYSTEM_GUIDE.md. **BATCH 3 TUTUP — SELURUH ROADMAP GELOMBANG 1 SELESAI.**
- [x] ~~C4~~ — TIDAK DIPICU (amandemen 2026-09-16).

**Batch 4 — CDN v2.8.0 (2026-09-18, frontend-only; backend v2.3.0 tetap antre):**
- [x] F2: `.btn-icon`/`.btn-icon-danger`/`.btn-lg` dipromosikan dari A0_Style si-lahar (G18c-2) ke app-common.css — sumber hex light+dark identik, struktur pakai var(--slate-*/--transition).
- [x] F1: `<app-filter-bar>` dukung `span` (2..4) per filter via `spanCls` (peta literal Tailwind; tanpa span = perilaku lama, aditif murni).
- [x] Versi: package.json 2.8.0; exporter app-components '2.8.0'; default prop `version` <app-login> v2.8.0; changelog app-common.css.
- [x] `npm run build` → 4 `.min` diregenerasi; node --check min OK; isi baru terverifikasi ada di min (btn-icon, span classes).
- [x] `tools/contract_check.py` exit 0 (PUTUSAN: SEMUA KONTRAK TERPENUHI; 2 warn Play-CDN jujur + waiver pin pelaporan).
- [x] Harness drift fix: tests/sso-integration-simulation.js → platform split 04a–04d + path CoreLib frontend-cdn/backend → **20/20 PASS**.
- [x] Docs: README root (versi aktif + riwayat), frontend/README (props), ECOSYSTEM_GUIDE, CDN_SNIPPET, entri ini + baris baseline §2 di bawah.
- [ ] **RILIS (user)**: unggah berkas → tag BARU `v2.8.0` (tag lama tak dipindah) → verifikasi jsDelivr @v2.8.0 HTTP 200 + byte-identik.
- [ ] Adopsi app (setelah tag live): si-lahar pin @v2.8.0 + hapus .btn-icon/.btn-lg lokal di A0_Style (konvergensi); si-kompetensi pin bump MANUAL oleh pemilik (gerbong bersih-bersih).

**Disiplin rilis (selalu):** perubahan aditif (prop baru boleh, arti prop lama jangan); satu tag untuk semua berkas; `.min` di-commit bersama sumber; unggah via *Upload files* (anti kontaminasi CF); dokumen master + tabel baseline §2 diperbarui di rilis yang sama; `testAll()` CoreLib FAIL:0 sebelum save versi.

## 6. Definition of Done — "CDN Stabil & Nol Duplikasi Mekanik" (amandemen 2026-09-16)

Selesai bila:
1. **S4–S7 hijau** (nol kode horizontal di app, nol duplikasi, zero-touch fix, keamanan tertutup — S7 sudah ✅).
2. Sisa duplikasi di app **hanya yang bersifat bisnis/spesifik-app** (mesin SKJ, JP 20/24, Paspor, dsb. — memang milik app).
3. Setiap perubahan **berisiko rendah & reversibel**: tes di Test deployment sebelum New version; gagal = produksi tak tersentuh.
4. Rasio dicatat tiap batch sebagai **indikator** (bukan target). Posisi amandemen: kepala **4,25 : 1** (11.899 : 2.801), stack-bersama **2,08 : 1** — proyeksi akhir ≈3,4–3,6 tanpa C4, dan itu **diterima**.
5. C4/B3/B5 tetap tidak dipicu tanpa alasan fungsional.

*(Catatan historis: DoD lama menargetkan band 2,9–3,3:1 via C4 — diturunkan atas keputusan user: "intinya optimasi ideal untuk modal awal CDN yang stabil; terlalu mendalam justru menyulitkan".)*

**Status PENUTUPAN FRONTEND (2026-09-16):** kriteria 1–3 TERCAPAI dengan pengecualian terdokumentasi: (a) 2 ekspor multi-sheet `_exportXlsx` tetap lokal (menunggu opsi ekstensi multi-sheet CDN, tidak dijadwalkan); (b) 6 baris filter menyatu tombol Refresh/Tambah di MasterSatelit & DiklatPortofolio dipertahankan (app-filter-bar tanpa slot aksi; opsi aditif `actions` v2.8.x bila kelak perlu); (c) B7 v-can tidak diadopsi. S4: 0 paginasi manual, 0 formatDate lokal, 0 chart manual, 0 empty-state custom. Batch 3 backend: C3/C2/C1 SELESAI — **CoreLib v2.2.4 LIVE di GAS (testAll 38/0/1, versi 14 tersimpan 2026-09-17)**; 2 file app si-kompetensi DIPASTE + runAllTestsSikompetensi 55/0/0 PASS (2026-09-17). **Sisa C5 saja.**

**Alarm over/under-engineering**: bila app <9.500 (berarti logika bisnis ikut terbuang — STOP, review) atau CDN >3.800 tanpa adopsi nyata di ≥2 app (berarti komponen spekulatif — STOP, turunkan ke Gelombang 2).

## 7. Gelombang 2 — DAFTAR OPSI SAJA (tidak dijadwalkan)

| Opsi | Isi | Efek bila kelak diambil | Pemicu adopsi |
|---|---|---|---|
| G2-1 | Modul deklaratif `<app-crud-page>` (tabel+form+filter+paginasi dari schema JSON) | app kaya → 8,2–8,6 rb; rasio 2,2–2,5:1 | ≥2 app dengan sheet CRUD seragam (app ke-3/ke-4) |
| G2-2 | Kompresi boilerplate handler .gs per sheet menjadi modul aturan murni | −800…−1.200/app | menyertai G2-1 |
| G2-3 | Halaman deklaratif penuh (low-code lite) untuk app CRUD-murni | app tipis → ≈1–2 rb config | hanya app CRUD-murni baru (mis. SI-ASET) |
| G2-4 | **Template starter-kit web app bisnis** (kerangka siap pakai: head CDN, CoreLib, SSO ticket, tolerant-reader SIMPEG, DB 5–10 sheet) — acuan semua app baru | app baru lahir selaras, onboarding cepat | **SELESAI 2026-09-17** — `/home/user/starter-kit/` (si-kompetensi finish: 55/0/0 + CoreLib v14) |
| **Lantai keras** | mesin SKJ, aturan JP 20/24, H-90, dokumen Paspor, analitik | ≈7–8 rb baris tak terkompresi | — (makna bisnis, bukan mekanisme) |

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

---

*Referensi audit: STATUS_PROYEK.md (2026-09-16: audit sinkron frontend, audit backend app-vs-CoreLib, verifikasi live v2.2.3). Checklist salin-manual: DAFTAR_SALIN.md.*
