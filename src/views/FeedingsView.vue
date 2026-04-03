<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { useFeedingsStore } from '@/stores/feedings'
import { useUiStore } from '@/stores/ui'
import FeedCard from '@/components/FeedCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'
import ExportButton from '@/components/ui/ExportButton.vue'

const feedingsStore = useFeedingsStore()
const ui = useUiStore()
const { confirm } = useConfirm()

// Date range
const rangePreset = ref('today')
const customFrom = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const customTo = ref(dayjs().format('YYYY-MM-DD'))
const selectedType = ref('')
const page = ref(1)

const rangePresets = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '14 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'custom', label: 'Custom' },
]

const typeFilters = [
  { value: '', label: 'All', icon: '' },
  { value: 'bottle', label: 'Bottle', icon: '🍼' },
  { value: 'breastfeed', label: 'Breast', icon: '🤱' },
  { value: 'pump', label: 'Pump', icon: '⚙️' },
]

const dateRange = computed(() => {
  const today = dayjs()
  switch (rangePreset.value) {
    case 'today': return { from: today.format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') }
    case 'yesterday': { const y = today.subtract(1, 'day'); return { from: y.format('YYYY-MM-DD'), to: y.format('YYYY-MM-DD') } }
    case '3d': return { from: today.subtract(2, 'day').format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') }
    case '7d': return { from: today.subtract(6, 'day').format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') }
    case '14d': return { from: today.subtract(13, 'day').format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') }
    case '30d': return { from: today.subtract(29, 'day').format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') }
    case 'custom': return { from: customFrom.value, to: customTo.value }
    default: return { from: today.subtract(6, 'day').format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') }
  }
})

// Group feedings by date (sorted newest first)
const sortedDates = computed(() => {
  const groups = {}
  for (const feed of feedingsStore.feedings) {
    const date = dayjs(feed.started_at).format('YYYY-MM-DD')
    if (!groups[date]) groups[date] = []
    groups[date].push(feed)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
})

const totalStats = computed(() => {
  const feeds = feedingsStore.feedings
  return {
    count: feeds.length,
    ml: feeds.reduce((s, f) => s + (f.volume_ml || 0), 0),
    bottles: feeds.filter(f => f.feed_type === 'bottle').length,
    breastfeeds: feeds.filter(f => f.feed_type === 'breastfeed').length,
    pumps: feeds.filter(f => f.feed_type === 'pump').length,
  }
})

function dateLabel(date) {
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  if (date === today) return 'Today'
  if (date === yesterday) return 'Yesterday'
  return dayjs(date).format('ddd, MMM D')
}

function dayTotal(feeds) {
  return feeds.reduce((sum, f) => sum + (f.volume_ml || 0), 0)
}

function dayBreastMin(feeds) {
  return feeds.filter(f => f.feed_type === 'breastfeed').reduce((s, f) => s + (f.duration_minutes || 0), 0)
}

async function loadFeedings() {
  const params = { from: dateRange.value.from, to: dateRange.value.to, page: page.value, per_page: 100 }
  if (selectedType.value) params.feed_type = selectedType.value
  await feedingsStore.fetchFeedings(params)
}

async function handleDelete(id) {
  const ok = await confirm({ title: 'Delete Feeding', message: 'Are you sure you want to delete this feeding entry?', confirmLabel: 'Delete' })
  if (!ok) return
  await feedingsStore.removeFeed(id)
  ui.showToast('Feeding deleted')
}

watch([dateRange, selectedType], () => {
  page.value = 1
  loadFeedings()
})

onMounted(loadFeedings)
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Feed Log</h1>
      <div class="flex items-center gap-2">
        <ExportButton type="feedings" :from="dateRange.from" :to="dateRange.to" />
        <BaseButton @click="ui.feedModalOpen = true">
          <PlusIcon class="w-4 h-4" />
          Log Feed
        </BaseButton>
      </div>
    </div>

    <!-- Date Range Selector -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in rangePresets"
          :key="preset.value"
          @click="rangePreset = preset.value"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
            rangePreset === preset.value
              ? 'bg-slate-900 dark:bg-slate-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          ]"
        >
          {{ preset.label }}
        </button>
      </div>
      <!-- Custom date inputs -->
      <div v-if="rangePreset === 'custom'" class="flex items-center gap-3 mt-3">
        <input v-model="customFrom" type="date" class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" />
        <span class="text-gray-400 dark:text-slate-500 text-sm">to</span>
        <input v-model="customTo" type="date" class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" />
      </div>
    </div>

    <!-- Filters + Summary Bar -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <!-- Type filters -->
      <div class="flex gap-1.5">
        <button
          v-for="filter in typeFilters"
          :key="filter.value"
          @click="selectedType = filter.value"
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-full transition-all',
            selectedType === filter.value
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-blue-300 hover:text-blue-600'
          ]"
        >
          <span v-if="filter.icon">{{ filter.icon }} </span>{{ filter.label }}
        </button>
      </div>

      <!-- Range summary -->
      <div v-if="!feedingsStore.loading && feedingsStore.feedings.length" class="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
        <span class="font-semibold text-gray-700 dark:text-slate-200">{{ totalStats.count }} feeds</span>
        <span>{{ totalStats.ml }}ml total</span>
        <span class="hidden sm:inline">🍼{{ totalStats.bottles }} 🤱{{ totalStats.breastfeeds }} ⚙️{{ totalStats.pumps }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="feedingsStore.loading" class="text-center py-16">
      <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-sm text-gray-400 mt-3">Loading feeds...</p>
    </div>

    <!-- Feed list grouped by date -->
    <template v-else-if="sortedDates.length > 0">
      <div v-for="[date, feeds] in sortedDates" :key="date" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <!-- Day header -->
        <div class="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-100 dark:border-slate-700">
          <span class="text-sm font-bold text-gray-800 dark:text-white">{{ dateLabel(date) }}</span>
          <div class="flex items-center gap-3 text-xs">
            <span class="text-gray-500 dark:text-slate-400">{{ feeds.length }} feeds</span>
            <span v-if="dayTotal(feeds)" class="font-bold text-blue-600">{{ dayTotal(feeds) }}ml</span>
            <span v-if="dayBreastMin(feeds)" class="font-medium text-pink-600">{{ dayBreastMin(feeds) }}min 🤱</span>
          </div>
        </div>

        <!-- Feed cards -->
        <div class="divide-y divide-gray-50 dark:divide-slate-700 px-4">
          <FeedCard
            v-for="feed in feeds"
            :key="feed.id"
            :feeding="feed"
            @edit="(f) => ui.openFeedEdit(f)"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="feedingsStore.meta.total_pages > 1" class="flex justify-center items-center gap-3 py-4">
        <BaseButton variant="secondary" size="sm" :disabled="page <= 1" @click="page--; loadFeedings()">Previous</BaseButton>
        <span class="text-sm text-gray-400 dark:text-slate-500">{{ feedingsStore.meta.current_page }} / {{ feedingsStore.meta.total_pages }}</span>
        <BaseButton variant="secondary" size="sm" :disabled="page >= feedingsStore.meta.total_pages" @click="page++; loadFeedings()">Next</BaseButton>
      </div>
    </template>

    <!-- Empty state -->
    <EmptyState v-else icon="🍼" title="No feedings found" description="No feeds in this date range. Try a different range or log a new feed.">
      <BaseButton @click="ui.feedModalOpen = true">
        <PlusIcon class="w-4 h-4" />
        Log Feed
      </BaseButton>
    </EmptyState>
  </div>
</template>
