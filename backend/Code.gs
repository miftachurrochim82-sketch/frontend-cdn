// ============================================================
// CORE LIBRARY GLOBAL v2.0 - Code.gs
// Entrypoint Utama Web App & Dispatcher Aksi Backend GAS
// ============================================================

/**
 * Endpoint HTTP GET untuk merender antarmuka web.
 */
function doGet(e) {
  var appTitle = getEnvProperty('APP_TITLE') || 'Aplikasi Pemkab Trenggalek';
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(appTitle)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper untuk menyisipkan partial file HTML di GAS (misal: <?!= include('A4_Dashboard'); ?>)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Dispatcher utama yang dipanggil oleh frontend via:
 * google.script.run.withSuccessHandler(...).handleAction({ action, data, token })
 *
 * @param {Object} payload { action: string, data: Object, token: string }
 * @returns {Object} { success: boolean, data?: any, message?: string, error?: string, code?: string }
 */
function handleAction(payload) {
  payload = payload || {};
  var action = payload.action || '';
  var data = payload.data || {};
  var token = payload.token || '';

  var lock = acquireLock();

  try {
    switch (action) {
      // ===== 1. AUTH & SINGLE SIGN-ON (SSO) =====
      case 'exchange_platform_ticket':
        return handleExchangePlatformTicket(data.ticket);

      case 'logout':
        return { success: true, message: 'Berhasil keluar sesi.' };

      // ===== 2. PROFIL PEGAWAI (SIMPEG) =====
      case 'get_my_profile':
        return handleGetMyProfile(token);

      case 'save_my_profile':
        return handleSaveMyProfile(data, token);

      // ===== 3. PENGATURAN & KONFIGURASI SISTEM (ADMIN) =====
      case 'get_config':
        return handleGetConfig(token);

      case 'save_config_item':
        return handleSaveConfigItem(data, token);

      case 'delete':
        return handleDeleteEntity(data, token);

      // ===== 4. AKSI KHUSUS APLIKASI (DAPAT DI-EXTEND) =====
      // Tambahkan case baru di sini untuk logika spesifik modul aplikasi Anda:
      /*
      case 'get_dashboard_data':
        return handleGetDashboardData(token);
      */

      default:
        return {
          success: false,
          error: 'Aksi \'' + action + '\' tidak dikenali di server backend.'
        };
    }
  } catch (err) {
    logError('handleAction', err);

    // Tangani error otorisasi/sesi expired agar frontend otomatis mereset sesi
    if (err.code === 'UNAUTHORIZED') {
      return {
        success: false,
        code: 'UNAUTHORIZED',
        error: err.message || 'Sesi telah berakhir, silakan login ulang.'
      };
    }

    if (err.code === 'FORBIDDEN') {
      return {
        success: false,
        code: 'FORBIDDEN',
        error: err.message || 'Akses ditolak.'
      };
    }

    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem internal.'
    };
  } finally {
    if (lock) {
      try { lock.releaseLock(); } catch (e) {}
    }
  }
}
