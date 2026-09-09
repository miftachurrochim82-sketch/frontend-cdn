/* ============================================================
   app-core.js — Factory inisialisasi Vue app (Shared CDN)

   AppCore.create(AppConfig) mengembalikan instance aplikasi Vue 3
   yang sudah berisi:
   - state shell    : token, currentUser, currentPage, sidebar,
                      dark mode, toasts, loading
   - auth SSO       : exchange_platform_ticket, validasi sesi,
                      logout, handleSessionExpired
   - bridge backend : callServer(action, data) via
                      google.script.run.handleAction({action,data,token})
   - komponen shell : <app-login>, <app-sidebar>, <app-header>
   - helper         : showToast, formatDateDisplay, formatDateTimeDisplay,
                      formatRupiah, copyToClipboard, debounce, todayIso_

   AppConfig {
     appTitle      : String   // 'SI-PELAPORAN'
     storagePrefix : String   // 'sipelaporan' → key sipelaporan_token/_user/_dark
     platformUrl   : String   // URL exec SI-Platform (SSO)
     initialPage   : String   // default 'dashboard'
     brand         : { title, subtitle, logoChar, logoIcon, logoSvg }
     menu          : [{ name:'Utama', items:[{id,label,icon,adminOnly}] }]
                     ATAU flat [{id,label,icon,adminOnly}]
     pageIcons     : { pageId: 'fa-solid fa-...' }
     onNavigate    : (vm, page) => {}        // loader per halaman
     onDarkToggle  : (vm) => {}               // mis. re-render chart
     initApp       : async (vm) => {}        // load data awal pasca-login
     mixins        : [ ... ]                  // data/methods khusus aplikasi
   }
   ============================================================ */
(function (global) {
  'use strict';

  function create(config) {
    if (!global.Vue) {
      throw new Error('[AppCore] Vue 3 global build belum dimuat.');
    }
    config = config || {};

    var prefix      = config.storagePrefix || 'app';
    var KEY_TOKEN   = prefix + '_token';
    var KEY_USER    = prefix + '_user';
    var KEY_DARK    = prefix + '_dark';
    var platformUrl = config.platformUrl || '';

    var app = Vue.createApp({
      data: function () {
        var storedUser = {};
        try {
          var raw = sessionStorage.getItem(KEY_USER);
          var parsed = raw ? JSON.parse(raw) : {};
          storedUser = (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (e) { storedUser = {}; }

        return {
          // ===== Pass-through AppConfig (dipakai template & komponen) =====
          appTitle: config.appTitle || 'Aplikasi',
          brand: Object.assign(
            { title: '', subtitle: '', logoChar: '', logoIcon: 'fa-solid fa-cube', logoSvg: '' },
            config.brand || {}
          ),
          menu: config.menu || [],
          pageIcons: config.pageIcons || {},

          // ===== Auth & session =====
          token: sessionStorage.getItem(KEY_TOKEN) || '',
          currentUser: storedUser,

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
        }
      },

      methods: {
        // ================= NAVIGASI & THEME =================
        // Portal butuh ?redirect= (kontrak doGet Global) agar tahu URL
        // kembali + tiket. back = URL aplikasi ini (valid di /exec & /dev).
        goToPlatform: function () {
          if (!platformUrl) { this.showToast('platformUrl belum dikonfigurasi', 'error'); return; }
          var back = window.location.href.split('?')[0];
          var sep = platformUrl.indexOf('?') >= 0 ? '&' : '?';
          window.location.href = platformUrl + sep + 'redirect=' + encodeURIComponent(back);
        },

        navigateTo: function (page) {
          // Cegah non-admin membuka pengaturan (lapis UX; backend tetap menolak)
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

        // ================= GAS BACKEND BRIDGE =================
        callServer: function (action, data) {
          data = data || {};
          var self = this;
          console.log('[callServer] Aksi: \'' + action + '\'', data);
          return new Promise(function (resolve, reject) {
            if (typeof google === 'undefined' || !google.script || !google.script.run) {
              var mockError = 'Google Script Run Environment tidak tersedia.';
              console.warn('[callServer]', mockError);
              resolve({ success: false, error: mockError });
              return;
            }
            google.script.run
              .withSuccessHandler(function (res) {
                console.log('[callServer] Res \'' + action + '\':', res);
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
        },

        // Sesi mati/kedaluwarsa → bersihkan + kembali ke layar login
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
          if (typeof config.initApp !== 'function') return Promise.resolve();
          var self = this;
          return Promise.resolve(config.initApp(this)).then(function () {
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

        // ================= HELPER & UTILITAS =================
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

        copyToClipboard: function (text, successMsg) {
          var self = this;
          if (!text) return;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(String(text)).then(function () {
              self.showToast(successMsg || 'Berhasil disalin ke clipboard');
            }).catch(function () {
              self.fallbackCopy_(text, successMsg);
            });
          } else {
            this.fallbackCopy_(text, successMsg);
          }
        },

        fallbackCopy_: function (text, successMsg) {
          var el = document.createElement('textarea');
          el.value = String(text);
          el.style.position = 'fixed';
          el.style.opacity = '0';
          document.body.appendChild(el);
          el.select();
          try {
            document.execCommand('copy');
            this.showToast(successMsg || 'Berhasil disalin');
          } catch (e) {
            this.showToast('Gagal menyalin teks', 'error');
          }
          document.body.removeChild(el);
        },

        debounce: function (func, wait) {
          var timeout;
          return function () {
            var context = this, args = arguments;
            var later = function () {
              timeout = null;
              func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait || 300);
          };
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

        // Tiket → login; session tersimpan → VERIFIKASI dulu baru initApp
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
            // token mati → callServer memicu handleSessionExpired
            this.callServer('get_my_profile').then(function (res) {
              if (res && res.success) return self.runInitApp();
            });
          }
        }
      },

      mounted: function () {
        var self = this;

        // Inisialisasi mode gelap (class sudah dipasang pre-paint di <head>)
        document.documentElement.classList.toggle('dark', this.isDarkMode);

        // Ekstraksi tiket SSO dari URL (?ticket=...)
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

    // Registrasi modul halaman mandiri (app-modules.js, opsional)
    if (global.AppModules) {
      Object.keys(global.AppModules).forEach(function (name) {
        if (name === 'version') return;
        app.component(name, global.AppModules[name]);
      });
    }

    // Mixin khusus aplikasi (data/methods halaman: dashboard, CRUD, dst.)
    (config.mixins || []).forEach(function (m) { app.mixin(m); });

    return app;
  }

  global.AppCore = {
    create: create,
    version: '2.0.0'
  };

})(window);
