# Frontend CDN — Pemkab Trenggalek

Pustaka UI bersama untuk aplikasi Google Apps Script berbasis **Vue 3 + Tailwind**.

**2 berkas. 11 komponen. 1 tag versi.**

| | |
|---|---|
| Versi aktif | **v3.0.0** |
| Konsumen | `starter-kit`, `si-data` |
| Katalog komponen | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| Riwayat versi | [`CHANGELOG.md`](CHANGELOG.md) |
| Demo & uji asap | [`preview.html`](preview.html) |
| Backend `CoreLib` | repo terpisah — [LIbrary-CoreLib](https://github.com/miftachurrochim82-sketch/LIbrary-CoreLib) |

---

## Cara pakai

Di dalam `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v3.0.0/frontend/app.min.css">
<script src="https://cdn.jsdelivr.net/npm/vue@3.5.42/dist/vue.global.prod.js"></script>
```

Sebelum `</body>`:

```html
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@v3.0.0/frontend/app.min.js"></script>
<script>
  AppCore.create({
    appCode: 'si-contoh',
    appTitle: 'SI Contoh',
    storagePrefix: 'sicontoh',
    platformUrl: 'https://script.google.com/.../exec'
  }).mount('#app');
</script>
```

Itu saja. Tidak ada keputusan "modul mana yang perlu dimuat".

---

## 11 komponen

| Komponen | Keterangan |
|---|---|
| `app-login` | Halaman login + SSO ke si-platform |
| `app-sidebar` | Navigasi samping, role-gated |
| `app-header` | Bilah atas: judul, user, dark mode |
| `app-badge` | Label status multi-domain |
| `app-stat-card` | Kartu metrik KPI |
| `app-modal` | Dialog |
| `app-empty-state` | Keadaan kosong |
| `app-skeleton` | Placeholder saat memuat |
| `app-chart-bar` | Grafik batang (Chart.js on-demand) |
| `app-chart-doughnut` | Grafik donat (Chart.js on-demand) |
| `app-theme-picker` | Pemilih tema, 6 preset |

Props lengkap ada di [`docs/COMPONENTS.md`](docs/COMPONENTS.md).

> **v3.0.0 menghapus 27 komponen** yang tidak dipanggil oleh satu pun aplikasi.
> Aplikasi yang masih membutuhkannya cukup tetap menunjuk tag `v2.9.3` —
> jsDelivr menyajikan tiap tag secara permanen.

---

## Struktur repo

```
frontend/
  app.css              sumber CSS
  app.min.css          ← disajikan ke aplikasi
  app-core.js          sumber: AppCore (sesi, SWR, tema, loadLib)
  app-components.js    sumber: 11 komponen
  app.min.js           ← disajikan ke aplikasi (bundel core + komponen)
tools/build.mjs        build & verifikasi
preview.html           demo sekaligus uji asap
```

---

## Pengembangan

```bash
npm ci
npm run build    # bangun app.min.js + app.min.css, sinkronkan versi
npm run check    # verifikasi artefak sinkron dengan sumber (dipakai CI)
```

**`package.json` adalah satu-satunya sumber versi.** `npm run build` menyuntikkannya ke berkas sumber — jangan mengedit literal versi secara manual.

Artefak `.min` **sengaja di-commit** karena jsDelivr menyajikannya langsung dari tag git. CI gagal bila artefak tidak sinkron dengan sumbernya.

Untuk melihat demo lokal: `npx http-server -p 8080 .` lalu buka `preview.html`.

### Merilis versi baru

```bash
npm version patch          # atau minor / major
npm run build
git add -A && git commit -m "release: vX.Y.Z"
git tag vX.Y.Z && git push --follow-tags
```

Lalu perbarui pin versi di `starter-kit` dan `si-data`.

---

## Arsip

Dokumen perencanaan historis ada di [`docs/arsip/`](docs/arsip/) dan tidak dipelihara.
Hasil audit teknis repo ini ada di [`AUDIT.md`](AUDIT.md).

## Lisensi

MIT
