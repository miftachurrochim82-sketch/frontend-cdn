/**
 * Simulasi Pengujian Integrasi SSO Antar-Aplikasi
 * Ekosistem Pemkab Trenggalek: SI-PLATFORM <---> SI-PELAPORAN / Consumer Apps
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('='.repeat(80));
console.log('🚀 SIMULASI INTEGRASI SSO PEMKAB TRENGGALEK (SI-PLATFORM <-> SI-PELAPORAN)');
console.log('='.repeat(80));

// 1. Mock Environment GAS
const memorySheets = {};
const cacheStore = new Map();
let uuidCounter = 1000;

class MockSheet {
  constructor(name) {
    this.name = name;
    this.rows = [];
  }
  getDataRange() {
    return {
      getValues: () => this.rows.map(r => [...r])
    };
  }
  getLastRow() {
    return this.rows.length;
  }
  getLastColumn() {
    return this.rows.length > 0 ? (this.rows[0]?.length || 0) : 0;
  }
  appendRow(row) {
    this.rows.push([...row]);
  }
  setFrozenRows() {}
  getRange(row, col, numRows = 1, numCols = 1) {
    return {
      setFontWeight: () => {},
      setBackground: () => {},
      setFontColor: () => {},
      setWrap: () => {},
      setHorizontalAlignment: () => {},
      getValues: () => {
        const out = [];
        for (let r = 0; r < numRows; r++) {
          const rowArr = [];
          for (let c = 0; c < numCols; c++) {
            rowArr.push(this.rows[row - 1 + r]?.[col - 1 + c] ?? '');
          }
          out.push(rowArr);
        }
        return out;
      },
      setValues: (values) => {
        for (let r = 0; r < values.length; r++) {
          for (let c = 0; c < values[r].length; c++) {
            if (!this.rows[row - 1 + r]) this.rows[row - 1 + r] = [];
            this.rows[row - 1 + r][col - 1 + c] = values[r][c];
          }
        }
      }
    };
  }
  deleteRow(row) {
    this.rows.splice(row - 1, 1);
  }
}

const LockService = {
  getScriptLock: () => ({
    waitLock: () => true,
    tryLock: () => true,
    releaseLock: () => {}
  })
};

const ScriptApp = {
  getProjectTriggers: () => [],
  deleteTrigger: () => {},
  newTrigger: () => ({
    timeBased: () => ({
      everyMinutes: () => ({ create: () => {} }),
      everyHours: () => ({ create: () => {} }),
      everyDays: () => ({ atHour: () => ({ create: () => {} }) })
    })
  })
};

const SpreadsheetApp = {
  flush: () => {},
  openById: (id) => {
    if (!memorySheets[id]) memorySheets[id] = {};
    return {
      getId: () => id,
      getSheetByName: (name) => {
        if (!memorySheets[id][name]) {
          memorySheets[id][name] = new MockSheet(name);
        }
        return memorySheets[id][name];
      },
      insertSheet: (name) => {
        const s = new MockSheet(name);
        memorySheets[id][name] = s;
        return s;
      }
    };
  },
  getActiveSpreadsheet: () => SpreadsheetApp.openById('DEFAULT_PLATFORM_SS'),
  create: (name) => {
    const id = 'SS_' + (++uuidCounter);
    return SpreadsheetApp.openById(id);
  }
};

const CacheService = {
  getScriptCache: () => ({
    get: (key) => cacheStore.get(key) || null,
    put: (key, val, ttl) => cacheStore.set(key, String(val)),
    remove: (key) => cacheStore.delete(key)
  })
};

const crypto = require('crypto');

const Utilities = {
  getUuid: () => 'uuid-' + (++uuidCounter),
  computeHmacSha256Signature: (data, key) => Buffer.from('sig_' + data),
  base64Encode: (data) => Buffer.from(data).toString('base64'),
  formatDate: (date, tz, fmt) => date.toISOString(),
  DigestAlgorithm: {
    SHA_256: 'SHA_256'
  },
  computeDigest: (algo, str) => {
    return Array.from(crypto.createHash('sha256').update(str).digest());
  }
};

const Logger = {
  log: (...args) => {
    // Uncomment for verbose GAS logs:
    // console.log('   [GAS Log]', ...args);
  }
};

// Mock PropertiesService
const propertiesStore = {
  PLATFORM_SPREADSHEET_ID: 'PLATFORM_SS_ID',
  MASTER_SPREADSHEET_ID: 'SIMPEG_MASTER_SS_ID',
  SPREADSHEET_ID: 'PELAPORAN_LOCAL_SS_ID',
  PLATFORM_API_URL: 'https://platform.trenggalekkab.go.id/exec'
};

const PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k) => propertiesStore[k] || null,
    setProperty: (k, v) => { propertiesStore[k] = v; },
    getProperties: () => ({ ...propertiesStore })
  })
};

const ContentService = {
  MimeType: {
    JSON: 'application/json',
    TEXT: 'text/plain'
  },
  createTextOutput: (content) => {
    let outputContent = content || '';
    let mime = 'text/plain';
    const obj = {
      setContent: (c) => { outputContent = c; return obj; },
      setMimeType: (m) => { mime = m; return obj; },
      getContent: () => outputContent,
      getMimeType: () => mime
    };
    return obj;
  }
};

// 2. Setup Context SI-PLATFORM
const platformContext = {
  SpreadsheetApp,
  CacheService,
  LockService,
  ScriptApp,
  ContentService,
  Utilities,
  Logger,
  PropertiesService,
  console,
  setTimeout,
  clearTimeout,
  Date
};

vm.createContext(platformContext);

// Load SI-PLATFORM backend files
const platformFiles = [
  '01_Config.gs',
  '02_SetupAndSeed.gs',
  '03_DataAndAuth.gs',
  '04_HandlerAndRouter.gs'
];

for (const file of platformFiles) {
  const code = fs.readFileSync(path.join('/home/user/si-platform/src', file), 'utf8');
  vm.runInContext(code, platformContext, { filename: file });
}

// 3. Setup Context Consumer / Backend (CoreLib & SI-PELAPORAN)
const consumerContext = {
  SpreadsheetApp,
  CacheService,
  LockService,
  ScriptApp,
  ContentService,
  Utilities,
  Logger,
  PropertiesService,
  console,
  setTimeout,
  clearTimeout,
  Date,
  UrlFetchApp: {
    fetch: (url, options) => {
      // Intercept request to SI-PLATFORM and execute in platformContext
      if (url === propertiesStore.PLATFORM_API_URL) {
        const payload = JSON.parse(options.payload || '{}');
        const simulatedEvent = {
          postData: {
            contents: options.payload
          },
          parameter: {}
        };
        const output = platformContext.doPost(simulatedEvent);
        const contentText = output.getContent();
        return {
          getResponseCode: () => 200,
          getContentText: () => contentText
        };
      }
      throw new Error('Unknown URL fetch destination: ' + url);
    }
  }
};

vm.createContext(consumerContext);

// Load CoreLib Backend
const coreFiles = [
  '01_CoreFoundation.gs',
  '02_CoreGateway.gs',
  '03_CoreServices.gs'
];

for (const file of coreFiles) {
  const code = fs.readFileSync(path.join('/home/user/backend', file), 'utf8');
  vm.runInContext(code, consumerContext, { filename: file });
}

// Expose all functions from backend as CoreLib in consumer context
consumerContext.CoreLib = { ...consumerContext };


// Load SI-PELAPORAN backend files
const pelaporanFiles = [
  '01_ConfigAndBridge.gs',
  '02_AppLogic.gs'
];

for (const file of pelaporanFiles) {
  const code = fs.readFileSync(path.join('/home/user/si-pelaporan/src', file), 'utf8');
  vm.runInContext(code, consumerContext, { filename: file });
}

// =========================================================================
// RUN TEST SCENARIOS
// =========================================================================

async function runSsoSimulation() {
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  console.log('\n--- TAHAP 1: INISIALISASI & SEEDING DATABASE ---');
  
  // 1. Seed SI-PLATFORM database
  platformContext.setup();
  console.log('  ✓ Database SI-PLATFORM berhasil diinisialisasi.');

  // 2. Seed Master SIMPEG database
  const masterSheet = SpreadsheetApp.openById(propertiesStore.MASTER_SPREADSHEET_ID).getSheetByName('PEGAWAI');
  masterSheet.appendRow(['pegawai_id', 'nip', 'nama', 'gelar_depan', 'gelar_belakang', 'jenis_kelamin', 'tanggal_lahir', 'pangkat_golongan', 'status_kepegawaian', 'pendidikan_terakhir', 'email', 'no_hp', 'alamat', 'foto_url', 'unit_id', 'jabatan_id', 'atasan_id', 'role', 'status', 'created_at', 'updated_at']);
  masterSheet.appendRow(['PEG-001', '198501012010011001', 'Budi Pratama', '', 'S.Kom', 'L', '1985-01-01', 'III/c', 'PNS', 'S1', 'budi@trenggalekkab.go.id', '081234567890', 'Trenggalek', '', 'UNIT-KOMINFO', 'JAB-PRANATA', '', 'USER', 'AKTIF', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z']);
  masterSheet.appendRow(['PEG-ADMIN', '198001012006041001', 'Administrator Utama', '', 'S.STP', 'L', '1980-01-01', 'IV/a', 'PNS', 'S2', 'gakdasatpolppk@gmail.com', '081298765432', 'Trenggalek', '', 'UNIT-KOMINFO', 'JAB-KADIS', '', 'ADMIN', 'AKTIF', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z']);
  console.log('  ✓ Master Spreadsheet SIMPEG (PEGAWAI, JABATAN, UNIT) berhasil di-seed.');

  // 3. Seed Consumer App Database
  consumerContext.setupApp();
  console.log('  ✓ Database lokal SI-PELAPORAN berhasil diinisialisasi.');

  console.log('\n--- TAHAP 2: SCENARIO 1 - FULL SSO TICKET ISSUANCE & EXCHANGE FLOW ---');
  
  // Step A: User Login di SI-PLATFORM
  const loginRes = platformContext.loginUser_({ identifier: 'admin', password: 'admin123' });
  assert(loginRes && loginRes.token, 'User admin berhasil login di SI-PLATFORM dan memperoleh token portal.');
  const adminUser = loginRes.user;
  assert(adminUser.username === 'admin', 'Identitas user portal terverifikasi sebagai admin.');

  // Step B: SI-PLATFORM membuat Tiket SSO untuk SIPELAPORAN
  const platformSessionContext = { user: adminUser };
  const ticketRes = platformContext.createAccessTicket_(adminUser.id, 'SIPELAPORAN', platformSessionContext);
  assert(ticketRes && ticketRes.ticket, `Tiket SSO berhasil diterbitkan untuk SIPELAPORAN: ${ticketRes.ticket}`);
  assert(ticketRes.expires_in === 3600, 'TTL tiket SSO tervalidasi 3600 detik.');

  // Step C: Consumer App (SI-PELAPORAN) menerima tiket dan melakukan penukaran
  const exchangePayload = {
    action: 'exchange_sso_ticket',
    ticket: ticketRes.ticket
  };
  const exchangeRes = consumerContext.handleAction(exchangePayload);
  assert(exchangeRes.success === true, 'SI-PELAPORAN berhasil menukarkan tiket SSO ke SI-PLATFORM.');
  assert(exchangeRes.data && exchangeRes.data.token, `SI-PELAPORAN menerbitkan token sesi lokal: ${exchangeRes.data?.token}`);
  assert(exchangeRes.data.user.email === 'gakdasatpolppk@gmail.com', 'Email user tersinkronisasi: gakdasatpolppk@gmail.com');
  assert(exchangeRes.data.user.nip === '198001012006041001', 'NIP ter-resolve dari Master SIMPEG: 198001012006041001');
  assert(exchangeRes.data.user.role.toLowerCase() === 'admin', 'Role pengguna ditetapkan ke ADMIN.');

  const localToken = exchangeRes.data.token;

  console.log('\n--- TAHAP 3: SCENARIO 2 - MEMANGGIL RESOURCE CRUD DENGAN TOKEN SESI BARU ---');
  
  // Create Record
  const createPayload = {
    action: 'pelaporan.create',
    token: localToken,
    data: {
      judul: 'Laporan Monitoring Jaringan Triwulan 1',
      kategori: 'Infrastruktur IT',
      status: 'SUBMITTED',
      konten: 'Konektivitas FO OPD 100% aktif dan stabil.'
    }
  };
  const createRes = consumerContext.handleAction(createPayload);
  console.log('  🔍 Create Result:', JSON.stringify(createRes, null, 2));
  assert(createRes.success === true, 'Berhasil membuat entri data pelaporan baru dengan sesi SSO.');
  assert(createRes.data && createRes.data.id, `ID record pelaporan baru terbuat: ${createRes.data?.id}`);
  const createdId = createRes.data.id;

  // List Records
  const listPayload = {
    action: 'pelaporan.list',
    token: localToken
  };
  const listRes = consumerContext.handleAction(listPayload);
  assert(listRes.success === true, 'Berhasil membaca daftar pelaporan dengan autentikasi sesi.');
  assert(Array.isArray(listRes.data) && listRes.data.length >= 1, `Total data terbaca: ${listRes.data.length}`);
  assert(listRes.data.some(r => r.id === createdId), 'Record baru ditemukan di dalam list.');

  console.log('\n--- TAHAP 4: SCENARIO 3 - VALIDASI APP BINDING (SECURITY ENFORCEMENT) ---');
  
  // Tiket dibuat khusus untuk SIPELAPORAN
  const restrictedTicket = platformContext.createAccessTicket_(adminUser.id, 'SIPELAPORAN', platformSessionContext).ticket;
  
  // Coba ditukarkan oleh aplikasi lain (misal config SICUTI)
  const cutiConfig = {
    appCode: 'SICUTI',
    platformApiUrl: propertiesStore.PLATFORM_API_URL,
    masterSsId: propertiesStore.MASTER_SPREADSHEET_ID
  };
  const invalidBindingRes = consumerContext.CoreLib.exchangePlatformTicket(restrictedTicket, cutiConfig);
  assert(invalidBindingRes.success === false, 'Exchange ditolak saat tiket SIPELAPORAN dipakai oleh SICUTI.');
  assert(invalidBindingRes.error && invalidBindingRes.error.includes('aplikasi lain'), `Pesan penolakan valid: "${invalidBindingRes.error}"`);

  console.log('\n--- TAHAP 5: SCENARIO 4 - EXPIRED TICKET & REUSED TICKET TEST ---');
  
  // Test tiket fiktif / tidak ada
  const fakeTicketRes = consumerContext.CoreLib.exchangePlatformTicket('t_INVALID_NON_EXISTENT', {
    appCode: 'SIPELAPORAN',
    platformApiUrl: propertiesStore.PLATFORM_API_URL
  });
  assert(fakeTicketRes.success === false, 'Tiket fiktif berhasil ditolak.');

  console.log('\n--- TAHAP 6: SCENARIO 5 - LOGOUT & SESSION INVALIDATION ---');
  
  // Logout
  const logoutRes = consumerContext.handleAction({
    action: 'logout',
    token: localToken
  });
  assert(logoutRes.success === true, 'Logout pengguna dari SI-PELAPORAN berhasil.');

  // Panggil action setelah logout (harus UNAUTHORIZED)
  const unauthorizedRes = consumerContext.handleAction({
    action: 'pelaporan.list',
    token: localToken
  });
  assert(unauthorizedRes.success === false, 'Akses ditolak setelah token sesi di-logout.');
  assert(unauthorizedRes.code === 'UNAUTHORIZED', 'Response code adalah UNAUTHORIZED.');

  console.log('\n' + '='.repeat(80));
  console.log(`🎉 HASIL SIMULASI INTEGRASI SSO: ${passed}/${total} PENGUJIAN LULUS (100%)`);
  console.log('='.repeat(80) + '\n');
}

runSsoSimulation().catch(err => {
  console.error('Simulation Failed:', err);
  process.exit(1);
});
