<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  variant: { type: String, default: 'danger' }, // danger or primary
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :open="open" :title="title" size="sm" @close="emit('cancel')">
    <div class="mt-1">
      <p class="text-sm text-gray-600">{{ message }}</p>

      <div class="flex gap-3 mt-6">
        <BaseButton variant="secondary" block @click="emit('cancel')">{{ cancelLabel }}</BaseButton>
        <BaseButton :variant="variant" block :loading="loading" @click="emit('confirm')">{{ confirmLabel }}</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
