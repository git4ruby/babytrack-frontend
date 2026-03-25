<script setup>
import { useMilkStore } from '@/stores/milk'

const milkStore = useMilkStore()
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Milk Storage</h1>

    <div class="bg-white rounded-xl shadow-sm border p-6">
      <p class="text-gray-500">Milk inventory management coming in Phase 5</p>
    </div>

    <div v-if="milkStore.totals" class="bg-white rounded-xl shadow-sm border p-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Inventory Totals</h2>
      <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div v-for="(value, label) in milkStore.totals" :key="label">
          <span class="font-medium text-gray-700">{{ label }}:</span> {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>
