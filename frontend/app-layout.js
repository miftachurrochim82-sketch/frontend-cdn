/* ============================================================
   app-layout.js — Layout Components (Shared CDN v2.9.0)
   RAK C — TATA LETAK (Dinding & Pintu)
   8 FILE & 31 OPSI — Sekali Jalan

   Isi:
   - <app-breadcrumb> (C1) — Home > Master > Kategori
   - <app-page-header> (C2) — Judul + deskripsi + aksi kanan seragam

   Semua komponen otomatis terdaftar ke AppComponents (backward compat)
   + AppLayout (modular). Dipakai via:
     <app-breadcrumb :items="[{label:'Home', to:'dashboard'}, {label:'Kategori'}]" />
     <app-page-header title="Master Data" subtitle="5 master = 5 dimensi" icon="fa-solid fa-book">
       <template #actions><button class="btn btn-primary">Tambah</button></template>
     </app-page-header>
   ============================================================ */
(function(global){
  'use strict';

  var AppBreadcrumb = {
    name: 'AppBreadcrumb',
    props: {
      items: { type: Array, default: function(){ return []; } }
    },
    emits: ['navigate'],
    template: '\
    <nav class="breadcrumb" aria-label="Breadcrumb">\
      <template v-for="(it, idx) in items" :key="idx">\
        <a v-if="it.to" href="#" @click.prevent="$emit(\'navigate\', it.to)">{{ it.label }}</a>\
        <span v-else class="breadcrumb-current">{{ it.label }}</span>\
        <span v-if="idx < items.length - 1" class="breadcrumb-separator"><i class="fa-solid fa-chevron-right"></i></span>\
      </template>\
    </nav>'
  };

  var AppPageHeader = {
    name: 'AppPageHeader',
    props: {
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      icon: { type: String, default: '' }
    },
    template: '\
    <div class="page-header">\
      <div>\
        <div class="breadcrumb" style="margin-bottom:0.35rem" v-if="$slots.breadcrumb"><slot name="breadcrumb"></slot></div>\
        <h2 class="page-header-title">\
          <i v-if="icon" :class="icon"></i>\
          <span>{{ title }}</span>\
          <slot name="title-extra"></slot>\
        </h2>\
        <p v-if="subtitle" class="page-header-subtitle">{{ subtitle }}</p>\
        <slot></slot>\
      </div>\
      <div class="page-header-actions">\
        <slot name="actions"></slot>\
      </div>\
    </div>'
  };

  var comps = {
    'app-breadcrumb': AppBreadcrumb,
    'app-page-header': AppPageHeader,
    version: '2.9.0'
  };

  global.AppLayout = comps;
  // juga merge ke AppComponents untuk backward compat (app yang hanya load app-components tetap dapat)
  global.AppComponents = global.AppComponents || {};
  Object.keys(comps).forEach(function(k){ if(k!=='version') global.AppComponents[k]=comps[k]; });
  // update version
  if(global.AppComponents) global.AppComponents.version = '2.9.0';

})(window);
