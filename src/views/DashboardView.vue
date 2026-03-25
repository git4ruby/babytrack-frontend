<script setup>
import { ref, onMounted, computed } from 'vue'
import { useFeedingsStore } from '@/stores/feedings'
import { useBabyStore } from '@/stores/baby'
import { useMilkStore } from '@/stores/milk'
import { useUiStore } from '@/stores/ui'
import { useTimeSince } from '@/composables/useTimeSince'
import { getUpcomingVaccinations } from '@/api/vaccinations'
import { getNextAppointment } from '@/api/appointments'
import { getFeedingAnalytics } from '@/api/feedings'
import dayjs from 'dayjs'

const feedingsStore = useFeedingsStore()
const babyStore = useBabyStore()
const milkStore = useMilkStore()
const ui = useUiStore()

const today = dayjs().format('YYYY-MM-DD')
const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

const lastFeedTime = computed(() => feedingsStore.lastFeeding?.started_at || null)
const { label: gapLabel, urgency } = useTimeSince(lastFeedTime)

const summary = computed(() => feedingsStore.todaySummary)
const inventory = computed(() => milkStore.inventory)
const upcomingVaccines = ref([])
const nextAppointment = ref(null)
const weeklyTotals = ref({})

// If today has no feeds, show that explicitly but still load data
const hasDataToday = computed(() => summary.value && summary.value.total_feeds > 0)
const summaryLabel = computed(() => hasDataToday.value ? 'Today' : 'Today (no feeds yet)')

onMounted(async () => {
  await Promise.all([
    feedingsStore.fetchLastFeeding(),
    feedingsStore.fetchSummary(today),
    milkStore.fetchInventory(),
    getUpcomingVaccinations().then(r => { upcomingVaccines.value = r.data.data?.slice(0, 4) || [] }).catch(() => {}),
    getNextAppointment().then(r => { nextAppointment.value = r.data.data }).catch(() => {}),
    getFeedingAnalytics({ from: dayjs().subtract(6, 'day').format('YYYY-MM-DD'), to: today }).then(r => {
      weeklyTotals.value = r.data.data?.daily_totals || {}
    }).catch(() => {}),
  ])
})

// Mini sparkline data for last 7 days
const sparkData = computed(() => {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    data.push({ date: d, ml: weeklyTotals.value[d] || 0, label: dayjs(d).format('dd') })
  }
  return data
})
const sparkMax = computed(() => Math.max(...sparkData.value.map(d => d.ml), 1))
</script>

<template>
  <div class="space-y-5 max-w-4xl">
    <!-- Welcome + Gap Timer -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Gap Timer Card -->
      <div :class="[
        'rounded-2xl p-6 text-white relative overflow-hidden',
        urgency === 'alert'
          ? 'bg-gradient-to-br from-red-500 to-rose-600'
          : urgency === 'warning'
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
      ]">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
        <p class="text-sm font-medium text-white/70">Time since last feed</p>
        <p class="text-4xl font-black mt-2 tracking-tight">{{ gapLabel }}</p>
        <div v-if="feedingsStore.lastFeeding" class="mt-3 flex items-center gap-2">
          <span class="text-xs bg-white/20 px-2 py-1 rounded-full capitalize">{{ feedingsStore.lastFeeding.feed_type }}</span>
          <span v-if="feedingsStore.lastFeeding.volume_ml" class="text-sm text-white/80">{{ feedingsStore.lastFeeding.volume_ml }}ml</span>
          <span v-if="feedingsStore.lastFeeding.breast_side" class="text-sm text-white/80 capitalize">{{ feedingsStore.lastFeeding.breast_side }}</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm font-medium text-gray-500 mb-4">Quick Actions</p>
        <div class="grid grid-cols-2 gap-3">
          <button @click="ui.feedModalOpen = true" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition group">
            <span class="text-2xl group-hover:scale-110 transition-transform">🍼</span>
            <span class="text-xs font-semibold text-blue-700">Log Feed</span>
          </button>
          <button @click="ui.milkModalOpen = true" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition group">
            <span class="text-2xl group-hover:scale-110 transition-transform">🧊</span>
            <span class="text-xs font-semibold text-indigo-700">Store Milk</span>
          </button>
          <router-link to="/weight" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition group">
            <span class="text-2xl group-hover:scale-110 transition-transform">⚖️</span>
            <span class="text-xs font-semibold text-emerald-700">Log Weight</span>
          </router-link>
          <router-link to="/appointments" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition group">
            <span class="text-2xl group-hover:scale-110 transition-transform">📅</span>
            <span class="text-xs font-semibold text-amber-700">Appointments</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Today's Stats -->
    <div v-if="summary" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900">{{ summaryLabel }}</h3>
        <router-link to="/feedings" class="text-xs text-blue-600 hover:text-blue-700 font-medium">View Feed Log</router-link>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center p-3 rounded-xl bg-slate-50">
          <p class="text-3xl font-black text-slate-800">{{ summary.total_feeds }}</p>
          <p class="text-xs text-slate-500 mt-1">Feeds</p>
        </div>
        <div class="text-center p-3 rounded-xl bg-blue-50">
          <p class="text-3xl font-black text-blue-700">{{ summary.total_ml }}</p>
          <p class="text-xs text-blue-500 mt-1">Total ml</p>
        </div>
        <div class="text-center p-3 rounded-xl bg-pink-50">
          <p class="text-3xl font-black text-pink-700">{{ summary.breast_duration_minutes?.total || 0 }}</p>
          <p class="text-xs text-pink-500 mt-1">Breast min</p>
        </div>
        <div class="text-center p-3 rounded-xl bg-amber-50">
          <p class="text-3xl font-black text-amber-700">{{ summary.average_gap_hours }}</p>
          <p class="text-xs text-amber-500 mt-1">Avg gap (hrs)</p>
        </div>
      </div>

      <!-- Type breakdown chips -->
      <div class="flex items-center gap-3 mt-4 justify-center">
        <span class="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">🍼 {{ summary.feeds_by_type?.bottle || 0 }} bottles</span>
        <span class="inline-flex items-center gap-1.5 text-xs font-medium text-pink-700 bg-pink-100 px-3 py-1.5 rounded-full">🤱 {{ summary.feeds_by_type?.breastfeed || 0 }} breast</span>
        <span class="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">⚙️ {{ summary.feeds_by_type?.pump || 0 }} pump</span>
      </div>

      <!-- Breast Balance -->
      <div v-if="summary.breast_balance && (summary.breast_balance.left_percent > 0 || summary.breast_balance.right_percent > 0)" class="mt-4">
        <div class="flex h-4 rounded-full overflow-hidden bg-gray-100">
          <div class="bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold transition-all" :style="{ width: summary.breast_balance.left_percent + '%' }">
            <span v-if="summary.breast_balance.left_percent > 20">L {{ summary.breast_balance.left_percent }}%</span>
          </div>
          <div class="bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold transition-all" :style="{ width: summary.breast_balance.right_percent + '%' }">
            <span v-if="summary.breast_balance.right_percent > 20">R {{ summary.breast_balance.right_percent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Mini Chart -->
    <div v-if="Object.keys(weeklyTotals).length" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900">Last 7 Days</h3>
        <router-link to="/analytics" class="text-xs text-blue-600 hover:text-blue-700 font-medium">Full Analytics</router-link>
      </div>
      <div class="flex items-end gap-2 h-24">
        <div v-for="d in sparkData" :key="d.date" class="flex-1 flex flex-col items-center gap-1">
          <span class="text-[10px] text-gray-400 font-medium">{{ d.ml || '' }}</span>
          <div
            class="w-full rounded-t-md transition-all bg-gradient-to-t from-blue-500 to-sky-400"
            :style="{ height: Math.max((d.ml / sparkMax) * 72, 4) + 'px' }"
          ></div>
          <span class="text-[10px] text-gray-400">{{ d.label }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Milk Inventory -->
      <div v-if="inventory" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">Milk Inventory</h3>
          <router-link to="/milk-storage" class="text-xs text-blue-600 hover:text-blue-700 font-medium">Manage</router-link>
        </div>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-xl">🌡️</span>
            <div class="flex-1">
              <div class="flex justify-between text-sm"><span class="text-gray-600">Room Temp</span><span class="font-bold text-gray-900">{{ inventory.by_storage_type?.room_temp?.total_ml || 0 }}ml</span></div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xl">❄️</span>
            <div class="flex-1">
              <div class="flex justify-between text-sm"><span class="text-gray-600">Fridge</span><span class="font-bold text-gray-900">{{ inventory.by_storage_type?.fridge?.total_ml || 0 }}ml</span></div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xl">🧊</span>
            <div class="flex-1">
              <div class="flex justify-between text-sm"><span class="text-gray-600">Freezer</span><span class="font-bold text-gray-900">{{ inventory.by_storage_type?.freezer?.total_ml || 0 }}ml</span></div>
            </div>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100 text-center">
          <span class="text-sm font-bold text-gray-900">{{ inventory.summary?.total_ml || 0 }}ml</span>
          <span class="text-xs text-gray-400"> total</span>
        </div>
        <p v-if="inventory.expiring_soon?.count > 0" class="text-xs text-amber-600 text-center mt-1 font-medium">⚠️ {{ inventory.expiring_soon.count }} expiring soon</p>
      </div>

      <!-- Upcoming -->
      <div class="space-y-4">
        <!-- Next Appointment -->
        <div v-if="nextAppointment" class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold text-amber-900">Next Appointment</h3>
            <router-link to="/appointments" class="text-xs text-amber-600 font-medium">View all</router-link>
          </div>
          <p class="font-semibold text-gray-900">{{ nextAppointment.title }}</p>
          <p class="text-sm text-gray-600 mt-1">📅 {{ dayjs(nextAppointment.scheduled_at).format('ddd, MMM D · h:mm A') }}</p>
          <p v-if="nextAppointment.provider_name" class="text-xs text-gray-500 mt-1">{{ nextAppointment.provider_name }} · {{ nextAppointment.location }}</p>
        </div>

        <!-- Upcoming Vaccines -->
        <div v-if="upcomingVaccines.length" class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-emerald-900">Upcoming Vaccines</h3>
            <router-link to="/vaccinations" class="text-xs text-emerald-600 font-medium">View all</router-link>
          </div>
          <div class="space-y-2">
            <div v-for="vax in upcomingVaccines" :key="vax.id" class="flex items-center justify-between">
              <span class="text-sm text-gray-700">{{ vax.vaccine_name }}</span>
              <span :class="['text-[10px] px-2 py-0.5 rounded-full font-bold', vax.overdue ? 'bg-red-100 text-red-700' : vax.due_soon ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600']">
                {{ vax.recommended_date ? dayjs(vax.recommended_date).format('MMM D') : 'TBD' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
