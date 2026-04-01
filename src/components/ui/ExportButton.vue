<script setup>
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  type: { type: String, required: true }, // feedings, diapers, weight, all
  from: { type: String, default: '' },
  to: { type: String, default: '' },
})

function download() {
  const token = localStorage.getItem('bt_token')
  const babyId = localStorage.getItem('bt_baby_id')
  let url = `/api/v1/exports/${props.type}?baby_id=${babyId}&token=${token}`
  if (props.from) url += `&from=${props.from}`
  if (props.to) url += `&to=${props.to}`
  window.open(url, '_blank')
}
</script>

<template>
  <button
    @click="download"
    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition"
    title="Export CSV"
  >
    <ArrowDownTrayIcon class="w-3.5 h-3.5" />
    Export
  </button>
</template>
