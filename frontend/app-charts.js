/* ============================================================
   app-charts.js — Chart Components (Shared CDN v2.9.0)
   RAK G — GRAFIK (Ruang Pamer)
   8 FILE & 31 OPSI — Sekali Jalan

   Isi (3 opsi):
   - <app-chart-bar> (G1) — sudah ada di app-components, re-export
   - <app-chart-doughnut> (G1) — sudah ada
   - <app-chart-line> (G2) — BARU, tren 12 bulan
   - <app-configurable-dashboard> (G3) — grid 4 kartu + 4 chart

   Semua chart pakai Chart.js on-demand via AppCore.loadLib('chart')
   + dark mode aware (event appcore:dark).
   ============================================================ */
(function(global){
  'use strict';

  function makeChartComponent(chartType, name){
    return {
      name: name,
      props: {
        labels: { type: Array, default: function(){ return []; } },
        datasets: { type: Array, default: function(){ return []; } },
        title: { type: String, default: '' },
        height: { type: Number, default: 260 },
        legend: { type: Boolean, default: true },
        colors: { type: Array, default: function(){ return []; } },
        bare: { type: Boolean, default: false }
      },
      data: function(){ return { chart:null, loadError:false, dark: document.documentElement.classList.contains('dark') }; },
      computed: {
        palette: function(){ return this.colors.length?this.colors:['#059669','#0284c7','#f59e0b','#9333ea','#f43f5e','#14b8a6','#6366f1','#f97316']; }
      },
      watch: { labels:{deep:true,handler:function(){this.render();}}, datasets:{deep:true,handler:function(){this.render();}} },
      mounted: function(){
        var self=this;
        this.onDark_=function(e){ self.dark=!!e.detail; self.render(); };
        window.addEventListener('appcore:dark', this.onDark_);
        this.bootstrap();
      },
      unmounted: function(){
        window.removeEventListener('appcore:dark', this.onDark_);
        if(this.chart){ this.chart.destroy(); this.chart=null; }
      },
      methods: {
        bootstrap: async function(){
          var ok=false;
          try{
            if(typeof Chart!=='undefined') ok=true;
            else if(window.AppCore && window.AppCore.loadLib) ok=await window.AppCore.loadLib('chart');
          }catch(e){ ok=false; }
          if(!ok && typeof Chart==='undefined'){ this.loadError=true; return; }
          this.loadError=false;
          this.render();
        },
        render: function(){
          if(this.loadError || typeof Chart==='undefined') return;
          if(this.chart){ this.chart.destroy(); this.chart=null; }
          var ctx=this.$refs.canvas;
          if(!ctx) return;
          var self=this;
          var pal=this.palette;
          var gridColor=this.dark?'rgba(148,163,184,0.15)':'rgba(100,116,139,0.12)';
          var tickColor=this.dark?'#94a3b8':'#64748b';
          var ds=(this.datasets&&this.datasets.length)?this.datasets:[{label:this.title||'Data',data:[]}];
          var sets=ds.map(function(d,i){
            var base={ label:d.label||'', data:d.data||[] };
            if(chartType==='doughnut'){
              base.backgroundColor=d.colors||pal;
              base.borderColor=self.dark?'#1e293b':'#ffffff';
              base.borderWidth=2;
            } else if(chartType==='line'){
              base.borderColor=d.borderColor||pal[i%pal.length];
              base.backgroundColor=d.backgroundColor|| (pal[i%pal.length]+'20');
              base.tension=0.35;
              base.fill= d.fill!==undefined ? d.fill : true;
              base.pointRadius=3;
              base.pointHoverRadius=5;
              base.borderWidth=2;
            } else {
              base.backgroundColor=d.colors|| (ds.length===1?pal:pal[i%pal.length]);
              base.borderRadius=6;
              base.maxBarThickness=48;
            }
            return base;
          });
          var opts={
            responsive:true, maintainAspectRatio:false,
            plugins:{
              legend:{ display:self.legend && (chartType==='doughnut' || ds.length>1), labels:{ color:tickColor, boxWidth:12, font:{size:11} } },
              tooltip:{ backgroundColor:self.dark?'#0f172a':'#1e293b' }
            }
          };
          if(chartType==='bar' || chartType==='line'){
            opts.scales={
              x:{ grid:{ display:false }, ticks:{ color:tickColor, font:{size:10} } },
              y:{ grid:{ color:gridColor }, ticks:{ color:tickColor, font:{size:10}, precision:0 } }
            };
          }
          this.chart=new Chart(ctx, { type: chartType, data:{ labels:this.labels||[], datasets:sets }, options:opts });
        }
      },
      template: '\
      <div :class="bare?\'\':\'p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm\'">\
        <p v-if="title && !bare" style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem">{{ title }}</p>\
        <div v-if="loadError" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2.5rem; text-align:center">\
          <i class="fa-solid fa-chart-simple" style="font-size:1.5rem; color:#cbd5e1; margin-bottom:0.5rem"></i>\
          <p style="font-size:0.75rem; color:#94a3b8">Grafik gagal dimuat.</p>\
          <button @click="bootstrap" class="btn btn-secondary btn-xs" style="margin-top:0.5rem">Coba lagi</button>\
        </div>\
        <div v-else style="position:relative" :style="{ height: height+\'px\' }"><canvas ref="canvas"></canvas></div>\
      </div>'
    };
  }

  var AppChartLine = makeChartComponent('line', 'AppChartLine');

  var AppConfigurableDashboard = {
    name: 'AppConfigurableDashboard',
    props: {
      cards: { type: Array, default: function(){ return []; } },
      charts: { type: Array, default: function(){ return []; } }
    },
    template: '\
    <div style="display:flex; flex-direction:column; gap:1.5rem">\
      <div v-if="cards && cards.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">\
        <app-stat-card v-for="(c,idx) in cards" :key="idx" :title="c.title" :value="c.value" :icon="c.icon||\'fa-solid fa-chart-simple\'" :color="c.color||\'emerald\'" :subtext="c.subtext||\'\'"></app-stat-card>\
      </div>\
      <div v-if="charts && charts.length" class="grid grid-cols-1 lg:grid-cols-2 gap-4">\
        <div v-for="(ch,idx) in charts" :key="idx">\
          <app-chart-bar v-if="ch.type===\'bar\'" :labels="ch.labels" :datasets="ch.datasets" :title="ch.title" :height="ch.height||260"></app-chart-bar>\
          <app-chart-line v-else-if="ch.type===\'line\'" :labels="ch.labels" :datasets="ch.datasets" :title="ch.title" :height="ch.height||260"></app-chart-line>\
          <app-chart-doughnut v-else :labels="ch.labels" :datasets="ch.datasets" :title="ch.title" :height="ch.height||260"></app-chart-doughnut>\
        </div>\
      </div>\
      <slot></slot>\
    </div>'
  };

  var comps = {
    'app-chart-line': AppChartLine,
    'app-configurable-dashboard': AppConfigurableDashboard,
    version: '2.9.0'
  };

  global.AppCharts = comps;
  global.AppComponents = global.AppComponents || {};
  Object.keys(comps).forEach(function(k){ if(k!=='version') global.AppComponents[k]=comps[k]; });
  if(global.AppComponents) global.AppComponents.version='2.9.0';

})(window);
