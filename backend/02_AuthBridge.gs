// ============================================================
// CORE LIBRARY GLOBAL v2.0 - 02_AuthBridge.gs
// Modul Autentikasi SSO, Verifikasi Token Sesi & Role Guard
// ============================================================

var SESSION_EXPIRY_SECONDS = 86400; // 24 Jam

/**
 * Validasi tiket SSO dari SI-Platform dan kembalikan token sesi.
 * @param {string} ticket - Tiket SSO dari URL parameter
 * @param {Object} options - { platformValidateUrl, secretKey, spreadsheetId, masterSsId }
 * @returns {Object} { success: boolean, data: { token, user } }
 */
function handleExchangePlatformTicket(ticket, options) {
  options = options || {};
  if (!ticket || String(ticket).trim() === '') {
    return { success: false, error: 'Tiket Single Sign-On (SSO) tidak ditemukan.' };
  }

  var scriptProps = PropertiesService.getScriptProperties();
  var validateUrl = options.platformValidateUrl || scriptProps.getProperty('PLATFORM_VALIDATE_URL') || '';
  var masterSsId = options.masterSsId || scriptProps.getProperty('MASTER_SPREADSHEET_ID') || '';
  var localSsId = options.spreadsheetId || scriptProps.getProperty('SPREADSHEET_ID') || '';

  var userData = null;

  // 1. Jika ada endpoint validasi SI-Platform HTTP/API
  if (validateUrl) {
    try {
      var resp = UrlFetchApp.fetch(validateUrl + '?ticket=' + encodeURIComponent(ticket), {
        method: 'get',
        muteHttpExceptions: true
      });
      var result = JSON.parse(resp.getContentText());
      if (result && result.success && result.data && result.data.user) {
        userData = result.data.user;
      }
    } catch (e) {
      logError('AuthBridge', 'Validasi HTTP tiket SSO gagal: ' + e.message);
    }
  }

  // 2. Fallback / direct ticket decode (bila tiket berupa payload terenkripsi/base64)
  if (!userData) {
    try {
      var decoded = Utilities.newBlob(Utilities.base64Decode(ticket)).getDataAsString();
      var parsedTicket = JSON.parse(decoded);
      if (parsedTicket && (parsedTicket.email || parsedTicket.nip || parsedTicket.user_id)) {
        userData = parsedTicket;
      }
    } catch (e) {
      // Tiket bukan format base64 JSON
    }
  }

  // 3. Fallback: Lookup data SIMPEG di master spreadsheet jika ada email/nip
  if (userData && masterSsId) {
    try {
      var pegawaiList = getSheetDataCached(localSsId, 'PEGAWAI', null, 3600, { masterSsId: masterSsId });
      var matched = null;
      for (var i = 0; i < pegawaiList.length; i++) {
        var p = pegawaiList[i];
        if (userData.email && normalizeEmail(p.email) === normalizeEmail(userData.email)) { matched = p; break; }
        if (userData.nip && String(p.nip) === String(userData.nip)) { matched = p; break; }
      }
      if (matched) {
        userData = Object.assign({}, matched, userData);
      }
    } catch (e) {
      logWarn('AuthBridge', 'Sinkronisasi profil SIMPEG saat login dilewati: ' + e.message);
    }
  }

  if (!userData) {
    return { success: false, error: 'Tiket SSO tidak valid atau sudah kedaluwarsa.' };
  }

  // Siapkan user payload standar
  var user = {
    id: userData.pegawai_id || userData.id || userData.user_id || makeId('usr'),
    email: normalizeEmail(userData.email || ''),
    nip: userData.nip || '',
    display_name: userData.nama || userData.display_name || userData.username || userData.email || 'Pengguna',
    role: String(userData.role || 'viewer').toLowerCase(),
    unit_id: userData.unit_id || '',
    jabatan_id: userData.jabatan_id || ''
  };

  // Buat session token
  var token = generateSessionToken_(user);

  return {
    success: true,
    data: {
      token: token,
      user: user
    }
  };
}

/**
 * Menghasilkan token sesi bertandatangan HMAC
 */
function generateSessionToken_(user) {
  var now = Math.floor(Date.now() / 1000);
  var payload = {
    u: user,
    exp: now + SESSION_EXPIRY_SECONDS,
    iat: now
  };
  var payloadStr = JSON.stringify(payload);
  var payloadB64 = Utilities.base64EncodeWebSafe(payloadStr);

  var secret = getSessionSecret_();
  var signature = Utilities.computeHmacSha256Signature(payloadB64, secret);
  var signatureB64 = Utilities.base64EncodeWebSafe(signature);

  return payloadB64 + '.' + signatureB64;
}

/**
 * Verifikasi token sesi. Mengembalikan user jika valid, throw error jika expired/invalid.
 */
function verifySessionToken_(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) {
    var err = new Error('Token sesi tidak ditemukan atau tidak valid.');
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  var parts = token.split('.');
  var payloadB64 = parts[0];
  var signatureB64 = parts[1];

  var secret = getSessionSecret_();
  var expectedSig = Utilities.computeHmacSha256Signature(payloadB64, secret);
  var expectedSigB64 = Utilities.base64EncodeWebSafe(expectedSig);

  if (signatureB64 !== expectedSigB64) {
    var errSig = new Error('Tanda tangan token sesi tidak sah.');
    errSig.code = 'UNAUTHORIZED';
    throw errSig;
  }

  var payloadStr = Utilities.newBlob(Utilities.base64DecodeWebSafe(payloadB64)).getDataAsString();
  var payload = JSON.parse(payloadStr);

  var now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    var errExp = new Error('Sesi Anda telah kedaluwarsa. Silakan login ulang.');
    errExp.code = 'UNAUTHORIZED';
    throw errExp;
  }

  return payload.u;
}

/**
 * Dapatkan atau buat Secret Key sesi unik per script deployment.
 */
function getSessionSecret_() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('SESSION_SECRET');
  if (!secret) {
    secret = Utilities.getUuid() + '_' + Date.now();
    props.setProperty('SESSION_SECRET', secret);
  }
  return secret;
}

/**
 * Guard untuk memastikan token valid sebelum memproses aksi.
 */
function requireAuth_(token) {
  return verifySessionToken_(token);
}

/**
 * Guard untuk memastikan role user adalah admin atau super.
 */
function requireAdmin_(token) {
  var user = verifySessionToken_(token);
  var role = String(user.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'super') {
    var err = new Error('Akses ditolak: Operasi ini membutuhkan hak akses Administrator.');
    err.code = 'FORBIDDEN';
    throw err;
  }
  return user;
}
