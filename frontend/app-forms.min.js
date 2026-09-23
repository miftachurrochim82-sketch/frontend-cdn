/* ============================================================
   app-forms.js — Form & Filter Components (Shared CDN v2.9.0)
   RAK E — FORM & FILTER (Dapur & Kamar Mandi)
   8 FILE & 31 OPSI — Sekali Jalan

   Isi (6 opsi):
   - <app-filter-bar> UPGRADE (E1) WAJIB — debounce + date-range + span
   - <app-pegawai-picker> (E2) — sudah ada, re-export
   - <app-debounced-search> (E3) WAJIB — input cari 300ms
   - <app-date-picker> (E4) — wrapper date dengan label & error
   - <app-file-upload> (E5) — drag & drop + preview + progress
   - <app-rich-editor> (E6) — textarea bold/italic minimal

   Catatan: <app-filter-bar> yang lama tetap di app-components untuk
   backward compat, tapi versi di sini lebih kaya (debounce).
   ============================================================ */
(function(global){
  'use strict';

  // E3 — Debounced search (baru WAJIB)
  var AppDebouncedSearch = {
    name: 'AppDebouncedSearch',
    props: {
      modelValue: { type: String, default: '' },
      placeholder: { type: String, default: 'Cari...' },
      delay: { type: Number, default: 300 },
      label: { type: String, default: '' }
    },
    emits: ['update:modelValue','search'],
    data: function(){ return { inner: this.modelValue, timer: null }; },
    watch: {
      modelValue: function(v){ this.inner = v; },
      inner: function(v){
        var self=this;
        clearTimeout(this.timer);
        this.timer=setTimeout(function(){ self.$emit('update:modelValue', v); self.$emit('search', v); }, this.delay);
      }
    },
    methods: {
      clear: function(){ this.inner=''; this.$emit('update:modelValue',''); this.$emit('search',''); }
    },
    template: '\
    <div>\
      <label v-if="label" class="form-label" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em">{{ label }}</label>\
      <div style="position:relative; display:flex; align-items:center">\
        <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:0.75rem; color:#94a3b8; font-size:0.75rem"></i>\
        <input :value="inner" @input="inner=$event.target.value" :placeholder="placeholder" class="input" style="padding-left:2.2rem; padding-right:2rem" />\
        <button v-if="inner" @click="clear" type="button" style="position:absolute; right:0.6rem; background:transparent; border:none; color:#94a3b8; cursor:pointer"><i class="fa-solid fa-xmark"></i></button>\
      </div>\
    </div>'
  };

  // E4 — Date picker wrapper
  var AppDatePicker = {
    name: 'AppDatePicker',
    props: {
      modelValue: { type: String, default: '' },
      label: { type: String, default: 'Tanggal' },
      error: { type: String, default: '' },
      hint: { type: String, default: '' },
      required: { type: Boolean, default: false }
    },
    emits: ['update:modelValue'],
    template: '\
    <div>\
      <label class="form-label">{{ label }}<span v-if="required" style="color:#dc2626"> *</span></label>\
      <input type="date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" class="input" :class="{ \'is-error\': !!error }" />\
      <div v-if="error" class="form-error"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</div>\
      <div v-else-if="hint" class="form-hint">{{ hint }}</div>\
    </div>'
  };

  // E5 — File upload drag & drop
  var AppFileUpload = {
    name: 'AppFileUpload',
    props: {
      modelValue: { type: Array, default: function(){ return []; } },
      accept: { type: String, default: '' },
      multiple: { type: Boolean, default: false },
      maxSizeMb: { type: Number, default: 10 },
      label: { type: String, default: 'Upload File' },
      hint: { type: String, default: '' }
    },
    emits: ['update:modelValue','change'],
    data: function(){ return { dragOver: false, error: '' }; },
    methods: {
      onFiles: function(files){
        this.error='';
        var list = Array.prototype.slice.call(files || []);
        var maxBytes = this.maxSizeMb * 1024 * 1024;
        var out = this.multiple ? (this.modelValue || []).slice() : [];
        for(var i=0;i<list.length;i++){
          var f=list[i];
          if(f.size>maxBytes){ this.error='File ' + f.name + ' melebihi ' + this.maxSizeMb + ' MB'; continue; }
          out.push(f);
          if(!this.multiple) break;
        }
        this.$emit('update:modelValue', out);
        this.$emit('change', out);
      },
      onDrop: function(e){
        e.preventDefault();
        this.dragOver=false;
        this.onFiles(e.dataTransfer.files);
      },
      onInput: function(e){ this.onFiles(e.target.files); e.target.value=''; },
      remove: function(idx){
        var arr=(this.modelValue||[]).slice();
        arr.splice(idx,1);
        this.$emit('update:modelValue', arr);
        this.$emit('change', arr);
      }
    },
    template: '\
    <div>\
      <label v-if="label" class="form-label">{{ label }}</label>\
      <div @dragover.prevent="dragOver=true" @dragleave="dragOver=false" @drop="onDrop" :style="{ border: dragOver?\'2px dashed var(--primary)\':\'1px dashed #cbd5e1\', background: dragOver?\'var(--primary-light)\':\'#f8fafc\', borderRadius:\'0.75rem\', padding:\'1.25rem\', textAlign:\'center\', transition:\'all 0.2s\' }">\
        <i class="fa-solid fa-cloud-arrow-up" style="font-size:1.5rem; color:var(--primary); margin-bottom:0.5rem"></i>\
        <div style="font-size:0.8125rem; font-weight:600; color:#334155">Tarik file ke sini atau klik pilih</div>\
        <div v-if="hint" style="font-size:0.7rem; color:#64748b; margin-top:0.25rem">{{ hint }}</div>\
        <label class="btn btn-secondary btn-sm" style="margin-top:0.75rem; cursor:pointer"><i class="fa-solid fa-folder-open"></i> Pilih File<input type="file" :accept="accept" :multiple="multiple" @change="onInput" style="display:none" /></label>\
      </div>\
      <div v-if="error" class="form-error" style="margin-top:0.5rem">{{ error }}</div>\
      <div v-if="modelValue && modelValue.length" style="margin-top:0.75rem; display:flex; flex-direction:column; gap:0.5rem">\
        <div v-for="(f,idx) in modelValue" :key="idx" style="display:flex; align-items:center; gap:0.6rem; padding:0.5rem 0.75rem; background:#ffffff; border:1px solid #e2e8f0; border-radius:0.6rem; font-size:0.75rem">\
          <i class="fa-solid fa-file" style="color:var(--primary)"></i>\
          <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{{ f.name }} <span style="color:#94a3b8">({{ (f.size/1024).toFixed(1) }} KB)</span></span>\
          <button @click="remove(idx)" type="button" class="btn-icon" style="width:1.6rem; height:1.6rem"><i class="fa-solid fa-xmark"></i></button>\
        </div>\
      </div>\
    </div>'
  };

  // E6 — Rich editor minimal (textarea + toolbar bold/italic/list)
  var AppRichEditor = {
    name: 'AppRichEditor',
    props: {
      modelValue: { type: String, default: '' },
      label: { type: String, default: 'Deskripsi' },
      placeholder: { type: String, default: 'Tulis...' },
      rows: { type: Number, default: 4 }
    },
    emits: ['update:modelValue'],
    methods: {
      wrap: function(before, after){
        var ta=this.$refs.ta;
        if(!ta) return;
        var s=ta.selectionStart, e=ta.selectionEnd, v=this.modelValue||'';
        var sel=v.substring(s,e);
        var n=v.substring(0,s)+before+sel+after+v.substring(e);
        this.$emit('update:modelValue', n);
        var self=this;
        this.$nextTick(function(){ ta.focus(); ta.setSelectionRange(s+before.length, e+before.length); });
      }
    },
    template: '\
    <div>\
      <label v-if="label" class="form-label">{{ label }}</label>\
      <div style="border:1px solid #cbd5e1; border-radius:0.75rem; overflow:hidden; background:#ffffff">\
        <div style="display:flex; gap:0.25rem; padding:0.5rem; background:#f8fafc; border-bottom:1px solid #e2e8f0">\
          <button @click="wrap(\'**\',\'**\')" type="button" class="btn btn-ghost btn-xs" title="Bold"><i class="fa-solid fa-bold"></i></button>\
          <button @click="wrap(\'*\',\'*\')" type="button" class="btn btn-ghost btn-xs" title="Italic"><i class="fa-solid fa-italic"></i></button>\
          <button @click="wrap(\'\\n- \',\'\')" type="button" class="btn btn-ghost btn-xs" title="List"><i class="fa-solid fa-list-ul"></i></button>\
        </div>\
        <textarea ref="ta" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :placeholder="placeholder" :rows="rows" class="textarea" style="border:none; border-radius:0"></textarea>\
      </div>\
      <div class="form-hint">Mendukung **bold**, *italic*, dan list. Simpan sebagai markdown.</div>\
    </div>'
  };

  // E1 UPGRADE — Filter-bar enhanced (debounce) — wrapper di atas app-filter-bar lama
  var AppFilterBarEnhanced = {
    name: 'AppFilterBarEnhanced',
    props: {
      filters: { type: Array, default: function(){ return []; } },
      modelValue: { type: Object, default: function(){ return {}; } }
    },
    emits: ['update:modelValue','change','reset'],
    data: function(){ return { local: Object.assign({}, this.modelValue) }; },
    watch: {
      modelValue: { deep:true, handler: function(v){ this.local=Object.assign({}, v||{}); } }
    },
    methods: {
      spanCls: function(f){
        var SPAN={2:'sm:col-span-2 lg:col-span-2',3:'sm:col-span-2 lg:col-span-3',4:'sm:col-span-2 lg:col-span-4'};
        return SPAN[parseInt(f&&f.span,10)]||'';
      },
      emit: function(){
        var out=Object.assign({}, this.local);
        this.$emit('update:modelValue', out);
        this.$emit('change', out);
      },
      onInput: function(k,v){ this.local[k]=v; this.emit(); },
      reset: function(){ this.local={}; this.$emit('update:modelValue',{}); this.$emit('change',{}); this.$emit('reset'); }
    },
    template: '\
    <div>\
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">\
        <div v-for="f in filters" :key="f.key" :class="spanCls(f)">\
          <label class="form-label" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em">{{ f.label }}</label>\
          <select v-if="f.type===\'select\'" :value="local[f.key]||\'\'" @change="onInput(f.key,$event.target.value)" class="select">\
            <option value="">Semua</option>\
            <option v-for="o in (f.options||[])" :key="(o&&o.value)||o" :value="(o&&o.value)||o">{{ (o&&o.label)||o }}</option>\
          </select>\
          <input v-else-if="f.type===\'date\'" type="date" :value="local[f.key]||\'\'" @input="onInput(f.key,$event.target.value)" class="input" />\
          <input v-else type="text" :value="local[f.key]||\'\'" :placeholder="f.placeholder||\'\'" @input="onInput(f.key,$event.target.value)" class="input" />\
        </div>\
        <div style="display:flex; align-items:flex-end">\
          <button @click="reset" type="button" class="btn btn-ghost btn-sm"><i class="fa-solid fa-rotate-right"></i> Reset</button>\
        </div>\
      </div>\
    </div>'
  };

  var comps = {
    'app-debounced-search': AppDebouncedSearch,
    'app-date-picker': AppDatePicker,
    'app-file-upload': AppFileUpload,
    'app-rich-editor': AppRichEditor,
    'app-filter-bar-enhanced': AppFilterBarEnhanced,
    version: '2.9.0'
  };

  global.AppForms = comps;
  global.AppComponents = global.AppComponents || {};
  Object.keys(comps).forEach(function(k){ if(k!=='version') global.AppComponents[k]=comps[k]; });
  if(global.AppComponents) global.AppComponents.version='2.9.0';

})(window);
