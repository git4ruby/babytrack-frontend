<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBabyStore } from '@/stores/baby'
import { useUiStore } from '@/stores/ui'
import { Bars3Icon, PlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const babyStore = useBabyStore()
const ui = useUiStore()

const pageTitle = computed(() => {
  const titles = { Dashboard: 'Dashboard', Feedings: 'Feed Log', Analytics: 'Analytics', Diapers: 'Diapers', Milestones: 'Milestones', MilkStorage: 'Milk Storage', Weight: 'Weight', Vaccinations: 'Vaccinations', Appointments: 'Appointments', Settings: 'Settings' }
  return titles[route.name] || 'BabyTrack'
})

async function handleLogout() {
  await auth.signOut()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
    <div class="flex items-center justify-between h-14 px-4 lg:px-6">
      <!-- Left -->
      <div class="flex items-center gap-3">
        <button @click="ui.toggleSidebar()" class="lg:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
          <Bars3Icon class="w-5 h-5" />
        </button>
        <h1 class="text-base font-bold text-gray-900">{{ pageTitle }}</h1>
      </div>

      <!-- Right: actions -->
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
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition"
        >
          🧊
          <span class="hidden sm:inline">Store Milk</span>
        </button>

        <button
          @click="handleLogout"
          class="p-1.5 text-gray-300 hover:text-gray-500 transition rounded-lg hover:bg-gray-100"
          title="Sign out"
        >
          <ArrowRightOnRectangleIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
</template>
