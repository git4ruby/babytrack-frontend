<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBabyStore } from '@/stores/baby'
import { useUiStore } from '@/stores/ui'
import { useDarkMode } from '@/composables/useDarkMode'
import { Bars3Icon, PlusIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const babyStore = useBabyStore()
const ui = useUiStore()
const { isDark, toggle: toggleDark } = useDarkMode()

const pageTitle = computed(() => {
  const titles = { Dashboard: 'Dashboard', Feedings: 'Feed Log', Analytics: 'Analytics', Sleep: 'Sleep', Diapers: 'Diapers', Milestones: 'Milestones', MilkStorage: 'Milk Storage', Weight: 'Weight', Vaccinations: 'Vaccinations', Appointments: 'Appointments', Settings: 'Settings', Admin: 'Admin' }
  return titles[route.name] || 'BabyTrack'
})

async function handleLogout() {
  await auth.signOut()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/60 dark:border-gray-700/60" style="z-index: 30;">
    <div class="flex items-center justify-between h-14 px-4 lg:px-6">
      <div class="flex items-center gap-3">
        <button @click="ui.toggleSidebar()" class="lg:hidden p-1.5 -ml-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bars3Icon class="w-5 h-5" />
        </button>
        <h1 class="text-base font-bold text-gray-900 dark:text-white">{{ pageTitle }}</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="ui.feedModalOpen = true"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm shadow-blue-500/25"
        >
          <PlusIcon class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Log Feed</span>
        </button>

        <button
          @click="ui.milkModalOpen = true"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition"
        >
          🧊 <span class="hidden sm:inline">Store Milk</span>
        </button>

        <button
          @click="toggleDark"
          class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          :title="isDark ? 'Light mode' : 'Dark mode'"
        >
          <MoonIcon v-if="!isDark" class="w-4 h-4" />
          <SunIcon v-else class="w-4 h-4" />
        </button>

        <button
          @click="handleLogout"
          class="p-1.5 text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Sign out"
        >
          <ArrowRightOnRectangleIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
</template>
