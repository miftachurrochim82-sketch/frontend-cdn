/* ============================================================
   app-workflow.js — Workflow Components (Shared CDN v2.9.0)
   RAK H — ALUR KERJA (Ruang Rapat)
   8 FILE & 31 OPSI — Sekali Jalan

   Isi (4 opsi):
   - <app-approval-panel> / <app-stepper> (H1) — Langkah 1-2-3
   - <app-audit-timeline> (H2) — garis waktu siapa/kapan/status
   - <app-theme-picker> (H4) ⭐ Opsi B — pilih tema dinamis + simpan
   - + app-profile & app-settings (H3) — sudah ada di app-modules, re-export

   H4 Theme Picker: 6 preset + custom, simpan ke safeLocal + emit
   ============================================================ */
(function(global){
  'use strict';

  var AppApprovalPanel = {
    name: 'AppApprovalPanel',
    props: {
      steps: { type: Array, default: function(){ return []; } },
      currentStep: { type: Number, default: 0 }
    },
    template: '\
    <div style="display:flex; align-items:center; gap:0">\
      <div v-for="(s,idx) in steps" :key="idx" style="display:flex; align-items:center; flex:1">\
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.4rem">\
          <div :style="{ width:\'2.5rem\', height:\'2.5rem\', borderRadius:\'9999px\', display:\'flex\', alignItems:\'center\', justifyContent:\'center\', fontWeight:700, fontSize:\'0.85rem\', background: idx<currentStep?\'var(--success)\': idx===currentStep?\'var(--primary)\':\'#f1f5f9\', color: idx<=currentStep?\'#ffffff\':\'#64748b\', border: idx>currentStep?\'1px solid #e2e8f0\':\'none\' }">\
            <i v-if="idx<currentStep" class="fa-solid fa-check"></i><span v-else>{{ idx+1 }}</span>\
          </div>\
          <div style="text-align:center">\
            <div :style="{ fontSize:\'0.75rem\', fontWeight:700, color: idx===currentStep?\'var(--primary)\': idx<currentStep?\'var(--success)\':\'#64748b\' }">{{ s.label || s.title || (\'Langkah \'+(idx+1)) }}</div>\
            <div v-if="s.subtitle" style="font-size:0.65rem; color:#94a3b8">{{ s.subtitle }}</div>\
          </div>\
        </div>\
        <div v-if="idx < steps.length-1" :style="{ flex:1, height:\'2px\', margin:\'0 0.5rem\', marginBottom:\'1.6rem\', background: idx<currentStep?\'var(--success)\':\'#e2e8f0\' }"></div>\
      </div>\
    </div>'
  };

  var AppStepper = AppApprovalPanel; // alias

  var AppAuditTimeline = {
    name: 'AppAuditTimeline',
    props: {
      items: { type: Array, default: function(){ return []; } }
    },
    template: '\
    <div style="position:relative; padding-left:1.5rem">\
      <div style="position:absolute; left:0.45rem; top:0; bottom:0; width:2px; background:#e2e8f0"></div>\
      <div v-if="!items.length" style="color:#94a3b8; font-size:0.75rem; text-align:center; padding:1rem">Belum ada riwayat</div>\
      <div v-for="(it,idx) in items" :key="idx" style="position:relative; padding-bottom:1.25rem">\
        <div :style="{ position:\'absolute\', left:\'-1.25rem\', top:\'0.2rem\', width:\'0.8rem\', height:\'0.8rem\', borderRadius:\'9999px\', background: it.status===\'disetujui\'||it.status===\'selesai\'?\'var(--success)\': it.status===\'ditolak\'||it.status===\'batal\'?\'var(--danger)\': it.status===\'diproses\'?\'var(--warning)\':\'var(--primary)\', border:\'2px solid #ffffff\', boxShadow:\'0 0 0 2px #e2e8f0\' }"></div>\
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:0.75rem; padding:0.75rem 1rem">\
          <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem">\
            <div style="font-weight:700; font-size:0.8rem; color:#0f172a">{{ it.title || it.aksi || it.status || \'Aktivitas\' }}</div>\
            <span style="font-size:0.65rem; color:#64748b">{{ it.waktu || it.tanggal || \'\' }}</span>\
          </div>\
          <div v-if="it.deskripsi || it.catatan" style="font-size:0.75rem; color:#475569; margin-top:0.25rem">{{ it.deskripsi || it.catatan }}</div>\
          <div v-if="it.aktor || it.oleh" style="font-size:0.7rem; color:#94a3b8; margin-top:0.35rem"><i class="fa-solid fa-user" style="margin-right:0.25rem"></i>{{ it.aktor || it.oleh }}</div>\
        </div>\
      </div>\
    </div>'
  };

  var AppThemePicker = {
    name: 'AppThemePicker',
    props: {
      modelValue: { type: String, default: '' },
      label: { type: String, default: 'Pilih Tema Warna' }
    },
    emits: ['update:modelValue','change'],
    data: function(){
      var themes = [
        { code:'emerald', label:'Emerald', color:'#059669' },
        { code:'sky', label:'Sky', color:'#0284c7' },
        { code:'amber', label:'Amber', color:'#d97706' },
        { code:'violet', label:'Violet', color:'#7c3aed' },
        { code:'rose', label:'Rose', color:'#e11d48' },
        { code:'teal', label:'Teal', color:'#0d9488' }
      ];
      return { themes: themes, inner: this.modelValue || (window.AppCore && window.AppCore.getTheme && (window.AppCore.getTheme() && window.AppCore.getTheme().label ? (function(){ try{ var t=window.AppCore.getTheme(); for(var k in window.AppCore.themes){ if(window.AppCore.themes[k].primary===t.primary) return k; } return ''; }catch(e){return ''}})() : '')) || '' };
    },
    watch: {
      modelValue: function(v){ this.inner=v; }
    },
    methods: {
      pick: function(code){
        this.inner=code;
        this.$emit('update:modelValue', code);
        this.$emit('change', code);
        if(window.AppCore && window.AppCore.applyTheme){
          window.AppCore.applyTheme(code);
        }
        if(this.$root && this.$root.showToast) this.$root.showToast('Tema diubah ke ' + code, 'success');
      }
    },
    template: '\
    <div>\
      <label v-if="label" class="form-label" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em">{{ label }}</label>\
      <div class="theme-picker-grid">\
        <div v-for="t in themes" :key="t.code" class="theme-swatch" :class="{active: inner===t.code}" @click="pick(t.code)">\
          <div class="theme-swatch-dot" :style="{ background: t.color }"></div>\
          <span class="theme-swatch-label">{{ t.label }}</span>\
        </div>\
      </div>\
      <div class="form-hint" style="margin-top:0.5rem">Pilihan tersimpan otomatis di browser & berlaku untuk semua halaman. Admin juga bisa set <code>THEME_CODE</code> di Script Properties untuk default server.</div>\
    </div>'
  };

  // H3 — re-export profile & settings jika ada (untuk modular workflow)
  var comps = {
    'app-approval-panel': AppApprovalPanel,
    'app-stepper': AppStepper,
    'app-audit-timeline': AppAuditTimeline,
    'app-theme-picker': AppThemePicker,
    version: '2.9.0'
  };

  // merge profile/settings dari AppModules jika sudah load
  if(global.AppModules){
    Object.keys(global.AppModules).forEach(function(k){
      if(k!=='version' && !comps[k]) comps[k]=global.AppModules[k];
    });
  }

  global.AppWorkflow = comps;
  global.AppComponents = global.AppComponents || {};
  Object.keys(comps).forEach(function(k){ if(k!=='version') global.AppComponents[k]=comps[k]; });
  if(global.AppComponents) global.AppComponents.version='2.9.0';

  // juga expose ke AppModules untuk backward compat
  global.AppModules = global.AppModules || {};
  Object.keys(comps).forEach(function(k){ if(k!=='version') global.AppModules[k]=comps[k]; });

})(window);
