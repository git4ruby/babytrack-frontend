<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { useFeedingsStore } from '@/stores/feedings'
import { useUiStore } from '@/stores/ui'
import FeedCard from '@/components/FeedCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const feedingsStore = useFeedingsStore()
const ui = useUiStore()

const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const selectedType = ref('')
const page = ref(1)

const typeFilters = [
  { value: '', label: 'All' },
  { value: 'bottle', label: '🍼 Bottle' },
  { value: 'breastfeed', label: '🤱 Breast' },
  { value: 'pump', label: '⚙️ Pump' },
]

// Group feedings by date
const groupedFeedings = computed(() => {
  const groups = {}
  for (const feed of feedingsStore.feedings) {
    const date = dayjs(feed.started_at).format('YYYY-MM-DD')
    if (!groups[date]) groups[date] = []
    groups[date].push(feed)
  }
  return groups
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

async function loadFeedings() {
  const params = { date: selectedDate.value, page: page.value }
  if (selectedType.value) params.feed_type = selectedType.value
  await feedingsStore.fetchFeedings(params)
}

async function handleDelete(id) {
  if (!confirm('Delete this feeding?')) return
  await feedingsStore.removeFeed(id)
  ui.showToast('Feeding deleted')
}

function changeDate(offset) {
  selectedDate.value = dayjs(selectedDate.value).add(offset, 'day').format('YYYY-MM-DD')
}

watch([selectedDate, selectedType], () => {
  page.value = 1
  loadFeedings()
})

onMounted(loadFeedings)
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Feed Log</h1>
      <BaseButton @click="ui.feedModalOpen = true">
        <PlusIcon class="w-4 h-4" />
        Log Feed
      </BaseButton>
    </div>

    <!-- Date nav -->
    <div class="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <button @click="changeDate(-1)" class="px-3 py-1 text-sm text-gray-600 hover:text-blue-600 font-medium">← Prev</button>
      <input
        v-model="selectedDate"
        type="date"
        class="text-sm font-medium text-gray-900 border-none bg-transparent text-center focus:outline-none cursor-pointer"
      />
      <button
        @click="changeDate(1)"
        :disabled="selectedDate >= dayjs().format('YYYY-MM-DD')"
        class="px-3 py-1 text-sm text-gray-600 hover:text-blue-600 font-medium disabled:text-gray-300"
      >
        Next →
      </button>
    </div>

    <!-- Type filters -->
    <div class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="filter in typeFilters"
        :key="filter.value"
        @click="selectedType = filter.value"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition',
          selectedType === filter.value
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
        ]"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="feedingsStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <!-- Feed list grouped by date -->
    <template v-else-if="feedingsStore.feedings.length > 0">
      <div v-for="(feeds, date) in groupedFeedings" :key="date" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Day header -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span class="text-sm font-semibold text-gray-700">{{ dateLabel(date) }}</span>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span>{{ feeds.length }} feeds</span>
            <span v-if="dayTotal(feeds) > 0" class="font-medium text-gray-700">{{ dayTotal(feeds) }}ml</span>
          </div>
        </div>

        <!-- Feed cards -->
        <div class="divide-y divide-gray-50 px-4">
          <FeedCard
            v-for="feed in feeds"
            :key="feed.id"
            :feeding="feed"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="feedingsStore.meta.total_pages > 1" class="flex justify-center items-center gap-2 pt-2">
        <BaseButton variant="secondary" size="sm" :disabled="page <= 1" @click="page--; loadFeedings()">Previous</BaseButton>
        <span class="text-sm text-gray-500 px-2">Page {{ feedingsStore.meta.current_page }} of {{ feedingsStore.meta.total_pages }}</span>
        <BaseButton variant="secondary" size="sm" :disabled="page >= feedingsStore.meta.total_pages" @click="page++; loadFeedings()">Next</BaseButton>
      </div>
    </template>

    <!-- Empty state -->
    <EmptyState v-else icon="🍼" title="No feedings yet" description="Log your first feeding to start tracking.">
      <BaseButton @click="ui.feedModalOpen = true">
        <PlusIcon class="w-4 h-4" />
        Log Feed
      </BaseButton>
    </EmptyState>
  </div>
</template>
