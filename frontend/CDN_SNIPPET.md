# 📋 Snippet Standar Pemuatan CDN — v2.6.5

> **Salin blok di bawah ini ke `Index.html` setiap web app baru.**
> Dokumen ini dibuat untuk menghentikan tiga pola pemuatan yang saling
> bertentangan antar repo (lihat bagian *Masalah yang diperbaiki*).

---

## 1. Blok standar `<head>`

```html
  <!-- ========== Pustaka pihak ketiga (WAJIB) ========== -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { darkMode: 'class' };</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/vue@3.4.21/dist/vue.global.prod.js"></script>

  <!-- ========== Shared CDN Pemkab Trenggalek ==========
       ATURAN:
       1. Pakai TAG VERSI (mis. @v2.6.5), JANGAN @main.
          -> @main di-cache jsDelivr hingga 12 jam, update Anda tidak
             langsung terlihat dan tiap app bisa dapat versi berbeda.
       2. Pakai berkas .min (sudah di-build & di-commit di repo ini).
       3. JANGAN muat chart.js / xlsx / jspdf / pdf-lib di sini.
          Semua itu dimuat otomatis saat dibutuhkan lewat AppCore.loadLib().
  -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.6.5/frontend/app-common.min.css">
```

## 2. Blok standar sebelum `</body>`

```html
  <!-- Shared CDN: JS (urutan bebas — AppCore membaca window.AppComponents
       & window.AppModules saat create() dipanggil) -->
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.6.5/frontend/app-components.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.6.5/frontend/app-modules.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.6.5/frontend/app-core.min.js"></script>

  <!-- Local App JS -->
  <?!= include('J_State'); ?>
  <?!= include('J_Helpers'); ?>
  <?!= include('J_Api'); ?>
  <?!= include('J_Actions'); ?>
  <?!= include('J_Export'); ?>
  <?!= include('J_App'); ?>
```

---

## 2b. Komponen baru di v2.6.5

| Komponen | Perubahan | Contoh |
|---|---|---|
| `<app-badge>` | Prop baru `icon` (class Font Awesome, opsional) | `<app-badge status="disetujui" icon="fa-solid fa-check" />` |
| `<app-stat-card>` | **Baru** — kartu metrik KPI: `title`, `value` (Number diformat id-ID otomatis), `icon`, `color` (emerald/sky/amber/purple/rose), `subtext` | `<app-stat-card title="Total Pegawai" :value="1234" color="sky" />` |

Katalog props lengkap: [`README.md`](README.md) folder ini.

---

## 3. Registry pustaka (`AppCore.libs`) — baru di v2.6.0

Semua URL pustaka berat kini **terpusat di satu tempat** dan dimuat
on-demand. Aplikasi tidak perlu lagi menulis URL atau pengecekan
`typeof` sendiri.

| Nama | Pustaka | Versi terkunci | Muat otomatis oleh |
|---|---|---|---|
| `chart` | Chart.js | 4.4.1 | `ensureChartLibrary()` |
| `xlsx` | SheetJS | 0.18.5 | `exportExcel()` |
| `jspdf` | jsPDF | 2.5.1 | `exportPDF()` |
| `autotable` | jsPDF-AutoTable | 3.8.2 | `exportPDF()` (lewat grup `pdf`) |
| `pdflib` | pdf-lib | 1.17.1 | — (panggil manual) |
| `pdf` | *grup*: jspdf + autotable | — | `exportPDF()` |

### Cara pakai

```javascript
// Di dalam methods Vue (instance app buatan AppCore.create):
async renderGrafik() {
  if (!(await this.loadLib('chart'))) return;   // toast error otomatis
  new Chart(ctx, { /* ... */ });
}

// Beberapa pustaka sekaligus:
await this.loadLib(['chart', 'xlsx']);

// Tanpa toast (tangani error sendiri):
await this.loadLib('pdflib', { silent: true });

// Dari luar instance Vue (mis. di helper global):
await AppCore.loadLib('xlsx');

// Menambah pustaka baru: cukup tambah satu entri di LIBS (app-core.js),
// tidak perlu menulis loader:
//   moment: { url: 'https://.../moment.min.js',
//             test: function(){ return typeof moment !== 'undefined'; },
//             label: 'Moment.js' }
```

**Catatan dependensi:** entri boleh punya `after: 'namaLib'` — pustaka
itu dimuat lebih dulu (dipakai `autotable` → `jspdf`).

---

## 4. Masalah yang diperbaiki di v2.6.0

Sebelum rilis ini, ketiga aplikasi memuat CDN dengan cara berbeda:

| Aplikasi | URL | Berkas | Cache buster | Masalah |
|---|---|---|---|---|
| si-kompetensi | `@main` | non-min | `?v=2.5.1` | Unduh kode mentah (~74 KB) padahal `.min` tersedia |
| si-pelaporan | `@main` | `.min` | **tidak ada** | Bisa macet di versi lama hingga 12 jam |
| si-platform | `@v2.4.0` | hanya CSS | ✅ tag | Tidak memuat JS CDN |

Selain itu `ensureChartLibrary()` memuat `https://cdn.jsdelivr.net/npm/chart.js`
**tanpa versi terkunci** — Chart.js bisa naik versi besar (breaking) tanpa
ada yang mengubah kode, dan aplikasi rusak tanpa sebab yang jelas.
Sekarang dikunci ke `4.4.1`.

### Konsekuensi untuk alur kerja Anda

Karena CDN dimuat lewat jsDelivr dari GitHub, **perubahan CDN baru berlaku
setelah masuk ke GitHub**. Urutannya:

1. Ubah berkas di `frontend-cdn/frontend/`
2. Jalankan `npm run build` (memperbarui `.min`)
3. Commit & push / unggah lewat web GitHub
4. **Buat tag rilis** `vX.Y.Z` (GitHub → Releases → Draft a new release)
   — ini yang membuat URL `@vX.Y.Z` bisa dipakai dan cache-nya permanen
5. Baru ubah `Index.html` aplikasi untuk menunjuk tag tersebut

> ⚠️ PELAJARAN v2.6.3: buat tag HANYA setelah SEMUA berkas terunggah.
> Tag v2.6.3 sempat menunjuk app-components lama karena tag dibuat lebih
> dulu daripada unggahan. Mulai v2.6.4 seluruh berkas memakai SATU nomor
> versi ekosistem — satu tag berlaku untuk semua berkas.

> Selama tag belum dibuat, URL `@vX.Y.Z` akan mengembalikan **404**.
> Jika Anda ingin menguji sebelum membuat tag, sementara pakai
> `@main` + `?v=X.Y.Z`, lalu ganti ke tag versi setelah rilis.

---

## 5. Cek cepat setelah update

Buka aplikasi, jalankan di Console browser:

```javascript
AppCore.version        // harus "2.6.5" (atau lebih baru)
Object.keys(AppCore.libs)   // ['chart','xlsx','jspdf','autotable','pdflib','pdf']
AppComponents.version  // harus sama dengan tag yang Anda rujuk
```

Kalau `AppCore.version` masih versi lama, berarti jsDelivr belum menyegarkan
cache — paksa dengan menaikkan query string (`?v=2.6.5`) atau tunggu.
