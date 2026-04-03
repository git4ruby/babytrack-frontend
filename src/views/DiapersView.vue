<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useDiapersStore } from '@/stores/diapers'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'
import ExportButton from '@/components/ui/ExportButton.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
const { confirm } = useConfirm()

const diapersStore = useDiapersStore()
const ui = useUiStore()

const rangePreset = ref('today')

const rangePresets = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '14 Days' },
]

const typeConfig = {
  wet: { icon: '💧', label: 'Wet', color: 'sky' },
  soiled: { icon: '💩', label: 'Soiled', color: 'amber' },
  both: { icon: '💧💩', label: 'Both', color: 'purple' },
  dry: { icon: '✅', label: 'Dry', color: 'gray' },
}

const dateRange = computed(() => {
  const today = dayjs()
  if (rangePreset.value === 'yesterday') {
    const y = today.subtract(1, 'day')
    return { from: y.format('YYYY-MM-DD'), to: y.format('YYYY-MM-DD') }
  }
  const map = { today: 0, '3d': 2, '7d': 6, '14d': 13 }
  const days = map[rangePreset.value] ?? 6
  return { from: today.subtract(days, 'day').format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') }
})

// Group by date (newest first)
const groupedChanges = computed(() => {
  const groups = {}
  for (const c of diapersStore.changes) {
    const date = dayjs(c.changed_at).format('YYYY-MM-DD')
    if (!groups[date]) groups[date] = []
    groups[date].push(c)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
})

function dateLabel(date) {
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  if (date === today) return 'Today'
  if (date === yesterday) return 'Yesterday'
  return dayjs(date).format('ddd, MMM D')
}

function dayStats(changes) {
  return {
    total: changes.length,
    wet: changes.filter(c => c.diaper_type === 'wet' || c.diaper_type === 'both').length,
    soiled: changes.filter(c => c.diaper_type === 'soiled' || c.diaper_type === 'both').length,
  }
}

// Chart
const chartData = computed(() => {
  const stats = diapersStore.stats
  if (!stats) return null
  const days = rangePreset.value === 'today' ? 0 : parseInt(rangePreset.value) - 1 || 6
  const labels = []
  const wetData = []
  const soiledData = []
  for (let i = days; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    labels.push(dayjs(d).format('MMM D'))
    wetData.push(stats.daily_wet[d] || 0)
    soiledData.push(stats.daily_soiled[d] || 0)
  }
  return {
    data: {
      labels,
      datasets: [
        { label: 'Wet', data: wetData, backgroundColor: 'rgba(14, 165, 233, 0.7)', borderRadius: 4 },
        { label: 'Soiled', data: soiledData, backgroundColor: 'rgba(245, 158, 11, 0.7)', borderRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  }
})

async function loadData() {
  await Promise.all([
    diapersStore.fetchChanges({ from: dateRange.value.from, to: dateRange.value.to, per_page: 200 }),
    diapersStore.fetchStats({ from: dateRange.value.from, to: dateRange.value.to }),
  ])
}

async function handleDelete(id) {
  const ok = await confirm({ title: 'Delete Diaper Change', message: 'Are you sure you want to delete this entry?', confirmLabel: 'Delete' })
  if (!ok) return
  await diapersStore.removeChange(id)
  ui.showToast('Deleted')
}

watch(dateRange, loadData)
onMounted(loadData)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Diapers</h1>
      <div class="flex items-center gap-2">
        <ExportButton type="diapers" :from="dateRange.from" :to="dateRange.to" />
        <BaseButton @click="ui.diaperModalOpen = true">
          <PlusIcon class="w-4 h-4" /> Log Change
        </BaseButton>
      </div>
    </div>

    <!-- Range picker -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="preset in rangePresets"
        :key="preset.value"
        @click="rangePreset = preset.value"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
          rangePreset === preset.value ? 'bg-slate-900 dark:bg-slate-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
        ]"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Stats cards -->
    <div v-if="diapersStore.stats" class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
        <p class="text-3xl font-black text-slate-800 dark:text-white">{{ diapersStore.stats.total_changes }}</p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase">Total</p>
      </div>
      <div class="bg-sky-50 dark:bg-sky-900/30 rounded-2xl p-4 border border-sky-100 dark:border-sky-800 text-center">
        <p class="text-3xl font-black text-sky-600">{{ diapersStore.stats.total_wet }}</p>
        <p class="text-xs font-medium text-sky-400 mt-1 uppercase">💧 Wet</p>
      </div>
      <div class="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-4 border border-amber-100 dark:border-amber-800 text-center">
        <p class="text-3xl font-black text-amber-600">{{ diapersStore.stats.total_soiled }}</p>
        <p class="text-xs font-medium text-amber-400 mt-1 uppercase">💩 Soiled</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
        <p class="text-3xl font-black text-indigo-600">{{ diapersStore.stats.avg_per_day }}</p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase">Avg/Day</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
        <p class="text-3xl font-black" :class="diapersStore.stats.rash_days > 0 ? 'text-red-500' : 'text-green-500'">{{ diapersStore.stats.rash_days }}</p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase">Rash Days</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="chartData && rangePreset !== 'today'" class="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
      <h3 class="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">Daily Diaper Counts</h3>
      <Bar :data="chartData.data" :options="chartData.options" />
    </div>

    <!-- Timeline -->
    <template v-if="groupedChanges.length > 0">
      <div v-for="[date, changes] in groupedChanges" :key="date" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-100 dark:border-slate-700">
          <span class="text-sm font-bold text-gray-800 dark:text-white">{{ dateLabel(date) }}</span>
          <div class="flex items-center gap-2 text-xs">
            <span class="font-bold text-gray-700 dark:text-slate-200">{{ dayStats(changes).total }} changes</span>
            <span class="text-sky-600 font-medium">💧{{ dayStats(changes).wet }}</span>
            <span class="text-amber-600 font-medium">💩{{ dayStats(changes).soiled }}</span>
          </div>
        </div>
        <div class="divide-y divide-gray-50 dark:divide-slate-700 px-4">
          <div v-for="c in changes" :key="c.id" class="flex items-center gap-3 py-3 group">
            <div :class="[
              'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg border',
              c.diaper_type === 'wet' ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-100 dark:border-sky-800' :
              c.diaper_type === 'soiled' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800' :
              c.diaper_type === 'both' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800' :
              'bg-gray-50 dark:bg-slate-700 border-gray-100 dark:border-slate-600'
            ]">
              {{ typeConfig[c.diaper_type]?.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span :class="[
                  'text-sm font-semibold',
                  c.diaper_type === 'wet' ? 'text-sky-700' :
                  c.diaper_type === 'soiled' ? 'text-amber-700' :
                  c.diaper_type === 'both' ? 'text-purple-700' : 'text-gray-700'
                ]">
                  {{ typeConfig[c.diaper_type]?.label }}
                </span>
                <span v-if="c.stool_color" class="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-md font-bold uppercase text-gray-600 dark:text-slate-300">{{ c.stool_color }}</span>
                <span v-if="c.consistency" class="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-md font-bold uppercase text-gray-600 dark:text-slate-300">{{ c.consistency }}</span>
                <span v-if="c.has_rash" class="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md font-bold uppercase">rash</span>
              </div>
              <p v-if="c.notes" class="text-xs text-gray-400 dark:text-slate-500 mt-0.5 italic">{{ c.notes }}</p>
            </div>
            <div class="flex-shrink-0 text-right">
              <p class="text-xs font-medium text-gray-400 dark:text-slate-500">{{ c.has_time ? dayjs(c.changed_at).format('h:mm A') : '' }}</p>
              <div class="flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition">
                <button @click="ui.openDiaperEdit(c)" class="p-0.5 text-gray-300 hover:text-blue-500" title="Edit">
                  <PencilIcon class="w-3.5 h-3.5" />
                </button>
                <button @click="handleDelete(c.id)" class="p-0.5 text-gray-300 hover:text-red-500" title="Delete">
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <EmptyState v-else-if="!diapersStore.loading" icon="🧷" title="No diaper changes logged" description="Track diaper changes to share with your pediatrician.">
      <BaseButton @click="ui.diaperModalOpen = true"><PlusIcon class="w-4 h-4" /> Log Change</BaseButton>
    </EmptyState>
  </div>
</template>
