<script setup>
import { onMounted } from 'vue'
import { useBabyStore } from '@/stores/baby'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppBottomNav from './AppBottomNav.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const babyStore = useBabyStore()

onMounted(() => {
  babyStore.fetchBaby()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Desktop sidebar -->
    <AppSidebar class="hidden lg:block" />

    <!-- Main content -->
    <div class="lg:pl-64">
      <AppHeader />
      <main class="p-4 lg:p-6 pb-20 lg:pb-6">
        <router-view />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <AppBottomNav class="lg:hidden" />

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>
