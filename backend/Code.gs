// ============================================================
// TEMPLATE APLIKASI WEB GAS - Code.gs
// Memanfaatkan CORE LIBRARY GLOBAL v2.0 (01_CoreFoundation, 02_CoreGateway, 03_CoreServices)
// ============================================================

/**
 * Konfigurasi Lokal Aplikasi
 */
function getAppConfig_() {
  var scriptProps = PropertiesService.getScriptProperties();
  return {
    appCode: scriptProps.getProperty('APP_CODE') || 'SI-PELAPORAN',
    appTitle: scriptProps.getProperty('APP_TITLE') || 'SI-PELAPORAN Kab. Trenggalek',
    spreadsheetId: scriptProps.getProperty('SPREADSHEET_ID') || '',
    masterSsId: scriptProps.getProperty('MASTER_SPREADSHEET_ID') || '',
    platformApiUrl: scriptProps.getProperty('PLATFORM_API_URL') || '',
    headersMap: {
      // Definisikan header sheet lokal aplikasi Anda di sini:
      // PELAPORAN: ['id', 'nomor_laporan', 'judul', 'kategori', 'isi', 'status', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at']
    },
    pkFields: {
      // PELAPORAN: 'id'
    },
    localHandlers: {
      // Tambahkan handler khusus aplikasi di sini (signature: function(data, currentUser)):
      // 'get_custom_summary': function(data, currentUser) { return { success: true, data: {} }; }
    }
  };
}

/**
 * Entrypoint HTTP GET web app
 */
function doGet(e) {
  var config = getAppConfig_();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(config.appTitle)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper include partial HTML di GAS
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Dispatcher utama yang dipanggil oleh frontend:
 * google.script.run.withSuccessHandler(...).handleAction({ action, data, token })
 */
function handleAction(payload) {
  return dispatchAction(payload, getAppConfig_());
}

/**
 * Helper Setup Aplikasi Pertama Kali
 * Jalankan fungsi ini dari editor Apps Script untuk inisialisasi sheet & folder Drive.
 */
function runSetup() {
  var config = getAppConfig_();
  return executeAppSetup({
    appCode: config.appCode,
    appTitle: config.appTitle,
    spreadsheetId: config.spreadsheetId,
    masterSsId: config.masterSsId,
    platformApiUrl: config.platformApiUrl,
    headersMap: config.headersMap,
    props: PropertiesService.getScriptProperties(),
    defaultConfigs: [
      { key: 'app_version', value: 'v2.0.0', keterangan: 'Versi rilis aplikasi' },
      { key: 'instansi_nama', value: 'Pemerintah Kabupaten Trenggalek', keterangan: 'Nama instansi pengelola' }
    ]
  });
}

/**
 * Jalankan Diagnostic Test Suite Core Library v2.0
 */
function runDiagnosticTests() {
  var config = getAppConfig_();
  return runCoreTests({
    ssId: config.spreadsheetId,
    masterSsId: config.masterSsId,
    platformApiUrl: config.platformApiUrl,
    appCode: config.appCode,
    headersMap: Object.assign({}, config.headersMap, {
      ZZ_TEST_CRUD: ['id', 'nama', 'no_hp', 'catatan_baru', 'laporan_id']
    })
  });
}
