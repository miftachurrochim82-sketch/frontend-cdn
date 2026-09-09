// ============================================================
// CORE LIBRARY GLOBAL v2.0 - 04_ConfigService.gs
// Layanan Konfigurasi & Pengaturan Sistem (Admin Only)
// ============================================================

/**
 * Mengambil daftar konfigurasi sistem (hanya data yang belum di-soft-delete).
 */
function handleGetConfig(token, options) {
  options = options || {};
  var user = requireAdmin_(token);

  var localSsId = options.spreadsheetId || PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
  var records = readRecordsNoLock(localSsId, 'KONFIGURASI', null);

  // Filter hanya data aktif (deleted_at kosong) dan bukan data kontak internal
  var filtered = records.filter(function (item) {
    return !item.deleted_at && String(item.key || '').indexOf('PROFILE_CONTACT_') !== 0;
  });

  return {
    success: true,
    data: filtered
  };
}

/**
 * Menyimpan atau memperbarui item konfigurasi sistem.
 */
function handleSaveConfigItem(data, token, options) {
  options = options || {};
  var user = requireAdmin_(token);
  data = data || {};

  var key = String(data.key || '').trim();
  if (!key) {
    return { success: false, error: 'Key parameter konfigurasi wajib diisi.' };
  }

  var localSsId = options.spreadsheetId || PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

  var record = {
    key: key,
    value: data.value !== undefined ? String(data.value) : '',
    keterangan: data.keterangan !== undefined ? String(data.keterangan) : ''
  };

  var saved = writeRecordNoLock(localSsId, 'KONFIGURASI', record, false, user, null, null, 'key');

  return {
    success: true,
    message: 'Konfigurasi parameter "' + key + '" berhasil disimpan.',
    data: saved
  };
}

/**
 * Menghapus konfigurasi sistem (soft delete).
 */
function handleDeleteEntity(data, token, options) {
  options = options || {};
  var user = requireAdmin_(token);
  data = data || {};

  var entity = String(data.entity || '').toUpperCase().trim();
  var id = data.id || data.key;

  if (!id) {
    return { success: false, error: 'ID data yang akan dihapus tidak ditemukan.' };
  }

  var localSsId = options.spreadsheetId || PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

  var success = softDeleteRecordNoLock(localSsId, entity, id, user, null, null, entity === 'KONFIGURASI' ? 'id' : null);

  if (!success) {
    // Coba fallback hapus berdasarkan key untuk konfigurasi
    if (entity === 'KONFIGURASI') {
      success = softDeleteRecordNoLock(localSsId, entity, id, user, null, null, 'key');
    }
  }

  if (success) {
    return { success: true, message: 'Data berhasil dihapus.' };
  } else {
    return { success: false, error: 'Data tidak ditemukan atau gagal dihapus.' };
  }
}
