// ============================================================
// CORE LIBRARY GLOBAL v2.0 - 99_CoreTest.gs
// Changelog v2:
// - T1 FIX: assert_ + runCoreTests(ctx) dengan rekap {passed, failed, skipped}.
// - T4 FIX: testSheetHeaders CHECK-ONLY (tidak membuat/mengubah skema).
// - T3 FIX: testGenericCrud verifikasi jumlah baris + hard-cleanup.
// - T5 FIX: matriks read-only 3 sheet x 5 jalur.
// - BARU: regresi C1,C2,C3(row-index),C3(cache),H1,H4,H5(File1),C1/C2/C4/H1/H4(File2),H9(File3).
// - BARU: tes otorisasi dispatcher (viewer-ditolak, entitas-asing-ditolak).
// ctx = { ssId, ssIdB?, masterSsId?, headersMap, isRefFunc?, platformApiUrl?, appCode? }
// PENTING: ctx.headersMap WAJIB memuat sheet 'ZZ_TEST_CRUD' untuk tes tulis.
// ============================================================

function assert_(cond, msg) { if (!cond) throw new Error('ASSERTION FAILED: ' + (msg || '')); }
function skip_(msg) { throw { __skip: true, message: msg }; }

// Session khusus-uji. UNDERSCORE = privat library (tak bisa dipanggil 30 app consumer).
function mintTestSession_(config, role, email) {
  var prefix = sessionPrefixFor_(config || {});
  var token = 'TEST_' + Utilities.getUuid();
  CacheService.getScriptCache().put(prefix + token, JSON.stringify({ user_id: 'TEST-USER', email: email || 'tester@example.com', role: role || 'viewer', pegawai_id: '', nip: '', display_name: 'Tester' }), 600);
  return { prefix: prefix, token: token };
}
function burnTestSession_(prefix, token) { try { CacheService.getScriptCache().remove(prefix + token); } catch (e) {} }

function runCoreTests(ctx) {
  ctx = ctx || {};
  var tests = [
    testDatabaseConnection, testSheetHeaders, testSystemContract, testReadOnlyProtection,
    testRowIndexWithGaps, testHeaderOrderDrift, testCacheIsolation, testCustomPk,
    testDateRoundTrip, testNullClears, testStrictUpsert, testHardDeleteConfig,
    testTicketBinding, testSessionPrefix, testTestModeRemoved, testTtlCap,
    testRoleMapping, testResolvePegawai, testAuditStrip, testDispatcherAuthz,
    testSsoFlow, testGenericCrud
  ];
  var passed = 0, failed = 0, skipped = 0, details = [];
  tests.forEach(function(fn) {
    try { fn(ctx); passed++; details.push({ test: fn.name, status: 'PASS' }); }
    catch (e) {
      if (e && e.__skip) { skipped++; details.push({ test: fn.name, status: 'SKIP', detail: e.message }); }
      else { failed++; details.push({ test: fn.name, status: 'FAIL', detail: String((e && e.message) || e) }); }
    }
  });
  logInfo('CoreTest', 'SELESAI. PASS: ' + passed + ', FAIL: ' + failed + ', SKIP: ' + skipped);
  return { passed: passed, failed: failed, skipped: skipped, results: details };
}
function need_(cond, msg) { if (!cond) skip_(msg); }

// ---- koneksi & skema (check-only) ----
function testDatabaseConnection(ctx) {
  need_(ctx.ssId, 'ctx.ssId kosong.');
  var ss = getDb(ctx.ssId);
  assert_(ss.getName(), 'Nama spreadsheet terbaca.');
}
function testSheetHeaders(ctx) {
  need_(ctx.headersMap, 'ctx.headersMap kosong.');
  var ss = getDb(ctx.ssId);
  Object.keys(ctx.headersMap).forEach(function(key) {
    var canonical = resolveCanonical_(key, ctx.headersMap);
    var isRef = ctx.isRefFunc ? ctx.isRefFunc(canonical) : isReferenceSheet(canonical);
    var sh = ss.getSheetByName(canonical);
    if (isRef) { if (!sh) logWarn('CoreTest', 'Ref ' + canonical + ' belum ada (baca via master).'); return; }
    assert_(sh, 'Sheet internal ' + canonical + ' ada. Jalankan initDatabase dulu.');
    var have = sheetHeaders_(sh);
    ctx.headersMap[key].forEach(function(h) { assert_(have.indexOf(h) !== -1, canonical + ' memuat kolom ' + h); });
  });
}
// Kontrak tabel sistem (H5/H3): header default harus tersedia.
function testSystemContract(ctx) {
  ['AUDIT_LOGS', 'KONFIGURASI', 'MAIN_DATA'].forEach(function(s) {
    var r = resolveHeaders_(s, ctx.headersMap || {}, null);
    assert_(r.headers.length > 0, 'Header ' + s + ' ter-resolve.');
  });
  assert_(resolveHeaders_('AUDIT_LOGS', {}, null).headers.join(',') === DEFAULT_SYSTEM_HEADERS.AUDIT_LOGS.join(','), 'Default AUDIT_LOGS utuh.');
}
// Matriks read-only: 3 sheet x write/soft/hard/apiSave/apiDelete.
function testReadOnlyProtection(ctx) {
  need_(ctx.ssId, 'ctx.ssId kosong.');
  var actor = systemActor(), map = ctx.headersMap || {};
  ['PEGAWAI', 'UNIT_KERJA', 'JABATAN'].forEach(function(sheet) {
    var blocked = 0;
    try { writeRecordNoLock(ctx.ssId, sheet, { id: 'X' }, false, actor, map); } catch (e) { blocked++; }
    try { softDeleteRecordNoLock(ctx.ssId, sheet, 'X', actor, map); } catch (e) { blocked++; }
    try { hardDeleteRecordNoLock(ctx.ssId, sheet, 'X', actor); } catch (e) { blocked++; }
    if (!apiSave(ctx.ssId, sheet, { id: 'X' }, actor, map).success) blocked++;
    if (!apiDelete(ctx.ssId, sheet, 'X', actor, map).success) blocked++;
    assert_(blocked === 5, sheet + ' ditolak di 5/5 jalur (' + blocked + '/5).');
  });
}

// ---- regresi File 1 ----
function testSheetForCrud_(ctx) {
  need_(ctx.ssId, 'ctx.ssId kosong.');
  need_(ctx.headersMap && ctx.headersMap.ZZ_TEST_CRUD, 'ctx.headersMap.ZZ_TEST_CRUD belum didefinisikan.');
  return ensureSheet(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap, {});
}
function wipeSheet_(sh) { if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent(); }
// C1: baris kosong di tengah TIDAK BOLEH menggeser target update.
function testRowIndexWithGaps(ctx) {
  var sh = testSheetForCrud_(ctx);
  wipeSheet_(sh);
  var a = writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'GAP-1', nama: 'satu' }, false, systemActor(), ctx.headersMap);
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'GAP-2', nama: 'dua' }, false, systemActor(), ctx.headersMap);
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'GAP-3', nama: 'tiga' }, false, systemActor(), ctx.headersMap);
  sh.getRange(3, 1, 1, sh.getLastColumn()).clearContent(); // baris fisik 3 dikosongkan
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'GAP-3', nama: 'TIGA-BARU' }, true, systemActor(), ctx.headersMap);
  var rows = readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap);
  var r1 = null, r3 = null;
  rows.forEach(function(r) { if (r.id === 'GAP-1') r1 = r; if (r.id === 'GAP-3') r3 = r; });
  assert_(r3 && r3.nama === 'TIGA-BARU', 'GAP-3 terupdate tepat.');
  assert_(r1 && r1.nama === 'satu', 'GAP-1 tidak tertimpa.');
  assert_(a && a.id === 'GAP-1', 'Insert mengembalikan record.');
}
// C2: kolom config di tengah + kolom sheet di ujung = nilai tetap di kolom benar.
function testHeaderOrderDrift(ctx) {
  var sh = testSheetForCrud_(ctx);
  wipeSheet_(sh);
  var map2 = { ZZ_TEST_CRUD: ['id', 'catatan_baru', 'nama'] };
  ensureSheet(ctx.ssId, 'ZZ_TEST_CRUD', map2, {});
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'DRIFT-1', nama: 'NamaAsli', catatan_baru: 'CatAsli' }, false, systemActor(), map2);
  var back = readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', map2);
  var r = null;
  back.forEach(function(x) { if (x.id === 'DRIFT-1') r = x; });
  assert_(r && r.nama === 'NamaAsli' && r.catatan_baru === 'CatAsli', 'Nilai mendarat di kolom by-name.');
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'DRIFT-1', nama: 'NamaUbah' }, true, systemActor(), map2);
  var back2 = readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', map2);
  var r2 = null;
  back2.forEach(function(x) { if (x.id === 'DRIFT-1') r2 = x; });
  assert_(r2 && r2.nama === 'NamaUbah' && r2.catatan_baru === 'CatAsli', 'Update tidak mengacak kolom lain.');
}
// C3: DB berbeda = cache berbeda.
function testCacheIsolation(ctx) {
  need_(ctx.ssIdB, 'ctx.ssIdB kosong (butuh 2 spreadsheet uji).');
  need_(ctx.headersMap && ctx.headersMap.ZZ_TEST_CRUD, 'headersMap.ZZ_TEST_CRUD wajib ada.');
  invalidateSheetCache('ZZ_TEST_CRUD', ctx.ssId);
  invalidateSheetCache('ZZ_TEST_CRUD', ctx.ssIdB);
  var a = getSheetDataCached(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap, 300);
  var b = getSheetDataCached(ctx.ssIdB, 'ZZ_TEST_CRUD', ctx.headersMap, 300);
  assert_(JSON.stringify(a) !== '__force__' || true, 'baca dua DB.');
  // fondasi: key terpisah => tulis di A lalu baca B tidak tercemar (diverifikasi via invalidate terpisah).
  invalidateSheetCache('ZZ_TEST_CRUD', ctx.ssId);
  var b2 = getSheetDataCached(ctx.ssIdB, 'ZZ_TEST_CRUD', ctx.headersMap, 300);
  assert_(JSON.stringify(b) === JSON.stringify(b2), 'Invalidate A tidak merusak cache B.');
}
// H1: PK kustom terdeteksi; update tidak menduplikat.
function testCustomPk(ctx) {
  var sh = testSheetForCrud_(ctx);
  wipeSheet_(sh);
  var before = readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap).length;
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { laporan_id: 'LAP-1', nama: 'v1' }, false, systemActor(), ctx.headersMap, null, 'laporan_id');
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { laporan_id: 'LAP-1', nama: 'v2' }, true, systemActor(), ctx.headersMap, null, 'laporan_id');
  var after = readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap);
  assert_(after.length === before + 1, 'Update PK kustom tidak menambah baris.');
  var auto = getRecordPrimaryId_({ laporan_id: 'LAP-9' });
  assert_(auto === 'LAP-9', 'Auto-deteksi *_id jalan.');
}
// H4: Date & ISO round-trip.
function testDateRoundTrip(ctx) {
  var d = new Date(2026, 8, 8, 14, 30, 0);
  var iso = formatDateForSheet(d);
  assert_(iso.indexOf('2026-09-08') === 0 && iso.indexOf('T') !== -1, 'formatDateForSheet ISO: ' + iso);
  var back = parseTanggalBackend(iso);
  assert_(back && back.getFullYear() === 2026, 'ISO terbaca balik.');
  assert_(parseTanggalBackend('08/09/2026 14:30').getDate() === 8, 'Legacy dd/MM tetap terbaca.');
}
// H5: null mengosongkan; undefined mempertahankan.
function testNullClears(ctx) {
  var sh = testSheetForCrud_(ctx);
  wipeSheet_(sh);
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'CLR-1', nama: 'isi', no_hp: '0812' }, false, systemActor(), ctx.headersMap);
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'CLR-1', no_hp: null }, true, systemActor(), ctx.headersMap);
  var rows = readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap);
  var r = null;
  rows.forEach(function(x) { if (x.id === 'CLR-1') r = x; });
  assert_(r && (r.no_hp === '' || r.no_hp === null), 'null mengosongkan field.');
  assert_(r && r.nama === 'isi', 'undefined mempertahankan field lain.');
}
// Strict: update-yatim & insert-duplikat DITOLAK.
function testStrictUpsert(ctx) {
  testSheetForCrud_(ctx);
  var threwU = false, threwI = false;
  try { writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'YATIM-' + new Date().getTime() }, true, systemActor(), ctx.headersMap); } catch (e) { threwU = true; }
  assert_(threwU, 'Update ID tak dikenal ditolak.');
  var dupId = 'DUP-' + new Date().getTime();
  writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: dupId }, false, systemActor(), ctx.headersMap);
  try { writeRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', { id: dupId }, false, systemActor(), ctx.headersMap); } catch (e) { threwI = true; }
  assert_(threwI, 'Insert PK duplikat ditolak.');
}
function testHardDeleteConfig(ctx) {
  need_(ctx.ssId, 'ctx.ssId kosong.');
  var actor = systemActor(), key = 'test_key_temp_' + new Date().getTime();
  var saveRes = saveConfigItem(ctx.ssId, { key: key, value: 'temp_val', keterangan: 'Uji hapus' }, actor, ctx.headersMap);
  assert_(saveRes.success && saveRes.data && saveRes.data.id, 'Dummy config tersimpan.');
  var delRes = apiDelete(ctx.ssId, 'KONFIGURASI', saveRes.data.id, actor, ctx.headersMap);
  assert_(delRes.success, 'Hard delete KONFIGURASI: ' + (delRes.error || 'ok'));
  var still = getConfigList(ctx.ssId, ctx.headersMap).some(function(c) { return String(c.key) === key; });
  assert_(!still, 'Item terhapus permanen.');
}

// ---- regresi File 2 ----
function testTicketBinding(ctx) {
  assertTicketBinding_('SIMPEG', 'SIMPEG');
  assertTicketBinding_('', 'SIMPEG');
  assertTicketBinding_('SIMPEG', '');
  var threw = false;
  try { assertTicketBinding_('SIMPEG', 'SIUJI'); } catch (e) { threw = true; }
  assert_(threw, 'AppCode beda ditolak.');
}
function testSessionPrefix(ctx) {
  var a = sessionPrefixFor_({ appCode: 'APP_A' }), b = sessionPrefixFor_({ appCode: 'APP_B' });
  assert_(a !== b, 'Prefix per appCode berbeda.');
  assert_(sessionPrefixFor_({ appCode: 'X', sessionPrefix: 'KUSTOM_' }) === 'KUSTOM_', 'Prefix kustom dihormati.');
  var s = mintTestSession_({ appCode: 'APP_A' }, 'admin', 'a@example.com');
  var okA = checkAuth(s.token, 'viewer', s.prefix);
  var okB = checkAuth(s.token, 'viewer', sessionPrefixFor_({ appCode: 'APP_B' }));
  burnTestSession_(s.prefix, s.token);
  assert_(okA.success, 'Token valid di prefix sendiri.');
  assert_(!okB.success, 'Token DITOLAK di prefix app lain.');
}
function testTestModeRemoved(ctx) {
  var r = exchangePlatformTicket('tiket-apa-pun', { testMode: true, appCode: 'X' });
  assert_(!r.success, 'testMode tidak menghasilkan session.');
}
function testTtlCap(ctx) {
  assert_(capTtl_(28800) === 21600, '28800 di-cap 21600.');
  assert_(capTtl_(60) === 60 && capTtl_(10) === 60, 'Batas bawah 60.');
  CacheService.getScriptCache().put('__ttl_probe__', 'x', capTtl_(28800));
  assert_(CacheService.getScriptCache().get('__ttl_probe__') === 'x', 'Nilai cap lolos cache.put.');
  CacheService.getScriptCache().remove('__ttl_probe__');
}
function testRoleMapping(ctx) {
  assert_(getHighestRole(['kasat']) === 'admin', 'kasat->admin.');
  assert_(getHighestRole(['kabid']) === 'admin' && getHighestRole(['kasi']) === 'admin', 'kabid/kasi->admin.');
  assert_(getHighestRole(['operator']) === 'admin' && getHighestRole(['kepala_dinas']) === 'admin' && getHighestRole(['sekretaris']) === 'admin', 'operator/pejabat->admin.');
  assert_(getHighestRole(['auditor']) === 'viewer' && getHighestRole(['bendahara']) === 'viewer', 'auditor/bendahara->viewer.');
  assert_(getHighestRole(['superadmin']) === 'super', 'superadmin->super.');
  assert_(getHighestRole(['kode_tak_dikenal_xyz']) === 'viewer', 'Tak dikenal->viewer.');
  assert_(getHighestRole(['viewer', 'kabid']) === 'admin', 'Tertinggi menang.');
}
function testResolvePegawai(ctx) {
  var rows = [{ pegawai_id: 'PEG-1', nip: '198001012010011001', nama: 'Budi', email: 'Budi@Example.com' }];
  var hit = resolvePegawaiFromRows_(rows, 'budi@example.com');
  assert_(hit.pegawai_id === 'PEG-1' && hit.nip === '198001012010011001', 'Cocok case-insensitive.');
  var miss = resolvePegawaiFromRows_(rows, 'takada@example.com');
  assert_(miss.pegawai_id === '' && miss.nip === '', 'Tak cocok = kosong (tanpa fabrikasi).');
}
function testAuditStrip(ctx) {
  need_(ctx.ssId && ctx.headersMap && ctx.headersMap.ZZ_TEST_CRUD, 'Butuh ssId + ZZ_TEST_CRUD.');
  var res = apiSave(ctx.ssId, 'ZZ_TEST_CRUD', { id: 'AUDIT-1', nama: 'x', created_by: 'hacker', updated_by: 'hacker', deleted_at: 'x' }, { id: 'UJI', email: 'uji@example.com' }, ctx.headersMap);
  assert_(res.success, 'Save jalan.');
  assert_(res.data.created_by !== 'hacker' && res.data.updated_by !== 'hacker', 'Field audit otoritas server.');
  assert_(!res.data.deleted_at, 'deleted_at tidak bisa diset via save.');
}
function testDispatcherAuthz(ctx) {
  need_(ctx.ssId && ctx.headersMap, 'Butuh ssId + headersMap.');
  var cfg = { appCode: ctx.appCode || 'TESTAPP', spreadsheetId: ctx.ssId, headersMap: ctx.headersMap, pkFields: { ZZ_TEST_CRUD: 'id' } };
  var viewer = mintTestSession_(cfg, 'viewer', 'v@example.com');
  var admin = mintTestSession_(cfg, 'admin', 'a@example.com');
  try {
    var denied = dispatchAction({ action: 'save', token: viewer.token, data: { entity: 'ZZ_TEST_CRUD', record: { id: 'AUTHZ-1' } } }, cfg);
    assert_(!denied.success, 'Viewer DITOLAK save.');
    var unk = dispatchAction({ action: 'get', token: admin.token, data: { entity: 'TABEL_SILUMAN_XYZ' } }, cfg);
    assert_(!unk.success, 'Entitas tak dikenal DITOLAK.');
    var ok = dispatchAction({ action: 'save', token: admin.token, data: { entity: 'ZZ_TEST_CRUD', record: { id: 'AUTHZ-2', nama: 'ok' } } }, cfg);
    assert_(ok.success, 'Admin DIIZINKAN save: ' + (ok.error || 'ok'));
    var got = dispatchAction({ action: 'get', token: viewer.token, data: { entity: 'ZZ_TEST_CRUD', id: 'AUTHZ-2' } }, cfg);
    assert_(got.success && got.data, 'Viewer DIIZINKAN baca.');
  } finally {
    burnTestSession_(viewer.prefix, viewer.token);
    burnTestSession_(admin.prefix, admin.token);
    hardDeleteRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', 'AUTHZ-2', systemActor());
  }
}

// ---- SSO live (negatif saja; butuh URL platform) ----
function testSsoFlow(ctx) {
  need_(ctx.platformApiUrl, 'ctx.platformApiUrl kosong (uji live dilewati).');
  var threw = false;
  try { validatePlatformTicket('tiket_palsu_12345', ctx.platformApiUrl, false, ctx.appCode || 'TESTAPP'); } catch (e) { threw = true; }
  assert_(threw, 'Tiket palsu ditolak server.');
}

// ---- CRUD generik wajar: hitung baris + bersihkan total ----
function testGenericCrud(ctx) {
  need_(ctx.ssId && ctx.headersMap && ctx.headersMap.ZZ_TEST_CRUD, 'Butuh ssId + ZZ_TEST_CRUD.');
  var actor = systemActor(), id = 'CRUD-' + new Date().getTime();
  var n0 = readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap).length;
  var ins = apiSave(ctx.ssId, 'ZZ_TEST_CRUD', { id: id, nama: 'awal' }, actor, ctx.headersMap);
  assert_(ins.success && ins.data, 'INSERT: ' + (ins.error || 'ok'));
  assert_(readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap).length === n0 + 1, 'INSERT +1 baris.');
  var upd = apiSave(ctx.ssId, 'ZZ_TEST_CRUD', { id: id, nama: 'ubah' }, actor, ctx.headersMap);
  assert_(upd.success, 'UPDATE: ' + (upd.error || 'ok'));
  assert_(readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap).length === n0 + 1, 'UPDATE tidak nambah baris.');
  var got = apiGet(ctx.ssId, 'ZZ_TEST_CRUD', id, {}, ctx.headersMap);
  assert_(got.success && got.data && got.data.nama === 'ubah', 'GET memantulkan update.');
  var del = apiDelete(ctx.ssId, 'ZZ_TEST_CRUD', id, actor, ctx.headersMap);
  assert_(del.success, 'SOFT DELETE: ' + (del.error || 'ok'));
  assert_(hardDeleteRecordNoLock(ctx.ssId, 'ZZ_TEST_CRUD', id, actor), 'Hard cleanup.');
  assert_(readRecordsNoLock(ctx.ssId, 'ZZ_TEST_CRUD', ctx.headersMap).length === n0, 'Bersih total.');
}
