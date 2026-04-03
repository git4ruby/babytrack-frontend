<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  feeding: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete'])

const typeConfig = {
  bottle: { icon: '🍼', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Bottle', accent: 'text-blue-700' },
  breastfeed: { icon: '🤱', bg: 'bg-pink-50', border: 'border-pink-100', label: 'Breastfeed', accent: 'text-pink-700' },
  pump: { icon: '⚙️', bg: 'bg-purple-50', border: 'border-purple-100', label: 'Pump', accent: 'text-purple-700' },
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

const volumeBadge = computed(() => {
  const f = props.feeding
  if (f.volume_ml) return `${f.volume_ml}ml`
  if (f.duration_minutes) return `${f.duration_minutes}m`
  return null
})
</script>

<template>
  <div class="flex items-center gap-3 py-3 group cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 -mx-4 px-4 rounded-lg transition" @click="emit('edit', feeding)">
    <div :class="['flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl border', config.bg, config.border]">
      {{ config.icon }}
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span :class="['text-sm font-semibold', config.accent]">{{ config.label }}</span>
        <span v-if="feeding.session_group" class="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md font-bold uppercase tracking-wide">combo</span>
        <span v-if="feeding.milk_type === 'formula'" class="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-md font-bold uppercase tracking-wide">formula</span>
      </div>
      <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5 capitalize">{{ detail }}</p>
      <p v-if="feeding.notes" class="text-xs text-gray-400 dark:text-slate-500 mt-0.5 italic">{{ feeding.notes }}</p>
    </div>

    <div class="flex-shrink-0 flex items-center gap-3">
      <span v-if="volumeBadge" :class="['text-sm font-bold px-2.5 py-1 rounded-lg', config.bg, config.accent]">
        {{ volumeBadge }}
      </span>
      <div class="text-right">
        <p class="text-xs font-medium text-gray-400 dark:text-slate-500">{{ time }}</p>
        <div class="flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition">
          <button @click.stop="emit('edit', feeding)" class="p-0.5 text-gray-300 hover:text-blue-500" title="Edit">
            <PencilIcon class="w-3.5 h-3.5" />
          </button>
          <button @click.stop="emit('delete', feeding.id)" class="p-0.5 text-gray-300 hover:text-red-500" title="Delete">
            <TrashIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
