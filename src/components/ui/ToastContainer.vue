<script setup>
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group name="toast">
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm',
          toast.type === 'success' ? 'bg-green-500 text-white' : '',
          toast.type === 'error' ? 'bg-red-500 text-white' : '',
          toast.type === 'info' ? 'bg-blue-500 text-white' : '',
        ]"
      >
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }
</style>
