<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBabyStore } from '@/stores/baby'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppBottomNav from './AppBottomNav.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import FeedEntryModal from '@/components/FeedEntryModal.vue'
import MilkStashModal from '@/components/MilkStashModal.vue'
import DiaperEntryModal from '@/components/DiaperEntryModal.vue'
import TermsModal from '@/components/TermsModal.vue'
import client from '@/api/client'

const router = useRouter()
const route = useRoute()
const babyStore = useBabyStore()
const ui = useUiStore()
const { isOpen: confirmOpen, title: confirmTitle, message: confirmMessage, confirmLabel, variant: confirmVariant, handleConfirm, handleCancel } = useConfirm()

const showTerms = ref(false)

// Close mobile sidebar on navigation
watch(() => route.path, () => {
  ui.sidebarOpen = false
})

onMounted(async () => {
  await babyStore.fetchBaby()
  await babyStore.fetchBabies()
  if (!babyStore.hasBaby) {
    router.replace('/setup')
    return
  }
  // Check if user has accepted terms
  try {
    const { data } = await client.get('/profile')
    if (!data.data?.terms_accepted) {
      showTerms.value = true
    }
  } catch {}
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-gray-950 dark:text-gray-100">
    <!-- Desktop sidebar -->
    <AppSidebar class="hidden lg:block" />

    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div v-if="ui.sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="ui.sidebarOpen = false"></div>
    </Transition>
    <Transition name="slide">
      <AppSidebar v-if="ui.sidebarOpen" class="lg:hidden" style="z-index: 9999;" />
    </Transition>

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

    <!-- Terms acceptance modal -->
    <TermsModal :open="showTerms" @accepted="showTerms = false" />
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>
