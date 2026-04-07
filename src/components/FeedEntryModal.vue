<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useFeedingsStore } from '@/stores/feedings'
import { useUiStore } from '@/stores/ui'

const feedingsStore = useFeedingsStore()
const ui = useUiStore()

const step = ref(1)
const loading = ref(false)

// Form state
const feedType = ref('')
const startedAt = ref(dayjs().format('YYYY-MM-DDTHH:mm'))
const endedAt = ref('')
const volumeMl = ref('')
const breastSide = ref('')
const milkType = ref('breast_milk')
const formulaBrand = ref('')
const notes = ref('')
const addCombo = ref(false)
const comboVolume = ref('')
const comboMilkType = ref('formula')

const isEditing = computed(() => !!ui.editingFeed)
const modalTitle = computed(() => isEditing.value ? 'Edit Feed' : 'Log Feed')

const feedTypes = [
  { value: 'bottle', label: 'Bottle', icon: '🍼', desc: 'Expressed milk or formula' },
  { value: 'breastfeed', label: 'Breastfeed', icon: '🤱', desc: 'Direct breastfeeding' },
  { value: 'pump', label: 'Pump', icon: '⚙️', desc: 'Pumping session' },
]

const canSubmit = computed(() => {
  if (feedType.value === 'bottle' || feedType.value === 'pump') return volumeMl.value > 0
  if (feedType.value === 'breastfeed') return !!breastSide.value
  return false
})

function selectType(type) {
  feedType.value = type
  step.value = 2
}

function goBack() {
  if (isEditing.value) { close(); return }
  if (step.value > 1) step.value--
}

function resetForm() {
  step.value = 1
  feedType.value = ''
  startedAt.value = dayjs().format('YYYY-MM-DDTHH:mm')
  endedAt.value = ''
  volumeMl.value = ''
  breastSide.value = ''
  milkType.value = 'breast_milk'
  formulaBrand.value = ''
  notes.value = ''
  addCombo.value = false
  comboVolume.value = ''
  comboMilkType.value = 'formula'
  ui.editingFeed = null
}

function close() {
  ui.feedModalOpen = false
  resetForm()
}

function populateFromEdit(feed) {
  feedType.value = feed.feed_type
  startedAt.value = dayjs(feed.started_at).format('YYYY-MM-DDTHH:mm')
  endedAt.value = feed.ended_at ? dayjs(feed.ended_at).format('YYYY-MM-DDTHH:mm') : ''
  volumeMl.value = feed.volume_ml || ''
  breastSide.value = feed.breast_side || ''
  milkType.value = feed.milk_type || 'breast_milk'
  formulaBrand.value = feed.formula_brand || ''
  notes.value = feed.notes || ''
  step.value = 2
}

async function submit() {
  loading.value = true
  try {
    const feedData = {
      feed_type: feedType.value,
      started_at: new Date(startedAt.value).toISOString(),
      ended_at: endedAt.value ? new Date(endedAt.value).toISOString() : null,
      volume_ml: (feedType.value === 'bottle' || feedType.value === 'pump') ? parseInt(volumeMl.value) : null,
      breast_side: feedType.value === 'breastfeed' ? breastSide.value : null,
      milk_type: feedType.value !== 'breastfeed' ? milkType.value : null,
      formula_brand: milkType.value === 'formula' ? formulaBrand.value : null,
      notes: notes.value || null,
    }

    if (isEditing.value) {
      await feedingsStore.updateFeed(ui.editingFeed.id, feedData)
      ui.showToast('Feed updated')
    } else {
      const sessionGroup = addCombo.value ? crypto.randomUUID() : undefined
      feedData.session_group = sessionGroup
      await feedingsStore.logFeed(feedData)

      if (addCombo.value && comboVolume.value > 0) {
        await feedingsStore.logFeed({
          feed_type: 'bottle',
          started_at: feedData.started_at,
          volume_ml: parseInt(comboVolume.value),
          milk_type: comboMilkType.value,
          session_group: sessionGroup,
        })
      }
      ui.showToast('Feed logged')
    }

    close()
    feedingsStore.fetchSummary(dayjs().format('YYYY-MM-DD'))
    feedingsStore.fetchLastFeeding()
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally {
    loading.value = false
  }
}

watch(() => ui.feedModalOpen, (open) => {
  if (open && ui.editingFeed) {
    populateFromEdit(ui.editingFeed)
  } else if (open) {
    startedAt.value = dayjs().format('YYYY-MM-DDTHH:mm')
  }
})
</script>

<template>
  <BaseModal :open="ui.feedModalOpen" :title="modalTitle" @close="close">
    <!-- Step 1: Select Type (skip in edit mode) -->
    <div v-if="step === 1 && !isEditing" class="space-y-3 mt-2">
      <button
        v-for="ft in feedTypes"
        :key="ft.value"
        @click="selectType(ft.value)"
        class="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition text-left"
      >
        <span class="text-3xl">{{ ft.icon }}</span>
        <div>
          <p class="font-medium text-gray-900 dark:text-white">{{ ft.label }}</p>
          <p class="text-sm text-gray-500 dark:text-slate-400">{{ ft.desc }}</p>
        </div>
      </button>
    </div>

    <!-- Step 2: Details -->
    <div v-if="step === 2" class="space-y-4 mt-2">
      <div class="flex items-center gap-2">
        <button @click="goBack" class="text-sm text-blue-600 hover:text-blue-700">← {{ isEditing ? 'Cancel' : 'Back' }}</button>
        <span class="text-sm text-gray-400 dark:text-slate-500">|</span>
        <span class="text-sm font-medium text-gray-700 dark:text-slate-200 capitalize">{{ feedType }}</span>
      </div>

      <!-- Time -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Start Time</label>
        <input v-model="startedAt" type="datetime-local" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
      </div>

      <!-- Bottle / Pump -->
      <template v-if="feedType === 'bottle' || feedType === 'pump'">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Volume (ml)</label>
          <input v-model="volumeMl" type="number" min="1" max="500" placeholder="e.g. 60" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div v-if="feedType === 'bottle'">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Milk Type</label>
          <div class="flex gap-2">
            <button v-for="mt in [{v:'breast_milk',l:'Breast Milk'},{v:'formula',l:'Formula'},{v:'mixed',l:'Mixed'}]" :key="mt.v" @click="milkType = mt.v" :class="['flex-1 py-2 text-sm font-medium rounded-lg border-2 transition', milkType === mt.v ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300']">{{ mt.l }}</button>
          </div>
        </div>
        <div v-if="milkType === 'formula'">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Formula Brand</label>
          <input v-model="formulaBrand" type="text" placeholder="e.g. Similac 360 Total Care" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
      </template>

      <!-- Breastfeed -->
      <template v-if="feedType === 'breastfeed'">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Breast Side</label>
          <div class="flex gap-2">
            <button v-for="side in ['left','right','both']" :key="side" @click="breastSide = side" :class="['flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition capitalize', breastSide === side ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300']">{{ side }}</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">End Time (optional)</label>
          <input v-model="endedAt" type="datetime-local" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
      </template>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Notes (optional)</label>
        <input v-model="notes" type="text" placeholder="e.g. fussy after feed" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
      </div>

      <!-- Combo (new only) -->
      <div v-if="feedType === 'bottle' && !isEditing" class="border-t border-gray-100 dark:border-slate-700 pt-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="addCombo" type="checkbox" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
          <span class="text-sm text-gray-700 dark:text-slate-200">Add a second bottle (combo feed)</span>
        </label>
        <div v-if="addCombo" class="mt-3 pl-6 space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Second Volume (ml)</label>
            <input v-model="comboVolume" type="number" min="1" max="500" placeholder="e.g. 30" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
          </div>
          <div class="flex gap-2">
            <button v-for="mt in [{v:'breast_milk',l:'Breast Milk'},{v:'formula',l:'Formula'}]" :key="mt.v" @click="comboMilkType = mt.v" :class="['flex-1 py-2 text-sm font-medium rounded-lg border-2 transition', comboMilkType === mt.v ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300']">{{ mt.l }}</button>
          </div>
        </div>
      </div>

    </div>
    <template #footer>
      <BaseButton variant="primary" block :loading="loading" :disabled="!canSubmit" @click="submit">
        {{ isEditing ? 'Update Feed' : 'Log Feed' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
