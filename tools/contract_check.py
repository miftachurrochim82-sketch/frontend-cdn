#!/usr/bin/env python3
# =====================================================================
# CONTRACT-CHECK (C5) — "daftar periksa sebelum terbang"
# Menjalankan aturan CoreLib-first + kontrak CDN secara otomatis pada
# workspace aplikasi. Jalankan SEBELUM menyalin apa pun ke GAS:
#     python3 frontend-cdn/tools/contract_check.py
# Exit code 0 = semua hijau; 1 = ada FAIL (jangan deploy!).
# =====================================================================
import os, re, sys

HOME = "/home/user"

# --- Kontrak komponen kit (katalog = sumber kebenaran) — v2.9.0 31 OPSI ---
KIT_TAGS = {
    # Shell inti (tetap)
    "app-login", "app-sidebar", "app-header", "app-badge", "app-stat-card",
    "app-modal", "app-crud-table", "app-empty-state", "app-skeleton",
    "app-filter-bar", "app-pegawai-picker",
    "app-profile", "app-settings",
    # Charts (tetap + baru)
    "app-chart-bar", "app-chart-doughnut", "app-chart-line", "app-configurable-dashboard",
    # Layout BARU v2.9.0 (app-layout.js)
    "app-breadcrumb", "app-page-header",
    # UI BARU v2.9.0 (app-ui.js)
    "app-tabs", "app-pagination", "app-alert", "app-confirm",
    # Forms BARU v2.9.0 (app-forms.js)
    "app-debounced-search", "app-date-picker", "app-file-upload", "app-rich-editor",
    "app-filter-bar-enhanced",
    # Data BARU v2.9.0 (app-data.js)
    "app-detail-drawer", "app-export-button", "app-csv-import", "app-master-tree",
    "app-image-viewer", "app-file-preview",
    # Workflow BARU v2.9.0 (app-workflow.js)
    "app-approval-panel", "app-stepper", "app-audit-timeline", "app-theme-picker",
}
# Tag lokal app yang sah (bukan kit, tapi dikenal):
LOCAL_TAGS = {"pagination-controls"}

# --- Kontrak fungsi milik CoreLib (aturan CoreLib-first) — v2.4.0 A+B 18 fungsi ---
CORELIB_OWNED = [
    "normId", "normStr", "parseDate", "genUniqueCode", "requireRole",
    "checkRole", "getHighestRole", "isAllowedConfigKey",
    "todayIsoLocal", "dateKey10", "paginate", "matchSearch",
    "assertOwnership", "checkOwnership", "validateTransition",
    "getThemeConfig", "buildThemeCss", "getThemeCss",
    "periodeBulan", "dalamPeriode", "hitungHariKerja",
    "findUnique", "upsertUnique",
]

APPS = [
    {
        "name": "si-kompetensi",
        "src": os.path.join(HOME, "si-kompetensi", "src"),
        "pin": "2.9.2",
        "waiver": False,
        "markers": [
            ("06_MasterLogic.gs", "CoreLib.ensureSheet"),
            ("01_ConfigAndBridge.gs", "CoreLib.getDb"),
        ],
    },
    {
        "name": "si-platform",
        "src": os.path.join(HOME, "si-platform", "src"),
        "pin": "2.9.2",
        "waiver": False,
        "play_cdn_banned": True,
        "markers": [
            ("J_App.html", "AppComponents"),
            ("A0_Head.html", "app-components.min.js"),
        ],
    },
    {
        "name": "si-arsip-2026",
        "src": os.path.join(HOME, "si-arsip-2026", "src"),
        "pin": "2.9.2",   # bump CDN v2.9.0 (8 file) — 2026-09-22
        "waiver": False,
        "markers": [
            ("J_App.html", "AppCore.create"),
            ("01_ConfigAndBridge.gs", "CoreLib.getEnvProperty"),
        ],
    },
    {
        "name": "si-lahar",
        "src": os.path.join(HOME, "si-lahar", "src"),
        "pin": "2.9.2",   # bump CDN v2.9.0 + CoreLib v2.4.0 — 2026-09-22
        "waiver": False,
        "markers": [
            ("J_App.html", "AppCore.create"),
            ("02_AppLogic.gs", "CoreLib.matchSearch"),
            ("02_AppLogic.gs", "CoreLib.paginate"),
        ],
    },
    {
        "name": "starter-kit",
        "src": os.path.join(HOME, "starter-kit", "src"),
        "pin": "2.9.2",   # v2.12.0 — CDN 8 file + CoreLib 17 — 2026-09-23
        "waiver": False,
        "markers": [
            ("J_App.html", "AppCore.create"),
            ("02_AppLogic.gs", "CoreLib.getDb"),
            ("01_ConfigAndBridge.gs", "CoreLib.getEnvProperty"),
        ],
    },
    {
        "name": "si-dokumen",
        "src": os.path.join(HOME, "si-dokumen", "src"),
        "pin": "2.9.2",   # v1.7.0 bump CDN 8 file + CoreLib 16 — 2026-09-23
        "waiver": False,
        "markers": [
            ("J_App.html", "AppCore.create"),
            ("01_ConfigAndBridge.gs", "CoreLib.getEnvProperty"),
            ("17_RtlApi.gs", "RTL_TRANSISI_LEGAL_"),
        ],
    },
    {
        "name": "si-pelaporan",
        "src": os.path.join(HOME, "si-pelaporan", "src"),
        "pin": "2.7.0",   # alignment ditunda (keputusan user) -> waiver
        "waiver": True,
        "markers": [],
    },
]

fails, warns = [], []

def add_fail(app, msg): fails.append(f"[{app}] {msg}")
def add_warn(app, msg): warns.append(f"[{app}] {msg}")

def files_of(src, exts):
    if not os.path.isdir(src): return []
    out = []
    for root, _, fs in os.walk(src):
        for f in fs:
            if f.endswith(exts): out.append(os.path.join(root, f))
    return sorted(out)

def check_app(app):
    name, src = app["name"], app["src"]
    if not os.path.isdir(src):
        add_warn(name, f"folder src tidak ditemukan ({src}) — dilewati")
        return
    htmls = files_of(src, (".html",))
    gss   = files_of(src, (".gs",))
    print(f"\n=== {name} ({len(htmls)} html, {len(gss)} gs) ===")

    # 1) Pin versi CDN
    pins = set()
    for f in htmls:
        s = open(f, encoding="utf8", errors="ignore").read()
        pins |= set(re.findall(r"frontend-cdn@v([\d.]+)", s))
    if not pins:
        add_warn(name, "tidak menemukan pin frontend-cdn@vX.Y.Z di HTML mana pun")
    for p in sorted(pins):
        if p != app["pin"]:
            (add_warn if app["waiver"] else add_fail)(
                name, f"pin CDN v{p} != kontrak v{app['pin']}"
                + (" (WAIVER — penundaan terdokumentasi)" if app["waiver"] else ""))
        else:
            print(f"  pin CDN v{p} ✅")
    if len(pins) > 1:
        add_fail(name, f"pin CDN campur aduk dalam satu app: {sorted(pins)}")

    # 2) Self-closing custom tag (keluarga bug mematikan in-DOM)
    for f in htmls:
        s = open(f, encoding="utf8", errors="ignore").read()
        for m in re.finditer(r"<((?:app-[a-z-]+|pagination-controls))[^>]*/>", s):
            add_fail(name, f"{os.path.basename(f)}: SELF-CLOSING <{m.group(1)} .../> — wajib tag penutup eksplisit")

    # 3) Tag kit tak dikenal (kontrak katalog komponen)
    for f in htmls:
        s = open(f, encoding="utf8", errors="ignore").read()
        used = set(re.findall(r"<(app-[a-z-]+)(?=[\s>/])", s))
        unknown = used - KIT_TAGS
        if unknown:
            add_fail(name, f"{os.path.basename(f)}: tag kit tak dikenal {sorted(unknown)}")

    # 4) Play CDN Tailwind harus pensiun (FAIL hanya untuk app yang sudah Track D)
    for f in htmls:
        s = open(f, encoding="utf8", errors="ignore").read()
        if "cdn.tailwindcss.com" in s:
            if app.get("play_cdn_banned"):
                add_fail(name, f"{os.path.basename(f)}: masih memuat Tailwind Play CDN")
            else:
                add_warn(name, f"{os.path.basename(f)}: masih memuat Tailwind Play CDN (alignment belum dijadwalkan)")

    # 5) CoreLib-first: definisi lokal fungsi milik CoreLib wajib delegasi
    for f in gss:
        s = open(f, encoding="utf8", errors="ignore").read()
        for fn in CORELIB_OWNED:
            if re.search(r"function\s+" + fn + r"\s*\(", s):
                if "CoreLib." not in s:
                    add_fail(name, f"{os.path.basename(f)}: mendefinisikan {fn}() TANPA delegasi CoreLib (duplikasi mekanik)")

    # 6) Marker wajib (bukti adopsi C1/C2/kit masih terpasang)
    for fname, needle in app["markers"]:
        path = os.path.join(src, fname)
        if not os.path.exists(path):
            add_fail(name, f"marker: file {fname} tidak ditemukan")
        elif needle not in open(path, encoding="utf8", errors="ignore").read():
            add_fail(name, f"marker: '{needle}' hilang dari {fname}")

    # 7) Kontaminasi Cloudflare
    for f in htmls + gss:
        s = open(f, encoding="utf8", errors="ignore").read()
        if "__CF$cv" in s or "cf-chl" in s:
            add_fail(name, f"{os.path.basename(f)}: TERKONTAMINASI challenge Cloudflare")

    print("  pemeriksaan selesai")

def main():
    print("CONTRACT-CHECK (C5) — CoreLib-first + kontrak CDN")
    for app in APPS:
        check_app(app)
    print("\n" + "=" * 56)
    if warns:
        print(f"⚠️  WARN ({len(warns)}):")
        for w in warns: print("   ", w)
    if fails:
        print(f"❌ FAIL ({len(fails)}):")
        for x in fails: print("   ", x)
        print("\nPUTUSAN: JANGAN DEPLOY — perbaiki dulu.")
        sys.exit(1)
    print("✅ PUTUSAN: SEMUA KONTRAK TERPENUHI — aman untuk disalin ke GAS.")
    sys.exit(0)

if __name__ == "__main__":
    main()
