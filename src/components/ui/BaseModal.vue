<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm, md, lg
})

const emit = defineEmits(['close'])
</script>

<template>
  <TransitionRoot :show="open" as="template">
    <Dialog @close="emit('close')" class="relative" style="z-index: 10000;">
      <!-- Backdrop -->
      <TransitionChild
        enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40" />
      </TransitionChild>

      <!-- Panel -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center px-4 py-16 sm:p-4">
          <TransitionChild
            enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              :class="[
                'relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full',
                'max-h-[85vh] sm:max-h-[90vh] flex flex-col',
                size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-xl' : 'sm:max-w-md',
              ]"
            >
              <!-- Header -->
              <div v-if="title" class="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-2">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</DialogTitle>
                <button @click="emit('close')" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>

              <!-- Content (scrollable) -->
              <div class="px-5 pb-4 overflow-y-auto flex-1 min-h-0">
                <slot />
              </div>

              <!-- Footer (always visible, outside scroll) -->
              <div v-if="$slots.footer" class="flex-shrink-0 px-5 pb-5 pt-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 safe-bottom">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
