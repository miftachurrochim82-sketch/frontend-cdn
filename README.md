# Frontend CDN Ekosistem Aplikasi Kabupaten Trenggalek

[![Frontend CDN CI](https://github.com/miftachurrochim82-sketch/frontend-cdn/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/miftachurrochim82-sketch/frontend-cdn/actions/workflows/frontend-ci.yml)

Pustaka frontend bersama untuk aplikasi web Google Apps Script (GAS) dalam ekosistem aplikasi Pemerintah Kabupaten Trenggalek.

Repository ini berisi:
- aset CSS dan JavaScript frontend;
- komponen Vue 3 dan utilitas UI;
- berkas hasil build dan minifikasi untuk CDN;
- dokumentasi komponen dan arsitektur;
- pemeriksaan build otomatis melalui GitHub Actions.

> Catatan arsitektur: backend GAS `CoreLib` sudah dipisahkan ke repository [`LIbrary-CoreLib`](https://github.com/miftachurrochim82-sketch/LIbrary-CoreLib). Repository ini sekarang berfokus pada frontend CDN.

## Versi aktif

| Komponen | Versi | Keterangan |
|---|---:|---|
| Frontend CDN | `v2.9.0` | Versi aset frontend yang digunakan aplikasi konsumer |
| CoreLib GAS | `v2.3.0` | Versi production yang saat ini dipin oleh aplikasi; sumbernya berada di repository terpisah |

Frontend CDN v2.9.0 berisi 1 CSS + 9 JavaScript dengan komponen dan utilitas UI untuk layout, form, data, chart, workflow, tema, dan autentikasi frontend.

Aplikasi konsumer sebaiknya menggunakan tag versi, bukan `@main`:

```text
https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.0/frontend/app-core.min.js
```

Penggunaan tag versi membuat aplikasi tetap memakai versi yang stabil walaupun branch `main` terus berubah.

## Struktur repository

```text
frontend-cdn/
├── frontend/
│   ├── app-common.css           # Sumber CSS utama
│   ├── app-common.min.css       # CSS hasil minifikasi
│   ├── app-core.js              # AppCore dan utilitas inti
│   ├── app-components.js        # Komponen UI inti
│   ├── app-modules.js           # Profil dan pengaturan
│   ├── app-layout.js            # Breadcrumb dan page header
│   ├── app-ui.js                # Tabs, pagination, alert, confirm
│   ├── app-forms.js             # Search, date picker, upload, editor
│   ├── app-data.js              # Drawer, export, import, tree, viewer
│   ├── app-charts.js            # Chart dan configurable dashboard
│   ├── app-workflow.js          # Approval, audit timeline, theme picker
│   ├── *.min.js                 # Hasil build JavaScript
│   ├── README.md                # Katalog komponen dan props
│   └── CDN_SNIPPET.md           # Contoh pemuatan melalui CDN
├── tests/                       # Simulasi dan pengujian frontend
├── tools/                       # Alat pemeriksaan kontrak
├── .github/workflows/           # Workflow GitHub Actions
├── ECOSYSTEM_GUIDE.md           # Panduan arsitektur ekosistem
├── ROADMAP_CDN.md               # Roadmap dan riwayat perubahan
├── package.json                 # Skrip build dan dependency
└── package-lock.json            # Dependency yang dikunci
```

## Komponen utama

### Core dan komponen dasar
- `AppCore`: factory aplikasi Vue, penyimpanan sesi aman, pemuatan library on-demand, cache, tema, dan scope pengguna.
- Login, sidebar, header, badge, stat card, modal, dan tabel CRUD.
- `v-can` dan helper untuk pembatasan tampilan berdasarkan role.

### Layout dan UI
- Breadcrumb dan page header.
- Tabs dan pagination.
- Alert dan confirm dialog.
- Tema dinamis melalui `AppCore.themes` dan `<app-theme-picker>`.

### Form dan data
- Debounced search.
- Date picker.
- File upload.
- Rich editor.
- Filter bar.
- Detail drawer.
- Export dan CSV import.
- Master tree.
- Image/file viewer.

### Chart dan workflow
- Line chart.
- Configurable dashboard.
- Approval panel dan stepper.
- Audit timeline.

Dokumentasi props dan contoh penggunaan tersedia di [`frontend/README.md`](frontend/README.md).

## Build lokal

Pastikan Node.js sudah terpasang, kemudian jalankan dari folder repository:

```bash
npm ci
npm run build
```

Perintah `npm run build` menjalankan:
- minifikasi seluruh berkas JavaScript frontend;
- minifikasi `app-common.css`;
- pembaruan berkas `.min.js` dan `.min.css` di folder `frontend/`.

## Continuous Integration

Workflow [`frontend-ci.yml`](.github/workflows/frontend-ci.yml) memeriksa perubahan frontend secara otomatis melalui GitHub Actions.

Pemeriksaan yang dilakukan:
1. Checkout repository.
2. Menyiapkan Node.js.
3. Menginstal dependency dengan `npm ci`.
4. Menjalankan `npm run build`.

Perubahan dianggap lolos apabila workflow berstatus hijau.

## Prosedur rilis CDN

Urutan rilis yang disarankan:
1. Ubah berkas sumber di folder `frontend/`.
2. Perbarui nomor versi internal bila diperlukan.
3. Jalankan `npm run build`.
4. Periksa perubahan berkas sumber dan hasil minifikasi.
5. Commit berkas sumber dan berkas `.min.*`.
6. Pastikan GitHub Actions berstatus hijau.
7. Buat tag dan release, misalnya `v2.10.0`.
8. Perbarui aplikasi konsumer agar memakai tag versi baru.

Jangan membuat tag sebelum berkas sumber dan hasil build sudah masuk ke repository. Tag harus menunjuk ke commit yang berisi keduanya.

## Hubungan dengan CoreLib

Aplikasi konsumer biasanya menggunakan dua dependency utama:

```text
Aplikasi konsumer
├── Frontend CDN
│   └── Komponen UI melalui jsDelivr
└── LIbrary-CoreLib
    └── Backend GAS, SSO, RBAC, database, dan CRUD
```

- Frontend CDN dari repository ini menyediakan tampilan, komponen, dan utilitas frontend.
- LIbrary-CoreLib menyediakan autentikasi, role guard, database Google Sheets, CRUD, dan layanan backend bersama.

Untuk production, aplikasi sebaiknya menggunakan versi CoreLib yang dipin secara eksplisit, bukan mode development.

## Proyek terkait

### Fondasi dan tooling

| Repository | Fungsi |
|---|---|
| [`LIbrary-CoreLib`](https://github.com/miftachurrochim82-sketch/LIbrary-CoreLib) | Library backend GAS untuk SSO, RBAC, database, CRUD, dan layanan bersama |
| [`starter-kit`](https://github.com/miftachurrochim82-sketch/starter-kit) | Template aplikasi baru berbasis CoreLib dan Frontend CDN |
| [`frontend-cdn`](https://github.com/miftachurrochim82-sketch/frontend-cdn) | Repository frontend CDN dan dokumentasi ekosistem ini |

### Aplikasi ekosistem

| Repository | Fungsi |
|---|---|
| [`si-platform`](https://github.com/miftachurrochim82-sketch/si-platform) | Portal SSO, manajemen pengguna, role RBAC, master data, storage, dan audit log |
| [`si-kompetensi`](https://github.com/miftachurrochim82-sketch/si-kompetensi) | Sistem informasi pengembangan kompetensi ASN |
| [`si-pelaporan`](https://github.com/miftachurrochim82-sketch/si-pelaporan) | Sistem informasi pelaporan dan verifikasi kinerja pegawai |
| [`si-lahar`](https://github.com/miftachurrochim82-sketch/si-lahar) | Sistem e-Kinerja harian ASN, rencana, realisasi, verifikasi, dan Paspor Kinerja |
| [`si-dokumen`](https://github.com/miftachurrochim82-sketch/si-dokumen) | Sistem pengumpulan dan pengelolaan dokumen pegawai |
| [`si-arsip-2026`](https://github.com/miftachurrochim82-sketch/si-arsip-2026) | Aplikasi arsip dan pengelolaan dokumen tahun 2026 |

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [`frontend/README.md`](frontend/README.md) | Katalog komponen, props, dan contoh penggunaan |
| [`frontend/CDN_SNIPPET.md`](frontend/CDN_SNIPPET.md) | Snippet pemuatan aset melalui jsDelivr |
| [`ECOSYSTEM_GUIDE.md`](ECOSYSTEM_GUIDE.md) | Panduan arsitektur, integrasi, deployment, dan troubleshooting |
| [`ROADMAP_CDN.md`](ROADMAP_CDN.md) | Roadmap dan riwayat rilis CDN |
| [`LIbrary-CoreLib`](https://github.com/miftachurrochim82-sketch/LIbrary-CoreLib) | Dokumentasi dan sumber backend CoreLib GAS |

## Lisensi
