<script setup>
import { onMounted } from 'vue'
import { useBabyStore } from '@/stores/baby'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppBottomNav from './AppBottomNav.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import FeedEntryModal from '@/components/FeedEntryModal.vue'
import MilkStashModal from '@/components/MilkStashModal.vue'

const babyStore = useBabyStore()

onMounted(() => {
  babyStore.fetchBaby()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Desktop sidebar -->
    <AppSidebar class="hidden lg:block" />

    <!-- Main content -->
    <div class="lg:pl-64">
      <AppHeader />
      <main class="px-4 py-5 lg:px-8 lg:py-6 pb-24 lg:pb-8">
        <router-view />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <AppBottomNav class="lg:hidden" />

    <!-- Global modals -->
    <FeedEntryModal />
    <MilkStashModal />

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>
