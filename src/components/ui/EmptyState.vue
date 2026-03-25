<script setup>
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div v-if="icon" class="text-4xl mb-3">{{ icon }}</div>
    <h3 class="text-sm font-medium text-gray-900">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-500 mt-1 max-w-xs">{{ description }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
