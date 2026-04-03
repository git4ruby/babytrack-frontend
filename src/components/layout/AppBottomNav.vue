<script setup>
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()

const navItems = [
  { name: 'Home', path: '/', icon: HomeIcon },
  { name: 'Feeds', path: '/feedings', icon: ClipboardDocumentListIcon },
  { name: 'Diapers', path: '/diapers', icon: SparklesIcon },
  { name: 'Vaccines', path: '/vaccinations', icon: ShieldCheckIcon },
  { name: 'Appts', path: '/appointments', icon: CalendarDaysIcon },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom" style="z-index: 9999;">
    <div class="flex items-stretch justify-around">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex flex-col items-center justify-center gap-0.5 py-3 px-2 min-w-0 flex-1 min-h-[44px] text-[11px] font-medium transition-colors',
          isActive(item.path) ? 'text-blue-600' : 'text-gray-400'
        ]"
        style="-webkit-tap-highlight-color: transparent;"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span class="truncate">{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
