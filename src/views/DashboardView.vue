<script setup>
import { ref, onMounted, computed } from 'vue'
import { useFeedingsStore } from '@/stores/feedings'
import { useBabyStore } from '@/stores/baby'
import { useMilkStore } from '@/stores/milk'
import { useTimeSince } from '@/composables/useTimeSince'
import { getUpcomingVaccinations } from '@/api/vaccinations'
import { getNextAppointment } from '@/api/appointments'
import dayjs from 'dayjs'

const feedingsStore = useFeedingsStore()
const babyStore = useBabyStore()
const milkStore = useMilkStore()

const today = dayjs().format('YYYY-MM-DD')

const lastFeedTime = computed(() => feedingsStore.lastFeeding?.started_at || null)
const { label: gapLabel, urgency } = useTimeSince(lastFeedTime)

const summary = computed(() => feedingsStore.todaySummary)
const inventory = computed(() => milkStore.inventory)
const upcomingVaccines = ref([])
const nextAppointment = ref(null)

onMounted(async () => {
  await Promise.all([
    feedingsStore.fetchLastFeeding(),
    feedingsStore.fetchSummary(today),
    milkStore.fetchInventory(),
    getUpcomingVaccinations().then(r => { upcomingVaccines.value = r.data.data?.slice(0, 3) || [] }).catch(() => {}),
    getNextAppointment().then(r => { nextAppointment.value = r.data.data }).catch(() => {}),
  ])
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

    <!-- Gap Timer -->
    <div :class="[
      'rounded-xl p-6 text-white',
      urgency === 'alert' ? 'bg-red-500' : urgency === 'warning' ? 'bg-amber-500' : 'bg-blue-600'
    ]">
      <p class="text-sm opacity-80">Last fed</p>
      <p class="text-3xl font-bold mt-1">{{ gapLabel }}</p>
      <p v-if="feedingsStore.lastFeeding" class="text-sm opacity-80 mt-2">
        {{ feedingsStore.lastFeeding.feed_type }} —
        <span v-if="feedingsStore.lastFeeding.volume_ml">{{ feedingsStore.lastFeeding.volume_ml }}ml</span>
        <span v-if="feedingsStore.lastFeeding.breast_side">{{ feedingsStore.lastFeeding.breast_side }} side</span>
      </p>
    </div>

    <!-- Today's Summary -->
    <div v-if="summary" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">Total Feeds</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ summary.total_feeds }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">Total Volume</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ summary.total_ml }}<span class="text-sm font-normal text-gray-400">ml</span></p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">Breast Time</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ summary.breast_duration_minutes?.total || 0 }}<span class="text-sm font-normal text-gray-400">min</span></p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">Avg Gap</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ summary.average_gap_hours }}<span class="text-sm font-normal text-gray-400">hrs</span></p>
      </div>
    </div>

    <!-- Feed Type Breakdown -->
    <div v-if="summary" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 class="text-sm font-medium text-gray-500 mb-3">Today's Breakdown</h3>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-lg font-bold text-blue-600">{{ summary.feeds_by_type?.bottle || 0 }}</p>
          <p class="text-xs text-gray-500">Bottle</p>
        </div>
        <div>
          <p class="text-lg font-bold text-pink-600">{{ summary.feeds_by_type?.breastfeed || 0 }}</p>
          <p class="text-xs text-gray-500">Breastfeed</p>
        </div>
        <div>
          <p class="text-lg font-bold text-purple-600">{{ summary.feeds_by_type?.pump || 0 }}</p>
          <p class="text-xs text-gray-500">Pump</p>
        </div>
      </div>

      <!-- Breast Balance -->
      <div v-if="summary.breast_balance" class="mt-4">
        <p class="text-xs text-gray-400 mb-1">Breast Balance (L / R)</p>
        <div class="flex h-3 rounded-full overflow-hidden bg-gray-100">
          <div
            class="bg-pink-400 transition-all"
            :style="{ width: summary.breast_balance.left_percent + '%' }"
          />
          <div
            class="bg-purple-400 transition-all"
            :style="{ width: summary.breast_balance.right_percent + '%' }"
          />
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>L {{ summary.breast_balance.left_percent }}%</span>
          <span>R {{ summary.breast_balance.right_percent }}%</span>
        </div>
      </div>
    </div>

    <!-- Milk Inventory Quick View -->
    <div v-if="inventory" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-500">Milk Inventory</h3>
        <router-link to="/milk-storage" class="text-sm text-blue-600 hover:text-blue-700">View all</router-link>
      </div>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-lg font-bold text-orange-500">{{ inventory.by_storage_type?.room_temp?.total_ml || 0 }}<span class="text-xs font-normal">ml</span></p>
          <p class="text-xs text-gray-500">Room Temp</p>
        </div>
        <div>
          <p class="text-lg font-bold text-blue-500">{{ inventory.by_storage_type?.fridge?.total_ml || 0 }}<span class="text-xs font-normal">ml</span></p>
          <p class="text-xs text-gray-500">Fridge</p>
        </div>
        <div>
          <p class="text-lg font-bold text-indigo-500">{{ inventory.by_storage_type?.freezer?.total_ml || 0 }}<span class="text-xs font-normal">ml</span></p>
          <p class="text-xs text-gray-500">Freezer</p>
        </div>
      </div>
      <p v-if="inventory.summary?.total_ml" class="text-center text-sm text-gray-400 mt-3">
        {{ inventory.summary.total_ml }}ml total across {{ inventory.summary.total_bags }} containers
      </p>
      <p v-if="inventory.expiring_soon?.count > 0" class="text-center text-sm text-amber-600 mt-1">
        {{ inventory.expiring_soon.count }} expiring soon
      </p>
    </div>

    <!-- Next Appointment -->
    <div v-if="nextAppointment" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-500">Next Appointment</h3>
        <router-link to="/appointments" class="text-sm text-blue-600 hover:text-blue-700">View all</router-link>
      </div>
      <p class="font-medium text-gray-900">{{ nextAppointment.title }}</p>
      <p class="text-sm text-gray-600 mt-1">{{ dayjs(nextAppointment.scheduled_at).format('ddd, MMM D · h:mm A') }}</p>
      <p v-if="nextAppointment.provider_name" class="text-xs text-gray-400 mt-1">{{ nextAppointment.provider_name }} · {{ nextAppointment.location }}</p>
    </div>

    <!-- Upcoming Vaccinations -->
    <div v-if="upcomingVaccines.length" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-500">Upcoming Vaccines</h3>
        <router-link to="/vaccinations" class="text-sm text-blue-600 hover:text-blue-700">View all</router-link>
      </div>
      <div class="space-y-2">
        <div v-for="vax in upcomingVaccines" :key="vax.id" class="flex items-center justify-between">
          <span class="text-sm text-gray-700">{{ vax.vaccine_name }}</span>
          <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', vax.overdue ? 'bg-red-100 text-red-700' : vax.due_soon ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600']">
            {{ vax.recommended_date ? dayjs(vax.recommended_date).format('MMM D') : 'TBD' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
