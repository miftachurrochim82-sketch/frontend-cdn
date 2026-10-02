# Katalog Komponen

Referensi 11 komponen Frontend CDN Pemkab Trenggalek.
Cara memuat CDN ada di [`../README.md`](../README.md); riwayat versi di [`../CHANGELOG.md`](../CHANGELOG.md).

Semua komponen terdaftar otomatis oleh `AppCore.create()`. Props di bawah diambil
langsung dari `frontend/app-components.js`.

> Komponen wajib ditutup eksplisit: `<app-badge ...></app-badge>`.
> Tag self-closing (`<app-badge />`) tidak bekerja pada template in-DOM.

---

## Shell aplikasi

### `<app-login>`
Halaman login dengan jalur SSO ke si-platform.

| Prop | Tipe | Keterangan |
|---|---|---|
| `appTitle` | String | Judul aplikasi |
| `appSubtitle` | String | Baris kedua |
| `instansi` | String | Nama instansi |
| `tagline` | String | Teks kecil di bawah |
| `version` | String | Label versi, default mengikuti versi CDN |
| `logoSvg` | String | SVG logo inline |
| `isProcessing` | Boolean | Status memuat |
| `errorMessage` | String | Pesan galat |

### `<app-sidebar>`
Navigasi samping dengan gating role.

| Prop | Tipe | Keterangan |
|---|---|---|
| `menu` | Array | Daftar menu `{id, label, icon, roles}` |
| `currentPage` | String | Halaman aktif |
| `collapsed` | Boolean | Mode ringkas |
| `mobileOpen` | Boolean | Terbuka di layar kecil |
| `dark` | Boolean | Mode gelap |
| `isAdmin` | Boolean | Tampilkan menu admin |
| `user` | Object | Pengguna sesi |
| `brand` | Object | Judul & subjudul brand |

Emit: `navigate(pageId)`

### `<app-header>`
Bilah atas: judul halaman, identitas pengguna, dark mode.

| Prop | Tipe | Keterangan |
|---|---|---|
| `appTitle` | String | Judul aplikasi |
| `currentPage` | String | Halaman aktif |
| `pageIcons` | Object | Peta `pageId → kelas ikon` |
| `user` | Object | Pengguna sesi |
| `dark` | Boolean | Mode gelap |

---

## Tampilan data

### `<app-badge>`
Label status multi-domain. Memakai kelas utilitas Tailwind, bukan kelas `badge-*`.

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `status` | String | `menunggu` | Lihat daftar di bawah |
| `label` | String | — | Menimpa label otomatis |
| `size` | String | `sm` | `sm` \| `md` |
| `icon` | String | — | Kelas Font Awesome |

Status dikenal: `draft`, `baru`, `diproses`, `menunggu`, `pending`, `proses`,
`revisi`, `disetujui`, `approved`, `aktif`, `selesai`, `tuntas`, `ditolak`,
`rejected`, `inactive`, `batal`, `kosong`, `definitif`, `plt`, `pppk`.
Status tak dikenal tampil abu-abu dengan label berhuruf kapital awal.

### `<app-stat-card>`
Kartu metrik KPI.

| Prop | Tipe | Keterangan |
|---|---|---|
| `title` | String | Judul metrik |
| `value` | Number/String | Angka utama |
| `icon` | String | Kelas Font Awesome |
| `color` | String | `emerald` \| `amber` \| `sky` \| `rose` \| … |
| `subtext` | String | Keterangan kecil |

### `<app-skeleton>`
Placeholder saat memuat.

| Prop | Tipe | Default |
|---|---|---|
| `type` | String | `lines` |
| `count` | Number | jumlah baris |

### `<app-empty-state>`
Keadaan kosong yang seragam.

| Prop | Tipe |
|---|---|
| `icon` | String |
| `title` | String |
| `subtitle` | String |
| `actionLabel` | String |

---

## Interaksi

### `<app-modal>`
Dialog.

| Prop | Tipe | Keterangan |
|---|---|---|
| `show` | Boolean | Tampil/sembunyi |
| `title` · `subtitle` · `icon` | String | Kepala dialog |
| `size` | String | Lebar dialog |
| `loading` | Boolean | Status proses |
| `confirmText` · `cancelText` | String | Label tombol |
| `confirmClass` | String | Kelas tombol konfirmasi |
| `showFooter` · `showConfirm` | Boolean | Tampilkan kaki/tombol |

Emit: `close`, `confirm`

### `<app-theme-picker>`
Pemilih tema: 6 preset + kustom. Menyimpan pilihan ke `safeLocal` dan memanggil `AppCore.applyTheme()`.

| Prop | Tipe |
|---|---|
| `modelValue` | String |
| `label` | String |

Emit: `change(kodeTema)`

---

## Grafik

`<app-chart-bar>` dan `<app-chart-doughnut>` berbagi props yang sama.
Chart.js dimuat on-demand lewat `AppCore.loadLib('chart')` — tidak memblokir render.

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `labels` | Array | `[]` | Label sumbu |
| `datasets` | Array | `[]` | `[{ label, data }]` |
| `title` | String | — | Judul kartu |
| `height` | Number | `260` | Tinggi kanvas (px) |
| `legend` | Boolean | `true` | Tampilkan legenda |
| `colors` | Array | `[]` | Warna kustom |
| `bare` | Boolean | `false` | Tanpa pembungkus kartu |

```html
<app-chart-bar title="Per Kategori"
               :labels="['Jan','Feb','Mar']"
               :datasets="[{ label: 'Jumlah', data: [12, 19, 8] }]"></app-chart-bar>
```

---

## AppCore

`AppCore.create({...})` membuat instance Vue 3 lengkap dengan sesi aman dan
mendaftarkan kesebelas komponen.

| | |
|---|---|
| `callServer(action, data)` | Memanggil `handleAction` di GAS |
| `loadLib(nama)` | Memuat pustaka berat on-demand |
| `applyTheme(kode)` · `getTheme()` · `AppCore.themes` | Tema dinamis, 6 preset |
| `getMyScope()` · `setMyScope()` | Scope "Saya" vs "Semua" |
| `safeSession` · `safeLocal` | Storage anti-galat — **jangan** pakai `localStorage` mentah |
| `paginate(list, page, perPage)` · `pageCount()` | Paginasi sisi klien |
| Direktif `v-can` | Gating elemen berdasar role, fail-closed |

Cache SWR: data master SIMPEG tampil dari cache lebih dulu, lalu disegarkan di latar belakang.

### Registry pustaka (`AppCore.libs`)

Semua pustaka berat terpusat di satu tempat dengan versi terkunci, dimuat hanya saat dipakai.

| Nama | Pustaka | Versi |
|---|---|---|
| `chart` | Chart.js | 4.4.1 |
| `xlsx` | SheetJS | 0.18.5 |
| `jspdf` | jsPDF | 2.5.1 |
| `autotable` | jsPDF-AutoTable | 3.8.2 |
| `pdflib` | pdf-lib | 1.17.1 |
| `pdf` | grup: `jspdf` + `autotable` | — |

```javascript
async renderGrafik() {
  if (!(await this.loadLib('chart'))) return;
  new Chart(ctx, { /* ... */ });
}
```

> `xlsx`, `jspdf`, `autotable`, dan `pdflib` saat ini **tidak dipanggil** oleh
> `starter-kit` maupun `si-data`. Dipertahankan karena registry-nya murah
> (hanya URL), tapi pertimbangkan menghapusnya bila tetap tak terpakai.
