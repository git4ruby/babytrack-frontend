<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { getWeightLogs, createWeightLog, deleteWeightLog } from '@/api/weightLogs'
import { useBabyStore } from '@/stores/baby'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'

const { confirm } = useConfirm()

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const babyStore = useBabyStore()
const ui = useUiStore()

const logs = ref([])
const loading = ref(false)
const showForm = ref(false)
const formLoading = ref(false)

// Form
const form = ref({ recorded_at: dayjs().format('YYYY-MM-DD'), weight_grams: '', height_cm: '', head_circumference_cm: '', measured_by: '', notes: '' })

const weightUnit = ref('g') // g or lb

function toDisplay(grams) {
  if (weightUnit.value === 'lb') return (grams / 453.592).toFixed(2) + ' lb'
  if (grams >= 1000) return (grams / 1000).toFixed(2) + ' kg'
  return grams + ' g'
}

const chartData = computed(() => {
  if (logs.value.length < 2) return null
  const sorted = [...logs.value].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
  return {
    data: {
      labels: sorted.map(l => dayjs(l.recorded_at).format('MMM D')),
      datasets: [{
        label: 'Weight (g)',
        data: sorted.map(l => l.weight_grams),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(34, 197, 94)',
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { title: { display: true, text: 'grams' } },
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
  } finally {
    loading.value = false
  }
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
    await createWeightLog(payload)
    ui.showToast('Weight recorded')
    showForm.value = false
    form.value = { recorded_at: dayjs().format('YYYY-MM-DD'), weight_grams: '', height_cm: '', head_circumference_cm: '', measured_by: '', notes: '' }
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
      <h1 class="text-2xl font-bold text-gray-900">Weight Log</h1>
      <BaseButton @click="showForm = true">
        <PlusIcon class="w-4 h-4" /> Add Measurement
      </BaseButton>
    </div>

    <!-- Stats cards -->
    <div v-if="latestWeight" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">Current Weight</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ toDisplay(latestWeight.weight_grams) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ dayjs(latestWeight.recorded_at).format('MMM D, YYYY') }}</p>
      </div>
      <div v-if="weightChange !== null" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">Last Change</p>
        <p :class="['text-2xl font-bold mt-1', weightChange >= 0 ? 'text-green-600' : 'text-red-600']">
          {{ weightChange >= 0 ? '+' : '' }}{{ weightChange }}g
        </p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">Measurements</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ logs.length }}</p>
      </div>
    </div>

    <!-- Growth Chart -->
    <div v-if="chartData" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 class="text-sm font-medium text-gray-500 mb-4">Growth Chart</h3>
      <Line :data="chartData.data" :options="chartData.options" />
    </div>

    <!-- Table -->
    <div v-if="logs.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500">Weight</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Height</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Head</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">By</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in [...logs].sort((a,b) => new Date(b.recorded_at) - new Date(a.recorded_at))" :key="log.id" class="hover:bg-gray-50 group">
              <td class="px-4 py-3 text-gray-900">{{ dayjs(log.recorded_at).format('MMM D, YYYY') }}</td>
              <td class="px-4 py-3 font-medium text-gray-900">{{ toDisplay(log.weight_grams) }}</td>
              <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">{{ log.height_cm ? log.height_cm + ' cm' : '—' }}</td>
              <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">{{ log.head_circumference_cm ? log.head_circumference_cm + ' cm' : '—' }}</td>
              <td class="px-4 py-3 text-gray-500 hidden md:table-cell">{{ log.measured_by || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <button @click="handleDelete(log.id)" class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                  <TrashIcon class="w-4 h-4" />
                </button>
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
    <BaseModal :open="showForm" title="Add Weight Measurement" @close="showForm = false">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input v-model="form.recorded_at" type="date" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
          <input v-model="form.weight_grams" type="number" min="1" placeholder="e.g. 3500" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input v-model="form.height_cm" type="number" step="0.1" placeholder="Optional" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Head (cm)</label>
            <input v-model="form.head_circumference_cm" type="number" step="0.1" placeholder="Optional" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Measured By</label>
          <input v-model="form.measured_by" type="text" placeholder="e.g. Pediatrician, Home scale" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <BaseButton variant="primary" block :loading="formLoading" :disabled="!form.weight_grams" @click="submitWeight">Save Measurement</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
