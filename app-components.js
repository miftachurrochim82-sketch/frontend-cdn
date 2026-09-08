// app-components.js — Shared Vue components (tanpa registrasi global)
const AppLogin = {
  props: ['config', 'isProcessing', 'errorMessage'],
  emits: ['login'],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900">
      <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{{ config.appTitle }}</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ config.appSubtitle }}</p>
        </div>
        <button v-if="!isProcessing" @click="$emit('login')"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition">
          Masuk via SI-Platform
        </button>
        <div v-else class="text-center py-3">
          <div class="inline-block w-6 h-6 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p class="text-xs text-emerald-700 mt-2">Menghubungkan...</p>
        </div>
        <div v-if="errorMessage" class="mt-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `
};

const AppSidebar = {
  props: ['config', 'currentPage', 'isDarkMode', 'isAdmin', 'sidebarCollapsed', 'sidebarMobileOpen'],
  emits: ['navigate', 'toggle-sidebar', 'close-mobile', 'logout'],
  template: `
    <aside :class="[
      'fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 transition-all duration-300 border-r',
      sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
      isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-700 border-slate-200'
    ]">
      <div class="p-4 border-b flex items-center justify-between">
        <span v-if="!sidebarCollapsed" class="font-bold text-lg">{{ config.appTitle }}</span>
        <span v-else class="mx-auto font-bold">{{ config.appTitle.charAt(0) }}</span>
        <button @click="$emit('toggle-sidebar')" class="hidden lg:block text-sm">☰</button>
        <button @click="$emit('close-mobile')" class="lg:hidden">✕</button>
      </div>
      <nav class="flex-1 p-2 space-y-1 overflow-y-auto no-scrollbar">
        <a v-for="item in config.menuItems"
           :key="item.key"
           @click="$emit('navigate', item.key)"
           :class="[
             'flex items-center px-3 py-2 rounded-lg cursor-pointer text-sm',
             currentPage === item.key ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-100',
             item.adminOnly && !isAdmin ? 'hidden' : ''
           ]">
          <i :class="item.icon" class="w-5"></i>
          <span v-if="!sidebarCollapsed" class="ml-2">{{ item.label }}</span>
        </a>
      </nav>
      <div class="p-3 border-t">
        <button @click="$emit('logout')" class="w-full py-2 text-sm bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">Keluar</button>
      </div>
    </aside>
  `
};

const AppHeader = {
  props: ['config', 'currentPage', 'isDarkMode', 'currentUser'],
  emits: ['toggle-dark', 'toggle-mobile'],
  template: `
    <header class="sticky top-0 z-30 px-4 py-3 bg-white dark:bg-slate-900 border-b flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-mobile')" class="lg:hidden">☰</button>
        <h1 class="text-lg font-bold">{{ config.appTitle }}</h1>
        <span class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{{ currentPage }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button @click="$emit('toggle-dark')" class="text-sm">{{ isDarkMode ? '☀️' : '🌙' }}</button>
        <span class="text-xs">{{ currentUser?.email || '' }}</span>
      </div>
    </header>
  `
};

const AppLayout = {
  props: ['config', 'currentPage', 'isDarkMode', 'sidebarCollapsed', 'sidebarMobileOpen', 'currentUser', 'isAdmin'],
  emits: ['navigate', 'toggle-sidebar', 'close-mobile', 'logout', 'toggle-dark', 'toggle-mobile'],
  template: `
    <div class="flex min-h-screen">
      <app-sidebar
        :config="config"
        :current-page="currentPage"
        :is-dark-mode="isDarkMode"
        :is-admin="isAdmin"
        :sidebar-collapsed="sidebarCollapsed"
        :sidebar-mobile-open="sidebarMobileOpen"
        @navigate="$emit('navigate', $event)"
        @toggle-sidebar="$emit('toggle-sidebar')"
        @close-mobile="$emit('close-mobile')"
        @logout="$emit('logout')"
      ></app-sidebar>
      <div class="flex-1 flex flex-col">
        <app-header
          :config="config"
          :current-page="currentPage"
          :is-dark-mode="isDarkMode"
          :current-user="currentUser"
          @toggle-dark="$emit('toggle-dark')"
          @toggle-mobile="$emit('toggle-mobile')"
        ></app-header>
        <main class="flex-1 p-4 overflow-y-auto">
          <slot></slot>
        </main>
      </div>
    </div>
  `
};
