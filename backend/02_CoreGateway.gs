// ============================================================
// CORE LIBRARY GLOBAL v2.0 - 02_CoreGateway.gs
// Changelog v2:
// - C1 FIX: binding appCode tiket vs config (assertTicketBinding_).
// - C2 FIX: prefix session unik per app (sessionPrefixFor_).
// - C3 FIX: testMode DIHAPUS TOTAL (exchange menolak + log ERROR).
// - C4 FIX: TTL session di-cap 21600.
// - H1 FIX: tabel role Global->library standar + customLevels.
// - H2 FIX: pegawai_id/nip di-resolve dari master by email (tanpa fabrikasi).
// - H3 FIX: allowlist entitas + entityPermissions per tabel.
// - H4 FIX: apiSave menghapus paksa field audit client.
// - H5 FIX: AUDIT_LOGS via header default sistem + details dipotong 40rb.
// - H6/H7 FIX: apiSave 1x-scan (upsertRow_ langsung).
// - BARU: Declarative Resource Routing (Auto-CRUD with Row-Level Security,
//         Multi-Field Search, CacheService acceleration, Hooks & Permissions).
// - BARU: case 'save_config_item'; actionLevels kustom; kode error (code) standar.
// Breaking changes: baca 00_MIGRATION_v2.md
// ============================================================

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function extractRecord(data) {
  if (!data) return {};
  if (data.record) return data.record;
  if (data.row) return data.row;
  var record = {};
  Object.keys(data).forEach(function(key) {
    if (['entity', 'sheetName', 'table', 'token', 'action', 'id', 'page', 'limit', 'filters', 'search', 'sortBy', 'sortDir', 'sortOrder'].indexOf(key) === -1) record[key] = data[key];
  });
  if (data.id !== undefined && record.id === undefined) record.id = data.id;
  return record;
}

// ==================== SSO ====================
// testMode DIHAPUS (argumen ke-3 diabaikan demi kompatibilitas signature).
function validatePlatformTicket(ticket, platformApiUrl, testMode, appCode) {
  if (testMode) logError('CoreAuth', '⛔ testMode telah DIHAPUS. Validasi memakai server SSO asli.');
  var cleanTicket = String(ticket || '').trim();
  if (!cleanTicket) throw new Error('Tiket platform SSO tidak dilampirkan atau kosong.');
  if (!platformApiUrl) throw new Error('PLATFORM_API_URL belum dikonfigurasi.');
  var payload = { method: 'POST', path: '/api/v1/auth/validate-ticket', data: { ticket: cleanTicket, appCode: appCode || '' } };
  var response = UrlFetchApp.fetch(platformApiUrl, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true, followRedirects: true });
  var code = response.getResponseCode(), text = response.getContentText();
  if (code !== 200) { logError('CoreAuth', 'HTTP Error ' + code + ': ' + text.slice(0, 300)); throw new Error('Gagal validasi tiket SSO (HTTP ' + code + ').'); }
  var result;
  try { result = JSON.parse(text); } catch (e) { throw new Error('Respon SSO bukan JSON valid: ' + text.substring(0, 100)); }
  if (!result.success || !result.data || !result.data.user) throw new Error((result.error && result.error.message) ? result.error.message : 'Tiket SSO tidak valid/kadaluwarsa.');
  return result.data;
}

// C1: tiket harus milik aplikasi ini.
function assertTicketBinding_(ticketApp, configApp) {
  if (ticketApp && configApp && String(ticketApp) !== String(configApp)) throw new Error('Tiket diterbitkan untuk aplikasi lain (' + ticketApp + ').');
}

// C2: SATU-SATUNYA sumber prefix session. appCode berbeda = namespace berbeda.
function sessionPrefixFor_(config) {
  config = config || {};
  if (config.sessionPrefix) return config.sessionPrefix;
  return 'APP_SESSION_' + (config.appCode || 'DEFAULT') + '_';
}

// H2 murni (testable): cocokkan email -> identitas pegawai dari baris master.
function resolvePegawaiFromRows_(rows, email) {
  var target = String(email || '').toLowerCase().trim();
  var out = { pegawai_id: '', nip: '', nama: '' };
  if (!target || !Array.isArray(rows)) return out;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].email || '').toLowerCase().trim() === target) {
      out.pegawai_id = rows[i].pegawai_id || rows[i].id || '';
      out.nip = rows[i].nip || '';
      out.nama = rows[i].nama || '';
      break;
    }
  }
  return out;
}
function resolvePegawaiByEmail_(email, masterSsId) {
  var empty = { pegawai_id: '', nip: '', nama: '' };
  if (!email || !masterSsId) return empty;
  try {
    return resolvePegawaiFromRows_(getSheetDataCached(masterSsId, 'PEGAWAI', MASTER_SHEET_HEADERS, 600, { masterSsId: masterSsId }), email);
  } catch (e) { logError('CoreAuth', 'Resolve pegawai gagal: ' + e.message); return empty; }
}

function exchangePlatformTicket(ticket, config) {
  try {
    config = config || {};
    if (config.testMode) { logError('CoreAuth', '⛔ testMode telah DIHAPUS. Exchange ditolak.'); return { success: false, code: 'FORBIDDEN', error: 'Test mode dihapus. Gunakan tiket SSO asli.' }; }
    var cleanTicket = String(ticket || '').trim();
    if (!cleanTicket) throw new Error('Tiket SSO wajib dilampirkan.');
    var prefix = sessionPrefixFor_(config);
    var ttl = capTtl_(config.ttlSeconds || 28800); // C4: cap 21600
    var platformData = validatePlatformTicket(cleanTicket, config.platformApiUrl, false, config.appCode);
    assertTicketBinding_(platformData.appCode, config.appCode); // C1
    var platformUser = platformData.user || {};
    var email = String(platformUser.email || '').toLowerCase().trim();
    if (!email) throw new Error('Email pengguna tidak ditemukan dalam respon tiket SSO.');
    var roles = Array.isArray(platformUser.roles) ? platformUser.roles.map(String) : [];
    var role = getHighestRole(roles, config.roleLevels);
    var ident = resolvePegawaiByEmail_(email, config.masterSsId); // H2: tanpa fabrikasi
    var localToken = Utilities.getUuid();
    var payload = { user_id: platformUser.id || platformUser.user_id || email, email: email, role: role, pegawai_id: ident.pegawai_id, nip: ident.nip, display_name: platformUser.display_name || platformUser.nama || platformUser.name || ident.nama || email };
    CacheService.getScriptCache().put(prefix + localToken, JSON.stringify(payload), ttl);
    logInfo('CoreAuth', 'Penukaran tiket SSO berhasil: ' + email + ' [' + role + ']');
    return { success: true, data: { token: localToken, user: payload } };
  } catch (err) { logError('CoreAuth', err.message); return { success: false, code: 'UNAUTHORIZED', error: err.message }; }
}

function logoutUser(token, sessionPrefix) {
  if (!token) return { success: false, code: 'BAD_REQUEST', error: 'Token sesi wajib diisi.' };
  CacheService.getScriptCache().remove((sessionPrefix || 'APP_SESSION_DEFAULT_') + token);
  return { success: true, message: 'Berhasil keluar dari aplikasi.' };
}

function checkAuth(token, minLevel, sessionPrefix, customRoleLevels) {
  try {
    if (!token) return { success: false, code: 'UNAUTHORIZED', error: 'Token sesi tidak ditemukan. Silakan login kembali.' };
    var raw = CacheService.getScriptCache().get((sessionPrefix || 'APP_SESSION_DEFAULT_') + token);
    if (!raw) return { success: false, code: 'UNAUTHORIZED', error: 'Sesi telah kadaluwarsa. Silakan login kembali.' };
    var session = JSON.parse(raw);
    var roleMap = customRoleLevels || MASTER_ROLE_LEVELS;
    var userRole = String(session.role || 'viewer').toLowerCase();
    var currentLevel = roleMap[userRole] || 1;
    var requiredLevel = (typeof minLevel === 'number') ? minLevel : (roleMap[String(minLevel).toLowerCase()] || 1);
    if (currentLevel < requiredLevel) return { success: false, code: 'FORBIDDEN', error: 'Akses ditolak. Butuh hak akses minimal "' + minLevel + '".' };
    return { success: true, token: token, user: { id: session.user_id, email: session.email, role: userRole, pegawai_id: session.pegawai_id || '', nip: session.nip || '', display_name: session.display_name || session.email || '' } };
  } catch (err) { logError('CoreAuth', err.message); return { success: false, code: 'UNAUTHORIZED', error: err.message }; }
}

// H1: mapping standar Global -> library. customLevels di-merge menimpa default.
function getHighestRole(roles, customLevels) {
  var roleLevels = { viewer: 1, user: 1, pegawai: 1, auditor: 1, bendahara: 1, tamu: 1, operator: 2, admin: 2, administrator: 2, kasat: 2, kabid: 2, kasi: 2, sekretaris: 2, kepala_dinas: 2, super: 3, superadmin: 3 };
  if (customLevels) Object.keys(customLevels).forEach(function(k) { roleLevels[String(k).toLowerCase()] = customLevels[k]; });
  if (!roles || !Array.isArray(roles) || roles.length === 0) return 'viewer';
  var highest = 'viewer', level = 0;
  roles.forEach(function(r) {
    var lv = roleLevels[String(r).toLowerCase().trim()] || 1;
    if (lv > level) { level = lv; highest = (lv >= 3) ? 'super' : (lv === 2 ? 'admin' : 'viewer'); }
  });
  return highest;
}

// ==================== CRUD HANDLERS ====================
function apiGet(ssId, sheetName, id, query, headersMap, pkField) {
  try {
    query = query || {};
    var canonical = String(sheetName || '').toUpperCase().trim();
    if (!canonical) return { success: false, code: 'BAD_REQUEST', error: 'Nama sheet tidak valid.' };
    var rows = getSheetDataCached(ssId, canonical, headersMap, 180).filter(function(row) { return !row.deleted_at; });
    var headers = (headersMap && headersMap[canonical]) ? headersMap[canonical] : [];
    if (id) {
      var found = null;
      for (var i = 0; i < rows.length; i++) { if (String(getRecordPrimaryId_(rows[i], pkField)) === String(id)) { found = rows[i]; break; } }
      return { success: true, data: found };
    }
    if (query.filters) {
      var filters = (typeof query.filters === 'string') ? JSON.parse(query.filters) : query.filters;
      Object.keys(filters).forEach(function(key) {
        var val = filters[key];
        if (val !== '' && val !== null && val !== undefined) rows = rows.filter(function(row) { return String(row[key] || '').toLowerCase() === String(val).toLowerCase(); });
      });
    }
    if (query.search) {
      var q = String(query.search).toLowerCase().trim();
      if (q) {
        var fields = headers.length > 0 ? headers : (rows.length > 0 ? Object.keys(rows[0]) : []);
        rows = rows.filter(function(row) { return fields.some(function(h) { return String(row[h] || '').toLowerCase().indexOf(q) !== -1; }); });
      }
    }
    if (query.sortBy) {
      var sortDir = String(query.sortDir || query.sortOrder || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      rows.sort(function(a, b) { var av = a[query.sortBy] || '', bv = b[query.sortBy] || ''; return (av < bv ? -1 : (av > bv ? 1 : 0)) * sortDir; });
    }
    var page = parseInt(query.page, 10); if (isNaN(page) || page < 1) page = 1;
    var limit = parseInt(query.limit, 10); if (isNaN(limit) || limit < 1) limit = 50; if (limit > 500) limit = 500;
    var total = rows.length, start = (page - 1) * limit;
    return { success: true, data: rows.slice(start, start + limit), meta: { total: total, page: page, limit: limit, total_pages: Math.max(1, Math.ceil(total / limit)) } };
  } catch (err) { logError('CoreHandlers.apiGet', err.message); return { success: false, code: 'BAD_REQUEST', error: err.message }; }
}

function apiSave(ssId, sheetName, record, actor, headersMap, isRefSheetFunc, preSaveHook, pkField) {
  var lock = acquireLock();
  if (!lock) return { success: false, code: 'BUSY', error: 'Server sibuk, silakan coba lagi.' };
  try {
    var canonical = resolveCanonical_(sheetName, headersMap);
    var isRef = isRefSheetFunc ? isRefSheetFunc(canonical) : isReferenceSheet(canonical);
    if (isRef) return { success: false, code: 'FORBIDDEN', error: 'Sheet referensi SIMPEG bersifat read-only.' };
    if (!record || typeof record !== 'object') return { success: false, code: 'BAD_REQUEST', error: 'Payload record tidak valid.' };
    record = Object.assign({}, record);
    ['created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'].forEach(function(f) { delete record[f]; }); // H4: otoritas server
    if (typeof preSaveHook === 'function') {
      var hookResult = preSaveHook(canonical, record, actor);
      if (hookResult && hookResult.error) return { success: false, code: 'BAD_REQUEST', error: hookResult.error };
      if (hookResult && hookResult.record) record = hookResult.record;
    }
    var r = resolveHeaders_(canonical, headersMap, record);
    var sh = ensureSheet(ssId, canonical, headersMap, { isRefFunc: isRefSheetFunc });
    var out = upsertRow_(sh, record, actor, pkField, null); // H7: 1x-scan insert-or-update
    invalidateSheetCache(canonical, ssId);
    var userId = actor && (actor.id || actor.user_id) ? (actor.id || actor.user_id) : 'system';
    appendAuditLog(ssId, userId, (out.isUpdate ? 'UPDATE_' : 'INSERT_') + canonical, out.record, headersMap);
    return { success: true, data: out.record };
  } catch (err) { logError('CoreHandlers.apiSave', err.message); return { success: false, code: 'BAD_REQUEST', error: err.message }; }
  finally { try { lock.releaseLock(); } catch (e) {} }
}

function apiDelete(ssId, sheetName, id, actor, headersMap, isRefSheetFunc, pkField) {
  var lock = acquireLock();
  if (!lock) return { success: false, code: 'BUSY', error: 'Server sibuk, silakan coba lagi.' };
  try {
    var canonical = resolveCanonical_(sheetName, headersMap);
    var isRef = isRefSheetFunc ? isRefSheetFunc(canonical) : isReferenceSheet(canonical);
    if (isRef) return { success: false, code: 'FORBIDDEN', error: 'Sheet referensi SIMPEG bersifat read-only.' };
    if (!id) return { success: false, code: 'BAD_REQUEST', error: 'ID record wajib diisi.' };
    var userId = actor && (actor.id || actor.user_id) ? (actor.id || actor.user_id) : 'system';
    if (canonical === 'KONFIGURASI') {
      if (!hardDeleteRecordNoLock(ssId, canonical, id, actor, isRefSheetFunc, pkField)) return { success: false, code: 'NOT_FOUND', error: 'Data konfigurasi tidak ditemukan.' };
      appendAuditLog(ssId, userId, 'HARD_DELETE_' + canonical, 'Hard delete ID: ' + id, headersMap);
      return { success: true, message: 'Konfigurasi dihapus permanen.' };
    }
    if (!softDeleteRecordNoLock(ssId, canonical, id, actor, headersMap, isRefSheetFunc, pkField)) return { success: false, code: 'NOT_FOUND', error: 'Record tidak ditemukan.' };
    appendAuditLog(ssId, userId, 'DELETE_' + canonical, 'Soft delete ID: ' + id, headersMap);
    return { success: true, message: 'Data berhasil dihapus.' };
  } catch (err) { logError('CoreHandlers.apiDelete', err.message); return { success: false, code: 'BAD_REQUEST', error: err.message }; }
  finally { try { lock.releaseLock(); } catch (e) {} }
}

function appendAuditLog(ssId, userId, action, details, headersMap) {
  try {
    var det = (typeof details === 'object') ? JSON.stringify(details) : String(details || '');
    if (det.length > 40000) det = det.slice(0, 40000) + '…[truncated]';
    var sh = ensureSheet(ssId, 'AUDIT_LOGS', headersMap || {}, {});
    var headers = sheetHeaders_(sh);
    if (headers.length === 0) { headers = DEFAULT_SYSTEM_HEADERS.AUDIT_LOGS.slice(); sh.getRange(1, 1, 1, headers.length).setValues([headers]); sh.setFrozenRows(1); }
    sh.appendRow(toAlignedRow_(headers, { id: makeId('audit'), user_id: userId || 'system', action: action || 'UNKNOWN', timestamp: nowIso(), details: det }));
  } catch (e) { logError('CoreHandlers.appendAuditLog', e.message); }
}

// ==================== DECLARATIVE RESOURCE ROUTER ====================
function handleDeclarativeResourceAction_(action, data, currentUser, localConfig) {
  var resources = localConfig.resources;
  if (!resources || typeof resources !== 'object') return null;

  var act = String(action || '').toLowerCase().trim();
  var resourceKeys = Object.keys(resources);

  for (var i = 0; i < resourceKeys.length; i++) {
    var rKey = resourceKeys[i];
    var resCfg = resources[rKey] || {};
    var normKey = String(rKey).toLowerCase().trim();
    var canonical = String(resCfg.sheetName || rKey).toUpperCase().trim();
    var pkField = resCfg.pk || pkFor_(localConfig, canonical) || 'id';
    var ownerField = resCfg.ownerField || null;
    var searchFields = resCfg.searchFields || null;
    var roles = resCfg.roles || {};
    var hooks = resCfg.hooks || {};
    var roleMap = localConfig.roleLevels || MASTER_ROLE_LEVELS;
    var ssId = (isReferenceSheet(canonical) && localConfig.masterSsId) ? localConfig.masterSsId : localConfig.spreadsheetId;
    var headersMap = localConfig.headersMap;
    var userRole = String((currentUser && currentUser.role) || 'viewer').toLowerCase();
    var userLevel = levelOf_(userRole, roleMap);
    var isAdmin = userRole === 'admin' || userRole === 'super';
    var userPegawaiId = String((currentUser && (currentUser.pegawai_id || currentUser.user_id || currentUser.id)) || '').trim();

    // Match Action Patterns
    var isList = (act === 'get_' + normKey + '_list' || act === 'get_' + normKey + 's' || act === 'get_' + normKey || act === normKey + '_list');
    var isDetail = (act === 'get_' + normKey + '_detail' || act === 'get_' + normKey + '_by_id' || act === normKey + '_detail');
    var isSave = (act === 'save_' + normKey || act === 'create_' + normKey || act === 'update_' + normKey);
    var isDelete = (act === 'delete_' + normKey || act === 'remove_' + normKey);

    if (isList) {
      var needRole = roles.read || 'viewer';
      if (userLevel < levelOf_(needRole, roleMap)) {
        return { success: false, code: 'FORBIDDEN', error: 'Akses baca "' + canonical + '" butuh hak akses "' + needRole + '".' };
      }
      return executeResourceList_(ssId, canonical, data, headersMap, pkField, searchFields, resCfg.defaultSort);
    }

    if (isDetail) {
      var needRoleD = roles.read || 'viewer';
      if (userLevel < levelOf_(needRoleD, roleMap)) {
        return { success: false, code: 'FORBIDDEN', error: 'Akses baca "' + canonical + '" butuh hak akses "' + needRoleD + '".' };
      }
      var targetId = data.id || (data.record && data.record[pkField]) || '';
      if (!targetId) return { success: false, code: 'BAD_REQUEST', error: 'ID ' + canonical + ' wajib diisi.' };
      var rows = getSheetDataCached(ssId, canonical, headersMap, 180).filter(function(r) { return !r.deleted_at; });
      var found = null;
      for (var j = 0; j < rows.length; j++) {
        if (String(getRecordPrimaryId_(rows[j], pkField)) === String(targetId)) { found = rows[j]; break; }
      }
      if (!found) return { success: false, code: 'NOT_FOUND', error: 'Data ' + canonical + ' tidak ditemukan.' };
      return { success: true, data: found };
    }

    if (isSave) {
      var record = extractRecord(data);
      var isUpdate = Boolean(record[pkField] && String(record[pkField]).trim() !== '');
      var needRoleS = isUpdate ? (roles.update || roles.create || 'user') : (roles.create || 'user');
      if (userLevel < levelOf_(needRoleS, roleMap)) {
        return { success: false, code: 'FORBIDDEN', error: 'Akses simpan "' + canonical + '" butuh hak akses "' + needRoleS + '".' };
      }

      // Row-level owner guard
      if (ownerField && !isAdmin) {
        if (isUpdate) {
          var rowsS = getSheetDataCached(ssId, canonical, headersMap, 180).filter(function(r) { return !r.deleted_at; });
          var oldRec = null;
          for (var k = 0; k < rowsS.length; k++) {
            if (String(getRecordPrimaryId_(rowsS[k], pkField)) === String(record[pkField])) { oldRec = rowsS[k]; break; }
          }
          if (oldRec && String(oldRec[ownerField] || '').trim() !== userPegawaiId) {
            return { success: false, code: 'FORBIDDEN', error: 'Anda hanya boleh mengubah data milik sendiri.' };
          }
        } else {
          if (!record[ownerField]) record[ownerField] = userPegawaiId;
        }
      }

      var preHook = (hooks && typeof hooks.preSave === 'function') ? hooks.preSave : localConfig.preSaveHook;
      var saveResult = apiSave(ssId, canonical, record, currentUser, headersMap, localConfig.isRefSheetFunc, preHook, pkField);

      if (saveResult && saveResult.success && hooks && typeof hooks.postSave === 'function') {
        try { hooks.postSave(saveResult.data, currentUser); } catch (e) { logWarn('CoreResource', 'postSave hook: ' + e.message); }
      }
      return saveResult;
    }

    if (isDelete) {
      var needRoleDel = roles.delete || 'admin';
      if (userLevel < levelOf_(needRoleDel, roleMap)) {
        return { success: false, code: 'FORBIDDEN', error: 'Akses hapus "' + canonical + '" butuh hak akses "' + needRoleDel + '".' };
      }
      var delId = data.id || (data.record && data.record[pkField]) || '';
      if (!delId) return { success: false, code: 'BAD_REQUEST', error: 'ID ' + canonical + ' wajib diisi.' };

      if (ownerField && !isAdmin) {
        var rowsD = getSheetDataCached(ssId, canonical, headersMap, 180).filter(function(r) { return !r.deleted_at; });
        var targetRec = null;
        for (var m = 0; m < rowsD.length; m++) {
          if (String(getRecordPrimaryId_(rowsD[m], pkField)) === String(delId)) { targetRec = rowsD[m]; break; }
        }
        if (targetRec && String(targetRec[ownerField] || '').trim() !== userPegawaiId) {
          return { success: false, code: 'FORBIDDEN', error: 'Anda hanya boleh menghapus data milik sendiri.' };
        }
      }

      if (hooks && typeof hooks.beforeDelete === 'function') {
        var beforeResult = hooks.beforeDelete(delId, currentUser);
        if (beforeResult && beforeResult.error) return { success: false, code: 'BAD_REQUEST', error: beforeResult.error };
      }

      return apiDelete(ssId, canonical, delId, currentUser, headersMap, localConfig.isRefSheetFunc, pkField);
    }
  }

  return null;
}

function executeResourceList_(ssId, canonical, query, headersMap, pkField, customSearchFields, defaultSort) {
  try {
    query = query || {};
    var rows = getSheetDataCached(ssId, canonical, headersMap, 180).filter(function(r) { return !r.deleted_at; });
    var headers = (headersMap && headersMap[canonical]) ? headersMap[canonical] : (rows.length > 0 ? Object.keys(rows[0]) : []);

    // Filters
    var rawFilters = query.filters || query;
    if (typeof rawFilters === 'string') { try { rawFilters = JSON.parse(rawFilters); } catch (e) { rawFilters = {}; } }
    if (rawFilters && typeof rawFilters === 'object') {
      var exclude = ['action', 'token', 'search', 'page', 'limit', 'sortBy', 'sortDir', 'sortOrder', 'filters'];
      Object.keys(rawFilters).forEach(function(k) {
        if (exclude.indexOf(k) === -1) {
          var val = rawFilters[k];
          if (val !== '' && val !== null && val !== undefined) {
            rows = rows.filter(function(r) { return String(r[k] || '').toLowerCase().trim() === String(val).toLowerCase().trim(); });
          }
        }
      });
    }

    // Search
    var q = String(query.search || '').toLowerCase().trim();
    if (q) {
      var fields = (customSearchFields && customSearchFields.length > 0) ? customSearchFields : headers;
      rows = rows.filter(function(r) {
        return fields.some(function(f) { return String(r[f] || '').toLowerCase().indexOf(q) !== -1; });
      });
    }

    // Sort
    var sortKey = query.sortBy || (defaultSort && defaultSort.field) || '';
    var sortOrder = query.sortDir || query.sortOrder || (defaultSort && defaultSort.order) || 'asc';
    if (sortKey) {
      var dir = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;
      rows.sort(function(a, b) {
        var av = String(a[sortKey] || ''), bv = String(b[sortKey] || '');
        return (av < bv ? -1 : (av > bv ? 1 : 0)) * dir;
      });
    }

    // Pagination
    var page = parseInt(query.page, 10); if (isNaN(page) || page < 1) page = 1;
    var limit = parseInt(query.limit, 10); if (isNaN(limit) || limit < 1) limit = 50; if (limit > 500) limit = 500;
    var total = rows.length;
    var start = (page - 1) * limit;

    return {
      success: true,
      data: rows.slice(start, start + limit),
      meta: {
        total: total,
        page: page,
        limit: limit,
        total_pages: Math.max(1, Math.ceil(total / limit))
      }
    };
  } catch (err) {
    logError('CoreResource.list', err.message);
    return { success: false, code: 'BAD_REQUEST', error: err.message };
  }
}

// ==================== DISPATCHER ====================
function levelOf_(role, map) { return (map && map[String(role).toLowerCase()]) || 1; }
function entityGate_(entity, headersMap) {
  if (!entity || entity === 'UNDEFINED') return 'Entitas tidak valid.';
  if (headersMap && headersMap[entity]) return null;
  if (DEFAULT_SYSTEM_HEADERS[entity] || MASTER_SHEET_HEADERS[entity]) return null;
  return 'Entitas "' + entity + '" tidak dikenal.';
}

function dispatchAction(payload, localConfig) {
  payload = payload || {};
  var action = String(payload.action || '').toLowerCase();
  var data = payload.data || {};
  var token = payload.token || data.token || '';
  localConfig = localConfig || {};
  var ssId = localConfig.spreadsheetId;
  var headersMap = localConfig.headersMap;
  var localHandlers = localConfig.localHandlers || {};
  var prefix = sessionPrefixFor_(localConfig);
  var roleMap = localConfig.roleLevels || MASTER_ROLE_LEVELS;
  logInfo('CoreRouter', 'Handling action: ' + action);
  try {
    // 1. Publik: tukar tiket & logout (tanpa session)
    if (action === 'exchange_platform_ticket' || action === 'exchange_sso_ticket') {
      var ticketEx = (typeof data === 'string') ? data : (data.ticket || payload.ticket || '');
      return exchangePlatformTicket(ticketEx, localConfig);
    }
    if (action === 'logout') return logoutUser(token, prefix);
    // Handler SSO pre-auth (signature: fn(data, payload) — TANPA user).
    if (localHandlers[action] && typeof localHandlers[action] === 'function' && (action === 'validate_sso_ticket' || action === 'generate_sso_ticket')) {
      return localHandlers[action](data, payload);
    }
    // 2. Level minimal: actionLevels kustom menang atas default.
    var minLevel = (localConfig.actionLevels && localConfig.actionLevels[action]) || ((['save', 'delete', 'save_my_profile', 'save_config_item'].indexOf(action) !== -1) ? 'admin' : 'viewer');
    var auth = checkAuth(token, minLevel, prefix, roleMap);
    if (!auth.success) return auth;
    var currentUser = auth.user;

    // 3. Handler lokal dinas kustom (signature: fn(data, currentUser) — post-auth).
    if (localHandlers[action] && typeof localHandlers[action] === 'function') {
      return localHandlers[action](data, currentUser);
    }

    // 4. Declarative Resource Router (Auto-CRUD with Row-Level Security, Search & Cache)
    var resourceResult = handleDeclarativeResourceAction_(action, data, currentUser, localConfig);
    if (resourceResult !== null) return resourceResult;

    // 5. Aksi universal.
    var masterDb = localConfig.masterSsId || ssId;
    switch (action) {
      case 'get_profile':
        var profile = getProfile(ssId, currentUser.email, headersMap, localConfig.masterSsId);
        return { success: true, data: profile || currentUser };
      case 'save_my_profile':
        return saveMyProfile(ssId, data, currentUser, headersMap, localConfig.masterSsId);
      case 'get_config':
        return { success: true, data: getSheetDataCached(ssId, 'KONFIGURASI', headersMap, 300) };
      case 'save_config_item':
        return saveConfigItem(ssId, data, currentUser, headersMap);
      case 'get_pegawai_list':
        return { success: true, data: getSheetDataCached(masterDb, 'PEGAWAI', MASTER_SHEET_HEADERS, 300, { masterSsId: localConfig.masterSsId }) };
      case 'get_unit_list':
        return { success: true, data: getSheetDataCached(masterDb, 'UNIT_KERJA', MASTER_SHEET_HEADERS, 300, { masterSsId: localConfig.masterSsId }) };
      case 'get_jabatan_list':
        return { success: true, data: getSheetDataCached(masterDb, 'JABATAN', MASTER_SHEET_HEADERS, 300, { masterSsId: localConfig.masterSsId }) };
      case 'get': {
        var entityGet = String(data.entity || data.sheetName || data.table || '').toUpperCase();
        var gateErr = entityGate_(entityGet, headersMap);
        if (gateErr) return { success: false, code: 'NOT_FOUND', error: gateErr };
        var needGet = 'viewer';
        if (localConfig.entityPermissions && localConfig.entityPermissions[entityGet] && localConfig.entityPermissions[entityGet].read) needGet = localConfig.entityPermissions[entityGet].read;
        if (levelOf_(currentUser.role, roleMap) < levelOf_(needGet, roleMap)) return { success: false, code: 'FORBIDDEN', error: 'Akses baca "' + entityGet + '" butuh "' + needGet + '".' };
        var dbGet = (isReferenceSheet(entityGet) && localConfig.masterSsId) ? localConfig.masterSsId : ssId;
        return apiGet(dbGet, entityGet, data.id || null, data, headersMap, pkFor_(localConfig, entityGet));
      }
      case 'save': {
        var entitySave = String(data.entity || data.sheetName || data.table || '').toUpperCase();
        var gateErrS = entityGate_(entitySave, headersMap);
        if (gateErrS) return { success: false, code: 'NOT_FOUND', error: gateErrS };
        var needWrite = 'admin';
        if (localConfig.entityPermissions && localConfig.entityPermissions[entitySave] && localConfig.entityPermissions[entitySave].write) needWrite = localConfig.entityPermissions[entitySave].write;
        if (levelOf_(currentUser.role, roleMap) < levelOf_(needWrite, roleMap)) return { success: false, code: 'FORBIDDEN', error: 'Akses tulis "' + entitySave + '" butuh "' + needWrite + '".' };
        return apiSave(ssId, entitySave, extractRecord(data), currentUser, headersMap, localConfig.isRefSheetFunc, localConfig.preSaveHook, pkFor_(localConfig, entitySave));
      }
      case 'delete': {
        var entityDel = String(data.entity || data.sheetName || data.table || '').toUpperCase();
        var gateErrD = entityGate_(entityDel, headersMap);
        if (gateErrD) return { success: false, code: 'NOT_FOUND', error: gateErrD };
        var needDel = 'admin';
        if (localConfig.entityPermissions && localConfig.entityPermissions[entityDel] && localConfig.entityPermissions[entityDel].write) needDel = localConfig.entityPermissions[entityDel].write;
        if (levelOf_(currentUser.role, roleMap) < levelOf_(needDel, roleMap)) return { success: false, code: 'FORBIDDEN', error: 'Akses hapus "' + entityDel + '" butuh "' + needDel + '".' };
        return apiDelete(ssId, entityDel, data.id, currentUser, headersMap, localConfig.isRefSheetFunc, pkFor_(localConfig, entityDel));
      }
      default:
        return { success: false, code: 'NOT_FOUND', error: 'Aksi "' + action + '" tidak dikenali.' };
    }
  } catch (err) { logError('CoreRouter', 'CRITICAL: ' + err.message); return { success: false, code: 'BAD_REQUEST', error: err.message }; }
}
function pkFor_(localConfig, entity) {
  return (localConfig && localConfig.pkFields && localConfig.pkFields[entity]) || undefined;
}
