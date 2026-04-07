<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getVaccinations, administerVaccination } from '@/api/vaccinations'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()

const vaccinations = ref([])
const loading = ref(false)
const activeTab = ref('upcoming')

// Admin form
const adminModal = ref({ open: false, vax: null })
const adminForm = ref({ administered_at: dayjs().format('YYYY-MM-DD'), administered_by: '', lot_number: '', site: '' })
const adminLoading = ref(false)

const upcoming = computed(() => vaccinations.value.filter(v => v.status === 'pending'))
const completed = computed(() => vaccinations.value.filter(v => v.status === 'administered'))

const progress = computed(() => {
  const total = vaccinations.value.length
  const done = completed.value.length
  return total ? Math.round((done / total) * 100) : 0
})

// Group upcoming by milestone
const groupedUpcoming = computed(() => {
  const groups = {}
  const milestones = { 0: 'Birth', 60: '2 Months', 120: '4 Months', 180: '6 Months', 365: '12 Months', 395: '12-15 Months', 480: '15-18 Months', 548: '18 Months' }
  for (const vax of upcoming.value) {
    const key = vax.recommended_age_days
    const label = milestones[key] || `${key} days`
    if (!groups[key]) groups[key] = { label, vaccines: [] }
    groups[key].vaccines.push(vax)
  }
  return Object.values(groups).sort((a, b) => a.vaccines[0].recommended_age_days - b.vaccines[0].recommended_age_days)
})

function openAdmin(vax) {
  adminModal.value = { open: true, vax }
  adminForm.value = { administered_at: dayjs().format('YYYY-MM-DD'), administered_by: '', lot_number: '', site: '' }
}

async function submitAdmin() {
  adminLoading.value = true
  try {
    await administerVaccination(adminModal.value.vax.id, adminForm.value)
    ui.showToast(`${adminModal.value.vax.vaccine_name} marked as administered`)
    adminModal.value = { open: false, vax: null }
    fetchVaccinations()
  } catch (e) {
    ui.showToast('Failed to update', 'error')
  } finally {
    adminLoading.value = false
  }
}

async function fetchVaccinations() {
  loading.value = true
  try {
    const { data } = await getVaccinations()
    vaccinations.value = data.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchVaccinations)
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Vaccinations</h1>

    <!-- Progress bar -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-slate-200">Vaccination Progress</span>
        <span class="text-sm font-bold text-blue-600">{{ completed.length }} / {{ vaccinations.length }}</span>
      </div>
      <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-green-500 rounded-full transition-all" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="text-xs text-gray-400 dark:text-slate-500 mt-2">{{ progress }}% complete</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
      <button
        @click="activeTab = 'upcoming'"
        :class="['flex-1 py-2 text-sm font-medium rounded-md transition', activeTab === 'upcoming' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400']"
      >
        Upcoming ({{ upcoming.length }})
      </button>
      <button
        @click="activeTab = 'completed'"
        :class="['flex-1 py-2 text-sm font-medium rounded-md transition', activeTab === 'completed' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400']"
      >
        Completed ({{ completed.length }})
      </button>
    </div>

    <!-- Upcoming Tab -->
    <template v-if="activeTab === 'upcoming'">
      <div v-for="group in groupedUpcoming" :key="group.label" class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-slate-200 px-1">{{ group.label }}</h3>
        <div class="space-y-2">
          <div
            v-for="vax in group.vaccines"
            :key="vax.id"
            :class="[
              'bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-4 flex items-center justify-between',
              vax.overdue ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30' : 'border-gray-100 dark:border-slate-700'
            ]"
          >
            <div class="flex items-start gap-3">
              <ExclamationTriangleIcon v-if="vax.overdue" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <ClockIcon v-else-if="vax.due_soon" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <ClockIcon v-else class="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-gray-900 dark:text-white text-sm">{{ vax.vaccine_name }}</p>
                <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ vax.description }}</p>
                <p v-if="vax.recommended_date" class="text-xs mt-1" :class="vax.overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-slate-500'">
                  {{ vax.overdue ? 'Overdue — was due' : 'Due' }} {{ dayjs(vax.recommended_date).format('MMM D, YYYY') }}
                </p>
              </div>
            </div>
            <BaseButton size="sm" @click="openAdmin(vax)">Mark Done</BaseButton>
          </div>
        </div>
      </div>
    </template>

    <!-- Completed Tab -->
    <template v-if="activeTab === 'completed'">
      <div class="space-y-2">
        <div v-for="vax in completed" :key="vax.id" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3">
          <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0" />
          <div class="flex-1">
            <p class="font-medium text-gray-900 dark:text-white text-sm">{{ vax.vaccine_name }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Administered {{ dayjs(vax.administered_at).format('MMM D, YYYY') }}
              <span v-if="vax.administered_by"> by {{ vax.administered_by }}</span>
            </p>
            <p v-if="vax.lot_number" class="text-xs text-gray-400 dark:text-slate-500">Lot: {{ vax.lot_number }}</p>
          </div>
        </div>
      </div>
      <p v-if="!completed.length" class="text-center text-sm text-gray-400 dark:text-slate-500 py-8">No completed vaccinations yet</p>
    </template>

    <!-- Administer Modal -->
    <BaseModal :open="adminModal.open" :title="'Mark ' + (adminModal.vax?.vaccine_name || '') + ' as Administered'" @close="adminModal = { open: false, vax: null }">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Date Administered</label>
          <input v-model="adminForm.administered_at" type="date" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Administered By</label>
          <input v-model="adminForm.administered_by" type="text" placeholder="e.g. Dr. Smith" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Lot Number</label>
            <input v-model="adminForm.lot_number" type="text" placeholder="Optional" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Site</label>
            <input v-model="adminForm.site" type="text" placeholder="e.g. Left thigh" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" block :loading="adminLoading" @click="submitAdmin">Confirm Administration</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
