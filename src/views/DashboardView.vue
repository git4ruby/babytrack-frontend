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
import { getDiaperSummary } from '@/api/diapers'
import dayjs from 'dayjs'

const feedingsStore = useFeedingsStore()
const babyStore = useBabyStore()
const milkStore = useMilkStore()
const ui = useUiStore()

const today = dayjs().format('YYYY-MM-DD')

const lastFeedTime = computed(() => feedingsStore.lastFeeding?.started_at || null)
const { label: gapLabel, urgency } = useTimeSince(lastFeedTime)

const summary = computed(() => feedingsStore.todaySummary)
const inventory = computed(() => milkStore.inventory)
const upcomingVaccines = ref([])
const nextAppointment = ref(null)
const weeklyTotals = ref({})
const diaperSummary = ref(null)

const hasDataToday = computed(() => summary.value && summary.value.total_feeds > 0)

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
    getDiaperSummary({ date: today }).then(r => { diaperSummary.value = r.data.data }).catch(() => {}),
  ])
})

const sparkData = computed(() => {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    data.push({ date: d, ml: weeklyTotals.value[d] || 0, label: dayjs(d).format('dd')[0] })
  }
  return data
})
const sparkMax = computed(() => Math.max(...sparkData.value.map(d => d.ml), 1))
</script>

<template>
  <div class="space-y-6">
    <!-- Top row: Gap timer (wide) + Quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Gap Timer — spans 2 cols -->
      <div :class="[
        'lg:col-span-2 rounded-2xl p-7 text-white relative overflow-hidden min-h-[160px] flex flex-col justify-between',
        urgency === 'alert'
          ? 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600'
          : urgency === 'warning'
            ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500'
            : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600'
      ]">
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div class="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full"></div>
        <div class="absolute top-6 right-6 w-16 h-16 bg-white/5 rounded-full"></div>
        <div>
          <p class="text-sm font-medium text-white/60 uppercase tracking-wider">Time since last feed</p>
          <p class="text-5xl font-black mt-1 tracking-tight">{{ gapLabel }}</p>
        </div>
        <div v-if="feedingsStore.lastFeeding" class="flex items-center gap-2 mt-4">
          <span class="text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-full capitalize font-medium">{{ feedingsStore.lastFeeding.feed_type }}</span>
          <span v-if="feedingsStore.lastFeeding.volume_ml" class="text-sm text-white/80 font-medium">{{ feedingsStore.lastFeeding.volume_ml }}ml</span>
          <span v-if="feedingsStore.lastFeeding.breast_side" class="text-sm text-white/80 capitalize font-medium">{{ feedingsStore.lastFeeding.breast_side }}</span>
          <span class="text-xs text-white/50 ml-auto">{{ dayjs(feedingsStore.lastFeeding.started_at).format('h:mm A') }}</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
        <div class="grid grid-cols-2 gap-2 flex-1">
          <button @click="ui.feedModalOpen = true" class="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition group">
            <span class="text-2xl group-hover:scale-110 transition-transform">🍼</span>
            <span class="text-[11px] font-bold text-blue-700">Log Feed</span>
          </button>
          <button @click="ui.milkModalOpen = true" class="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition group">
            <span class="text-2xl group-hover:scale-110 transition-transform">🧊</span>
            <span class="text-[11px] font-bold text-indigo-700">Store Milk</span>
          </button>
          <button @click="ui.diaperModalOpen = true" class="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 transition group">
            <span class="text-2xl group-hover:scale-110 transition-transform">🧷</span>
            <span class="text-[11px] font-bold text-cyan-700">Diaper</span>
          </button>
          <router-link to="/weight" class="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition group">
            <span class="text-2xl group-hover:scale-110 transition-transform">⚖️</span>
            <span class="text-[11px] font-bold text-emerald-700">Weight</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div v-if="summary" class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
        <p class="text-4xl font-black text-slate-800">{{ summary.total_feeds }}</p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">Feeds Today</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
        <p class="text-4xl font-black text-blue-600">{{ summary.total_ml }}<span class="text-lg font-bold text-blue-300">ml</span></p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">Volume</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
        <p class="text-4xl font-black text-pink-600">{{ summary.breast_duration_minutes?.total || 0 }}<span class="text-lg font-bold text-pink-300">m</span></p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">Breast Time</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
        <p class="text-4xl font-black text-amber-600">{{ summary.average_gap_hours }}<span class="text-lg font-bold text-amber-300">h</span></p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">Avg Gap</p>
      </div>
      <router-link to="/diapers" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:border-cyan-200 transition">
        <p class="text-4xl font-black text-cyan-600">{{ diaperSummary?.total || 0 }}</p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">🧷 Diapers</p>
        <p v-if="diaperSummary && diaperSummary.total > 0" class="text-[10px] text-gray-400 mt-0.5">💧{{ diaperSummary.wet }} 💩{{ diaperSummary.soiled }}</p>
      </router-link>
    </div>

    <!-- Middle row: Weekly chart + Type breakdown + Breast balance -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Weekly mini chart -->
      <div v-if="Object.keys(weeklyTotals).length" class="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Last 7 Days — Daily Volume</h3>
          <router-link to="/analytics" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">Full Analytics →</router-link>
        </div>
        <div class="flex items-end gap-3 h-28">
          <div v-for="(d, i) in sparkData" :key="d.date" class="flex-1 flex flex-col items-center gap-1">
            <span class="text-[10px] font-bold text-gray-500">{{ d.ml || '' }}</span>
            <div
              :class="[
                'w-full rounded-lg transition-all',
                i === sparkData.length - 1
                  ? 'bg-gradient-to-t from-blue-600 to-sky-400'
                  : 'bg-gradient-to-t from-blue-200 to-blue-100'
              ]"
              :style="{ height: Math.max((d.ml / sparkMax) * 80, 6) + 'px' }"
            ></div>
            <span :class="['text-[11px] font-bold', i === sparkData.length - 1 ? 'text-blue-600' : 'text-gray-400']">{{ d.label }}</span>
          </div>
        </div>
      </div>

      <!-- Feed type + balance -->
      <div v-if="summary" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Today's Mix</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">🍼 Bottles</span>
            <span class="text-sm font-black text-blue-600">{{ summary.feeds_by_type?.bottle || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">🤱 Breastfeed</span>
            <span class="text-sm font-black text-pink-600">{{ summary.feeds_by_type?.breastfeed || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">⚙️ Pump</span>
            <span class="text-sm font-black text-purple-600">{{ summary.feeds_by_type?.pump || 0 }}</span>
          </div>
        </div>
        <!-- Breast Balance -->
        <div v-if="summary.breast_balance && (summary.breast_balance.left_percent > 0 || summary.breast_balance.right_percent > 0)" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Breast Balance</p>
          <div class="flex h-5 rounded-full overflow-hidden bg-gray-100">
            <div class="bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold" :style="{ width: summary.breast_balance.left_percent + '%' }">
              <span v-if="summary.breast_balance.left_percent > 20">L</span>
            </div>
            <div class="bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold" :style="{ width: summary.breast_balance.right_percent + '%' }">
              <span v-if="summary.breast_balance.right_percent > 20">R</span>
            </div>
          </div>
          <div class="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
            <span>Left {{ summary.breast_balance.left_percent }}%</span>
            <span>Right {{ summary.breast_balance.right_percent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom row: Milk + Appointment + Vaccines -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Milk Inventory -->
      <div v-if="inventory" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Milk Inventory</h3>
          <router-link to="/milk-storage" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">Manage →</router-link>
        </div>
        <div class="space-y-2.5">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-orange-50">
            <span class="text-sm">🌡️ Room Temp</span>
            <span class="text-sm font-black text-orange-600">{{ inventory.by_storage_type?.room_temp?.total_ml || 0 }}ml</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-sky-50">
            <span class="text-sm">❄️ Fridge</span>
            <span class="text-sm font-black text-sky-600">{{ inventory.by_storage_type?.fridge?.total_ml || 0 }}ml</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50">
            <span class="text-sm">🧊 Freezer</span>
            <span class="text-sm font-black text-indigo-600">{{ inventory.by_storage_type?.freezer?.total_ml || 0 }}ml</span>
          </div>
        </div>
        <div class="mt-3 text-center">
          <span class="text-lg font-black text-gray-800">{{ inventory.summary?.total_ml || 0 }}ml</span>
          <span class="text-xs text-gray-400"> total</span>
        </div>
        <p v-if="inventory.expiring_soon?.count > 0" class="text-xs text-amber-600 text-center mt-1 font-bold">⚠ {{ inventory.expiring_soon.count }} expiring soon</p>
      </div>

      <!-- Next Appointment -->
      <div v-if="nextAppointment" class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/50">
        <h3 class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">Next Appointment</h3>
        <p class="font-bold text-gray-900 text-lg">{{ nextAppointment.title }}</p>
        <p class="text-sm text-gray-600 mt-2">📅 {{ dayjs(nextAppointment.scheduled_at).format('ddd, MMM D · h:mm A') }}</p>
        <p v-if="nextAppointment.provider_name" class="text-xs text-gray-500 mt-1">👨‍⚕️ {{ nextAppointment.provider_name }}</p>
        <p v-if="nextAppointment.location" class="text-xs text-gray-500">📍 {{ nextAppointment.location }}</p>
        <router-link to="/appointments" class="inline-block mt-3 text-xs text-amber-600 font-semibold hover:text-amber-700">View all →</router-link>
      </div>
      <div v-else class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <span class="text-3xl mb-2">📅</span>
        <p class="text-sm text-gray-400">No upcoming appointments</p>
        <router-link to="/appointments" class="text-xs text-blue-600 font-semibold mt-2">Schedule one →</router-link>
      </div>

      <!-- Upcoming Vaccines -->
      <div v-if="upcomingVaccines.length" class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/50">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-bold text-emerald-500 uppercase tracking-wider">Upcoming Vaccines</h3>
          <router-link to="/vaccinations" class="text-xs text-emerald-600 font-semibold">View all →</router-link>
        </div>
        <div class="space-y-2">
          <div v-for="vax in upcomingVaccines" :key="vax.id" class="flex items-center justify-between bg-white/60 rounded-lg p-2">
            <span class="text-xs text-gray-700 font-medium">{{ vax.vaccine_name }}</span>
            <span :class="['text-[10px] px-2 py-0.5 rounded-full font-bold', vax.overdue ? 'bg-red-100 text-red-700' : vax.due_soon ? 'bg-amber-100 text-amber-700' : 'bg-white text-gray-500']">
              {{ vax.recommended_date ? dayjs(vax.recommended_date).format('MMM D') : 'TBD' }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <span class="text-3xl mb-2">💉</span>
        <p class="text-sm text-gray-400">Vaccines up to date</p>
        <router-link to="/vaccinations" class="text-xs text-blue-600 font-semibold mt-2">View schedule →</router-link>
      </div>
    </div>
  </div>
</template>
