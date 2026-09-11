# Ekosistem Aplikasi Pemerintah Kabupaten Trenggalek
### Platform Single Sign-On (SSO), Master Data & Aplikasi Dinas Terintegrasi

Repositori ini memuat seluruh sumber kode ekosistem digital terpadu Pemerintah Kabupaten Trenggalek berbasis **Google Apps Script (GAS)**, **Vue 3**, dan **Tailwind CSS**.

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
│SI-KOMPETENSI │        │ SI-PELAPORAN │        │  SI-DIKLAT   │
│(Kompetensi)  │        │ (Pelaporan)  │        │ (Diklat ASN) │
└──────────────┘        └──────────────┘        └──────────────┘
```

---

## 📦 Daftar Proyek & Repositori

| Proyek | Deskripsi | Arsitektur Tampilan |
|---|---|---|
| **`si-platform`** | Portal SSO, User Management, Role RBAC, Storage & Audit Log | **Modular 5-View System** (`V_Layout`, `V_Portal`, `V_Akses`, `V_Layanan`, `V_Sistem`) |
| **`si-kompetensi`** | Aplikasi Riwayat & Analisis Pengembangan Kompetensi ASN | SPA Vue 3 + Shared CDN UI |
| **`si-pelaporan`** | Aplikasi Manajemen & Verifikasi Pelaporan Kinerja ASN | SPA Vue 3 + Shared CDN UI |
| **`frontend-cdn`** | Desain Sistem, Komponen Bersama (`<app-sidebar>`, `<app-header>`, Token CSS) | Shared CDN Repository |

---

## 🚀 Keunggulan Arsitektur Modular (Ringkas & Tablet-Friendly)

1. **Jumlah File Sedikit & Ringkas**:
   - `si-platform` hanya menggunakan **6 file tampilan** (`Index.html`, `V_Layout.html`, `V_Portal.html`, `V_Akses.html`, `V_Layanan.html`, `V_Sistem.html`), sangat nyaman diedit dari browser tablet/mobile.
2. **Performa Tinggi**:
   - Backend dilengkapi mekanisme caching otomatis dan lock transaksional untuk mencegah *race conditions*.
3. **CI/CD Otomatis**:
   - Setiap `git push` ke GitHub otomatis sinkron ke Google Apps Script via GitHub Actions & Google Clasp.

---

## 📝 Lisensi
Dikelola oleh Pemerintah Kabupaten Trenggalek.  
Lisensi: MIT.
