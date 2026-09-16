/* ============================================================
   app-core.js — Factory Inisialisasi Vue App (Shared CDN v2.6.5)

   AppCore.create(AppConfig) mengembalikan instance aplikasi Vue 3
   yang sudah terkonfigurasi lengkap dengan optimasi performa tinggi:
   - High Performance Core : Dynamic script loading (on-demand SheetJS/
                             jsPDF/Chart.js), In-flight request
                             deduplication, Stale-While-Revalidate
                             Master SIMPEG Cache (LocalStorage).
   - State Shell           : token, currentUser, currentPage, sidebar,
                             dark mode, toasts, loading, modal, pagination.
   - Auth SSO              : exchange_platform_ticket, validasi sesi,
                             logout, handleSessionExpired.
   - Bridge Backend        : callServer(action, data) via google.script.run.
   - Master SIMPEG         : Auto-caching & Lookup Helpers.
   - Exporter Kit          : On-demand exportExcel, exportPDF.
   - Library Registry      : AppCore.libs + loadLib() — semua URL pustaka
                             pihak ketiga terpusat, dimuat on-demand.
   - Komponen Shell        : <app-login>, <app-sidebar>, <app-header>,
                             <app-badge>, <app-stat-card>, <app-modal>,
                             <app-crud-table>.

   Changelog v2.6.4 (2026-09-15):
   - 🔢 KEMBALI KE VERSI TUNGGAL: mulai rilis ini SELURUH berkas CDN
     (app-core, app-components, app-modules, app-common.css) memakai SATU
     nomor versi ekosistem (2.6.4), menggantikan skema versi-per-berkas.
     Satu tag git = satu nomor untuk semua berkas = lebih mudah dikelola.
   - Tidak ada perubahan perilaku pada berkas ini di rilis 2.6.4.

   Changelog v2.6.2 (2026-09-15):
   - 🔴 FIX: uji registry `autotable` memakai nama properti resmi plugin,
     `API.autoTable` (huruf T besar). Uji v2.6.1 menulis `API.autotable`
     (t kecil) sehingga SELALU bernilai false: loadLib('pdf') dan
     loadLib('autotable') melaporkan gagal meski plugin termuat sempurna
     (gejala: toast "Gagal memuat pustaka" saat cetak PDF).
   - 🛡 ADD: guard `!!jspdf.jsPDF.API` pada uji autotable agar tidak
     melempar TypeError bila jsPDF ada tanpa API.
   - 🔢 Versi berkas: 2.6.1 → 2.6.2. Tag rilis ekosistem: v2.6.2.

   Changelog v2.6.1 (2026-09-15):
   - 🔴 FIX KRITIS: SAFE STORAGE. Akses sessionStorage/localStorage kini
     lewat pembungkus aman dengan fallback memori. Sebelumnya akses
     mentah melempar DOMException ("Access is denied for this document")
     bila web app berjalan di iframe lintas-site dengan pemblokiran
     cookie pihak ketiga (alur SSO si-platform -> aplikasi satelit),
     sehingga AppCore.create() gagal total dan splash berputar selamanya.
   - Konsekuensi yang diterima: bila storage ditolak browser, sesi tetap
     berjalan lewat memori tetapi tidak bertahan setelah reload (alur
     tiket SSO akan masuk ulang otomatis).
   - 🔢 Versi berkas: 2.6.0 → 2.6.1. Tag rilis ekosistem: v2.6.1.
     (Berkas lain tidak berubah pada rilis patch ini.)

   Changelog v2.6.0 (2026-09-15):
   - 🆕 ADD: LIBRARY REGISTRY (`AppCore.libs`) + `AppCore.loadLib(name)`.
     URL Chart.js / SheetJS / jsPDF / AutoTable / pdf-lib yang tadinya
     tersebar sebagai string literal kini terpusat & diberi versi tetap.
     Chart.js sebelumnya dimuat TANPA versi terkunci (`npm/chart.js`) —
     sekarang dikunci ke 4.4.1 agar tidak berubah diam-diam.
   - 🆕 ADD: method `loadLib(name, {silent})` di instance Vue, plus
     alias grup `'pdf'` = jsPDF + AutoTable, dan dependensi otomatis
     (`autotable` memuat `jspdf` lebih dulu).
   - ♻️ REFACTOR: ensureChartLibrary / exportExcel / exportPDF kini
     memakai registry. Perilaku & tanda tangan fungsi TIDAK berubah
     (kompatibel ke belakang).
   - 🔢 Version bump: 2.5.1 → 2.6.0.
   - 📌 CATATAN: seluruh berkas frontend (app-core, app-components,
     app-modules, app-common.css) kini memakai SATU nomor versi bersama
     agar mudah dirujuk lewat tag git `@v2.6.0`.

   Changelog v2.5.1 (2026-09-14):
   - 🆕 ADD: cache busting via `_cacheBust` timestamp di payload
     callServer. Backend HARUS mengabaikan field ini (hapus sebelum
     diproses). Efek: GAS tidak cache response, selalu fresh.
   - In-flight dedup tetap bekerja karena reqKey dihitung dari data
     ORIGINAL (sebelum _cacheBust ditambahkan).
   - ✅ Backend CoreLib SUDAH menangani ini: `02_CoreGateway.gs`
     mengecualikan `_cacheBust` dari whitelist kolom (baris ~59),
     sehingga kolom sampah tidak tercipta di sheet.

   Changelog v2.5.0 (2026-09-13):
   - Konsolidasi CDN URL jsPDF & jspdf-autotable ke jsDelivr (konsisten
     dengan pustaka lain). Sebelumnya dari cdnjs.cloudflare.com.
   - Version bump: 2.4.0 → 2.5.0.
   ============================================================ */
(function (global) {
  'use strict';

  var loadedScripts = {};

  function loadScript(src) {
    if (loadedScripts[src]) return loadedScripts[src];
    loadedScripts[src] = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function (err) {
        delete loadedScripts[src];
        reject(new Error('Gagal memuat berkas script: ' + src));
      };
      document.head.appendChild(s);
    });
    return loadedScripts[src];
  }

  /* ============================================================
     LIBRARY REGISTRY (v2.6.0)
     ------------------------------------------------------------
     Semua URL pustaka pihak ketiga dipusatkan di satu tempat.
     Sebelumnya URL ini tersebar sebagai string literal di dalam
     ensureChartLibrary / exportExcel / exportPDF, sehingga tiap
     web app menyalinnya ulang (dan bisa berbeda versi).

     Cara pakai dari aplikasi:
       await this.loadLib('chart')     // di dalam methods Vue
       await AppCore.loadLib('xlsx')   // dari luar instance Vue

     Cara menambah pustaka baru: cukup tambahkan satu entri di
     bawah ini — tidak perlu menulis loader sendiri.
     ============================================================ */
  var LIBS = {
    chart: {
      url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
      test: function () { return typeof Chart !== 'undefined'; },
      label: 'Chart.js'
    },
    xlsx: {
      url: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
      test: function () { return typeof XLSX !== 'undefined'; },
      label: 'SheetJS (Excel)'
    },
    jspdf: {
      url: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
      test: function () { return typeof jspdf !== 'undefined' && !!jspdf.jsPDF; },
      label: 'jsPDF'
    },
    autotable: {
      url: 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js',
      // Plugin ini menempel ke jsPDF, jadi hanya bisa diuji setelah jsPDF ada.
      // v2.6.2: nama properti RESMI plugin adalah `API.autoTable` (T besar).
      // Uji v2.6.1 menulis `API.autotable` (t kecil) sehingga SELALU false
      // dan loadLib('pdf') gagal meski plugin termuat sempurna.
      // Kedua bentuk dicek agar tahan terhadap variasi versi plugin.
      test: function () {
        return typeof jspdf !== 'undefined' && !!jspdf.jsPDF && !!jspdf.jsPDF.API &&
          !!(jspdf.jsPDF.API.autoTable || jspdf.jsPDF.API.autotable);
      },
      label: 'jsPDF-AutoTable',
      after: 'jspdf'
    },
    pdflib: {
      url: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
      test: function () { return typeof PDFLib !== 'undefined'; },
      label: 'pdf-lib'
    },
    // Dipakai bersama untuk ekspor PDF bertabel: jsPDF + plugin AutoTable.
    pdf: ['jspdf', 'autotable']
  };

  /**
   * Muat pustaka on-demand berdasarkan nama di LIBS.
   * @param {string|string[]} name  Nama pustaka, atau array nama.
   * @param {object} [opts]         { silent: true } untuk menekan toast.
   * @returns {Promise<boolean>}    true bila pustaka siap dipakai.
   */
  function loadLib(name, opts) {
    opts = opts || {};
    var names = Array.isArray(name) ? name : [name];

    return names.reduce(function (chain, key) {
      return chain.then(function (okSoFar) {
        if (!okSoFar) return false;

        var entry = LIBS[key];
        if (!entry) {
          console.warn('[AppCore] Pustaka tidak dikenal di registry:', key);
          return false;
        }

        // Alias grup (mis. 'pdf' -> ['jspdf','autotable'])
        if (Array.isArray(entry)) return loadLib(entry, opts);

        // Pustaka yang harus dimuat lebih dulu (mis. autotable butuh jspdf)
        var prepare = entry.after ? loadLib(entry.after, opts) : Promise.resolve(true);

        return prepare.then(function (ready) {
          if (!ready) return false;
          if (entry.test()) return true;

          if (!opts.silent) console.info('[AppCore] Memuat ' + entry.label + '...');
          return loadScript(entry.url)
            .then(function () { return entry.test(); })
            .catch(function (err) {
              console.error('[AppCore] Gagal memuat ' + entry.label + ':', err && err.message);
              return false;
            });
        });
      });
    }, Promise.resolve(true));
  }

  /* ============================================================
     SAFE STORAGE (v2.6.1)
     ------------------------------------------------------------
     MASALAH: di beberapa konteks browser melempar DOMException
     ("Access is denied for this document") saat properti
     sessionStorage/localStorage DIBACA — bukan saat dipakai.
     Konteks pemicunya antara lain:
       - web app GAS berjalan di iframe lintas-site (alur SSO
         antar aplikasi), sementara Chrome memblokir storage
         pihak ketiga / Tracking Protection aktif;
       - mode privat tertentu dan kebijakan situs perusahaan.
     Efek sebelum perbaikan: AppCore.create() meledak di baris
     pertama data() -> Vue tidak pernah mount -> splash berputar
     selamanya.

     SOLUSI: semua akses storage lewat pembungkus ini. Bila storage
     ditolak, otomatis jatuh ke penyimpanan memori (sesi berjalan
     normal, hanya tidak bertahan setelah halaman dimuat ulang —
     alur tiket SSO akan login ulang secara otomatis).
     ============================================================ */
  function rawStorage(kind) {
    // Akses properti window[...] ikut dilempar bila ditolak,
    // karena itu seluruhnya dibungkus try/catch.
    try { return window[kind + 'Storage']; } catch (e) { return null; }
  }

  function makeSafeStorage(kind) {
    var mem = {};
    return {
      getItem: function (key) {
        var store = rawStorage(kind);
        if (store) {
          try { return store.getItem(key); } catch (e) { /* jatuh ke memori */ }
        }
        return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
      },
      setItem: function (key, value) {
        mem[key] = String(value);
        var store = rawStorage(kind);
        if (store) {
          try { store.setItem(key, value); } catch (e) { /* memori saja */ }
        }
      },
      removeItem: function (key) {
        delete mem[key];
        var store = rawStorage(kind);
        if (store) {
          try { store.removeItem(key); } catch (e) { /* memori saja */ }
        }
      }
    };
  }

  var safeSession = makeSafeStorage('session');
  var safeLocal   = makeSafeStorage('local');

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay || 250);
    };
  }

  function create(config) {
    if (!global.Vue) {
      throw new Error('[AppCore] Vue 3 global build belum dimuat.');
    }
    config = config || {};

    var prefix      = config.storagePrefix || 'app';
    var KEY_TOKEN   = prefix + '_token';
    var KEY_USER    = prefix + '_user';
    var KEY_DARK    = prefix + '_dark';
    var KEY_SIMPEG  = prefix + '_simpeg_cache';
    var platformUrl = config.platformUrl || '';

    var inFlightRequests = {};

    var app = Vue.createApp({
      data: function () {
        var storedUser = {};
        try {
          var raw = safeSession.getItem(KEY_USER);
          var parsed = raw ? JSON.parse(raw) : {};
          storedUser = (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (e) { storedUser = {}; }

        return {
          // ===== Pass-through AppConfig =====
          appTitle: config.appTitle || 'Aplikasi',
          appCode: config.appCode || '',   // v2.7.0 (A2): identitas app tersedia sbg this.appCode
          brand: Object.assign(
            { title: '', subtitle: '', logoChar: 'A', logoIcon: 'fa-solid fa-cube', logoSvg: '' },
            config.brand || {}
          ),
          menu: config.menu || [],
          pageIcons: config.pageIcons || {},

          // ===== Auth & session =====
          token: safeSession.getItem(KEY_TOKEN) || '',
          currentUser: storedUser,

          // ===== Master Data SIMPEG Shared Cache =====
          masterPegawaiList: [],
          masterUnitList: [],
          masterJabatanList: [],
          masterLoaded: false,

          // ===== Shell / UI state =====
          currentPage: config.initialPage || 'dashboard',
          sidebarCollapsed: window.innerWidth < 1024,
          sidebarMobileOpen: false,
          isDarkMode: safeLocal.getItem(KEY_DARK) === 'true',
          toasts: [],
          loading: false,
          errorMessage: '',
          isProcessing: false,
          dataLoaded: false,
          loadedPages: {},
          pageSize: config.pageSize || 10
        };
      },

      computed: {
        isAdmin: function () {
          var r = String((this.currentUser && this.currentUser.role) || '').toLowerCase();
          return r === 'admin' || r === 'super';
        },
        isVerifikator: function () {
          var r = String((this.currentUser && this.currentUser.role) || '').toLowerCase();
          return r === 'verifikator' || r === 'admin' || r === 'super';
        }
      },

      methods: {
        // ================= NAVIGASI & THEME =================
        goToPlatform: function () {
          if (!platformUrl) { this.showToast('platformUrl belum dikonfigurasi', 'error'); return; }
          var back = window.location.href.split('?')[0];
          var sep = platformUrl.indexOf('?') >= 0 ? '&' : '?';
          var targetUrl = platformUrl + sep + 'redirect=' + encodeURIComponent(back);
          try {
            if (window.top && window.top !== window) {
              window.top.location.href = targetUrl;
            } else {
              window.location.href = targetUrl;
            }
          } catch (e) {
            window.open(targetUrl, '_top');
          }
        },

        navigateTo: function (page) {
          if (page === 'pengaturan' && !this.isAdmin) {
            this.showToast('Halaman khusus administrator', 'error');
            return;
          }
          this.currentPage = page;
          this.sidebarMobileOpen = false;
          if (typeof config.onNavigate === 'function') config.onNavigate(this, page);
        },

        toggleSidebar: function () {
          this.sidebarCollapsed = !this.sidebarCollapsed;
        },

        toggleDarkMode: function () {
          this.isDarkMode = !this.isDarkMode;
          safeLocal.setItem(KEY_DARK, this.isDarkMode);
          document.documentElement.classList.toggle('dark', this.isDarkMode);
          // v2.7.0 (B2): komponen bertema (chart kit) mendengarkan event ini utk re-render
          try { window.dispatchEvent(new CustomEvent('appcore:dark', { detail: this.isDarkMode })); } catch (e) {}
          if (typeof config.onDarkToggle === 'function') config.onDarkToggle(this);
        },

        // ================= GAS BACKEND BRIDGE =================
        // v2.5.1: + cache busting (_cacheBust timestamp)
        callServer: function (action, data) {
          data = data || {};
          var self = this;
          var isReadOnly = String(action).startsWith('get_') || action === 'dashboard' || action === 'analytics';

          // v2.5.1: In-flight dedup berdasarkan data ORIGINAL (tanpa cache bust)
          var reqKey = isReadOnly ? (action + ':' + JSON.stringify(data) + ':' + this.token) : null;

          if (reqKey && inFlightRequests[reqKey]) {
            return inFlightRequests[reqKey];
          }

          var requestPromise = new Promise(function (resolve, reject) {
            if (typeof google === 'undefined' || !google.script || !google.script.run) {
              var mockError = 'Google Script Run Environment tidak tersedia.';
              console.warn('[callServer]', mockError);
              resolve({ success: false, error: mockError });
              return;
            }

            // v2.5.1: CACHE BUSTING — tambah _cacheBust di payload FINAL
            // saja (setelah reqKey dihitung). Backend HARUS mengabaikan
            // field ini. Efek: GAS tidak cache response, selalu fresh.
            var payloadFinal = Object.assign({}, data, { _cacheBust: Date.now() });

            google.script.run
              .withSuccessHandler(function (res) {
                res = res || { success: false, error: 'Respons kosong dari server' };
                if (res && res.code === 'UNAUTHORIZED') self.handleSessionExpired();
                resolve(res);
              })
              .withFailureHandler(function (err) {
                console.error('[callServer] Fail \'' + action + '\':', err);
                reject(new Error(err.message || 'Gagal terhubung ke server'));
              })
              .handleAction({ action: action, data: payloadFinal, token: self.token });
          });

          if (reqKey) {
            inFlightRequests[reqKey] = requestPromise;
            requestPromise.finally(function () {
              delete inFlightRequests[reqKey];
            });
          }

          return requestPromise;
        },

        handleSessionExpired: function () {
          this.token = '';
          this.currentUser = {};
          this.dataLoaded = false;
          this.loadedPages = {};
          safeSession.removeItem(KEY_TOKEN);
          safeSession.removeItem(KEY_USER);
          this.currentPage = config.initialPage || 'dashboard';
          this.errorMessage = 'Sesi berakhir, silakan login ulang.';
          this.showToast('Sesi berakhir, silakan login ulang', 'error');
        },

        // ================= MASTER DATA SIMPEG =================
        loadMasterSIMPEG: async function (forceReload) {
          var self = this;
          var CACHE_MAX_AGE = 15 * 60 * 1000; // 15 menit
          var cachedRaw = safeLocal.getItem(KEY_SIMPEG);
          var hasValidCache = false;

          if (cachedRaw) {
            try {
              var c = JSON.parse(cachedRaw);
              if (c && Array.isArray(c.pegawai) && Array.isArray(c.unit) && Array.isArray(c.jabatan)) {
                self.masterPegawaiList = c.pegawai;
                self.masterUnitList = c.unit;
                self.masterJabatanList = c.jabatan;
                self.pegawaiList = c.pegawai;
                self.unitList = c.unit;
                self.jabatanList = c.jabatan;
                self.masterLoaded = true;

                var isFresh = (Date.now() - (c.time || 0)) < CACHE_MAX_AGE;
                if (!forceReload && isFresh) {
                  return; // Instant zero-latency return dari LocalStorage
                }
                hasValidCache = true;
              }
            } catch (e) {}
          }

          var networkFetch = async function () {
            try {
              var calls = [
                self.callServer('get_master_pegawai'),
                self.callServer('get_master_unit'),
                self.callServer('get_master_jabatan')
              ];
              var results = await Promise.all(calls);
              if (!results[0].success) results[0] = await self.callServer('get_pegawai_list');
              if (!results[1].success) results[1] = await self.callServer('get_unit_list');
              if (!results[2].success) results[2] = await self.callServer('get_jabatan_list');

              var pList = (results[0] && results[0].success && results[0].data) ? results[0].data : self.masterPegawaiList;
              var uList = (results[1] && results[1].success && results[1].data) ? results[1].data : self.masterUnitList;
              var jList = (results[2] && results[2].success && results[2].data) ? results[2].data : self.masterJabatanList;

              self.masterPegawaiList = pList;
              self.masterUnitList = uList;
              self.masterJabatanList = jList;
              self.pegawaiList = pList;
              self.unitList = uList;
              self.jabatanList = jList;
              self.masterLoaded = true;

              try {
                safeLocal.setItem(KEY_SIMPEG, JSON.stringify({
                  time: Date.now(),
                  pegawai: pList,
                  unit: uList,
                  jabatan: jList
                }));
              } catch (e) {}
            } catch (err) {
              console.warn('[AppCore] loadMasterSIMPEG background sync:', err.message);
            }
          };

          if (!hasValidCache || forceReload) {
            await networkFetch();
          } else {
            networkFetch();
          }
        },

        lookupPegawai: function (id) {
          if (!id) return null;
          var list = (this.masterPegawaiList && this.masterPegawaiList.length) ? this.masterPegawaiList : (this.pegawaiList || []);
          return list.find(function(p) { return String(p.id || p.pegawai_id) === String(id); }) || null;
        },
        namaPegawai: function (id) {
          var p = this.lookupPegawai(id);
          return p ? (p.nama || p.display_name || id) : (id || '-');
        },
        lookupUnit: function (id) {
          if (!id) return null;
          var list = (this.masterUnitList && this.masterUnitList.length) ? this.masterUnitList : (this.unitList || []);
          return list.find(function(u) { return String(u.id || u.unit_id || u.kode_unit) === String(id); }) || null;
        },
        namaUnit: function (id) {
          var u = this.lookupUnit(id);
          return u ? (u.nama_unit || u.nama || id) : (id || '-');
        },
        lookupJabatan: function (id) {
          if (!id) return null;
          var list = (this.masterJabatanList && this.masterJabatanList.length) ? this.masterJabatanList : (this.jabatanList || []);
          return list.find(function(j) { return String(j.id || j.jabatan_id || j.kode_jabatan) === String(id); }) || null;
        },
        namaJabatan: function (id) {
          var j = this.lookupJabatan(id);
          return j ? (j.nama_jabatan || j.nama || id) : (id || '-');
        },

        // ================= DYNAMIC LIBRARY LOADER (v2.6.0) =================
        /**
         * Muat pustaka on-demand via registry AppCore.libs.
         * Mengganti pola lama: tiap aplikasi menulis URL & cek typeof sendiri.
         */
        loadLib: async function (name, opts) {
          var ok = await loadLib(name, opts);
          if (!ok && !(opts && opts.silent)) {
            var label = (LIBS[name] && LIBS[name].label) || name;
            this.showToast('Gagal memuat pustaka: ' + label, 'error');
          }
          return ok;
        },

        // ================= DYNAMIC CHART LOADER =================
        ensureChartLibrary: async function () {
          // v2.6.0: URL dipindah ke registry AppCore.libs.chart
          return this.loadLib('chart');
        },

        // ================= HIGH PERFORMANCE EXPORT KIT =================
        exportExcel: async function (data, filename, sheetName) {
          filename = filename || ('Export_' + this.todayIso_() + '.xlsx');
          if (!filename.endsWith('.xlsx')) filename += '.xlsx';
          sheetName = sheetName || 'Data';

          if (typeof XLSX === 'undefined') {
            this.showToast('Memuat pustaka Excel...', 'info');
            // v2.6.0: URL dipindah ke registry AppCore.libs.xlsx
            if (!(await this.loadLib('xlsx', { silent: true }))) {
              this.showToast('Gagal memuat modul SheetJS (Excel)', 'error');
              return;
            }
          }

          var ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : []);
          var wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
          XLSX.writeFile(wb, filename);
          this.showToast('Berkas Excel berhasil diunduh: ' + filename, 'success');
        },

        exportPDF: async function (columns, data, filename, title) {
          filename = filename || ('Export_' + this.todayIso_() + '.pdf');
          if (!filename.endsWith('.pdf')) filename += '.pdf';
          title = title || this.appTitle;

          if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
            this.showToast('Memuat pustaka PDF...', 'info');
            // v2.6.0: 'pdf' = grup jsPDF + AutoTable, URL di AppCore.libs
            if (!(await this.loadLib('pdf', { silent: true }))) {
              this.showToast('Gagal memuat modul PDF (jsPDF/AutoTable)', 'error');
              return;
            }
          }

          var doc = new jspdf.jsPDF();
          doc.setFontSize(14);
          doc.text(title, 14, 16);
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text('Dicetak pada: ' + this.formatDateTimeDisplay(new Date()), 14, 22);

          var head = [columns.map(function(c) { return c.label || c.header || c; })];
          var body = (data || []).map(function(row, idx) {
            return columns.map(function(c) {
              if (c.field && typeof c.field === 'function') return c.field(row, idx);
              if (c.key === '_index') return idx + 1;
              return row[c.key || c] !== undefined ? row[c.key || c] : '-';
            });
          });

          doc.autoTable({
            startY: 26,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' }
          });
          doc.save(filename);
          this.showToast('Berkas PDF berhasil diunduh: ' + filename, 'success');
        },

        // ================= LOGIN SSO =================
        loginViaPlatformTicket: function (ticket) {
          var self = this;
          this.isProcessing = true;
          this.errorMessage = '';
          return this.callServer('exchange_platform_ticket', { ticket: ticket })
            .then(function (res) {
              if (res.success && res.data && res.data.token) {
                self.token = res.data.token;
                self.currentUser = res.data.user || {};
                safeSession.setItem(KEY_TOKEN, self.token);
                safeSession.setItem(KEY_USER, JSON.stringify(self.currentUser));
                window.history.replaceState({}, document.title, window.location.pathname);
                return self.runInitApp();
              }
              self.errorMessage = res.error || 'Gagal memvalidasi tiket Single Sign-On.';
            })
            .catch(function (e) {
              self.errorMessage = 'Terjadi kesalahan sistem: ' + e.message;
            })
            .finally(function () {
              self.isProcessing = false;
            });
        },

        runInitApp: function () {
          var self = this;
          return this.loadMasterSIMPEG().then(function() {
            if (typeof config.initApp === 'function') {
              return Promise.resolve(config.initApp(self));
            }
          }).then(function () {
            self.dataLoaded = true;
          });
        },

        logout: function () {
          var self = this;
          return this.callServer('logout').catch(function () {}).then(function () {
            self.token = '';
            self.currentUser = {};
            self.dataLoaded = false;
            self.loadedPages = {};
            safeSession.removeItem(KEY_TOKEN);
            safeSession.removeItem(KEY_USER);
            self.currentPage = config.initialPage || 'dashboard';
          });
        },

        // ================= HELPER & FORMATTER =================
        todayIso_: function () {
          return new Date().toISOString().slice(0, 10);
        },

        formatDateDisplay: function (val) {
          if (!val) return '-';
          try {
            var d = new Date(val);
            if (isNaN(d.getTime())) return String(val);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
          } catch (e) {
            return String(val);
          }
        },

        formatDateTimeDisplay: function (val) {
          if (!val) return '-';
          try {
            var d = new Date(val);
            if (isNaN(d.getTime())) return String(val);
            return d.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(/\./g, ':');
          } catch (e) {
            return String(val);
          }
        },

        formatRupiah: function (val) {
          if (val === undefined || val === null || val === '') return 'Rp 0';
          var num = Number(val);
          if (isNaN(num)) return 'Rp 0';
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(num);
        },

        showToast: function (message, type) {
          type = type || 'success';
          var id = Date.now() + Math.random();
          this.toasts.push({ id: id, message: message, type: type });
          var self = this;
          setTimeout(function () { self.removeToast(id); }, 4000);
        },

        removeToast: function (id) {
          this.toasts = this.toasts.filter(function (t) { return t.id !== id; });
        },

        processInitialAuth: function (ticket) {
          var self = this;
          if (ticket) {
            this.loginViaPlatformTicket(ticket);
            return;
          }
          var storedToken = safeSession.getItem(KEY_TOKEN);
          var storedUser = safeSession.getItem(KEY_USER);
          if (storedToken && storedUser) {
            this.token = storedToken;
            try { this.currentUser = JSON.parse(storedUser); } catch (e) {}
            this.callServer('get_my_profile').then(function (res) {
              if (res && res.success) return self.runInitApp();
            });
          }
        }
      },

      mounted: function () {
        var self = this;
        document.documentElement.classList.toggle('dark', this.isDarkMode);

        var ticket = '';
        try {
          var urlParams = new URLSearchParams(window.location.search);
          ticket = urlParams.get('ticket') || '';
        } catch (e) {}

        if (!ticket && typeof google !== 'undefined' && google.script && google.script.url) {
          google.script.url.getLocation(function (location) {
            ticket = (location.parameter && location.parameter.ticket) || '';
            self.processInitialAuth(ticket);
          });
        } else {
          this.processInitialAuth(ticket);
        }
      }
    });

    // Registrasi komponen shell bersama
    if (global.AppComponents) {
      Object.keys(global.AppComponents).forEach(function (name) {
        if (name === 'version') return;
        app.component(name, global.AppComponents[name]);
      });
    }

    // Registrasi modul halaman mandiri (app-modules.js)
    if (global.AppModules) {
      Object.keys(global.AppModules).forEach(function (name) {
        if (name === 'version') return;
        app.component(name, global.AppModules[name]);
      });
    }

    // v2.7.0 (B7): directive v-can — gating elemen UI berdasar role sesi.
    // Cermin fail-closed levelOf_ CoreLib v2.2.3: role tak dikenal = level 0;
    // nilai syarat tak dikenal = selalu sembunyikan (need = 99).
    // Pakai: <button v-can="'verifikator'">…</button>
    var ROLE_LEVELS_CAN = { admin: 3, super: 3, verifikator: 2, user: 1, viewer: 0 };
    function canCheck_(el, binding) {
      var inst = binding.instance || {};
      var role = String((inst.currentUser && inst.currentUser.role) || '').toLowerCase();
      var have = ROLE_LEVELS_CAN[role]; if (have === undefined) have = 0;
      var need = ROLE_LEVELS_CAN[String(binding.value || '').toLowerCase()]; if (need === undefined) need = 99;
      if (have < need && el.parentNode) el.parentNode.removeChild(el);
    }
    app.directive('can', { mounted: canCheck_, updated: canCheck_ });

    (config.mixins || []).forEach(function (m) { app.mixin(m); });

    return app;
  }

  // v2.7.0 (B4): helper paginasi sisi klien — pasangan <app-filter-bar>/<app-crud-table>
  function paginate(list, page, perPage) {
    list = list || [];
    page = Math.max(1, parseInt(page, 10) || 1);
    perPage = Math.max(1, parseInt(perPage, 10) || 10);
    var start = (page - 1) * perPage;
    return list.slice(start, start + perPage);
  }
  function pageCount(list, perPage) {
    list = list || [];
    perPage = Math.max(1, parseInt(perPage, 10) || 10);
    return Math.max(1, Math.ceil(list.length / perPage));
  }

  global.AppCore = {
    create: create,
    paginate: paginate,
    pageCount: pageCount,
    loadScript: loadScript,
    loadLib: loadLib,
    libs: LIBS,
    debounce: debounce,
    version: '2.7.0'
  };

})(window);
