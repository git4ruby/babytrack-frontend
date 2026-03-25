import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const feedModalOpen = ref(false)
  const milkModalOpen = ref(false)
  const diaperModalOpen = ref(false)
  const toasts = ref([])

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function showToast(message, type = 'success', duration = 3000) {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  return {
    sidebarOpen, feedModalOpen, milkModalOpen, diaperModalOpen, toasts,
    toggleSidebar, showToast,
  }
})
