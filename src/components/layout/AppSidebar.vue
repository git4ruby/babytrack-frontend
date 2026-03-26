<script setup>
import { useRoute } from 'vue-router'
import { useBabyStore } from '@/stores/baby'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BeakerIcon,
  ScaleIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  SparklesIcon,
  StarIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const babyStore = useBabyStore()

const navItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Feed Log', path: '/feedings', icon: ClipboardDocumentListIcon },
  { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
  { name: 'Diapers', path: '/diapers', icon: SparklesIcon },
  { name: 'Milk Storage', path: '/milk-storage', icon: BeakerIcon },
  { name: 'Milestones', path: '/milestones', icon: StarIcon },
  { name: 'Weight', path: '/weight', icon: ScaleIcon },
  { name: 'Vaccinations', path: '/vaccinations', icon: ShieldCheckIcon },
  { name: 'Appointments', path: '/appointments', icon: CalendarDaysIcon },
  { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 z-30 flex flex-col">
    <!-- Logo -->
    <div class="flex items-center gap-3 px-6 h-16">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-lg shadow-lg shadow-blue-500/30">
        B
      </div>
      <div>
        <span class="text-base font-bold text-white">BabyTrack</span>
        <p v-if="babyStore.baby" class="text-[11px] text-slate-400 -mt-0.5">{{ babyStore.baby.name }}</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          isActive(item.path)
            ? 'bg-white/10 text-white shadow-lg shadow-black/10'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        ]"
      >
        <component
          :is="item.icon"
          :class="['w-5 h-5 transition-colors', isActive(item.path) ? 'text-sky-400' : 'text-slate-500']"
        />
        {{ item.name }}
      </router-link>
    </nav>

    <!-- Baby selector -->
    <div class="px-3 py-4 border-t border-white/10">
      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Current Baby</p>
      <div class="space-y-1">
        <button
          v-for="b in babyStore.babies"
          :key="b.id"
          @click="babyStore.switchBaby(b.id)"
          :class="[
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm',
            babyStore.baby?.id === b.id
              ? 'bg-white/10 text-white'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
          ]"
        >
          <span class="text-lg">{{ b.gender === 'female' ? '👧' : '👶' }}</span>
          <div class="min-w-0 flex-1">
            <p class="font-medium truncate">{{ b.name }}</p>
            <p class="text-[10px] text-slate-500">{{ b.age_in_weeks }}w · {{ b.age_in_days }}d</p>
          </div>
          <span v-if="babyStore.baby?.id === b.id" class="w-2 h-2 rounded-full bg-sky-400"></span>
        </button>
      </div>
      <router-link
        to="/setup"
        class="flex items-center gap-2 px-3 py-2 mt-1 text-xs font-medium text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition"
      >
        <span class="text-base">+</span> Add Baby
      </router-link>
    </div>
  </aside>
</template>
