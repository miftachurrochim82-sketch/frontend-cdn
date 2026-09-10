/* ============================================================
   app-core.js — Factory Inisialisasi Vue App (Shared CDN v2.4.0)

   AppCore.create(AppConfig) mengembalikan instance aplikasi Vue 3
   yang sudah terkonfigurasi lengkap dengan optimasi performa tinggi:
   - High Performance Core : Dynamic script loading (on-demand SheetJS/jsPDF/Chart.js),
                             In-flight request deduplication,
                             Stale-While-Revalidate Master SIMPEG Cache (LocalStorage)
   - State Shell           : token, currentUser, currentPage, sidebar,
                             dark mode, toasts, loading, modal, pagination
   - Auth SSO              : exchange_platform_ticket, validasi sesi,
                             logout, handleSessionExpired
   - Bridge Backend        : callServer(action, data) via google.script.run
   - Master SIMPEG         : Auto-caching & Lookup Helpers (Pegawai, Unit, Jabatan)
   - Exporter Kit          : On-demand exportExcel, exportPDF
   - Komponen Shell        : <app-login>, <app-sidebar>, <app-header>,
                             <app-badge>, <app-stat-card>, <app-modal>, <app-crud-table>
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
          var raw = sessionStorage.getItem(KEY_USER);
          var parsed = raw ? JSON.parse(raw) : {};
          storedUser = (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (e) { storedUser = {}; }

        return {
          // ===== Pass-through AppConfig =====
          appTitle: config.appTitle || 'Aplikasi',
          brand: Object.assign(
            { title: '', subtitle: '', logoChar: 'A', logoIcon: 'fa-solid fa-cube', logoSvg: '' },
            config.brand || {}
          ),
          menu: config.menu || [],
          pageIcons: config.pageIcons || {},

          // ===== Auth & session =====
          token: sessionStorage.getItem(KEY_TOKEN) || '',
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
          isDarkMode: localStorage.getItem(KEY_DARK) === 'true',
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
          localStorage.setItem(KEY_DARK, this.isDarkMode);
          document.documentElement.classList.toggle('dark', this.isDarkMode);
          if (typeof config.onDarkToggle === 'function') config.onDarkToggle(this);
        },

        // ================= GAS BACKEND BRIDGE (WITH DEDUPLICATION) =================
        callServer: function (action, data) {
          data = data || {};
          var self = this;
          var isReadOnly = String(action).startsWith('get_') || action === 'dashboard' || action === 'analytics';
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
              .handleAction({ action: action, data: data, token: self.token });
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
          sessionStorage.removeItem(KEY_TOKEN);
          sessionStorage.removeItem(KEY_USER);
          this.currentPage = config.initialPage || 'dashboard';
          this.errorMessage = 'Sesi berakhir, silakan login ulang.';
          this.showToast('Sesi berakhir, silakan login ulang', 'error');
        },

        // ================= MASTER DATA SIMPEG STALE-WHILE-REVALIDATE =================
        loadMasterSIMPEG: async function (forceReload) {
          var self = this;
          var CACHE_MAX_AGE = 15 * 60 * 1000; // 15 menit
          var cachedRaw = localStorage.getItem(KEY_SIMPEG);
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
                  return; // Instant zero-latency return from LocalStorage!
                }
                hasValidCache = true; // Ada cache lama, fetch pembaruan di latar belakang
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
                localStorage.setItem(KEY_SIMPEG, JSON.stringify({
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
            // Background sync tanpa blocking
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

        // ================= DYNAMIC CHART LOADER =================
        ensureChartLibrary: async function () {
          if (typeof Chart !== 'undefined') return true;
          try {
            await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
            return true;
          } catch (e) {
            this.showToast('Gagal memuat pustaka grafik Chart.js', 'error');
            return false;
          }
        },

        // ================= HIGH PERFORMANCE EXPORT KIT (ON-DEMAND) =================
        exportExcel: async function (data, filename, sheetName) {
          filename = filename || ('Export_' + this.todayIso_() + '.xlsx');
          if (!filename.endsWith('.xlsx')) filename += '.xlsx';
          sheetName = sheetName || 'Data';

          if (typeof XLSX === 'undefined') {
            this.showToast('Memuat pustaka Excel...', 'info');
            try {
              await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
            } catch (e) {
              this.showToast('Gagal memuat modul SheetJS: ' + e.message, 'error');
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
            try {
              await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
              await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
            } catch (e) {
              this.showToast('Gagal memuat modul PDF: ' + e.message, 'error');
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
                sessionStorage.setItem(KEY_TOKEN, self.token);
                sessionStorage.setItem(KEY_USER, JSON.stringify(self.currentUser));
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
            sessionStorage.removeItem(KEY_TOKEN);
            sessionStorage.removeItem(KEY_USER);
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
          var storedToken = sessionStorage.getItem(KEY_TOKEN);
          var storedUser = sessionStorage.getItem(KEY_USER);
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

    (config.mixins || []).forEach(function (m) { app.mixin(m); });

    return app;
  }

  global.AppCore = {
    create: create,
    loadScript: loadScript,
    debounce: debounce,
    version: '2.4.0'
  };

})(window);
