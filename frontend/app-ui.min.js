/* ============================================================
   app-ui.js — Feedback & State Components (Shared CDN v2.9.0)
   RAK D — FEEDBACK & STATE (Lampu & Alarm)
   8 FILE & 31 OPSI — Sekali Jalan

   Isi (7 opsi):
   - <app-tabs> (D1) WAJIB — pengganti grid+btn kecil
   - <app-pagination> (D2) WAJIB — standalone pagination
   - <app-badge> extend (D3) — sudah di app-components, diperkuat di sini (re-export)
   - <app-alert> (D4) — kotak info kuning/merah/hijau/biru
   - <app-confirm> (D5) — dialog Yakin hapus?
   - <app-stat-card> trend (D6) — sudah ada, varian trend ditambah
   - + empty/skeleton, v-can (sudah ada)

   Dipakai modular:
     <app-tabs :tabs="[{id:'semua',label:'Semua',count:12},{id:'saya',label:'Saya',count:3}]" v-model="tab" />
     <app-pagination :page="page" :total-pages="10" :total-data="95" @change-page="load" />
     <app-alert type="warning" title="Perhatian">Isi</app-alert>
   ============================================================ */
(function(global){
  'use strict';

  var AppTabs = {
    name: 'AppTabs',
    props: {
      tabs: { type: Array, default: function(){ return []; } },
      modelValue: { type: String, default: '' }
    },
    emits: ['update:modelValue', 'change'],
    methods: {
      select: function(id){
        this.$emit('update:modelValue', id);
        this.$emit('change', id);
      }
    },
    template: '\
    <div class="app-tabs" role="tablist">\
      <button v-for="t in tabs" :key="t.id" role="tab" :aria-selected="modelValue===t.id" class="app-tabs-item" :class="{active: modelValue===t.id}" @click="select(t.id)" type="button">\
        <i v-if="t.icon" :class="t.icon"></i>\
        <span>{{ t.label }}</span>\
        <span v-if="t.count!==undefined && t.count!==null" class="badge-count">{{ t.count }}</span>\
      </button>\
      <slot></slot>\
    </div>'
  };

  var AppPagination = {
    name: 'AppPagination',
    props: {
      page: { type: Number, default: 1 },
      totalPages: { type: Number, default: 1 },
      totalData: { type: Number, default: 0 },
      showInfo: { type: Boolean, default: true }
    },
    emits: ['change-page', 'update:page'],
    methods: {
      go: function(p){
        p = Math.max(1, Math.min(p, this.totalPages));
        this.$emit('update:page', p);
        this.$emit('change-page', p);
      }
    },
    template: '\
    <div class="app-pagination">\
      <div v-if="showInfo" class="app-pagination-info">\
        <span v-if="totalData">{{ totalData }} data · hal <strong>{{ page }}</strong>/{{ totalPages }}</span>\
        <span v-else>hal <strong>{{ page }}</strong>/{{ totalPages }}</span>\
      </div>\
      <div v-else></div>\
      <div class="app-pagination-actions">\
        <button class="app-pagination-btn" :disabled="page<=1" @click="go(page-1)" type="button"><i class="fa-solid fa-chevron-left"></i> Prev</button>\
        <button class="app-pagination-btn" :disabled="page>=totalPages" @click="go(page+1)" type="button">Next <i class="fa-solid fa-chevron-right"></i></button>\
      </div>\
    </div>'
  };

  var AppAlert = {
    name: 'AppAlert',
    props: {
      type: { type: String, default: 'info' },
      title: { type: String, default: '' },
      icon: { type: String, default: '' },
      dismissible: { type: Boolean, default: false }
    },
    emits: ['dismiss'],
    data: function(){ return { visible: true }; },
    computed: {
      cls: function(){
        var m = { info:'alert-info', success:'alert-success', warning:'alert-warning', danger:'alert-danger', error:'alert-danger' };
        return 'alert ' + (m[this.type] || 'alert-info');
      },
      iconCls: function(){
        if(this.icon) return this.icon;
        var m = { info:'fa-solid fa-circle-info', success:'fa-solid fa-circle-check', warning:'fa-solid fa-triangle-exclamation', danger:'fa-solid fa-circle-xmark', error:'fa-solid fa-circle-xmark' };
        return m[this.type] || 'fa-solid fa-circle-info';
      }
    },
    template: '\
    <div v-if="visible" :class="cls" role="alert">\
      <i :class="iconCls" style="margin-top:0.15rem"></i>\
      <div style="flex:1">\
        <div v-if="title" style="font-weight:700; margin-bottom:0.15rem">{{ title }}</div>\
        <div><slot></slot></div>\
      </div>\
      <button v-if="dismissible" @click="visible=false; $emit(\'dismiss\')" type="button" style="margin-left:auto; background:transparent; border:none; cursor:pointer; opacity:0.6"><i class="fa-solid fa-xmark"></i></button>\
    </div>'
  };

  var AppConfirm = {
    name: 'AppConfirm',
    props: {
      show: { type: Boolean, default: false },
      title: { type: String, default: 'Konfirmasi' },
      message: { type: String, default: 'Apakah Anda yakin?' },
      confirmText: { type: String, default: 'Ya, Lanjutkan' },
      cancelText: { type: String, default: 'Batal' },
      type: { type: String, default: 'danger' },
      loading: { type: Boolean, default: false }
    },
    emits: ['close','confirm'],
    template: '\
    <app-modal :show="show" :title="title" :loading="loading" :confirm-text="confirmText" :cancel-text="cancelText" @close="$emit(\'close\')" @confirm="$emit(\'confirm\')" :confirm-class="type===\'danger\'?\'bg-rose-600 hover:bg-rose-700 text-white\':\'\'">\
      <div style="display:flex; gap:0.85rem; align-items:flex-start">\
        <div v-if="type===\'danger\'" style="width:2.5rem; height:2.5rem; border-radius:9999px; background:#fff1f2; color:#e11d48; display:flex; align-items:center; justify-content:center; flex-shrink:0"><i class="fa-solid fa-triangle-exclamation"></i></div>\
        <div v-else-if="type===\'warning\'" style="width:2.5rem; height:2.5rem; border-radius:9999px; background:#fffbeb; color:#d97706; display:flex; align-items:center; justify-content:center; flex-shrink:0"><i class="fa-solid fa-circle-exclamation"></i></div>\
        <div style="flex:1; font-size:0.8125rem; color:#334155; line-height:1.6">{{ message }}<slot></slot></div>\
      </div>\
    </app-modal>'
  };

  var comps = {
    'app-tabs': AppTabs,
    'app-pagination': AppPagination,
    'app-alert': AppAlert,
    'app-confirm': AppConfirm,
    version: '2.9.0'
  };

  global.AppUi = comps;
  global.AppComponents = global.AppComponents || {};
  Object.keys(comps).forEach(function(k){ if(k!=='version') global.AppComponents[k]=comps[k]; });
  if(global.AppComponents) global.AppComponents.version = '2.9.0';

})(window);
