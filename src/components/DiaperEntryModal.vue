<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useDiapersStore } from '@/stores/diapers'
import { useUiStore } from '@/stores/ui'

const diapersStore = useDiapersStore()
const ui = useUiStore()

const loading = ref(false)
const changedAt = ref(dayjs().format('YYYY-MM-DDTHH:mm'))
const diaperType = ref('')
const stoolColor = ref('')
const consistency = ref('')
const hasRash = ref(false)
const notes = ref('')
const showDetails = ref(false)
const showTimeField = ref(false)

const isEditing = computed(() => !!ui.editingDiaper)
const modalTitle = computed(() => isEditing.value ? 'Edit Diaper Change' : 'Log Diaper Change')

const typeOptions = [
  { value: 'wet', label: 'Wet (Pee)', icon: '💧', color: 'sky' },
  { value: 'soiled', label: 'Soiled (Poop)', icon: '💩', color: 'amber' },
  { value: 'both', label: 'Both', icon: '💧💩', color: 'purple' },
  { value: 'dry', label: 'Dry', icon: '✅', color: 'gray' },
]

const colorOptions = [
  { value: 'yellow', label: 'Yellow', dot: 'bg-yellow-400' },
  { value: 'green', label: 'Green', dot: 'bg-green-500' },
  { value: 'brown', label: 'Brown', dot: 'bg-amber-700' },
  { value: 'black', label: 'Black', dot: 'bg-gray-900' },
  { value: 'orange', label: 'Orange', dot: 'bg-orange-400' },
  { value: 'red', label: 'Red', dot: 'bg-red-500' },
]

const consistencyOptions = [
  { value: 'normal', label: 'Normal' }, { value: 'seedy', label: 'Seedy' },
  { value: 'loose', label: 'Loose' }, { value: 'watery', label: 'Watery' },
  { value: 'hard', label: 'Hard' }, { value: 'mucousy', label: 'Mucousy' },
]

function resetForm() {
  changedAt.value = dayjs().format('YYYY-MM-DDTHH:mm')
  diaperType.value = ''
  stoolColor.value = ''
  consistency.value = ''
  hasRash.value = false
  notes.value = ''
  showDetails.value = false
  showTimeField.value = false
  ui.editingDiaper = null
}

function close() { ui.diaperModalOpen = false; resetForm() }

function selectType(type) {
  diaperType.value = type
  showDetails.value = (type === 'soiled' || type === 'both')
}

function populateFromEdit(d) {
  changedAt.value = dayjs(d.changed_at).format('YYYY-MM-DDTHH:mm')
  diaperType.value = d.diaper_type
  stoolColor.value = d.stool_color || ''
  consistency.value = d.consistency || ''
  hasRash.value = d.has_rash || false
  notes.value = d.notes || ''
  showDetails.value = (d.diaper_type === 'soiled' || d.diaper_type === 'both')
  showTimeField.value = true
}

async function submit() {
  if (!diaperType.value) return
  loading.value = true
  try {
    const data = {
      changed_at: showTimeField.value ? new Date(changedAt.value).toISOString() : null,
      diaper_type: diaperType.value,
      stool_color: showDetails.value ? (stoolColor.value || null) : null,
      consistency: showDetails.value ? (consistency.value || null) : null,
      has_rash: hasRash.value,
      notes: notes.value || null,
    }
    if (isEditing.value) {
      await diapersStore.updateChange(ui.editingDiaper.id, data)
      ui.showToast('Diaper change updated')
    } else {
      await diapersStore.logChange(data)
      ui.showToast('Diaper change logged')
    }
    close()
    diapersStore.fetchSummary(dayjs().format('YYYY-MM-DD'))
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally { loading.value = false }
}

watch(() => ui.diaperModalOpen, (open) => {
  if (open && ui.editingDiaper) populateFromEdit(ui.editingDiaper)
  else if (open) changedAt.value = dayjs().format('YYYY-MM-DDTHH:mm')
})
</script>

<template>
  <BaseModal :open="ui.diaperModalOpen" :title="modalTitle" @close="close">
    <div class="space-y-4 mt-2">
      <div class="grid grid-cols-2 gap-2">
        <button v-for="opt in typeOptions" :key="opt.value" @click="selectType(opt.value)"
          :class="['flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition text-center', diaperType === opt.value ? `border-${opt.color}-500 bg-${opt.color}-50 dark:bg-${opt.color}-900/30` : 'border-gray-200 dark:border-slate-600 hover:border-gray-300']">
          <span class="text-2xl">{{ opt.icon }}</span>
          <span class="text-xs font-semibold text-gray-700 dark:text-slate-200">{{ opt.label }}</span>
        </button>
      </div>

      <!-- Time: hidden by default, toggle to show -->
      <div v-if="showTimeField" class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700 dark:text-slate-200">Time</label>
          <button @click="showTimeField = false" class="text-xs text-gray-400 hover:text-gray-600">Remove time</button>
        </div>
        <input v-model="changedAt" type="datetime-local" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
      </div>
      <button v-else @click="showTimeField = true; changedAt = dayjs().format('YYYY-MM-DDTHH:mm')" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
        + Add time
      </button>

      <template v-if="showDetails">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Stool Color</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="c in colorOptions" :key="c.value" @click="stoolColor = stoolColor === c.value ? '' : c.value"
              :class="['flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border-2 transition', stoolColor === c.value ? 'border-gray-800 dark:border-white bg-gray-100 dark:bg-slate-700 dark:text-white' : 'border-gray-200 dark:border-slate-600 dark:text-slate-300']">
              <span :class="['w-3 h-3 rounded-full', c.dot]"></span>{{ c.label }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Consistency</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="c in consistencyOptions" :key="c.value" @click="consistency = consistency === c.value ? '' : c.value"
              :class="['px-3 py-1.5 text-xs font-medium rounded-full border-2 transition', consistency === c.value ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300']">
              {{ c.label }}
            </button>
          </div>
        </div>
      </template>

      <label class="flex items-center gap-2.5 cursor-pointer">
        <input v-model="hasRash" type="checkbox" class="w-4 h-4 text-red-600 rounded border-gray-300" />
        <span class="text-sm text-gray-700 dark:text-slate-200">Diaper rash present</span>
      </label>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Notes (optional)</label>
        <input v-model="notes" type="text" placeholder="Any observations..." class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
      </div>

      <BaseButton variant="primary" block :loading="loading" :disabled="!diaperType" @click="submit">
        {{ isEditing ? 'Update' : 'Log Diaper Change' }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
