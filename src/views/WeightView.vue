<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { getWeightLogs, createWeightLog, updateWeightLog, deleteWeightLog, getPercentiles } from '@/api/weightLogs'
import { useBabyStore } from '@/stores/baby'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'
import ExportButton from '@/components/ui/ExportButton.vue'

const { confirm } = useConfirm()

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const babyStore = useBabyStore()
const ui = useUiStore()

const logs = ref([])
const loading = ref(false)
const showForm = ref(false)
const formLoading = ref(false)
const editingId = ref(null)
const percentileData = ref(null)
const currentPercentile = ref(null)

// Form
const form = ref({ recorded_at: dayjs().format('YYYY-MM-DD'), weight_grams: '', height_cm: '', head_circumference_cm: '', measured_by: '', notes: '' })

const weightUnit = ref('g')

function toDisplay(grams) {
  if (weightUnit.value === 'lb') return (grams / 453.592).toFixed(2) + ' lb'
  if (grams >= 1000) return (grams / 1000).toFixed(2) + ' kg'
  return grams + ' g'
}

const chartData = computed(() => {
  if (logs.value.length < 1) return null
  const sorted = [...logs.value].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))

  const datasets = []

  // WHO percentile bands
  if (percentileData.value?.curves) {
    const bandColors = { P3: '#fee2e2', P15: '#fef3c7', P50: '#d1fae5', P85: '#fef3c7', P97: '#fee2e2' }
    const lineColors = { P3: '#fca5a5', P15: '#fcd34d', P50: '#6ee7b7', P85: '#fcd34d', P97: '#fca5a5' }
    for (const [label, points] of Object.entries(percentileData.value.curves)) {
      datasets.push({
        label,
        data: points.map(p => ({ x: p.age_days, y: p.weight_grams })),
        borderColor: lineColors[label],
        borderWidth: 1,
        borderDash: label === 'P50' ? [] : [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      })
    }
  }

  // Baby's actual weight
  datasets.push({
    label: `${babyStore.baby?.name || 'Baby'}`,
    data: sorted.map(l => ({
      x: babyStore.baby ? Math.round((new Date(l.recorded_at) - new Date(babyStore.baby.date_of_birth)) / 86400000) : 0,
      y: l.weight_grams,
    })),
    borderColor: 'rgb(34, 197, 94)',
    backgroundColor: 'rgb(34, 197, 94)',
    borderWidth: 3,
    pointRadius: 6,
    pointBackgroundColor: 'rgb(34, 197, 94)',
    fill: false,
    tension: 0.3,
  })

  return {
    data: { datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, pointStyle: 'line', font: { size: 10 } } },
      },
      scales: {
        x: { type: 'linear', title: { display: true, text: 'Age (days)' }, min: 0 },
        y: { title: { display: true, text: 'Weight (grams)' } },
      },
    },
  }
})

const latestWeight = computed(() => {
  if (!logs.value.length) return null
  return [...logs.value].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))[0]
})

const weightChange = computed(() => {
  if (logs.value.length < 2) return null
  const sorted = [...logs.value].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
  const diff = sorted[sorted.length - 1].weight_grams - sorted[sorted.length - 2].weight_grams
  return diff
})

async function fetchLogs() {
  loading.value = true
  try {
    const { data } = await getWeightLogs()
    logs.value = data.data
    // Fetch WHO percentile data
    const { data: pData } = await getPercentiles()
    percentileData.value = pData.data
    if (pData.data?.measurements?.length) {
      const latest = pData.data.measurements[pData.data.measurements.length - 1]
      currentPercentile.value = latest.percentile
    }
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { recorded_at: dayjs().format('YYYY-MM-DD'), weight_grams: '', height_cm: '', head_circumference_cm: '', measured_by: '', notes: '' }
  showForm.value = true
}

function openEdit(log) {
  editingId.value = log.id
  form.value = {
    recorded_at: dayjs(log.recorded_at).format('YYYY-MM-DD'),
    weight_grams: log.weight_grams || '',
    height_cm: log.height_cm || '',
    head_circumference_cm: log.head_circumference_cm || '',
    measured_by: log.measured_by || '',
    notes: log.notes || '',
  }
  showForm.value = true
}

async function submitWeight() {
  if (!form.value.weight_grams) return
  formLoading.value = true
  try {
    const payload = {
      recorded_at: form.value.recorded_at,
      weight_grams: parseInt(form.value.weight_grams),
      height_cm: form.value.height_cm ? parseFloat(form.value.height_cm) : null,
      head_circumference_cm: form.value.head_circumference_cm ? parseFloat(form.value.head_circumference_cm) : null,
      measured_by: form.value.measured_by || null,
      notes: form.value.notes || null,
    }
    if (editingId.value) {
      await updateWeightLog(editingId.value, payload)
      ui.showToast('Weight updated')
    } else {
      await createWeightLog(payload)
      ui.showToast('Weight recorded')
    }
    showForm.value = false
    fetchLogs()
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(id) {
  const ok = await confirm({ title: 'Delete Weight Entry', message: 'Are you sure you want to delete this measurement?', confirmLabel: 'Delete' })
  if (!ok) return
  await deleteWeightLog(id)
  ui.showToast('Entry deleted')
  fetchLogs()
}

onMounted(fetchLogs)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">Weight Log</h1>
      <div class="flex items-center gap-2">
        <ExportButton type="weight" />
        <BaseButton @click="openCreate">
          <PlusIcon class="w-4 h-4" /> Add Measurement
        </BaseButton>
      </div>
    </div>

    <!-- Stats cards -->
    <div v-if="latestWeight" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <p class="text-sm text-gray-500 dark:text-slate-400">Current Weight</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ toDisplay(latestWeight.weight_grams) }}</p>
        <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">{{ dayjs(latestWeight.recorded_at).format('MMM D, YYYY') }}</p>
      </div>
      <div v-if="weightChange !== null" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <p class="text-sm text-gray-500 dark:text-slate-400">Last Change</p>
        <p :class="['text-2xl font-bold mt-1', weightChange >= 0 ? 'text-green-600' : 'text-red-600']">
          {{ weightChange >= 0 ? '+' : '' }}{{ weightChange }}g
        </p>
      </div>
      <div v-if="currentPercentile" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <p class="text-sm text-gray-500 dark:text-slate-400">WHO Percentile</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ currentPercentile }}th</p>
        <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">weight-for-age</p>
      </div>
      <div v-else class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <p class="text-sm text-gray-500 dark:text-slate-400">Measurements</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ logs.length }}</p>
      </div>
    </div>

    <!-- Growth Chart -->
    <div v-if="chartData" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
      <h3 class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">Growth Chart</h3>
      <Line :data="chartData.data" :options="chartData.options" />
    </div>

    <!-- Table -->
    <div v-if="logs.length > 0" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Date</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Weight</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400 hidden sm:table-cell">Height</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400 hidden sm:table-cell">Head</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400 hidden md:table-cell">By</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-slate-700">
            <tr v-for="log in [...logs].sort((a,b) => new Date(b.recorded_at) - new Date(a.recorded_at))" :key="log.id" @click="openEdit(log)" class="hover:bg-gray-50 dark:hover:bg-slate-700 group cursor-pointer">
              <td class="px-4 py-3 text-gray-900 dark:text-white">{{ dayjs(log.recorded_at).format('MMM D, YYYY') }}</td>
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ toDisplay(log.weight_grams) }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-slate-300 hidden sm:table-cell">{{ log.height_cm ? log.height_cm + ' cm' : '—' }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-slate-300 hidden sm:table-cell">{{ log.head_circumference_cm ? log.head_circumference_cm + ' cm' : '—' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-slate-400 hidden md:table-cell">{{ log.measured_by || '—' }}</td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="flex gap-1 justify-end sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button @click="openEdit(log)" class="text-gray-300 hover:text-blue-500">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button @click="handleDelete(log.id)" class="text-gray-300 hover:text-red-500">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EmptyState v-else-if="!loading" icon="⚖️" title="No weight entries yet" description="Track your baby's growth by adding weight measurements.">
      <BaseButton @click="showForm = true"><PlusIcon class="w-4 h-4" /> Add Measurement</BaseButton>
    </EmptyState>

    <!-- Add Weight Modal -->
    <BaseModal :open="showForm" :title="editingId ? 'Edit Weight Measurement' : 'Add Weight Measurement'" @close="showForm = false">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Date</label>
          <input v-model="form.recorded_at" type="date" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Weight (grams)</label>
          <input v-model="form.weight_grams" type="number" min="1" placeholder="e.g. 3500" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Height (cm)</label>
            <input v-model="form.height_cm" type="number" step="0.1" placeholder="Optional" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Head (cm)</label>
            <input v-model="form.head_circumference_cm" type="number" step="0.1" placeholder="Optional" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Measured By</label>
          <input v-model="form.measured_by" type="text" placeholder="e.g. Pediatrician, Home scale" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" block :loading="formLoading" :disabled="!form.weight_grams" @click="submitWeight">{{ editingId ? 'Update' : 'Save' }} Measurement</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
