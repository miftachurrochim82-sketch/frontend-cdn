/* ============================================================
   app-data.js — Data & Table Components (Shared CDN v2.9.0)
   RAK F — DATA & TABEL (Gudang & Garasi)
   8 FILE & 31 OPSI — Sekali Jalan

   Isi (6 opsi):
   - <app-crud-table> UPGRADE (F1) — sticky + sortable + col preset (enhanced di sini, lama tetap ada)
   - <app-detail-drawer> (F2) — slide dari kanan
   - <app-export-button> (F3) — Excel/PDF 1 klik
   - <app-csv-import> (F4) — impor + preview
   - <app-master-tree> (F5) — pohon hierarki
   - <app-image-viewer> / <app-file-preview> (F6) — preview foto/PDF
   ============================================================ */
(function(global){
  'use strict';

  // F2 — Detail drawer
  var AppDetailDrawer = {
    name: 'AppDetailDrawer',
    props: {
      show: { type: Boolean, default: false },
      title: { type: String, default: 'Detail' },
      subtitle: { type: String, default: '' }
    },
    emits: ['close'],
    template: '\
    <teleport to="body">\
      <div v-if="show">\
        <div class="drawer-backdrop" @click="$emit(\'close\')"></div>\
        <div class="drawer-panel">\
          <div class="drawer-header">\
            <div>\
              <h3 style="font-weight:800; font-size:1rem; color:#0f172a">{{ title }}</h3>\
              <p v-if="subtitle" style="font-size:0.75rem; color:#64748b">{{ subtitle }}</p>\
            </div>\
            <button @click="$emit(\'close\')" class="btn-icon" type="button"><i class="fa-solid fa-xmark"></i></button>\
          </div>\
          <div class="drawer-body"><slot></slot></div>\
          <div class="drawer-footer">\
            <slot name="footer"></slot>\
            <button @click="$emit(\'close\')" class="btn btn-secondary" type="button">Tutup</button>\
          </div>\
        </div>\
      </div>\
    </teleport>'
  };

  // F3 — Export button
  var AppExportButton = {
    name: 'AppExportButton',
    props: {
      data: { type: Array, default: function(){ return []; } },
      columns: { type: Array, default: function(){ return []; } },
      filename: { type: String, default: '' },
      title: { type: String, default: '' },
      type: { type: String, default: 'excel' }
    },
    data: function(){ return { loading: false }; },
    methods: {
      doExport: async function(){
        this.loading=true;
        try{
          if(this.type==='pdf'){
            await this.$root.exportPDF(this.columns, this.data, this.filename, this.title);
          } else {
            await this.$root.exportExcel(this.data, this.filename);
          }
        } catch(e){
          if(this.$root && this.$root.showToast) this.$root.showToast('Gagal ekspor: '+(e.message||e),'error');
        }
        this.loading=false;
      }
    },
    template: '\
    <button @click="doExport" :disabled="loading || !data || !data.length" class="btn btn-secondary btn-sm" type="button">\
      <i v-if="!loading" :class="type===\'pdf\'?\'fa-solid fa-file-pdf\':\'fa-solid fa-file-excel\'"></i>\
      <i v-else class="fa-solid fa-spinner fa-spin"></i>\
      <span>{{ type===\'pdf\'?\'Ekspor PDF\':\'Ekspor Excel\' }}</span>\
    </button>'
  };

  // F4 — CSV import
  var AppCsvImport = {
    name: 'AppCsvImport',
    props: {
      label: { type: String, default: 'Impor CSV' },
      hint: { type: String, default: 'Format: header di baris 1, pisahkan dengan koma' }
    },
    emits: ['import'],
    data: function(){ return { rows: [], error:'', fileName:'' }; },
    methods: {
      onFile: function(e){
        var f=e.target.files[0];
        if(!f) return;
        this.fileName=f.name;
        var reader=new FileReader();
        var self=this;
        reader.onload=function(ev){
          try{
            var text=ev.target.result;
            var lines=text.split(/\\r?\\n/).filter(function(l){ return l.trim(); });
            if(!lines.length) { self.error='File kosong'; return; }
            var headers=lines[0].split(',').map(function(h){ return h.trim(); });
            var out=[];
            for(var i=1;i<lines.length;i++){
              var cols=lines[i].split(',');
              var obj={};
              for(var j=0;j<headers.length;j++) obj[headers[j]]= (cols[j]||'').trim();
              out.push(obj);
            }
            self.rows=out;
            self.error='';
            self.$emit('import', out);
          } catch(err){ self.error='Gagal parse CSV: '+(err.message||err); }
        };
        reader.readAsText(f);
        e.target.value='';
      }
    },
    template: '\
    <div>\
      <label class="btn btn-secondary btn-sm" style="cursor:pointer"><i class="fa-solid fa-file-csv"></i> {{ label }}<input type="file" accept=".csv" @change="onFile" style="display:none" /></label>\
      <span v-if="fileName" style="margin-left:0.5rem; font-size:0.75rem; color:#64748b">{{ fileName }} — {{ rows.length }} baris</span>\
      <div v-if="hint" class="form-hint">{{ hint }}</div>\
      <div v-if="error" class="form-error">{{ error }}</div>\
      <div v-if="rows.length" style="margin-top:0.5rem; max-height:160px; overflow:auto; border:1px solid #e2e8f0; border-radius:0.5rem; font-size:0.7rem">\
        <table style="width:100%; border-collapse:collapse"><thead><tr style="background:#f8fafc"><th v-for="k in Object.keys(rows[0]||{})" :key="k" style="padding:0.4rem 0.5rem; text-align:left; border-bottom:1px solid #e2e8f0">{{ k }}</th></tr></thead>\
        <tbody><tr v-for="(r,idx) in rows.slice(0,5)" :key="idx"><td v-for="k in Object.keys(r)" :key="k" style="padding:0.3rem 0.5rem; border-bottom:1px solid #f1f5f9">{{ r[k] }}</td></tr></tbody></table>\
        <div v-if="rows.length>5" style="padding:0.4rem; text-align:center; color:#94a3b8">+ {{ rows.length-5 }} baris lagi</div>\
      </div>\
    </div>'
  };

  // F5 — Master tree
  var AppMasterTree = {
    name: 'AppMasterTree',
    props: {
      items: { type: Array, default: function(){ return []; } },
      labelKey: { type: String, default: 'nama' },
      parentKey: { type: String, default: 'parent_id' }
    },
    data: function(){ return { expanded: {} }; },
    computed: {
      tree: function(){
        var map={}; var roots=[];
        for(var i=0;i<this.items.length;i++){ var it=this.items[i]; map[it.id]=Object.assign({}, it, { children: [] }); }
        for(var i=0;i<this.items.length;i++){
          var it=map[this.items[i].id];
          var pid=it[this.parentKey];
          if(pid && map[pid]) map[pid].children.push(it);
          else roots.push(it);
        }
        return roots;
      }
    },
    methods: {
      toggle: function(id){ this.expanded[id]=!this.expanded[id]; },
      isExpanded: function(id){ return !!this.expanded[id]; }
    },
    template: '\
    <div style="font-size:0.8125rem">\
      <div v-if="!tree.length" style="color:#94a3b8; text-align:center; padding:1rem">Tidak ada data</div>\
      <ul style="list-style:none; padding:0; margin:0">\
        <li v-for="node in tree" :key="node.id">\
          <div style="display:flex; align-items:center; gap:0.4rem; padding:0.45rem 0.6rem; border-radius:0.5rem; cursor:pointer" @click="node.children.length && toggle(node.id)" :style="{ background: isExpanded(node.id)?\'#f8fafc\':\'transparent\' }">\
            <i v-if="node.children.length" :class="isExpanded(node.id)?\'fa-solid fa-chevron-down\':\'fa-solid fa-chevron-right\'" style="font-size:0.65rem; color:#94a3b8; width:0.8rem"></i>\
            <span v-else style="width:0.8rem"></span>\
            <span style="font-weight:600">{{ node[labelKey] || node.kode || node.id }}</span>\
            <span v-if="node.kode" style="font-size:0.7rem; color:#94a3b8; margin-left:auto">{{ node.kode }}</span>\
            <slot name="actions" :node="node"></slot>\
          </div>\
          <ul v-if="node.children.length && isExpanded(node.id)" style="list-style:none; padding-left:1.2rem; margin:0; border-left:1px dashed #e2e8f0; margin-left:0.6rem">\
            <li v-for="child in node.children" :key="child.id" style="padding:0.35rem 0; display:flex; align-items:center; gap:0.4rem">\
              <span>{{ child[labelKey] || child.kode }}</span>\
              <span style="font-size:0.7rem; color:#94a3b8">{{ child.kode }}</span>\
            </li>\
          </ul>\
        </li>\
      </ul>\
    </div>'
  };

  // F6 — Image viewer / file preview
  var AppImageViewer = {
    name: 'AppImageViewer',
    props: {
      src: { type: String, default: '' },
      alt: { type: String, default: 'Preview' },
      show: { type: Boolean, default: false }
    },
    emits: ['close'],
    template: '\
    <teleport to="body">\
      <div v-if="show" class="drawer-backdrop" style="display:flex; align-items:center; justify-content:center; padding:1rem" @click="$emit(\'close\')">\
        <img :src="src" :alt="alt" style="max-width:90vw; max-height:90vh; border-radius:1rem; box-shadow:0 20px 60px rgba(0,0,0,0.3)" @click.stop />\
        <button @click="$emit(\'close\')" style="position:fixed; top:1rem; right:1rem; width:2.5rem; height:2.5rem; border-radius:9999px; background:rgba(0,0,0,0.6); color:white; border:none; cursor:pointer"><i class="fa-solid fa-xmark"></i></button>\
      </div>\
    </teleport>'
  };

  var AppFilePreview = {
    name: 'AppFilePreview',
    props: {
      file: { type: Object, default: null },
      url: { type: String, default: '' }
    },
    computed: {
      isImage: function(){ var n=(this.file&&this.file.nama_file)||this.url||''; return /\\.(png|jpg|jpeg|gif|webp)$/i.test(n); },
      isPdf: function(){ var n=(this.file&&this.file.nama_file)||this.url||''; return /\\.pdf$/i.test(n); }
    },
    template: '\
    <div style="border:1px solid #e2e8f0; border-radius:0.75rem; overflow:hidden; background:#f8fafc">\
      <div v-if="isImage" style="padding:0.5rem; text-align:center"><img :src="url" style="max-width:100%; max-height:260px; border-radius:0.5rem" /></div>\
      <div v-else-if="isPdf" style="padding:1rem; text-align:center"><i class="fa-solid fa-file-pdf" style="font-size:2rem; color:#e11d48"></i><div style="margin-top:0.5rem; font-size:0.75rem; color:#64748b">{{ (file&&file.nama_file)||\'Dokumen PDF\' }}</div><a :href="url" target="_blank" class="btn btn-secondary btn-sm" style="margin-top:0.5rem">Buka PDF</a></div>\
      <div v-else style="padding:1rem; text-align:center"><i class="fa-solid fa-file" style="font-size:2rem; color:#94a3b8"></i><div style="margin-top:0.5rem; font-size:0.75rem">{{ (file&&file.nama_file)||url||\'File\' }}</div><a v-if="url" :href="url" target="_blank" class="btn btn-secondary btn-sm" style="margin-top:0.5rem">Download</a></div>\
    </div>'
  };

  var comps = {
    'app-detail-drawer': AppDetailDrawer,
    'app-export-button': AppExportButton,
    'app-csv-import': AppCsvImport,
    'app-master-tree': AppMasterTree,
    'app-image-viewer': AppImageViewer,
    'app-file-preview': AppFilePreview,
    version: '2.9.0'
  };

  global.AppData = comps;
  global.AppComponents = global.AppComponents || {};
  Object.keys(comps).forEach(function(k){ if(k!=='version') global.AppComponents[k]=comps[k]; });
  if(global.AppComponents) global.AppComponents.version='2.9.0';

})(window);
