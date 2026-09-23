/* ============================================================
   app-components.js — Komponen Vue 3 Siap Pakai (Shared CDN v2.9.0)
   Komponen global (inti):
   1. <app-login>      : Layar Autentikasi Single Sign-On (SSO)
   2. <app-sidebar>    : Navigasi Samping Themed (per-app colors)
   3. <app-header>     : Top Bar Universal + Slot extra-actions
   4. <app-badge>      : Status Badge Multi-domain (v2.9.0: +draft/baru/diproses/selesai/batal)
   5. <app-stat-card>  : Kartu Widget Metrik Dashboard
   6. <app-modal>      : Universal Modal Box
   7. <app-crud-table> : Smart Data Table
   + 8-14 via modular files (app-layout, app-ui, app-forms, app-data, app-charts, app-workflow) — semua merge ke AppComponents

   Changelog v2.9.0 (2026-09-22) — 8 FILE & 31 OPSI:
   - 🔧 BADGE: tambah status transaksi starter-kit (draft/baru/diproses/selesai/batal) — cermin V_Utama
   - 🔧 VERSION: bump ke 2.9.0 (sinkron 8 file). AppLogin default version → 2.9.0
   - 📦 MODULAR: 6 file baru (app-layout/ui/forms/data/charts/workflow) otomatis merge ke AppComponents

   Changelog v2.6.5 (2026-09-15):
  - 🆕 AppBadge: prop `icon` (ikon FA menggantikan titik bila diisi).
  - 🆕 AppBadge: status baru — info (sky), emerald/tuntas (hijau),
    purple/pppk (ungu). Perilaku status lama tidak berubah.

  Changelog v2.6.4 (2026-09-15):
   - 🔢 Penyelarasan versi tunggal ekosistem (lihat changelog app-core).
     Isi komponen TIDAK berubah sejak 2.6.3 (size 3xl/4xl/5xl + subtitle).
   - ⚠️ CATATAN OPERASIONAL: tag v2.6.3 di GitHub sempat menunjuk isi
     components lama (2.6.0) karena berkas terunggah setelah tag dibuat.
     Mulai 2.6.4: unggah SEMUA berkas dahulu, BARU buat tag.

   Changelog v2.6.3 (2026-09-15):
   - 🆕 ADD: <app-modal> ukuran '3xl', '4xl', '5xl' (form lebar dengan grid
     3 kolom kini muat tanpa memaksa max-w-2xl).
   - 🆕 ADD: prop `subtitle` pada <app-modal> — baris keterangan kecil di
     bawah judul, menggantikan pola subtitle yang dulu ditulis manual di
     header tiap modal aplikasi.
   - 🔢 Versi berkas: 2.6.0 → 2.6.3. Tag rilis ekosistem: v2.6.3.

   Changelog v2.6.0 (2026-09-15):
   - 🔢 Penyelarasan versi: seluruh berkas CDN kini memakai SATU nomor
     versi bersama (2.6.0) agar bisa dirujuk lewat satu tag git @v2.6.0.
     TIDAK ada perubahan perilaku/komponen pada rilis ini.
   - Default prop `version` pada <app-login> ikut diselaraskan ke v2.6.0.

   Changelog v2.4.0 (2026-09-13):
   - 🎨 THEMING: <app-sidebar> sekarang pakai CSS class .app-sidebar*
     (didefinisikan di app-common.css). Warna mengikuti --primary-*
     CSS variables — tiap web app cukup override :root di Index.html
     untuk ganti tema (hijau/biru/kuning/dst).
   - Sidebar light mode kini tinted sesuai tema (bukan gelap).
   - Dark mode sidebar tetap gelap dengan accent --primary-accent.
   Changelog v2.3.2 (2026-09-13):
   - FIX: AppHeader — replace(/_/g, ' ') agar semua underscore → spasi.
   Changelog v2.3.1 (2026-09-13):
   - FIX: AppHeader — slot extra-actions; AppCrudTable — v-else fix.
   ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
     1. <app-login>
     ---------------------------------------------------------- */
  var AppLogin = {
    name: 'AppLogin',
    props: {
      appTitle:     { type: String, default: 'Aplikasi' },
      appSubtitle:  { type: String, default: 'Sistem Informasi Terintegrasi SIMPEG' },
      instansi:     { type: String, default: 'Pemerintah Kabupaten Trenggalek' },
      tagline:      { type: String, default: 'Autentikasi telah terintegrasi terpusat (SSO). Silakan masuk menggunakan akun resmi Anda pada platform utama.' },
      version:      { type: String, default: 'v2.9.0' },
      logoSvg:      { type: String, default: '' },
      isProcessing: { type: Boolean, default: false },
      errorMessage: { type: String, default: '' }
    },
    emits: ['login'],
    template: '\
    <div class="min-h-screen flex items-center justify-center p-4 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/60 via-slate-900 to-slate-950">\
      <div class="bg-white dark:bg-slate-800/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700/60 transition-all duration-300 relative overflow-hidden">\
        <div class="absolute top-0 left-0 right-0 h-1.5" :style="{ background: \'linear-gradient(90deg, var(--primary), var(--primary-dark))\' }"></div>\
        <div class="text-center mb-6 pt-2">\
          <div class="relative inline-block group">\
            <div class="absolute -inset-1 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300" :style="{ background: \'linear-gradient(90deg, var(--primary), var(--primary-dark))\' }"></div>\
            <img v-if="logoSvg" :src="logoSvg" :alt="\'Logo \' + instansi"\
                 class="relative w-24 h-24 mx-auto mb-3 object-contain drop-shadow-md transform transition-transform duration-300 hover:scale-105">\
            <div v-else class="relative w-24 h-24 mx-auto mb-3 rounded-3xl text-white flex items-center justify-center text-4xl shadow-xl" :style="{ background: \'linear-gradient(135deg, var(--primary), var(--primary-dark))\', boxShadow: \'0 20px 25px -5px rgba(var(--primary-rgb), 0.3)\' }">\
              <i class="fa-solid fa-cube"></i>\
            </div>\
          </div>\
          <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{{ appTitle }}</h1>\
          <p class="text-xs font-semibold mt-0.5 uppercase tracking-wider" :style="{ color: \'var(--primary)\' }">{{ instansi }}</p>\
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ appSubtitle }}</p>\
        </div>\
        <div class="space-y-4">\
          <div class="p-3.5 rounded-2xl flex items-start gap-3" :style="{ background: \'var(--primary-light)\', border: \'1px solid var(--primary-lighter)\' }">\
            <div class="p-2 rounded-xl shrink-0 mt-0.5" :style="{ background: \'var(--primary-lighter)\', color: \'var(--primary-dark)\' }">\
              <i class="fa-solid fa-shield-halved text-base"></i>\
            </div>\
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{{ tagline }}</p>\
          </div>\
          <button v-if="!isProcessing" @click="$emit(\'login\')"\
                  class="w-full text-white font-semibold py-3.5 px-4 rounded-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group"\
                  :style="{ background: \'linear-gradient(90deg, var(--primary), var(--primary-dark))\', boxShadow: \'0 10px 15px -3px rgba(var(--primary-rgb), 0.2)\' }">\
            <i class="fa-solid fa-right-to-bracket text-lg transition-transform group-hover:translate-x-1"></i>\
            <span>Masuk via SI-Platform</span>\
          </button>\
          <div v-else class="py-4 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center space-y-2.5">\
            <div class="relative flex items-center justify-center">\
              <div class="w-9 h-9 rounded-full border-3 animate-spin" :style="{ borderColor: \'var(--primary-lighter)\', borderTopColor: \'var(--primary)\' }"></div>\
              <i class="fa-solid fa-key text-[10px] absolute" :style="{ color: \'var(--primary)\' }"></i>\
            </div>\
            <p class="text-xs font-semibold animate-pulse" :style="{ color: \'var(--primary-dark)\' }">Menghubungkan &amp; memvalidasi tiket SSO...</p>\
          </div>\
          <div v-if="errorMessage" class="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-start gap-2.5 transition-all">\
            <i class="fa-solid fa-circle-exclamation text-base text-rose-500 shrink-0 mt-0.5"></i>\
            <div class="flex-1">\
              <span class="font-semibold block">Gagal Autentikasi</span>\
              <span class="text-rose-600 dark:text-rose-400 leading-tight block mt-0.5">{{ errorMessage }}</span>\
            </div>\
          </div>\
        </div>\
        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-center">\
          <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">\
            {{ appTitle }} {{ version }} &bull; Pemkab Trenggalek\
          </p>\
        </div>\
      </div>\
    </div>'
  };

  /* ----------------------------------------------------------
     2. <app-sidebar> — v2.4.0: Themed via CSS classes
     ---------------------------------------------------------- */
  var AppSidebar = {
    name: 'AppSidebar',
    props: {
      collapsed:  { type: Boolean, default: false },
      mobileOpen: { type: Boolean, default: false },
      dark:       { type: Boolean, default: false },
      currentPage:{ type: String, default: 'dashboard' },
      isAdmin:    { type: Boolean, default: false },
      user:       { type: Object, default: function () { return {}; } },
      brand:      { type: Object, default: function () { return {}; } },
      menu:       { type: Array, default: function () { return []; } }
    },
    emits: ['navigate', 'toggle', 'close', 'logout'],
    computed: {
      groups: function () {
        var out = [];
        var flat = [];
        var menu = this.menu || [];
        for (var i = 0; i < menu.length; i++) {
          var m = menu[i];
          if (m && m.items) { out.push({ name: m.name || '', items: m.items }); }
          else if (m) { flat.push(m); }
        }
        if (flat.length) out.push({ name: '', items: flat });
        return out;
      },
      visibleItems: function () {
        var self = this;
        return (this.groups || []).map(function (g) {
          return {
            name: g.name,
            items: g.items.filter(function (it) { return !it.adminOnly || self.isAdmin; })
          };
        }).filter(function (g) { return g.items.length > 0; });
      },
      brandTitle:    function () { return this.brand.title || 'Aplikasi'; },
      brandSubtitle: function () { return this.brand.subtitle || 'Pemkab Trenggalek'; },
      logoChar:      function () { return this.brand.logoChar || (this.brandTitle.charAt(0) || 'A'); },
      logoIcon:      function () { return this.brand.logoIcon || 'fa-solid fa-cube'; }
    },
    methods: {
      itemClass: function (id) {
        var base = 'app-sidebar-item relative flex items-center px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group text-xs sm:text-sm font-semibold';
        if (this.currentPage === id) return base + ' active';
        return base;
      },
      iconClass: function (id) {
        return 'app-sidebar-icon w-6 text-center text-sm shrink-0 transition-transform group-hover:scale-110';
      },
      go: function (id) { this.$emit('navigate', id); }
    },
    template: '\
    <aside :class="[\
        \'app-sidebar fixed lg:static inset-y-0 left-0 z-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none shadow-2xl lg:shadow-none\',\
        collapsed ? \'w-20\' : \'w-64\',\
        mobileOpen ? \'translate-x-0\' : \'-translate-x-full lg:translate-x-0\'\
      ]">\
      <div class="app-sidebar-header h-20 px-4 flex items-center justify-between shrink-0 transition-colors">\
        <div v-if="!collapsed" class="flex items-center gap-3 overflow-hidden animate-fade-in">\
          <div class="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0 border"\
               :style="{ background: \'linear-gradient(135deg, var(--primary), var(--primary-dark))\', boxShadow: \'0 8px 12px -2px rgba(var(--primary-rgb), 0.25)\', borderColor: \'var(--primary-lighter)\' }">\
            <i :class="logoIcon"></i>\
          </div>\
          <div class="min-w-0">\
            <h2 class="app-sidebar-brand-title text-sm font-extrabold tracking-tight truncate">{{ brandTitle }}</h2>\
            <p class="app-sidebar-brand-subtitle text-[10px] font-semibold tracking-wider uppercase truncate">{{ brandSubtitle }}</p>\
          </div>\
        </div>\
        <div v-else class="mx-auto">\
          <div class="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-lg border"\
               :style="{ background: \'linear-gradient(135deg, var(--primary), var(--primary-dark))\', boxShadow: \'0 8px 12px -2px rgba(var(--primary-rgb), 0.25)\', borderColor: \'var(--primary-lighter)\' }">\
            {{ logoChar }}\
          </div>\
        </div>\
        <button v-if="!collapsed" @click="$emit(\'toggle\')"\
                class="app-sidebar-toggle hidden lg:flex w-8 h-8 rounded-xl items-center justify-center text-xs transition-all duration-200 shrink-0" title="Kecilkan Sidebar">\
          <i class="fa-solid fa-chevron-left"></i>\
        </button>\
        <button @click="$emit(\'close\')" class="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-base shrink-0" title="Tutup Menu">\
          <i class="fa-solid fa-xmark"></i>\
        </button>\
      </div>\
      <nav class="flex-1 px-3 py-5 space-y-6 overflow-y-auto no-scrollbar">\
        <div v-for="(group, gi) in visibleItems" :key="gi" class="space-y-1.5">\
          <div v-if="group.name && !collapsed" class="app-sidebar-group-label px-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">\
            <span class="w-1.5 h-1.5 rounded-full" :style="{ background: \'var(--primary)\' }"></span>\
            <span>{{ group.name }}</span>\
          </div>\
          <div class="space-y-1">\
            <a v-for="item in group.items" :key="item.id" @click="go(item.id)"\
               :class="itemClass(item.id)" :title="collapsed ? item.label : \'\'">\
              <div v-if="currentPage === item.id" class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white/60 rounded-r-full"></div>\
              <i :class="[item.icon, iconClass(item.id)]"></i>\
              <span v-if="!collapsed" class="ml-2.5 text-xs sm:text-sm truncate font-semibold">{{ item.label }}</span>\
            </a>\
          </div>\
        </div>\
      </nav>\
      <div class="app-sidebar-footer p-3.5 shrink-0 flex flex-col gap-2">\
        <button v-if="collapsed" @click="$emit(\'toggle\')"\
                class="app-sidebar-toggle hidden lg:flex w-full h-10 rounded-xl items-center justify-center text-xs transition mb-1"\
                title="Perluas Sidebar">\
          <i class="fa-solid fa-chevron-right"></i>\
        </button>\
        <button @click="$emit(\'logout\')"\
                class="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white transition-all text-xs font-extrabold shadow-lg shadow-rose-600/20 active:scale-[0.98]"\
                :title="collapsed ? \'Keluar dari Aplikasi\' : \'\'">\
          <i class="fa-solid fa-power-off text-sm shrink-0"></i>\
          <span v-if="!collapsed" class="ml-2.5">Keluar Sesi</span>\
        </button>\
      </div>\
    </aside>\
    <div v-if="mobileOpen" @click="$emit(\'close\')" class="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"></div>'
  };

  /* ----------------------------------------------------------
     3. <app-header> — v2.4.0: pakai --primary vars
     ---------------------------------------------------------- */
  var AppHeader = {
    name: 'AppHeader',
    props: {
      dark:        { type: Boolean, default: false },
      appTitle:    { type: String, default: 'Aplikasi' },
      currentPage: { type: String, default: '' },
      pageIcons:   { type: Object, default: function () { return {}; } },
      user:        { type: Object, default: function () { return {}; } }
    },
    emits: ['toggle-dark', 'toggle-mobile', 'navigate'],
    computed: {
      pageIcon: function () { return this.pageIcons[this.currentPage] || 'fa-solid fa-circle'; },
      userName: function () { return (this.user && (this.user.display_name || this.user.email)) || 'Pengguna'; },
      currentPageLabel: function () {
        return String(this.currentPage || '').replace(/_/g, ' ');
      }
    },
    template: '\
    <header :class="[\
      \'sticky top-0 z-30 px-4 py-3 flex items-center justify-between rounded-2xl shadow-sm backdrop-blur-md transition-all duration-200 border select-none\',\
      dark ? \'bg-slate-900/90 border-slate-800 text-slate-100\' : \'bg-white/90 border-slate-200/80 text-slate-800\'\
    ]">\
      <div class="flex items-center gap-3">\
        <button @click="$emit(\'toggle-mobile\')"\
                :class="[\
                  \'w-10 h-10 rounded-xl flex items-center justify-center border active:scale-95 transition-all lg:hidden\',\
                  dark ? \'hover:bg-slate-800 text-slate-300 border-slate-700\' : \'hover:bg-slate-100 text-slate-700 border-slate-200\'\
                ]" title="Buka Navigasi Mobile">\
          <i class="fa-solid fa-bars text-lg"></i>\
        </button>\
        <div class="flex items-center gap-2">\
          <span class="font-extrabold tracking-tight text-base sm:text-lg text-slate-900 dark:text-white hidden sm:inline-block">{{ appTitle }}</span>\
          <span class="text-slate-300 dark:text-slate-700 font-light hidden sm:inline-block">/</span>\
          <span class="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg border capitalize"\
                :style="{ color: \'var(--primary)\', background: \'var(--primary-light)\', borderColor: \'var(--primary-lighter)\' }">\
            <i :class="pageIcon" class="mr-1.5 text-xs"></i>\
            {{ currentPageLabel }}\
          </span>\
        </div>\
      </div>\
      <div class="flex items-center gap-2.5 sm:gap-3">\
        <slot name="extra-actions"></slot>\
        <button @click="$emit(\'toggle-dark\')"\
                :class="[\
                  \'w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90\',\
                  dark ? \'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700\' : \'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100\'\
                ]" :title="dark ? \'Beralih ke Mode Terang\' : \'Beralih ke Mode Gelap\'">\
          <i :class="dark ? \'fa-solid fa-sun\' : \'fa-solid fa-moon\'" class="text-sm"></i>\
        </button>\
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"\
             :style="{ color: \'var(--primary-dark)\', background: \'var(--primary-light)\', borderColor: \'var(--primary-lighter)\' }">\
          <span class="relative flex h-2 w-2">\
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :style="{ background: \'var(--primary)\' }"></span>\
            <span class="relative inline-flex rounded-full h-2 w-2" :style="{ background: \'var(--primary)\' }"></span>\
          </span>\
          <span>Online</span>\
        </div>\
        <div class="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>\
        <div class="flex items-center gap-2.5 cursor-pointer group" @click="$emit(\'navigate\', \'profil\')">\
          <div class="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow-md group-hover:scale-105 transition-transform uppercase"\
               :style="{ background: \'linear-gradient(135deg, var(--primary), var(--primary-dark))\', boxShadow: \'0 4px 6px -1px rgba(var(--primary-rgb), 0.2)\' }">\
            {{ userName.charAt(0) }}\
          </div>\
          <div class="hidden md:block text-left min-w-0 max-w-[160px]">\
            <p class="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100 truncate">{{ userName }}</p>\
            <div class="flex items-center gap-1 mt-0.5">\
              <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider"\
                    :style="{ color: \'var(--primary-dark)\', background: \'var(--primary-lighter)\' }">{{ (user && user.role) || \'Pegawai\' }}</span>\
            </div>\
          </div>\
        </div>\
      </div>\
    </header>'
  };

  /* ----------------------------------------------------------
     4. <app-badge>
     ---------------------------------------------------------- */
  var AppBadge = {
    name: 'AppBadge',
    props: {
      status: { type: String, default: 'menunggu' },
      label:  { type: String, default: '' },
      size:   { type: String, default: 'sm' },
      icon:   { type: String, default: '' }
    },
    computed: {
      displayLabel: function () {
        if (this.label) return this.label;
        var s = String(this.status || '').toLowerCase();
        var map = {
          'disetujui': 'Disetujui', 'approved': 'Disetujui', 'active': 'Aktif', 'aktif': 'Aktif',
          'menunggu': 'Menunggu', 'pending': 'Menunggu', 'proses': 'Dalam Proses',
          'revisi': 'Perlu Revisi', 'revision': 'Perlu Revisi',
          'ditolak': 'Ditolak', 'rejected': 'Ditolak', 'inactive': 'Nonaktif',
          'definitif': 'Definitif', 'plt': 'PLT', 'kosong': 'Kosong',
          'draft': 'Draft', 'baru': 'Baru', 'diproses': 'Diproses', 'selesai': 'Selesai', 'batal': 'Batal'
        };
        return map[s] || (s.charAt(0).toUpperCase() + s.slice(1));
      },
      badgeClass: function () {
        var s = String(this.status || '').toLowerCase();
        var sz = this.size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]';
        var base = 'inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border ' + sz;
        if (['disetujui', 'approved', 'active', 'aktif', 'definitif', 'success', 'emerald', 'tuntas', 'selesai'].indexOf(s) >= 0) {
          return base + ' bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
        }
        if (['menunggu', 'pending', 'proses', 'plt', 'warning', 'diproses', 'baru'].indexOf(s) >= 0) {
          return base + ' bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
        }
        if (['revisi', 'revision', 'info', 'draft'].indexOf(s) >= 0) {
          return base + ' bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
        }
        if (['ditolak', 'rejected', 'inactive', 'kosong', 'danger', 'failed', 'batal'].indexOf(s) >= 0) {
          return base + ' bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
        }
        if (['purple', 'pppk'].indexOf(s) >= 0) {
          return base + ' bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
        }
        return base + ' bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      },
      dotClass: function () {
        var s = String(this.status || '').toLowerCase();
        if (['disetujui', 'approved', 'active', 'aktif', 'definitif', 'success', 'emerald', 'tuntas', 'selesai'].indexOf(s) >= 0) return 'bg-emerald-500';
        if (['menunggu', 'pending', 'proses', 'plt', 'warning', 'diproses', 'baru'].indexOf(s) >= 0) return 'bg-amber-500';
        if (['revisi', 'revision', 'info', 'draft'].indexOf(s) >= 0) return 'bg-sky-500';
        if (['ditolak', 'rejected', 'inactive', 'kosong', 'danger', 'failed', 'batal'].indexOf(s) >= 0) return 'bg-rose-500';
        if (['purple', 'pppk'].indexOf(s) >= 0) return 'bg-purple-500';
        return 'bg-slate-400';
      }
    },
    template: '\
    <span :class="badgeClass">\
      <i v-if="icon" :class="icon"></i>\
      <span v-else class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>\
      <span>{{ displayLabel }}</span>\
    </span>'
  };

  /* ----------------------------------------------------------
     5. <app-stat-card>
     ---------------------------------------------------------- */
  var AppStatCard = {
    name: 'AppStatCard',
    props: {
      title:   { type: String, default: 'Metrik' },
      value:   { type: [Number, String], default: 0 },
      icon:    { type: String, default: 'fa-solid fa-chart-simple' },
      color:   { type: String, default: 'emerald' },
      subtext: { type: String, default: '' }
    },
    computed: {
      colorClasses: function () {
        var map = {
          emerald: { bg: 'from-emerald-600 to-teal-500' },
          sky:     { bg: 'from-sky-600 to-blue-500' },
          amber:   { bg: 'from-amber-500 to-yellow-500' },
          purple:  { bg: 'from-purple-600 to-indigo-500' },
          rose:    { bg: 'from-rose-600 to-pink-500' }
        };
        return map[this.color] || map.emerald;
      }
    },
    template: '\
    <div class="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4">\
      <div>\
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ title }}</p>\
        <h3 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">\
          {{ typeof value === \'number\' ? value.toLocaleString(\'id-ID\') : value }}\
        </h3>\
        <p v-if="subtext" class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{{ subtext }}</p>\
      </div>\
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr text-white flex items-center justify-center text-xl shadow-md shrink-0" :class="colorClasses.bg">\
        <i :class="icon"></i>\
      </div>\
    </div>'
  };

  /* ----------------------------------------------------------
     6. <app-modal>
     ---------------------------------------------------------- */
  var AppModal = {
    name: 'AppModal',
    props: {
      show:        { type: Boolean, default: false },
      title:       { type: String, default: 'Konfirmasi' },
      subtitle:    { type: String, default: '' },
      icon:        { type: String, default: '' },
      size:        { type: String, default: 'md' },
      loading:     { type: Boolean, default: false },
      confirmText: { type: String, default: 'Simpan' },
      cancelText:  { type: String, default: 'Batal' },
      confirmClass:{ type: String, default: '' },
      showFooter:  { type: Boolean, default: true },
      showConfirm: { type: Boolean, default: true }
    },
    emits: ['close', 'confirm'],
    computed: {
      maxWidthClass: function () {
        var map = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl', '5xl': 'max-w-5xl' };
        return map[this.size] || 'max-w-md';
      },
      confirmStyle: function () {
        if (this.confirmClass) return {};
        return { background: 'var(--primary)', color: '#ffffff' };
      }
    },
    template: '\
    <teleport to="body">\
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">\
        <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh] transition-all" :class="maxWidthClass">\
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">\
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">\
              <i v-if="icon" :class="icon" :style="{ color: \'var(--primary)\' }"></i>\
              <span>{{ title }}</span>\
            </h3>\
            <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 pl-6">{{ subtitle }}</p>\
            <button @click="$emit(\'close\')" class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="Tutup">\
              <i class="fa-solid fa-xmark text-sm"></i>\
            </button>\
          </div>\
          <div class="p-6 overflow-y-auto flex-1">\
            <slot></slot>\
          </div>\
          <div v-if="showFooter" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-end gap-2.5 shrink-0">\
            <button @click="$emit(\'close\')" :disabled="loading" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition">\
              {{ cancelText }}\
            </button>\
            <button v-if="showConfirm" @click="$emit(\'confirm\')" :disabled="loading" class="px-5 py-2 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50" :class="confirmClass" :style="confirmStyle">\
              <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>\
              <span>{{ loading ? \'Memproses...\' : confirmText }}</span>\
            </button>\
          </div>\
        </div>\
      </div>\
    </teleport>'
  };

  /* ----------------------------------------------------------
     7. <app-crud-table>
     ---------------------------------------------------------- */
  var AppCrudTable = {
    name: 'AppCrudTable',
    props: {
      items:      { type: Array, default: function () { return []; } },
      columns:    { type: Array, default: function () { return []; } },
      loading:    { type: Boolean, default: false },
      page:       { type: Number, default: 1 },
      totalPages: { type: Number, default: 1 },
      totalData:  { type: Number, default: 0 },
      emptyText:  { type: String, default: 'Tidak ada data ditemukan.' },
      emptyIcon:  { type: String, default: 'fa-solid fa-folder-open' }
    },
    emits: ['change-page'],
    template: '\
    <div class="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col">\
      <div class="overflow-x-auto">\
        <table class="w-full text-left text-xs">\
          <thead>\
            <tr class="border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 font-extrabold text-slate-400 dark:text-slate-400 uppercase text-[10px] tracking-wider">\
              <th v-for="(col, ci) in columns" :key="ci" class="py-3 px-4" :class="col.thClass || \'\'">\
                {{ col.label }}\
              </th>\
            </tr>\
          </thead>\
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">\
            <tr v-if="loading">\
              <td :colspan="(columns || []).length" class="py-12 text-center text-slate-400">\
                <div class="inline-flex items-center gap-2 font-semibold">\
                  <i class="fa-solid fa-spinner fa-spin text-base" :style="{ color: \'var(--primary)\' }"></i>\
                  <span>Memuat data...</span>\
                </div>\
              </td>\
            </tr>\
            <tr v-else-if="!(items || []).length">\
              <td :colspan="(columns || []).length" class="py-12 text-center text-slate-400">\
                <div class="flex flex-col items-center justify-center space-y-2">\
                  <i :class="emptyIcon" class="text-3xl text-slate-300 dark:text-slate-600"></i>\
                  <p class="font-medium text-xs">{{ emptyText }}</p>\
                </div>\
              </td>\
            </tr>\
            <template v-else>\
              <tr v-for="(row, ri) in items" :key="row.id || ri" class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">\
                <slot name="row" :row="row" :index="ri">\
                  <td v-for="(col, ci) in columns" :key="ci" class="py-3 px-4 text-slate-700 dark:text-slate-300" :class="col.class || \'\'">\
                    {{ row[col.key] }}\
                  </td>\
                </slot>\
              </tr>\
            </template>\
          </tbody>\
        </table>\
      </div>\
      <div class="px-4 py-3 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">\
        <span>\
          Menampilkan halaman <strong class="text-slate-800 dark:text-white">{{ page }}</strong> dari <strong class="text-slate-800 dark:text-white">{{ totalPages }}</strong>\
          <span v-if="totalData"> (Total {{ totalData }} data)</span>\
        </span>\
        <div class="flex items-center gap-1.5">\
          <button @click="$emit(\'change-page\', page - 1)" :disabled="page <= 1"\
                  class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-white dark:hover:bg-slate-800 transition disabled:opacity-40">\
            <i class="fa-solid fa-chevron-left mr-1"></i> Prev\
          </button>\
          <button @click="$emit(\'change-page\', page + 1)" :disabled="page >= totalPages"\
                  class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-white dark:hover:bg-slate-800 transition disabled:opacity-40">\
            Next <i class="fa-solid fa-chevron-right ml-1"></i>\
          </button>\
        </div>\
      </div>\
    </div>'
  };


  /* ----------------------------------------------------------
     8. <app-empty-state> (baru v2.7.0 / B6)
     ---------------------------------------------------------- */
  var AppEmptyState = {
    name: 'AppEmptyState',
    props: {
      icon:        { type: String, default: 'fa-solid fa-box-open' },
      title:       { type: String, default: 'Tidak ada data' },
      subtitle:    { type: String, default: '' },
      actionLabel: { type: String, default: '' }
    },
    emits: ['action'],
    template: '\
    <div class="flex flex-col items-center justify-center text-center py-14 px-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-dashed border-slate-300 dark:border-slate-700">\
      <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 flex items-center justify-center text-2xl mb-4">\
        <i :class="icon"></i>\
      </div>\
      <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ title }}</h3>\
      <p v-if="subtitle" class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">{{ subtitle }}</p>\
      <button v-if="actionLabel" type="button" @click="$emit(\'action\')" class="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition">\
        {{ actionLabel }}\
      </button>\
    </div>'
  };

  /* ----------------------------------------------------------
     9. <app-skeleton> (baru v2.7.0 / B6)
     ---------------------------------------------------------- */
  var AppSkeleton = {
    name: 'AppSkeleton',
    props: {
      type:  { type: String, default: 'lines' },
      count: { type: Number, default: 3 }
    },
    computed: {
      items: function () { var a = []; for (var i = 0; i < this.count; i++) a.push(i); return a; }
    },
    methods: {
      lineWidth: function (n) { return ['w-full', 'w-5/6', 'w-2/3'][n % 3]; }
    },
    template: '\
    <div aria-busy="true" aria-label="Memuat data">\
      <div v-if="type === \'cards\'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">\
        <div v-for="n in items" :key="n" class="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 animate-pulse">\
          <div class="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700"></div>\
          <div class="h-7 w-1/2 rounded bg-slate-200 dark:bg-slate-700 mt-3"></div>\
        </div>\
      </div>\
      <div v-else-if="type === \'table\'" class="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 p-4 animate-pulse">\
        <div class="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 mb-4"></div>\
        <div v-for="n in items" :key="n" class="h-3 w-full rounded bg-slate-100 dark:bg-slate-700/60 mb-3"></div>\
      </div>\
      <div v-else class="space-y-3 animate-pulse">\
        <div v-for="n in items" :key="n" class="h-4 rounded bg-slate-200 dark:bg-slate-700" :class="lineWidth(n)"></div>\
      </div>\
    </div>'
  };

  /* ----------------------------------------------------------
     10. <app-filter-bar> (baru v2.7.0 / B4; v2.8.0 / F1: span per filter)
     ---------------------------------------------------------- */
  var AppFilterBar = {
    name: 'AppFilterBar',
    props: {
      filters:    { type: Array, default: function () { return []; } },
      modelValue: { type: Object, default: function () { return {}; } }
    },
    emits: ['update:modelValue', 'change', 'reset'],
    data: function () {
      return { local: Object.assign({}, this.modelValue) };
    },
    watch: {
      modelValue: {
        deep: true,
        handler: function (v) { this.local = Object.assign({}, v || {}); }
      }
    },
    methods: {
      // v2.8.0 / F1: filter boleh bawa `span` (2..4) → kolom grid lebih lebar
      // (lg:grid-cols-4, sm:grid-cols-2). Tanpa span = 1 (perilaku lama).
      spanCls: function (f) {
        var SPAN = { 2: 'sm:col-span-2 lg:col-span-2', 3: 'sm:col-span-2 lg:col-span-3', 4: 'sm:col-span-2 lg:col-span-4' };
        return SPAN[parseInt(f && f.span, 10)] || '';
      },
      optValue: function (o) { return (o && typeof o === 'object') ? o.value : o; },
      optLabel: function (o) { return (o && typeof o === 'object') ? (o.label || o.value) : o; },
      emitChange: function () {
        var out = Object.assign({}, this.local);
        this.$emit('update:modelValue', out);
        this.$emit('change', out);
      },
      onInput: function (key, val) { this.local[key] = val; this.emitChange(); },
      reset: function () {
        this.local = {};
        this.$emit('update:modelValue', {});
        this.$emit('change', {});
        this.$emit('reset');
      }
    },
    template: '\
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">\
      <div v-for="f in filters" :key="f.key" :class="spanCls(f)">\
        <label class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ f.label }}</label>\
        <select v-if="f.type === \'select\'" :value="local[f.key] || \'\'" @change="onInput(f.key, $event.target.value)" class="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">\
          <option value="">Semua</option>\
          <option v-for="o in (f.options || [])" :key="optValue(o)" :value="optValue(o)">{{ optLabel(o) }}</option>\
        </select>\
        <input v-else :type="f.type === \'date\' ? \'date\' : \'text\'" :value="local[f.key] || \'\'" :placeholder="f.placeholder || \'\'" @input="onInput(f.key, $event.target.value)" class="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">\
      </div>\
      <div class="flex items-end">\
        <button @click="reset" class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition">\
          <i class="fa-solid fa-rotate-right mr-1"></i>Reset\
        </button>\
      </div>\
    </div>'
  };


  /* ----------------------------------------------------------
     11. Chart kit (baru v2.7.0 / B2): <app-chart-bar> & <app-chart-doughnut>
     Chart.js dimuat on-demand via AppCore.loadLib('chart'); warna & grid
     mengikuti dark mode (event 'appcore:dark' dari AppCore.toggleDarkMode).
     ---------------------------------------------------------- */
  function makeChartComponent_(chartType) {
    return {
      name: chartType === 'bar' ? 'AppChartBar' : 'AppChartDoughnut',
      props: {
        labels:   { type: Array, default: function () { return []; } },
        datasets: { type: Array, default: function () { return []; } },
        title:    { type: String, default: '' },
        height:   { type: Number, default: 260 },
        legend:   { type: Boolean, default: true },
        colors:   { type: Array, default: function () { return []; } },
        bare:     { type: Boolean, default: false }   // v2.7.1: embed tanpa kartu (untuk card kustom app)
      },
      data: function () {
        return { chart: null, loadError: false, dark: document.documentElement.classList.contains('dark') };
      },
      computed: {
        palette: function () {
          return this.colors.length ? this.colors :
            ['#059669', '#0284c7', '#f59e0b', '#9333ea', '#f43f5e', '#14b8a6', '#6366f1', '#f97316'];
        }
      },
      watch: {
        labels:   { deep: true, handler: function () { this.render(); } },
        datasets: { deep: true, handler: function () { this.render(); } }
      },
      mounted: function () {
        var self = this;
        this.onDark_ = function (e) { self.dark = !!e.detail; self.render(); };
        window.addEventListener('appcore:dark', this.onDark_);
        this.bootstrap();
      },
      unmounted: function () {
        window.removeEventListener('appcore:dark', this.onDark_);
        if (this.chart) { this.chart.destroy(); this.chart = null; }
      },
      methods: {
        bootstrap: async function () {
          // v2.7.2 FIX: komponen adalah ANAK — method root/mixin (ensureChartLibrary)
          // tidak terlihat dari sini. Gunakan AppCore.loadLib statis; fallback aman.
          var ok = false;
          try {
            if (typeof Chart !== 'undefined') ok = true;
            else if (window.AppCore && window.AppCore.loadLib) ok = await window.AppCore.loadLib('chart');
            else if (this.ensureChartLibrary) ok = await this.ensureChartLibrary();
          } catch (e) { ok = false; }
          if (!ok && typeof Chart === 'undefined') { this.loadError = true; return; }
          this.loadError = false;
          this.render();
        },
        render: function () {
          if (this.loadError || typeof Chart === 'undefined') return;
          if (this.chart) { this.chart.destroy(); this.chart = null; }
          var ctx = this.$refs.canvas;
          if (!ctx) return;
          var self = this;
          var pal = this.palette;
          var gridColor = this.dark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.12)';
          var tickColor = this.dark ? '#94a3b8' : '#64748b';
          var ds = (this.datasets && this.datasets.length) ? this.datasets : [{ label: this.title || 'Data', data: [] }];
          var sets = ds.map(function (d, i) {
            var base = { label: d.label || '', data: d.data || [] };
            if (chartType === 'doughnut') {
              base.backgroundColor = d.colors || pal;
              base.borderColor = self.dark ? '#1e293b' : '#ffffff';
              base.borderWidth = 2;
            } else {
              base.backgroundColor = d.colors || (ds.length === 1 ? pal : pal[i % pal.length]);
              base.borderRadius = 6;
              base.maxBarThickness = 48;
            }
            return base;
          });
          var opts = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: self.legend && (chartType === 'doughnut' || ds.length > 1),
                labels: { color: tickColor, boxWidth: 12, font: { size: 11 } }
              },
              tooltip: { backgroundColor: self.dark ? '#0f172a' : '#1e293b' }
            }
          };
          if (chartType === 'bar') {
            opts.scales = {
              x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 } } },
              y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 }, precision: 0 } }
            };
          }
          this.chart = new Chart(ctx, {
            type: chartType,
            data: { labels: this.labels || [], datasets: sets },
            options: opts
          });
        }
      },
      template: '\
      <div :class="bare ? \'\' : \'p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm\'">\
        <p v-if="title && !bare" class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{{ title }}</p>\
        <div v-if="loadError" class="flex flex-col items-center justify-center py-10 text-center">\
          <i class="fa-solid fa-chart-simple text-2xl text-slate-300 dark:text-slate-600 mb-2"></i>\
          <p class="text-xs text-slate-400 dark:text-slate-500">Grafik gagal dimuat.</p>\
          <button @click="bootstrap" class="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">Coba lagi</button>\
        </div>\
        <div v-else class="relative" :style="{ height: height + \'px\' }">\
          <canvas ref="canvas"></canvas>\
        </div>\
      </div>'
    };
  }

  /* ----------------------------------------------------------
     12. <app-pegawai-picker> (baru v2.7.0 / B1)
     Searchable picker atas master SIMPEG (cache SWR root: masterPegawaiList,
     dimuat otomatis via loadMasterSIMPEG saat pertama fokus).
     ---------------------------------------------------------- */
  // v2.7.4 FIX: tombol hasil memakai type=button + @mousedown.prevent —
  // (a) blur input tidak lagi menutup dropdown sebelum click terdaftar (race 180ms),
  // (b) klik di dalam <form> app tidak lagi memicu submit tak sengaja.
  var AppPegawaiPicker = {
    name: 'AppPegawaiPicker',
    props: {
      modelValue:  { type: String, default: '' },
      source:      { type: Array, default: null },   // v2.7.3: daftar custom (mis. :source="sortedPegawaiList"); default = $root.masterPegawaiList
      label:       { type: String, default: 'Pegawai' },
      placeholder: { type: String, default: 'Cari nama / NIP…' },
      clearable:   { type: Boolean, default: true },
      disabled:    { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'change'],
    data: function () { return { query: '', open: false, loading: false }; },
    computed: {
      list: function () {
        if (this.source && this.source.length) return this.source;
        return (this.$root && this.$root.masterPegawaiList) || [];
      },
      selectedName: function () {
        if (!this.modelValue) return '';
        var key = String(this.modelValue);
        for (var i = 0; i < this.list.length; i++) {
          if (this.idOf(this.list[i] || {}) === key) return this.labelOf(this.list[i]);
        }
        // fallback: helper app di root (opsional)
        var rootFn = this.$root && this.$root.namaPegawai;
        return (typeof rootFn === 'function') ? String(rootFn(this.modelValue) || '') : '';
      },
      results: function () {
        var q = (this.query || '').toLowerCase();
        if (!q) return [];
        var out = [];
        for (var i = 0; i < this.list.length && out.length < 8; i++) {
          var p = this.list[i] || {};
          var nama = String(p.nama || p.nama_lengkap || '').toLowerCase();
          var nip = String(p.nip || '').toLowerCase();
          if (nama.indexOf(q) >= 0 || nip.indexOf(q) >= 0) out.push(p);
        }
        return out;
      }
    },
    methods: {
      idOf:  function (p) { return String(p.id || p.pegawai_id || p.nip || ''); },
      labelOf: function (p) { return String(p.nama || p.nama_lengkap || '(tanpa nama)'); },
      subOf: function (p) {
        var parts = [];
        if (p.nip) parts.push('NIP ' + p.nip);
        if (p.unit_nama || p.unit) parts.push(String(p.unit_nama || p.unit));
        return parts.join(' • ');
      },
      focus: async function () {
        if (this.disabled) return;
        this.open = true;
        if (!this.list.length && !this.source && this.$root && this.$root.loadMasterSIMPEG) {
          this.loading = true;
          try { await this.$root.loadMasterSIMPEG(); } catch (e) {}
          this.loading = false;
        }
      },
      pick: function (p) {
        this.query = '';
        this.open = false;
        this.$emit('update:modelValue', this.idOf(p));
        this.$emit('change', p);
      },
      clear: function () {
        this.$emit('update:modelValue', '');
        this.$emit('change', null);
      },
      onBlur: function () { var self = this; setTimeout(function () { self.open = false; }, 180); }
    },
    template: '\
    <div class="relative">\
      <label v-if="label" class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ label }}</label>\
      <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">\
        <i class="fa-solid fa-magnifying-glass text-[11px] text-slate-400"></i>\
        <input :value="query" :placeholder="selectedName ? selectedName : placeholder" :disabled="disabled" @input="query = $event.target.value; open = true" @focus="focus" @blur="onBlur" class="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none">\
        <button v-if="modelValue && clearable && !disabled" type="button" @mousedown.prevent @click="clear" class="text-slate-400 hover:text-rose-500 text-[11px]" title="Kosongkan"><i class="fa-solid fa-xmark"></i></button>\
      </div>\
      <div v-if="open && !disabled && (query || loading)" class="absolute z-30 mt-1 w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">\
        <p v-if="loading" class="px-3 py-2 text-[11px] text-slate-400">Memuat master pegawai…</p>\
        <template v-else>\
          <button v-for="p in results" :key="idOf(p)" type="button" @mousedown.prevent @click="pick(p)" class="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 border-b border-slate-100 dark:border-slate-700/60 last:border-0">\
            <span class="block text-xs font-semibold text-slate-700 dark:text-slate-200">{{ labelOf(p) }}</span>\
            <span class="block text-[10px] text-slate-400 dark:text-slate-500">{{ subOf(p) }}</span>\
          </button>\
          <p v-if="!results.length" class="px-3 py-2 text-[11px] text-slate-400">Tidak ditemukan.</p>\
        </template>\
      </div>\
    </div>'
  };

  global.AppComponents = {
    'app-login': AppLogin,
    'app-sidebar': AppSidebar,
    'app-header': AppHeader,
    'app-badge': AppBadge,
    'app-stat-card': AppStatCard,
    'app-modal': AppModal,
    'app-crud-table': AppCrudTable,
    'app-empty-state': AppEmptyState,
    'app-skeleton': AppSkeleton,
    'app-filter-bar': AppFilterBar,
    'app-chart-bar': makeChartComponent_('bar'),
    'app-chart-doughnut': makeChartComponent_('doughnut'),
    'app-pegawai-picker': AppPegawaiPicker,
    version: '2.9.0'
  };

})(window);
