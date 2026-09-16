# 🗺️ ROADMAP CDN & CoreLib — Rencana Gelombang s/d Rasio 3:1

> **Status**: DISAHKAN 2026-09-16 • **Sasaran kepala**: rasio app : CDN frontend berada di **kisaran 3:1 (band 2,9–3,3)** untuk app kaya-bisnis (rujukan: si-kompetensi).
> **Dokumen ini adalah master perencanaan ekosistem.** Setiap rilis CDN/CoreLib wajib memperbarui tabel baseline (§2) dan checklist (§5).
> Lingkup: **Gelombang 1 = komitmen eksekusi. Gelombang 2 = daftar opsi saja** (tidak dijadwalkan).

---

## 1. Sasaran & Batas Keberhasilan

| # | Sasaran | Ukuran | Target |
|---|---|---|---|
| S1 | Rasio kepala (app total : CDN frontend), app kaya-bisnis | baris | **2,9–3,3 : 1** (dari 4,9 : 1) |
| S2 | Rasio stack-bersama (app : CDN+CoreLib) | baris | **≤ 1,7 : 1** (dari 2,24 : 1) |
| S3 | App tipis (si-pelaporan) : stack-bersama | baris | **≤ 1 : 1** (dari 1,39 : 1) |
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
| **C4*** | *(opsional-terpicu: saat 02_AppLogic sudah disentuh fitur)* migrasi CRUD sheet standar si-kompetensi ke `dispatchAction` deklaratif (pola si-pelaporan) | −400…−800 | 0 | aksi standar lolos router; J_Actions menyusut |
| | **Subtotal backend** | −80…−110 (inti) / −480…−910 (dengan C4) | +15 | |

**Dipertahankan apa adanya** (hasil audit: sehat): pola single-point bridge `01_ConfigAndBridge` + `Utils.gs`; `sendAuditLog_` terpusat ke SI-PLATFORM (melengkapi `appendAuditLog` lokal, bukan duplikat); normalisasi SIMPEG vertikal.

## 5. Urutan Eksekusi & Disiplin Rilis

**Batch 0 — keamanan (prasyarat, minggu ini):**
- [ ] Simpan versi library CoreLib **13** (kode v2.2.3 sudah di HEAD & terverifikasi `testAll` 38/0/1).
- [ ] si-pelaporan: pin `"6"` → `"13"` (GAS + workspace + GitHub).
- [ ] si-platform: CDN CSS `@v2.6.4` → `@v2.6.5`.

**Batch 1 — CDN naik (sekali rilis, tag `v2.7.0`):**
- [ ] Kerjakan A2, B7, B6, B2, B4, B1 di workspace frontend-cdn.
- [ ] `npm run build` → commit `.min.*` → **unggah SEMUA berkas dulu, lalu tag** (pelajaran v2.6.3).
- [ ] Perbarui CDN_SNIPPET (A3) + katalog props di `frontend/README.md`.

**Batch 2 — adopsi app:**
- [ ] si-kompetensi: A1, A3, adopsi B1/B2/B4/B6/B7 di view terkait; compile-check + `runAllTestsSikompetensi`.
- [ ] si-pelaporan: adopsi badge/stat-card (daftar lama) + B3 bila verifikasi disentuh.

**Batch 3 — backend:**
- [ ] C1, C2, C3, C5 di si-kompetensi + CoreLib (opsi ensureSheet).
- [ ] C4 hanya bila pemicunya terjadi.

**Disiplin rilis (selalu):** perubahan aditif (prop baru boleh, arti prop lama jangan); satu tag untuk semua berkas; `.min` di-commit bersama sumber; unggah via *Upload files* (anti kontaminasi CF); dokumen master + tabel baseline §2 diperbarui di rilis yang sama; `testAll()` CoreLib FAIL:0 sebelum save versi.

## 6. Definition of Done — "Kisaran 3:1"

Setelah Batch 0–3 (inti, tanpa C4/B3/B5):
- app si-kompetensi ≈ **10.500** • CDN ≈ **3.100–3.150** → rasio kepala ≈ **3,3–3,4** …
- …dan dengan satu komponen syarat-terpicu atau C4 masuk: app ≈ **9.900–10.300** • CDN ≈ **3.250–3.500** → rasio ≈ **2,9–3,2** ✅ **di dalam band 2,9–3,3**.
- Rasio stack-bersama ≈ **1,6–1,7 : 1** ✅ S2; si-pelaporan ≤1:1 ✅ S3.
- S4–S7 hijau; contract-check frontend+backend lulus.

**Alarm over/under-engineering**: bila app <9.500 (berarti logika bisnis ikut terbuang — STOP, review) atau CDN >3.800 tanpa adopsi nyata di ≥2 app (berarti komponen spekulatif — STOP, turunkan ke Gelombang 2).

## 7. Gelombang 2 — DAFTAR OPSI SAJA (tidak dijadwalkan)

| Opsi | Isi | Efek bila kelak diambil | Pemicu adopsi |
|---|---|---|---|
| G2-1 | Modul deklaratif `<app-crud-page>` (tabel+form+filter+paginasi dari schema JSON) | app kaya → 8,2–8,6 rb; rasio 2,2–2,5:1 | ≥2 app dengan sheet CRUD seragam (app ke-3/ke-4) |
| G2-2 | Kompresi boilerplate handler .gs per sheet menjadi modul aturan murni | −800…−1.200/app | menyertai G2-1 |
| G2-3 | Halaman deklaratif penuh (low-code lite) untuk app CRUD-murni | app tipis → ≈1–2 rb config | hanya app CRUD-murni baru (mis. SI-ASET) |
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
