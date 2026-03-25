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
  <nav class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30 safe-bottom">
    <div class="flex items-center justify-around h-16">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
          isActive(item.path) ? 'text-blue-600' : 'text-gray-400'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
