# Frontend CDN — Shared Assets untuk Web App GAS

Repository ini berisi aset frontend bersama yang digunakan oleh beberapa aplikasi web berbasis Google Apps Script (GAS) di lingkungan Pemerintah Kabupaten Trenggalek.

Tujuan utama: mengurangi duplikasi kode HTML/CSS/JS, mempermudah pemeliharaan, dan mempercepat pengembangan aplikasi baru.

---

## 📦 Isi Repository

| File               | Fungsi                                                        |
|--------------------|---------------------------------------------------------------|
| `app-common.css`   | Kumpulan gaya global, tema, komponen UI, dan dark mode.       |
| `app-components.js`| Komponen Vue siap pakai: Login, Sidebar, Header, Layout.      |
| `app-core.js`      | Factory function untuk inisialisasi Vue app dengan AppConfig. |

---

## 🚀 Cara Penggunaan

### 1. Akses melalui jsDelivr

Gunakan URL berikut di dalam `Index.html` aplikasi GAS:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-common.css">
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-components.js"></script>
<script src="https://cdn.jsdelivr.net/gh/miftachurrochim82-sketch/frontend-cdn@main/app-core.js"></script>
