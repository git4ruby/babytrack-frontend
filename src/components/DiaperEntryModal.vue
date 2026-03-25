<script setup>
import { ref, watch } from 'vue'
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
  { value: 'normal', label: 'Normal' },
  { value: 'seedy', label: 'Seedy' },
  { value: 'loose', label: 'Loose' },
  { value: 'watery', label: 'Watery' },
  { value: 'hard', label: 'Hard' },
  { value: 'mucousy', label: 'Mucousy' },
]

const showDetails = ref(false) // poop detail fields

function resetForm() {
  changedAt.value = dayjs().format('YYYY-MM-DDTHH:mm')
  diaperType.value = ''
  stoolColor.value = ''
  consistency.value = ''
  hasRash.value = false
  notes.value = ''
  showDetails.value = false
}

function close() {
  ui.diaperModalOpen = false
  resetForm()
}

function selectType(type) {
  diaperType.value = type
  showDetails.value = (type === 'soiled' || type === 'both')
}

async function submit() {
  if (!diaperType.value) return
  loading.value = true
  try {
    await diapersStore.logChange({
      changed_at: new Date(changedAt.value).toISOString(),
      diaper_type: diaperType.value,
      stool_color: showDetails.value ? (stoolColor.value || null) : null,
      consistency: showDetails.value ? (consistency.value || null) : null,
      has_rash: hasRash.value,
      notes: notes.value || null,
    })
    ui.showToast('Diaper change logged')
    close()
    diapersStore.fetchSummary(dayjs().format('YYYY-MM-DD'))
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to log', 'error')
  } finally {
    loading.value = false
  }
}

watch(() => ui.diaperModalOpen, (open) => {
  if (open) changedAt.value = dayjs().format('YYYY-MM-DDTHH:mm')
})
</script>

<template>
  <BaseModal :open="ui.diaperModalOpen" title="Log Diaper Change" @close="close">
    <div class="space-y-4 mt-2">
      <!-- Type selection -->
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          @click="selectType(opt.value)"
          :class="[
            'flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition text-center',
            diaperType === opt.value
              ? `border-${opt.color}-500 bg-${opt.color}-50`
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <span class="text-2xl">{{ opt.icon }}</span>
          <span class="text-xs font-semibold text-gray-700">{{ opt.label }}</span>
        </button>
      </div>

      <!-- Time -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <input
          v-model="changedAt"
          type="datetime-local"
          class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      <!-- Poop details (if soiled or both) -->
      <template v-if="showDetails">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Stool Color</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in colorOptions"
              :key="c.value"
              @click="stoolColor = stoolColor === c.value ? '' : c.value"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border-2 transition',
                stoolColor === c.value ? 'border-gray-800 bg-gray-100' : 'border-gray-200'
              ]"
            >
              <span :class="['w-3 h-3 rounded-full', c.dot]"></span>
              {{ c.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Consistency</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in consistencyOptions"
              :key="c.value"
              @click="consistency = consistency === c.value ? '' : c.value"
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-full border-2 transition',
                consistency === c.value ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600'
              ]"
            >
              {{ c.label }}
            </button>
          </div>
        </div>
      </template>

      <!-- Rash -->
      <label class="flex items-center gap-2.5 cursor-pointer">
        <input v-model="hasRash" type="checkbox" class="w-4 h-4 text-red-600 rounded border-gray-300" />
        <span class="text-sm text-gray-700">Diaper rash present</span>
      </label>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <input
          v-model="notes"
          type="text"
          placeholder="Any observations..."
          class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      <!-- Submit -->
      <BaseButton
        variant="primary"
        block
        :loading="loading"
        :disabled="!diaperType"
        @click="submit"
      >
        Log Diaper Change
      </BaseButton>
    </div>
  </BaseModal>
</template>
