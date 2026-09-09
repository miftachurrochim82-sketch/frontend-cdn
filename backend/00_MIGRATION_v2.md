# 📖 Panduan Migrasi & Arsitektur Backend Global v2.0

Dokumen ini menjelaskan arsitektur backend Google Apps Script (GAS) versi 2.0 untuk seluruh ekosistem aplikasi Pemerintah Kabupaten Trenggalek.

---

## 🚀 Perubahan Penting (Changelog v2.0)

| Kode | Kategori | Penjelasan Perbaikan |
|---|---|---|
| **C1** | **Database** | Update / Soft-delete / Hard-delete sekarang menggunakan **nomor baris fisik** pada Google Sheet, tidak lagi bergantung pada array yang terfilter. Ini mencegah bug penimpaan data baris lain. |
| **C2** | **Database** | Penulisan data selalu **diselaraskan dengan nama kolom fisik** pada sheet (`toAlignedRow_`), sehingga posisi urutan kolom di sheet fleksibel dan kolom ekstra tetap aman. |
| **C3** | **Cache** | Cache di-namespace per Database ID (`sheetData_{dbId}_{sheetName}`), dengan pembatasan TTL maksimal 21.600 detik (6 jam). |
| **H1** | **Primary Key** | `getRecordPrimaryId_` mendukung penentuan `pkField` eksplisit serta deteksi otomatis kolom berakhiran `*_id`. |
| **H3** | **Master SIMPEG** | Fungsi baca **dilarang** membuat sheet referensi lokal jika tidak ditemukan. Data master (`PEGAWAI`, `JABATAN`, `UNIT_KERJA`) selalu dibaca langsung dari master spreadsheet (`MASTER_SPREADSHEET_ID`). |
| **H4** | **Format Tanggal** | Format kanonik ISO (`YYYY-MM-DDTHH:mm:ss.sssZ`) digunakan untuk penyimpanan di Google Sheet, sedangkan format `dd/MM/yyyy` hanya digunakan untuk tampilan frontend. |
| **H5** | **Strict Update** | Logika merge update: nilai `undefined` mempertahankan nilai lama, sedangkan `null` atau string kosong `""` akan mengosongkan sel. |
| **M2** | **Audit Trail** | Kolom audit standar (`created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`) otomatis dipastikan ada di seluruh sheet non-referensi. |

---

## ⚙️ Variabel Konfigurasi Script Properties

Di proyek Google Apps Script Anda (Project Settings ➡️ Script Properties), konfigurasikan variabel berikut:

| Key | Tipe | Contoh Nilai | Keterangan |
|---|---|---|---|
| `SPREADSHEET_ID` | String | `1abc123xyz...` | ID Google Spreadsheet database lokal aplikasi |
| `MASTER_SPREADSHEET_ID` | String | `1simpeg_master_xyz...` | ID Google Spreadsheet master data SIMPEG Pemkab |
| `PLATFORM_VALIDATE_URL` | String | `https://script.google.com/.../exec` | URL endpoint validasi tiket SSO SI-Platform |
| `SESSION_SECRET` | String | `random_secret_string` | *(Opsional)* Kunci rahasia hashing token sesi HMAC |
| `APP_TITLE` | String | `SI-PELAPORAN` | Judul aplikasi web |

---

## 📂 Struktur File Backend

1. **`01_CoreFoundation.gs`**: Engine inti database Google Sheets, caching layer, date/time parser, SIMPEG calculation helpers, dan logger.
2. **`02_AuthBridge.gs`**: Handler validasi tiket SSO, pembuatan token sesi HMAC, verifikasi token, dan role guard (`requireAuth_`, `requireAdmin_`).
3. **`03_ProfileService.gs`**: Handler sinkronisasi profil SIMPEG (`get_my_profile`) dan penyimpanan kontak mandiri (`save_my_profile`).
4. **`04_ConfigService.gs`**: Handler pengelolaan konfigurasi sistem dinamis (`get_config`, `save_config_item`, `delete`).
5. **`Code.gs`**: Dispatcher utama `handleAction` yang menghubungkan panggilan frontend `callServer` ke fungsi backend terkait.
