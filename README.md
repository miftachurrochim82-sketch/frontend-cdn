# Frontend CDN — Pemkab Trenggalek

Pustaka UI bersama untuk aplikasi Google Apps Script berbasis **Vue 3 + Tailwind**.
Semua aplikasi memuat UI dari **satu tag versi yang sama** lewat jsDelivr: tampilan seragam, dark mode sinkron, update sekali jalan.

**10 file fisik — 1 CSS + 9 JS — 31 komponen.**

| | |
|---|---|
| Versi aktif | **v2.9.3** |
| Dokumentasi komponen | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| Riwayat versi | [`CHANGELOG.md`](CHANGELOG.md) |
| Demo lokal | [`preview.html`](preview.html) |
| Backend `CoreLib` | repo terpisah — [LIbrary-CoreLib](https://github.com/miftachurrochim82-sketch/LIbrary-CoreLib) |

---

## Cara pakai

Di dalam `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.3/frontend/app-common.min.css">
<script src="https://cdn.jsdelivr.net/npm/vue@3.5.42/dist/vue.global.prod.js"></script>
```

Sebelum `</body>` — muat **hanya modul yang dipakai**, `app-core` wajib dan harus pertama:

```html
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.3/frontend/app-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v2.9.3/frontend/app-components.min.js"></script>
<!-- opsional, sesuai kebutuhan app: -->
<script src="...@v2.9.3/frontend/app-layout.min.js"></script>
<script src="...@v2.9.3/frontend/app-ui.min.js"></script>
<script src="...@v2.9.3/frontend/app-forms.min.js"></script>
<script src="...@v2.9.3/frontend/app-data.min.js"></script>
<script src="...@v2.9.3/frontend/app-charts.min.js"></script>
<script src="...@v2.9.3/frontend/app-workflow.min.js"></script>
<script src="...@v2.9.3/frontend/app-modules.min.js"></script>
```

> **Satu tag untuk semua file.** Jangan mencampur versi antar-file dalam satu aplikasi.

### Contoh minimal

```html
<script>
  AppCore.create({
    appCode: 'si-contoh',
    appTitle: 'SI Contoh',
    storagePrefix: 'sicontoh',
    platformUrl: 'https://script.google.com/.../exec'
  }).mount('#app');
</script>
```

---

## Daftar modul

| File | Isi | Wajib? |
|---|---|---|
| `app-common.css` | Token tema, kelas tombol, grid, alert, drawer, 6 preset tema | **wajib** |
| `app-core.js` | `AppCore.create()`, storage aman, `loadLib()`, SWR cache, sistem tema | **wajib** |
| `app-components.js` | Shell inti: login, sidebar, header, modal, crud-table, stat-card, badge | hampir selalu |
| `app-layout.js` | `app-breadcrumb`, `app-page-header` | opsional |
| `app-ui.js` | `app-tabs`, `app-pagination`, `app-alert`, `app-confirm` | opsional |
| `app-forms.js` | pencarian debounce, date-picker, file-upload, rich-editor, filter lanjutan | opsional |
| `app-data.js` | detail-drawer, export, impor CSV, master-tree, viewer gambar/berkas | opsional |
| `app-charts.js` | `app-chart-line`, `app-configurable-dashboard` | opsional |
| `app-workflow.js` | approval-panel, stepper, audit-timeline, theme-picker | opsional |
| `app-modules.js` | Halaman mandiri `app-profile`, `app-settings` | opsional |

`app-tailwind.min.css` adalah keluaran Tailwind yang sudah jadi (vendored). Tidak punya sumber di repo ini dan tidak dibangun ulang oleh `npm run build`.

---

## Prinsip desain

1. **Satu versi untuk semua berkas** — satu tag git mengunci 10 file sekaligus.
2. **Nol render-blocking** — pustaka berat (Chart.js, XLSX, jsPDF) dimuat on-demand lewat `AppCore.loadLib()`.
3. **SWR cache** — data master SIMPEG tampil instan dari cache, lalu disegarkan di belakang layar.
4. **Low-boilerplate** — aplikasi cukup mendeklarasikan komponen, tidak menulis ulang CSS/JS.
5. **À-la-carte** — aplikasi sederhana cukup memuat 3 file, bukan semuanya.

---

## Pengembangan

```bash
npm ci
npm run build    # bangun ulang 10 artefak .min + sinkronkan versi
npm run check    # verifikasi artefak sinkron dengan sumber (dipakai CI)
```

**`package.json` adalah satu-satunya sumber versi.** `npm run build` menyuntikkannya ke seluruh berkas sumber — jangan mengedit literal versi secara manual.

Artefak `*.min.js` dan `*.min.css` **sengaja di-commit** karena jsDelivr menyajikannya langsung dari tag git. CI akan gagal bila artefak tidak sinkron dengan sumbernya.

### Merilis versi baru

```bash
npm version patch          # atau minor / major
npm run build
git add -A && git commit -m "release: vX.Y.Z"
git tag vX.Y.Z && git push --follow-tags
```

Lalu perbarui pin versi di aplikasi konsumen.

---

## Arsip

Dokumen perencanaan historis (`ROADMAP_CDN.md`, `RENCANA_CDN_LENGKAP.md`, panduan ekosistem lama) dipindahkan ke [`docs/arsip/`](docs/arsip/) dan tidak lagi dipelihara.

Hasil audit teknis repo ini ada di [`AUDIT.md`](AUDIT.md).

## Lisensi

MIT
