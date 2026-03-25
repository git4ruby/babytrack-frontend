<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBabyStore } from '@/stores/baby'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppBottomNav from './AppBottomNav.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import FeedEntryModal from '@/components/FeedEntryModal.vue'
import MilkStashModal from '@/components/MilkStashModal.vue'
import DiaperEntryModal from '@/components/DiaperEntryModal.vue'

const router = useRouter()
const babyStore = useBabyStore()

onMounted(async () => {
  await babyStore.fetchBaby()
  await babyStore.fetchBabies()
  // Redirect to setup if user has no babies
  if (!babyStore.hasBaby) {
    router.replace('/setup')
  }
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
    <DiaperEntryModal />

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>
