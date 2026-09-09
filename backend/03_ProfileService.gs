// ============================================================
// CORE LIBRARY GLOBAL v2.0 - 03_ProfileService.gs
// Layanan Profil Pegawai & Sinkronisasi SIMPEG
// ============================================================

/**
 * Mengambil profil lengkap pegawai berdasarkan token sesi.
 */
function handleGetMyProfile(token, options) {
  options = options || {};
  var user = requireAuth_(token);

  var scriptProps = PropertiesService.getScriptProperties();
  var masterSsId = options.masterSsId || scriptProps.getProperty('MASTER_SPREADSHEET_ID') || '';
  var localSsId = options.spreadsheetId || scriptProps.getProperty('SPREADSHEET_ID') || '';

  var profile = {
    pegawai_id: user.id || '',
    nama: user.display_name || 'Pengguna',
    email: user.email || '',
    nip: user.nip || '',
    role: user.role || 'viewer',
    pangkat_golongan: '',
    unit_id: user.unit_id || '',
    unit_nama: '',
    jabatan_id: user.jabatan_id || '',
    jabatan_nama: '',
    no_hp: '',
    alamat: ''
  };

  // 1. Ambil data master SIMPEG jika masterSsId dikonfigurasi
  if (masterSsId) {
    try {
      var pegawaiList = getSheetDataCached(localSsId, 'PEGAWAI', null, 1800, { masterSsId: masterSsId });
      var matchedPegawai = null;
      for (var i = 0; i < pegawaiList.length; i++) {
        var p = pegawaiList[i];
        if (user.id && String(p.pegawai_id) === String(user.id)) { matchedPegawai = p; break; }
        if (user.nip && String(p.nip) === String(user.nip)) { matchedPegawai = p; break; }
        if (user.email && normalizeEmail(p.email) === normalizeEmail(user.email)) { matchedPegawai = p; break; }
      }

      if (matchedPegawai) {
        profile.nama = matchedPegawai.nama || profile.nama;
        profile.nip = matchedPegawai.nip || profile.nip;
        profile.pangkat_golongan = matchedPegawai.pangkat_golongan || '';
        profile.no_hp = matchedPegawai.no_hp || profile.no_hp;
        profile.alamat = matchedPegawai.alamat || profile.alamat;
        profile.unit_id = matchedPegawai.unit_id || profile.unit_id;
        profile.jabatan_id = matchedPegawai.jabatan_id || profile.jabatan_id;

        // Ambil nama unit
        if (profile.unit_id) {
          var unitList = getSheetDataCached(localSsId, 'UNIT_KERJA', null, 3600, { masterSsId: masterSsId });
          profile.unit_nama = getUnitNama(unitList, profile.unit_id);
        }

        // Ambil nama jabatan
        if (profile.jabatan_id) {
          var jabatanList = getSheetDataCached(localSsId, 'JABATAN', null, 3600, { masterSsId: masterSsId });
          var jbt = getJabatanById(jabatanList, profile.jabatan_id);
          if (jbt) profile.jabatan_nama = jbt.nama_jabatan || '';
        }
      }
    } catch (e) {
      logWarn('ProfileService', 'Gagal memuat master SIMPEG: ' + e.message);
    }
  }

  // 2. Cek apakah ada override kontak lokal di sheet KONFIGURASI / USER_CONTACTS
  try {
    var contactKey = 'PROFILE_CONTACT_' + (profile.nip || user.id);
    var configs = readRecordsNoLock(localSsId, 'KONFIGURASI', null);
    for (var k = 0; k < configs.length; k++) {
      if (configs[k].key === contactKey && !configs[k].deleted_at) {
        var extra = JSON.parse(configs[k].value || '{}');
        if (extra.alamat) profile.alamat = extra.alamat;
        if (extra.no_hp) profile.no_hp = extra.no_hp;
        break;
      }
    }
  } catch (e) {}

  return {
    success: true,
    data: profile
  };
}

/**
 * Menyimpan informasi kontak profil pengguna (No HP & Alamat).
 */
function handleSaveMyProfile(data, token, options) {
  options = options || {};
  var user = requireAuth_(token);
  data = data || {};

  var localSsId = options.spreadsheetId || PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

  var contactKey = 'PROFILE_CONTACT_' + (user.nip || user.id);
  var contactData = {
    alamat: String(data.alamat || '').trim(),
    no_hp: normalizeNoHp(data.no_hp)
  };

  var record = {
    key: contactKey,
    value: JSON.stringify(contactData),
    keterangan: 'Kontak lokal pegawai: ' + (user.display_name || user.email)
  };

  writeRecordNoLock(localSsId, 'KONFIGURASI', record, false, user, null, null, 'key');

  return {
    success: true,
    message: 'Informasi kontak berhasil diperbarui.'
  };
}
