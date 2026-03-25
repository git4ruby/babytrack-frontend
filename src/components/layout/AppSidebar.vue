<script setup>
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BeakerIcon,
  ScaleIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Feed Log', path: '/feedings', icon: ClipboardDocumentListIcon },
  { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
  { name: 'Milk Storage', path: '/milk-storage', icon: BeakerIcon },
  { name: 'Weight', path: '/weight', icon: ScaleIcon },
  { name: 'Vaccinations', path: '/vaccinations', icon: ShieldCheckIcon },
  { name: 'Appointments', path: '/appointments', icon: CalendarDaysIcon },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
    <!-- Logo -->
    <div class="flex items-center gap-3 px-6 h-16 border-b border-gray-200">
      <span class="text-2xl">👶</span>
      <span class="text-lg font-bold text-gray-900">BabyTrack</span>
    </div>

    <!-- Navigation -->
    <nav class="p-4 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive(item.path)
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <component
          :is="item.icon"
          :class="['w-5 h-5', isActive(item.path) ? 'text-blue-600' : 'text-gray-400']"
        />
        {{ item.name }}
      </router-link>
    </nav>
  </aside>
</template>
