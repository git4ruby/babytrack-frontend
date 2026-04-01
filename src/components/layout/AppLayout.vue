<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBabyStore } from '@/stores/baby'
import { useConfirm } from '@/composables/useConfirm'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppBottomNav from './AppBottomNav.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import FeedEntryModal from '@/components/FeedEntryModal.vue'
import MilkStashModal from '@/components/MilkStashModal.vue'
import DiaperEntryModal from '@/components/DiaperEntryModal.vue'

const router = useRouter()
const babyStore = useBabyStore()
const { isOpen: confirmOpen, title: confirmTitle, message: confirmMessage, confirmLabel, variant: confirmVariant, handleConfirm, handleCancel } = useConfirm()

onMounted(async () => {
  await babyStore.fetchBaby()
  await babyStore.fetchBabies()
  if (!babyStore.hasBaby) {
    router.replace('/setup')
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-gray-950 dark:text-gray-100">
    <AppSidebar class="hidden lg:block" />

    <div class="lg:pl-64">
      <AppHeader />
      <main class="px-4 py-5 lg:px-8 lg:py-6 pb-24 lg:pb-8">
        <router-view />
      </main>
    </div>

    <AppBottomNav class="lg:hidden" />

    <!-- Global modals -->
    <FeedEntryModal />
    <MilkStashModal />
    <DiaperEntryModal />

    <!-- Global confirm dialog -->
    <ConfirmDialog
      :open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-label="confirmLabel"
      :variant="confirmVariant"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <ToastContainer />
  </div>
</template>
