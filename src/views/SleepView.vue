<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { getSleepLogs, createSleepLog, updateSleepLog, deleteSleepLog, getSleepSummary } from '@/api/sleep'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ExportButton from '@/components/ui/ExportButton.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()
const { confirm } = useConfirm()

const logs = ref([])
const summary = ref(null)
const loading = ref(false)
const rangePreset = ref('today')
const showForm = ref(false)
const formLoading = ref(false)
const editingId = ref(null)

const form = ref(defaultForm())
function defaultForm() {
  return { started_at: dayjs().format('YYYY-MM-DDTHH:mm'), ended_at: '', sleep_type: 'nap', location: '', notes: '' }
}

const rangePresets = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days' },
]

const dateRange = computed(() => {
  const today = dayjs()
  if (rangePreset.value === 'yesterday') return { from: today.subtract(1, 'day').format('YYYY-MM-DD'), to: today.subtract(1, 'day').format('YYYY-MM-DD') }
  const map = { today: 0, '3d': 2, '7d': 6 }
  const days = map[rangePreset.value] ?? 0
  return { from: today.subtract(days, 'day').format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') }
})

const typeConfig = {
  nap: { icon: '💤', label: 'Nap', color: 'indigo' },
  night: { icon: '🌙', label: 'Night Sleep', color: 'slate' },
}

const locations = ['crib', 'bassinet', 'stroller', 'car', 'arms', 'other']

// Group by date
const groupedLogs = computed(() => {
  const groups = {}
  for (const log of logs.value) {
    const date = dayjs(log.started_at || log.created_at).format('YYYY-MM-DD')
    if (!groups[date]) groups[date] = []
    groups[date].push(log)
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

function dayTotalMin(sleeps) {
  return sleeps.reduce((s, l) => s + (l.duration_minutes || 0), 0)
}

function openCreate() {
  editingId.value = null
  form.value = defaultForm()
  showForm.value = true
}

function openEdit(log) {
  editingId.value = log.id
  form.value = {
    started_at: log.started_at ? dayjs(log.started_at).format('YYYY-MM-DDTHH:mm') : '',
    ended_at: log.ended_at ? dayjs(log.ended_at).format('YYYY-MM-DDTHH:mm') : '',
    sleep_type: log.sleep_type,
    location: log.location || '',
    notes: log.notes || '',
  }
  showForm.value = true
}

async function submitForm() {
  formLoading.value = true
  try {
    const data = {
      started_at: form.value.started_at ? new Date(form.value.started_at).toISOString() : null,
      ended_at: form.value.ended_at ? new Date(form.value.ended_at).toISOString() : null,
      sleep_type: form.value.sleep_type,
      location: form.value.location || null,
      notes: form.value.notes || null,
    }
    if (editingId.value) {
      await updateSleepLog(editingId.value, data)
      ui.showToast('Sleep log updated')
    } else {
      await createSleepLog(data)
      ui.showToast('Sleep logged')
    }
    showForm.value = false
    loadData()
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(id) {
  const ok = await confirm({ title: 'Delete Sleep Log', message: 'Delete this sleep entry?', confirmLabel: 'Delete' })
  if (!ok) return
  await deleteSleepLog(id)
  ui.showToast('Deleted')
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const [logsRes, summaryRes] = await Promise.all([
      getSleepLogs({ from: dateRange.value.from, to: dateRange.value.to }),
      getSleepSummary({ date: dayjs().format('YYYY-MM-DD') }),
    ])
    logs.value = logsRes.data.data
    summary.value = summaryRes.data.data
  } finally {
    loading.value = false
  }
}

watch(dateRange, loadData)
onMounted(loadData)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Sleep</h1>
      <div class="flex items-center gap-2">
        <BaseButton @click="openCreate"><PlusIcon class="w-4 h-4" /> Log Sleep</BaseButton>
      </div>
    </div>

    <!-- Today's summary -->
    <div v-if="summary" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
        <p class="text-3xl font-black text-indigo-600">{{ summary.total_sleep_hours }}<span class="text-lg font-bold text-indigo-300">h</span></p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase">Total Sleep</p>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
        <p class="text-3xl font-black text-slate-700">{{ summary.nap_count }}</p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase">Naps</p>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
        <p class="text-3xl font-black text-amber-600">{{ Math.round(summary.nap_minutes / 60 * 10) / 10 }}<span class="text-lg font-bold text-amber-300">h</span></p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase">Nap Time</p>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
        <p class="text-3xl font-black text-blue-600">{{ Math.round(summary.night_minutes / 60 * 10) / 10 }}<span class="text-lg font-bold text-blue-300">h</span></p>
        <p class="text-xs font-medium text-slate-400 mt-1 uppercase">Night Sleep</p>
      </div>
    </div>

    <!-- Range picker -->
    <div class="flex flex-wrap gap-2">
      <button v-for="preset in rangePresets" :key="preset.value" @click="rangePreset = preset.value"
        :class="['px-3 py-1.5 text-sm font-medium rounded-lg transition-all', rangePreset === preset.value ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100']">
        {{ preset.label }}
      </button>
    </div>

    <!-- Timeline -->
    <template v-if="groupedLogs.length">
      <div v-for="[date, sleeps] in groupedLogs" :key="date" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <span class="text-sm font-bold text-gray-800">{{ dateLabel(date) }}</span>
          <div class="flex items-center gap-2 text-xs">
            <span class="font-bold text-indigo-600">{{ Math.round(dayTotalMin(sleeps) / 60 * 10) / 10 }}h sleep</span>
            <span class="text-gray-400">{{ sleeps.length }} sessions</span>
          </div>
        </div>
        <div class="divide-y divide-gray-50 px-4">
          <div v-for="log in sleeps" :key="log.id" class="flex items-center gap-3 py-3 group">
            <div :class="['flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl border',
              log.sleep_type === 'night' ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50 border-indigo-100']">
              {{ typeConfig[log.sleep_type]?.icon || '💤' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span :class="['text-sm font-semibold', log.sleep_type === 'night' ? 'text-slate-700' : 'text-indigo-700']">
                  {{ typeConfig[log.sleep_type]?.label }}
                </span>
                <span v-if="log.location" class="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md font-bold uppercase">{{ log.location }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-0.5">
                <span v-if="log.started_at">{{ dayjs(log.started_at).format('h:mm A') }}</span>
                <span v-if="log.started_at && log.ended_at"> → {{ dayjs(log.ended_at).format('h:mm A') }}</span>
              </p>
              <p v-if="log.notes" class="text-xs text-gray-400 italic mt-0.5">{{ log.notes }}</p>
            </div>
            <div class="flex-shrink-0 flex items-center gap-3">
              <span v-if="log.duration_minutes" class="text-sm font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                {{ log.duration_minutes }}m
              </span>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button @click="openEdit(log)" class="p-0.5 text-gray-300 hover:text-blue-500"><PencilIcon class="w-3.5 h-3.5" /></button>
                <button @click="handleDelete(log.id)" class="p-0.5 text-gray-300 hover:text-red-500"><TrashIcon class="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <EmptyState v-else-if="!loading" icon="😴" title="No sleep logs yet" description="Track your baby's naps and night sleep.">
      <BaseButton @click="openCreate"><PlusIcon class="w-4 h-4" /> Log Sleep</BaseButton>
    </EmptyState>

    <!-- Create/Edit Modal -->
    <BaseModal :open="showForm" :title="editingId ? 'Edit Sleep' : 'Log Sleep'" @close="showForm = false">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div class="flex gap-2">
            <button v-for="(cfg, type) in typeConfig" :key="type" @click="form.sleep_type = type"
              :class="['flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition',
                form.sleep_type === type ? `border-${cfg.color}-500 bg-${cfg.color}-50` : 'border-gray-200']">
              <span class="text-xl">{{ cfg.icon }}</span>
              <span class="text-sm font-medium">{{ cfg.label }}</span>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input v-model="form.started_at" type="datetime-local" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Time (optional — fill when baby wakes)</label>
          <input v-model="form.ended_at" type="datetime-local" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location (optional)</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="loc in locations" :key="loc" @click="form.location = form.location === loc ? '' : loc"
              :class="['px-3 py-1.5 text-xs font-medium rounded-full border-2 capitalize transition',
                form.location === loc ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600']">
              {{ loc }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input v-model="form.notes" type="text" placeholder="Any notes..." class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <BaseButton variant="primary" block :loading="formLoading" @click="submitForm">
          {{ editingId ? 'Update' : 'Log Sleep' }}
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
