<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBabyStore } from '@/stores/baby'
import { useUiStore } from '@/stores/ui'
import { Bars3Icon, PlusIcon, ArrowRightOnRectangleIcon, BeakerIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const auth = useAuthStore()
const babyStore = useBabyStore()
const ui = useUiStore()

async function handleLogout() {
  await auth.signOut()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-20 bg-white border-b border-gray-200">
    <div class="flex items-center justify-between h-16 px-4 lg:px-6">
      <!-- Left: mobile menu + page context -->
      <div class="flex items-center gap-3">
        <button @click="ui.toggleSidebar()" class="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <Bars3Icon class="w-6 h-6" />
        </button>
        <div>
          <h2 class="text-sm font-medium text-gray-500">
            {{ babyStore.baby?.name || 'BabyTrack' }}
          </h2>
          <p v-if="babyStore.baby" class="text-xs text-gray-400">
            {{ babyStore.baby.age_in_weeks }} weeks old
          </p>
        </div>
      </div>

      <!-- Right: actions -->
      <div class="flex items-center gap-2">
        <button
          @click="ui.feedModalOpen = true"
          class="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <PlusIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Log Feed</span>
        </button>

        <button
          @click="ui.milkModalOpen = true"
          class="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium rounded-lg transition"
        >
          <BeakerIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Store Milk</span>
        </button>

        <button
          @click="handleLogout"
          class="p-2 text-gray-400 hover:text-gray-600 transition"
          title="Sign out"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>
