# Ekosistem Aplikasi Pemerintah Kabupaten Trenggalek
### Platform Single Sign-On (SSO), Master Data & Aplikasi Terpadu

Repositori ini memuat pustaka antarmuka bersama (*Shared UI Components*), arsitektur desain sistem, dan pedoman integrasi untuk seluruh ekosistem digital Pemerintah Kabupaten Trenggalek berbasis **Google Apps Script (GAS)**, **Vue 3**, dan **Tailwind CSS**.

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
│ (Kompetensi) │        │ (Pelaporan)  │        │ (Diklat ASN) │
└──────────────┘        └──────────────┘        └──────────────┘
```

---

## 📦 Daftar Proyek & Repositori Resmi

| Proyek | Deskripsi | Struktur Frontend | Tautan Repositori |
|---|---|---|---|
| **`si-platform`** | Portal SSO, User Management, Role RBAC, Storage & Audit Log | 2 File HTML (`Index.html` + `V_Layout.html`) | [GitHub Repo](https://github.com/miftachurrochim82-sketch/si-platform) |
| **`si-kompetensi`** | Aplikasi Riwayat & Analisis Pengembangan Kompetensi ASN | 2 File HTML (`Index.html` + `V_Layout.html`) | [GitHub Repo](https://github.com/miftachurrochim82-sketch/si-kompetensi) |
| **`si-pelaporan`** | Aplikasi Manajemen & Verifikasi Pelaporan Kinerja ASN | 2 File HTML (`Index.html` + `V_Layout.html`) | [GitHub Repo](https://github.com/miftachurrochim82-sketch/si-pelaporan) |
| **`frontend-cdn`** | Pustaka CDN Bersama (`app-components`, `app-core`, `app-common.css`) | Shared CDN Repository | [GitHub Repo](https://github.com/miftachurrochim82-sketch/frontend-cdn) |

---

## 🚀 Keunggulan Arsitektur 2-Berkas HTML (Single Include)

1. **Ringan & Bebas Bug di Apps Script**:
   - Google Apps Script hanya perlu memproses **satu kali include** (`<?!= include('V_Layout'); ?>`) di dalam `Index.html`.
   - Menghilangkan resiko *nested include* atau *recursion error* yang sering terjadi jika template dipecah ke belasan file terpisah.
2. **Sangat Nyaman Dikelola di Browser Tablet**:
   - Struktur berkas di editor Google Apps Script tetap ramping (hanya 4-5 berkas `.gs` dan 2 berkas `.html`).
3. **Pustaka Terpusat via CDN jsDelivr**:
   - Seluruh aplikasi dinas berbagi komponen `<app-sidebar>`, `<app-header>`, `<app-badge>`, `<app-login>`, `<app-crud-table>`, `<app-profile>`, dan `<app-settings>` dari repository `frontend-cdn`.
