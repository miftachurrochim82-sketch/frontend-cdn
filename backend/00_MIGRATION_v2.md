# 📖 Dokumen Master CoreLib — Backend Global v2.2.3

> **Dokumen ini adalah master referensi backend CoreLib.** Disimpan hanya di GitHub
> (Google Apps Script tidak bisa menyimpan file `.md`). Folder `backend/` di repo ini
> adalah **salinan sumber resmi** dari library GAS `CoreLib` — setiap perubahan pada
> library harus dicerminkan di sini, dan sebaliknya.
>
> **Status terakhir**: v2.2.3 — diverifikasi live 2026-09-16 (`testAll()` → PASS 38 / FAIL 0 / SKIP 1).

---

## 1. Identitas Library

| Item | Nilai |
|---|---|
| Nama | `CoreLib` (Global Backend Library Pemkab Trenggalek) |
| Script ID | `1GmeYflfMpRa1iTVgFHRD6K1DMoxc9OoKqpuucPJXgNZ9XBK06O7wgDkO` |
| Identifier di app | `CoreLib` |
| Runtime | Apps Script V8, timezone `Asia/Jakarta` |
| Versi kode saat ini | **v2.2.3** (2026-09-16) |
| Versi library tersimpan | **13 = v2.2.3** (disimpan 2026-09-16; URL `/library/d/1GmeYflf…/13`) |

### Aplikasi konsumen

| Aplikasi | Pin di `appsscript.json` | `developmentMode` | Efek |
|---|---|---|---|
| `si-kompetensi` | `"version": "12"` | `true` | Selalu pakai kode HEAD terbaru → otomatis dapat v2.2.3 |
| `si-pelaporan` | `"version": "13"` | *(tidak ada)* | Terkunci di v13 = v2.2.3 ✅ (pin dinaikkan 2026-09-16 setelah versi 13 disimpan) |
| `si-platform` | — | — | Tidak memakai CoreLib (portal SSO mandiri) |

---

## 2. Struktur File

### Yang WAJIB ada di proyek GAS CoreLib (hanya 5 file ini)

| File | Isi |
|---|---|
| `appsscript.json` | Manifest: runtime V8, timezone, oauth scopes |
| `01_CoreFoundation.gs` | Engine database Google Sheets (physical row index, `toAlignedRow_`), caching ber-namespace + TTL, parser tanggal ISO-8601, helper SIMPEG (level jabatan, unit bawahan), logger |
| `02_CoreGateway.gs` | Auth bridge SSO (tiket → token sesi HMAC), `checkAuth`, role guard (`requireRole_`, `getRoleForEmail_`, `levelOf_`), `dispatchAction` + declarative resource router, whitelist config |
| `03_CoreServices.gs` | Layanan siap pakai: CRUD generik (`apiSave`/`apiDelete`), config service, `executeAppSetup` (pembuatan sheet + folder Drive), resolusi pegawai |
| `99_CoreTest.gs` | Test suite diagnostik: `testAll()` (39 test), `runCoreTests(ctx)`, `cekUpdateCorelib()` |

### Yang HANYA ada di GitHub (JANGAN dimasukkan ke GAS CoreLib)

| File | Alasan |
|---|---|
| `00_MIGRATION_v2.md` | Dokumentasi — GAS tidak bisa menyimpan `.md` |
| `Code.gs` | **Template kerangka aplikasi baru** (doGet, handleAction, runSetup, getAppConfig_) — untuk aplikasi KONSUMEN, bukan bagian library. CoreLib tidak punya `Index.html`, jadi `doGet` di sana akan error. Pakai file ini saat membuat aplikasi ke-4 dan seterusnya. |
| `.clasp.json` / `.claspignore` | Konfigurasi tooling clasp. `.claspignore` hanya memutihkan 5 file library — `Code.gs` sengaja di-exclude agar tidak pernah ter-push ke library. |

---

## 3. Changelog Lengkap

### v2.0 — Fondasi
| Kode | Kategori | Perubahan |
|---|---|---|
| C1 | Database | Update/soft-delete/hard-delete memakai **nomor baris fisik** (`_row`), bukan indeks array terfilter → mencegah penimpaan baris lain |
| C2 | Database | Penulisan selalu diselaraskan kolom fisik via `toAlignedRow_` → urutan kolom sheet fleksibel, kolom ekstra aman |
| C3 | Cache | Namespace per database (`sheetData_{dbId}_{sheetName}`), TTL maksimal 21.600 detik (6 jam) |
| H1 | Primary Key | `getRecordPrimaryId_` dukung `pkField` eksplisit + deteksi otomatis kolom `*_id` |
| H3 | Master SIMPEG | Fungsi baca **dilarang** membuat sheet referensi lokal; `PEGAWAI`/`JABATAN`/`UNIT_KERJA` selalu dibaca dari `MASTER_SPREADSHEET_ID` |
| H4 | Tanggal | Format kanonik ISO `YYYY-MM-DDTHH:mm:ss.sssZ` di sheet; `dd/MM/yyyy` hanya untuk tampilan |
| H5 | Strict Update | `undefined` = pertahankan nilai lama; `null`/`""` = kosongkan sel |
| M2 | Audit Trail | Kolom `created_at/by`, `updated_at/by`, `deleted_at` otomatis dipastikan di semua sheet non-referensi |

### v2.1
Role levels (`levelOf_` peta admin>verifikator>user>viewer), utilitas tanggal, `getLevelJabatan`, `getUnitBawahan`, penanganan *action not found* & *session expired* yang terstandar.

### v2.2
Util & keamanan baru: `normId_`, `parseDate_`, whitelist `isAllowedConfigKey_`, `validateFields_`, `genUniqueCode_`, `requireRole_`, `checkRole_`, `getRoleForEmail_` (whitelist `ADMIN_EMAILS`/`VERIFIKATOR_EMAILS` — **sengaja tanpa default** demi keamanan), declarative resource router (`save_<sheet>`, `get_<sheet>_list`, `get_<sheet>_detail`, `delete_<sheet>` otomatis).

### v2.2.1 (2026-09-15)
FIX `genUniqueCode_`: regex `reAnyNumber` yang buggy diganti — pembuatan kode unik tidak lagi salah deteksi angka.

### v2.2.2 (2026-09-15)
- FIX `checkAuth`: fallback role `=== undefined → 0` (fail-closed).
- FIX `dispatchAction`: membuang `data._cacheBust` sebelum diproses (kontrak app-core).
- Penguatan `requireRole_`.
- Menambah test regresi `testRoleGateV222`.
- ⚠️ **Insiden**: versi ini mengirim *test*-nya tetapi **tidak** *fix* `levelOf_`-nya → `testRoleGateV222` gagal diam-diam di live sejak 2026-09-15. Diperbaiki di v2.2.3.

### v2.2.3 (2026-09-16) — FIX KEAMANAN ⭐
```javascript
// SEBELUM (buggy): viewer (level 0) & role tak dikenal terangkat jadi level 1,
// lolos 9 gerbang akses level 'user'.
return (map && map[role]) || 1;

// SESUDAH (fail-closed):
var lv = map && map[String(role).toLowerCase()];
return lv === undefined ? 0 : lv;
```
Verifikasi live 2026-09-16: `testAll()` → **PASS 38 / FAIL 0 / SKIP 1**, termasuk `[PASS] testRoleGateV222`.

---

## 4. Script Properties

### Di proyek CoreLib (untuk test suite)
| Key | Nilai saat ini | Keterangan |
|---|---|---|
| `SPREADSHEET_ID` | `1SoP4hX9iBkoPdzBl5zhKjV6OA5bb3xiyNdKox_nXcqc` | Spreadsheet test `CORELIB_TEST_DB` |
| `MASTER_SPREADSHEET_ID` | `1HvMXmvdtgAUZ9A0-SQHZp9QjnYv1A7Ku_oJIjbT8gT0` | Master SIMPEG Pemkab |
| `TEST_SPREADSHEET_ID_B` | *(kosong)* | Opsional — hanya untuk `testCacheIsolation`; kalau kosong test itu SKIP (normal) |
| `PLATFORM_API_URL` | *(kosong)* | URL web app SI-PLATFORM untuk test SSO |

### Di proyek aplikasi konsumen
| Key | Keterangan |
|---|---|
| `SPREADSHEET_ID` | Database lokal aplikasi |
| `MASTER_SPREADSHEET_ID` | Master SIMPEG |
| `PLATFORM_API_URL` | Endpoint validasi tiket SSO SI-PLATFORM |
| `APP_CODE` / `APP_TITLE` | Identitas aplikasi (dipakai template `Code.gs`) |
| `ADMIN_EMAILS` / `VERIFIKATOR_EMAILS` | Whitelist role (pisahkan dengan koma). **Tidak ada default** — app wajib mengisinya sendiri |
| `ROOT_FOLDER_ID` / `EVIDENCE_FOLDER_ID` / `BACKUP_FOLDER_ID` | Folder Drive (dibuat/dipakai `executeAppSetup`) |

---

## 5. Cara Menjalankan Test (di editor CoreLib)

| Fungsi | Kegunaan | Hasil yang diharapkan |
|---|---|---|
| **`testAll()`** | Test lengkap resmi (39 test, termasuk akses spreadsheet) | `PASS: 38 / FAIL: 0 / SKIP: 1` — SKIP = `testCacheIsolation` (butuh `TEST_SPREADSHEET_ID_B`) |
| `cekUpdateCorelib()` | Diagnostik cepat: fungsi v2.2 tersedia? properti benar? | Semua ✅. Baris `❌ CoreLib is not defined` **normal** bila dijalankan di dalam proyek CoreLib sendiri (library tidak me-reference dirinya sendiri) |
| `runCoreTests()` langsung | Tanpa `ctx` → `ctx = {}` | `PASS: 21 / FAIL: 0 / SKIP: 18` — 18 test database otomatis SKIP. Bukan pengganti `testAll()` |

Setiap rilis wajib: `testAll()` → **FAIL: 0** dan `[PASS] testRoleGateV222`.

---

## 6. Prosedur Rilis (deploy perubahan CoreLib)

1. Ubah file di repo ini (`frontend-cdn/backend/`) — workspace = sumber kebenaran.
2. Paste file yang berubah ke editor GAS CoreLib (whole-file, jangan find-replace manual).
3. Jalankan `testAll()` → pastikan `FAIL: 0`.
4. **Simpan versi library baru** (versi akan bertambah: 13, 14, dst).
5. Naikkan pin `"version"` di `appsscript.json` aplikasi yang *pinned* (saat ini `si-pelaporan`). Aplikasi dengan `developmentMode: true` (`si-kompetensi`) otomatis ikut HEAD.
6. Unggah salinan file yang berubah ke GitHub (`backend/*.gs`) agar repo = live.
7. Perbarui dokumen ini (changelog + nomor versi) dan `STATUS_PROYEK.md` workspace.

> ⚠️ **Urutan penting**: paste → test → save versi → bump pin → GitHub.
> Jangan pernah men-tag/mengunggah ke GitHub sebelum kode terverifikasi di GAS.

---

## 7. Kontrak Penting (jangan dilanggar)

- **Fail-closed**: role tidak dikenal / viewer = level 0. Tidak boleh ada fallback `|| 1` di mana pun.
- **Kolom audit** (`created_by`, dst.) di-strip dari payload user — hanya diisi server (`testAuditStrip`).
- **`testMode` sudah DIHAPUS** — exchange tiket palsu selalu ditolak (`testTestModeRemoved`).
- **Sheet referensi master tidak boleh dibuat/ditulis** oleh fungsi baca.
- **Tanggal disimpan ISO-8601**; tampilan `dd/MM/yyyy` urusan frontend.
- **`_cacheBust` dibuang** `dispatchAction` sebelum routing.


---

## 8. Keputusan: Config App di Script Properties (C3, 2026-09-16)

Konfigurasi tingkat aplikasi (SPREADSHEET_ID, MASTER_SPREADSHEET_ID, platform URL, dsb.) disimpan di **Script Properties** (Project Settings → Script properties), **bukan** di sheet `KONFIGURASI`. Alasan: (1) config dibaca sebelum DB terbuka — menyimpannya di sheet menciptakan masalah ayam-telur; (2) Script Properties tidak terbawa ekspor/salinan sheet sehingga tidak bisa diubah tanpa sengaja oleh pengguna non-teknis; (3) satu sumber kebenaran per deployment (dev/prod bisa beda properti tanpa beda kode). Konsekuensi: tidak ada fungsi `saveConfigItem_` untuk menulis config dari UI — perubahan config adalah tindakan deployment yang disengaja. Data yang bersifat *operasional* (daftar nilai, katalog, referensi) tetap di sheet.
