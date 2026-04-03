<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { getFeedingAnalytics } from '@/api/feedings'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const range = ref('7')
const analytics = ref(null)
const loading = ref(false)

const ranges = [
  { value: '7', label: '7 Days' },
  { value: '14', label: '14 Days' },
  { value: '30', label: '30 Days' },
]

async function fetchAnalytics() {
  loading.value = true
  try {
    const from = dayjs().subtract(parseInt(range.value), 'day').format('YYYY-MM-DD')
    const to = dayjs().format('YYYY-MM-DD')
    const { data } = await getFeedingAnalytics({ from, to })
    analytics.value = data.data
  } finally {
    loading.value = false
  }
}

// Fill in missing dates with 0
function fillDates(dataMap) {
  const days = parseInt(range.value)
  const labels = []
  const values = []
  for (let i = days; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    labels.push(dayjs(date).format('MMM D'))
    values.push(dataMap[date] || 0)
  }
  return { labels, values }
}

const volumeChart = computed(() => {
  if (!analytics.value) return null
  const { labels, values } = fillDates(analytics.value.daily_totals)
  return {
    data: {
      labels,
      datasets: [{
        label: 'Volume (ml)',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'ml' } } },
    },
  }
})

const feedCountChart = computed(() => {
  if (!analytics.value) return null
  const { labels, values } = fillDates(analytics.value.daily_feed_counts)
  return {
    data: {
      labels,
      datasets: [{
        label: 'Feeds',
        data: values,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  }
})

const typeChart = computed(() => {
  if (!analytics.value) return null
  const bd = analytics.value.feed_type_breakdown
  return {
    data: {
      labels: ['Bottle', 'Breastfeed', 'Pump'],
      datasets: [{
        data: [bd.bottle || 0, bd.breastfeed || 0, bd.pump || 0],
        backgroundColor: ['#3B82F6', '#EC4899', '#8B5CF6'],
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
    },
  }
})

const gapChart = computed(() => {
  if (!analytics.value) return null
  const { labels, values } = fillDates(analytics.value.average_gap_by_day)
  return {
    data: {
      labels,
      datasets: [{
        label: 'Avg Gap (hrs)',
        data: values,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'hours' } } },
    },
  }
})

const breastBalance = computed(() => analytics.value?.breast_balance)

watch(range, fetchAnalytics)
onMounted(fetchAnalytics)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      <div class="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
        <button
          v-for="r in ranges"
          :key="r.value"
          @click="range = r.value"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-md transition',
            range === r.value ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
          ]"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <template v-else-if="analytics">
      <!-- Daily Volume -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <h3 class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">Daily Volume (ml)</h3>
        <Bar v-if="volumeChart" :data="volumeChart.data" :options="volumeChart.options" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Feed Type Breakdown -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <h3 class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">Feed Type Breakdown</h3>
          <div class="max-w-[250px] mx-auto">
            <Doughnut v-if="typeChart" :data="typeChart.data" :options="typeChart.options" />
          </div>
        </div>

        <!-- Breast Balance -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <h3 class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">Breast Balance</h3>
          <div v-if="breastBalance" class="space-y-4">
            <div class="flex justify-between text-sm">
              <span class="text-pink-600 font-medium">Left: {{ breastBalance.left }} min ({{ breastBalance.left_percent }}%)</span>
              <span class="text-purple-600 font-medium">Right: {{ breastBalance.right }} min ({{ breastBalance.right_percent }}%)</span>
            </div>
            <div class="flex h-6 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
              <div class="bg-pink-400 transition-all flex items-center justify-center text-xs text-white font-medium" :style="{ width: breastBalance.left_percent + '%' }">
                <span v-if="breastBalance.left_percent > 15">L</span>
              </div>
              <div class="bg-purple-400 transition-all flex items-center justify-center text-xs text-white font-medium" :style="{ width: breastBalance.right_percent + '%' }">
                <span v-if="breastBalance.right_percent > 15">R</span>
              </div>
            </div>
            <p v-if="breastBalance.left === 0 && breastBalance.right === 0" class="text-center text-sm text-gray-400 dark:text-slate-500">No breastfeeding data in this range</p>
          </div>
        </div>
      </div>

      <!-- Feeds Per Day -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <h3 class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">Feeds Per Day</h3>
        <Line v-if="feedCountChart" :data="feedCountChart.data" :options="feedCountChart.options" />
      </div>

      <!-- Average Gap -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <h3 class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">Average Gap Between Feeds (hours)</h3>
        <Line v-if="gapChart" :data="gapChart.data" :options="gapChart.options" />
      </div>
    </template>
  </div>
</template>
