<script setup>
import { useFeedingsStore } from '@/stores/feedings'

const feedingsStore = useFeedingsStore()
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Feed Log</h1>

    <div class="bg-white rounded-xl shadow-sm border p-6">
      <p class="text-gray-500">Feed timeline coming in Phase 5</p>
    </div>

    <div v-if="feedingsStore.feedings?.length" class="bg-white rounded-xl shadow-sm border p-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Recent Feedings</h2>
      <ul class="space-y-2">
        <li
          v-for="feeding in feedingsStore.feedings"
          :key="feeding.id"
          class="text-sm text-gray-600 border-b border-gray-100 pb-2 last:border-0"
        >
          {{ feeding.type }} &mdash; {{ feeding.amount ?? 'N/A' }}
        </li>
      </ul>
    </div>
  </div>
</template>
