# Frontend CDN — Pustaka UI Bersama v2.6.5
### Vue 3 + Tailwind CSS • Pemkab Trenggalek

Seluruh aplikasi ekosistem (si-kompetensi, si-pelaporan, si-platform, dan aplikasi baru) memuat UI dari folder ini via jsDelivr. **Satu nomor versi berlaku untuk semua berkas** — satu tag rilis (`v2.6.5`) mengunci CSS + 3 bundle JS sekaligus.

> Snippet siap salin untuk `Index.html` aplikasi baru: **[CDN_SNIPPET.md](CDN_SNIPPET.md)**.

---

## 📦 Berkas

| Berkas | Isi | Dimuat via |
|---|---|---|
| `app-common.css` → `app-common.min.css` | Design tokens, CSS variables (tema per app bisa di-override), kelas util, animasi | `<link>` di `<head>` |
| `app-components.js` → `.min.js` | 7 komponen inti (katalog di bawah) | `<script>` sebelum `</body>` |
| `app-modules.js` → `.min.js` | 2 modul besar: `<app-profile>`, `<app-settings>` | `<script>` sebelum `</body>` |
| `app-core.js` → `.min.js` | `AppCore`: `create()`, sesi aman (safeSession/safeLocal), `loadLib()` on-demand, cache SWR, `callServer` + `_cacheBust` | `<script>` sebelum `</body>` |

Cek versi runtime di Console browser:
```javascript
AppCore.version        // "2.6.5"
AppComponents.version  // "2.6.5"
AppModules.version     // "2.6.5"
```

---

## 🧩 Katalog Komponen & Props

### `<app-badge>` — label status (v2.6.5: 32 pemakaian di si-kompetensi)
| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `status` | String | `'menunggu'` | Menentukan warna + label otomatis. Sinonim diterima: `disetujui/approved/aktif/active/tuntas/success` (hijau), `menunggu/pending` (kuning), `proses` (biru), `revisi/revision` (oranye), `ditolak/rejected/inactive` (merah), `definitif`, `plt`, `kosong` (netral) |
| `label` | String | `''` | Timpa teks otomatis dari `status` |
| `size` | String | `'sm'` | `'sm'` atau `'md'` |
| `icon` | String | `''` | Class Font Awesome opsional, mis. `fa-solid fa-check` |

```html
<app-badge status="disetujui" />
<app-badge status="menunggu" size="md" icon="fa-solid fa-clock" />
```

### `<app-stat-card>` — kartu metrik KPI (baru di v2.6.5; 13 pemakaian di si-kompetensi)
| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `title` | String | `'Metrik'` | Judul kecil di atas |
| `value` | Number/String | `0` | Number otomatis diformat `toLocaleString('id-ID')` (mis. `12345` → `12.345`) |
| `icon` | String | `'fa-solid fa-chart-simple'` | Ikon Font Awesome |
| `color` | String | `'emerald'` | Gradasi: `emerald` / `sky` / `amber` / `purple` / `rose` |
| `subtext` | String | `''` | Keterangan kecil di bawah nilai |

```html
<app-stat-card title="Total Pegawai" :value="1234" icon="fa-solid fa-users" color="sky" subtext="Aktif per hari ini" />
```

### Komponen lain
| Komponen | Fungsi |
|---|---|
| `<app-login>` | Layar autentikasi mandiri + launcher SSO SI-PLATFORM |
| `<app-sidebar>` | Navigasi responsif, collapse mode, indikator role |
| `<app-header>` | Topbar: dark mode switch, notifikasi, profil user |
| `<app-modal>` | Dialog responsif berbasis animasi CSS |
| `<app-crud-table>` | Tabel interaktif: pencarian, sorting, paginasi, ekspor Excel/PDF, aksi CRUD |
| `<app-profile>` *(app-modules)* | Profil ASN mandiri, data terverifikasi SIMPEG |
| `<app-settings>` *(app-modules)* | Pengaturan konfigurasi sistem berbasis tab |

---

## ⚙️ AppCore (app-core.js)

- **`AppCore.create({...})`** — factory instance Vue 3 dengan sesi aman. **Jangan pernah** mengakses `localStorage`/`sessionStorage` mentah (bug produksi v2.6.0 di iframe SSO cross-site) — selalu lewat helper `safeSession`/`safeLocal`.
- **`AppCore.libs` + `loadLib()`** — registry pustaka berat (chart.js 4.4.1, xlsx 0.18.5, jspdf 2.5.1, autotable 3.8.2, pdf-lib 1.17.1) dimuat on-demand, versi terkunci.
- **`callServer(action, data)`** — memanggil `handleAction` GAS; otomatis menambahkan `_cacheBust` (dibuang lagi oleh `dispatchAction` CoreLib v2.2.2+).
- **Cache SWR** — data SIMPEG ditampilkan dari cache lalu disegarkan di latar belakang.

---

## 🏗️ Build & Rilis

```bash
npm install
npm run build     # memperbarui seluruh berkas .min.* dari sumbernya
```

Alur rilis (urutan WAJIB — pelajaran insiden tag v2.6.3):
1. Ubah sumber (`app-*.js` / `app-common.css`) + naikkan `version` internal & `package.json`.
2. `npm run build` → commit `.min.*` hasil build.
3. **Unggah SEMUA berkas ke GitHub dulu.**
4. **Baru buat tag** `vX.Y.Z` (GitHub → Releases). Tag yang dibuat sebelum unggahan = tag basi via jsDelivr.
5. Terakhir, ubah `Index.html` aplikasi konsumen agar menunjuk tag baru.

> jsDelivr meng-cache `@main` hingga 12 jam → aplikasi wajib memakai tag versi.
> Detail snippet & troubleshooting: [CDN_SNIPPET.md](CDN_SNIPPET.md).
