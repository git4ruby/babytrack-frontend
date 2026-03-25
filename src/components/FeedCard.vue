<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  feeding: { type: Object, required: true },
})

const emit = defineEmits(['delete'])

const typeConfig = {
  bottle: { icon: '🍼', color: 'blue', label: 'Bottle' },
  breastfeed: { icon: '🤱', color: 'pink', label: 'Breastfeed' },
  pump: { icon: '⚙️', color: 'purple', label: 'Pump' },
}

const config = computed(() => typeConfig[props.feeding.feed_type] || typeConfig.bottle)
const time = computed(() => dayjs(props.feeding.started_at).format('h:mm A'))

const detail = computed(() => {
  const f = props.feeding
  if (f.feed_type === 'bottle' || f.feed_type === 'pump') {
    let text = `${f.volume_ml}ml`
    if (f.milk_type === 'formula') text += ' formula'
    else if (f.milk_type === 'breast_milk') text += ' breast milk'
    if (f.formula_brand) text += ` (${f.formula_brand})`
    return text
  }
  if (f.feed_type === 'breastfeed') {
    let text = `${f.breast_side} side`
    if (f.duration_minutes) text += ` · ${f.duration_minutes} min`
    return text
  }
  return ''
})
</script>

<template>
  <div class="flex items-start gap-3 py-3 group">
    <!-- Type icon -->
    <div :class="[
      'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg',
      `bg-${config.color}-50`
    ]">
      {{ config.icon }}
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-900">{{ config.label }}</span>
        <span v-if="feeding.session_group" class="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">combo</span>
      </div>
      <p class="text-sm text-gray-600 mt-0.5">{{ detail }}</p>
      <p v-if="feeding.notes" class="text-xs text-gray-400 mt-0.5 italic">{{ feeding.notes }}</p>
    </div>

    <!-- Time + actions -->
    <div class="flex-shrink-0 text-right">
      <p class="text-sm font-medium text-gray-500">{{ time }}</p>
      <button
        @click="emit('delete', feeding.id)"
        class="mt-1 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
        title="Delete"
      >
        <TrashIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
