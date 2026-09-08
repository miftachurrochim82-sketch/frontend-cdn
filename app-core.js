// app-core.js — Factory function untuk membuat Vue app
function createAppCore(config) {
  return {
    data() {
      return {
        appConfig: config,
        appTitle: config.appTitle || 'Aplikasi',
        token: sessionStorage.getItem(config.storagePrefix + 'token') || '',
        currentUser: JSON.parse(sessionStorage.getItem(config.storagePrefix + 'user') || '{}'),
        currentPage: 'dashboard',
        isDarkMode: localStorage.getItem(config.storagePrefix + 'dark') === 'true',
        sidebarCollapsed: window.innerWidth < 1024,
        sidebarMobileOpen: false,
        isProcessing: false,
        errorMessage: '',
        loading: false,
        toasts: [],
        pegawaiList: [],
        unitList: [],
        jabatanList: []
      };
    },
    computed: {
      isAdmin() {
        const r = String(this.currentUser?.role || '').toLowerCase();
        return r === 'admin' || r === 'super';
      }
    },
    methods: {
      callServer(action, data = {}) {
        return new Promise((resolve, reject) => {
          if (typeof google === 'undefined' || !google.script?.run) {
            resolve({ success: false, error: 'Google Script Run tidak tersedia.' });
            return;
          }
          google.script.run
            .withSuccessHandler((res) => {
              res = res || { success: false, error: 'Respons kosong' };
              if (res.code === 'UNAUTHORIZED') this.handleSessionExpired();
              resolve(res);
            })
            .withFailureHandler((err) => {
              reject(new Error(err.message || 'Gagal terhubung'));
            })
            .handleAction({ action, data, token: this.token });
        });
      },
      handleSessionExpired() {
        this.token = '';
        this.currentUser = {};
        sessionStorage.removeItem(config.storagePrefix + 'token');
        sessionStorage.removeItem(config.storagePrefix + 'user');
        this.showToast('Sesi berakhir, silakan login ulang', 'error');
      },
      navigateTo(page) {
        this.currentPage = page;
        this.sidebarMobileOpen = false;
      },
      toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
      },
      toggleMobileSidebar() {
        this.sidebarMobileOpen = !this.sidebarMobileOpen;
      },
      toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem(config.storagePrefix + 'dark', this.isDarkMode);
        document.documentElement.classList.toggle('dark', this.isDarkMode);
      },
      showToast(message, type = 'success') {
        const id = Date.now() + Math.random();
        this.toasts.push({ id, message, type });
        setTimeout(() => {
          this.toasts = this.toasts.filter(t => t.id !== id);
        }, 4000);
      },
      async loginViaPlatformTicket(ticket) {
        this.isProcessing = true;
        this.errorMessage = '';
        try {
          const res = await this.callServer('exchange_platform_ticket', { ticket });
          if (res.success && res.data?.token) {
            this.token = res.data.token;
            this.currentUser = res.data.user || {};
            sessionStorage.setItem(config.storagePrefix + 'token', this.token);
            sessionStorage.setItem(config.storagePrefix + 'user', JSON.stringify(this.currentUser));
            window.history.replaceState({}, document.title, window.location.pathname);
            await this.initApp();
          } else {
            this.errorMessage = res.error || 'Gagal validasi tiket SSO';
          }
        } catch (e) {
          this.errorMessage = e.message;
        } finally {
          this.isProcessing = false;
        }
      },
      async initApp() {
        this.loading = true;
        try {
          const [pegawaiRes, unitRes, jabatanRes] = await Promise.all([
            this.callServer('get_pegawai_list'),
            this.callServer('get_unit_list'),
            this.callServer('get_jabatan_list')
          ]);
          if (pegawaiRes.success) this.pegawaiList = pegawaiRes.data || [];
          if (unitRes.success) this.unitList = unitRes.data || [];
          if (jabatanRes.success) this.jabatanList = jabatanRes.data || [];
        } catch (e) {
          console.warn('initApp referensi:', e.message);
        } finally {
          this.loading = false;
        }
      },
      async logout() {
        try { await this.callServer('logout'); } catch (e) {}
        this.token = '';
        this.currentUser = {};
        sessionStorage.removeItem(config.storagePrefix + 'token');
        sessionStorage.removeItem(config.storagePrefix + 'user');
        this.currentPage = 'dashboard';
      },
      goToPlatform() {
        const back = window.location.href.split('?')[0];
        window.location.href = config.platformUrl + '?redirect=' + encodeURIComponent(back);
      }
    },
    mounted() {
      document.documentElement.classList.toggle('dark', this.isDarkMode);
      const params = new URLSearchParams(window.location.search);
      const ticket = params.get('ticket') || '';
      if (ticket) {
        this.loginViaPlatformTicket(ticket);
      } else if (this.token) {
        this.initApp();
      }
    }
  };
}
