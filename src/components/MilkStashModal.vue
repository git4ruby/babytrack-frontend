<script setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useMilkStore } from '@/stores/milk'
import { useUiStore } from '@/stores/ui'

const milkStore = useMilkStore()
const ui = useUiStore()

const loading = ref(false)
const volumeMl = ref('')
const storedAt = ref(dayjs().format('YYYY-MM-DDTHH:mm'))
const storageType = ref('fridge')
const sourceType = ref('pumped')
const label = ref('')
const notes = ref('')

const storageOptions = [
  { value: 'room_temp', label: 'Room Temp', icon: '🌡️', expiry: '8 hrs' },
  { value: 'fridge', label: 'Fridge', icon: '❄️', expiry: '4 days' },
  { value: 'freezer', label: 'Freezer', icon: '🧊', expiry: '6 months' },
]

function resetForm() {
  volumeMl.value = ''
  storedAt.value = dayjs().format('YYYY-MM-DDTHH:mm')
  storageType.value = 'fridge'
  sourceType.value = 'pumped'
  label.value = ''
  notes.value = ''
}

function close() {
  ui.milkModalOpen = false
  resetForm()
}

async function submit() {
  if (!volumeMl.value || volumeMl.value <= 0) return
  loading.value = true
  try {
    await milkStore.storeMilk({
      volume_ml: parseInt(volumeMl.value),
      stored_at: new Date(storedAt.value).toISOString(),
      storage_type: storageType.value,
      source_type: sourceType.value,
      label: label.value || `${dayjs(storedAt.value).format('MMM D h:mm A')} pump`,
      notes: notes.value || null,
    })
    ui.showToast(`${volumeMl.value}ml stored in ${storageType.value.replace('_', ' ')}`)
    close()
    milkStore.fetchInventory()
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to store milk', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="ui.milkModalOpen" title="Store Milk" @close="close">
    <div class="space-y-4 mt-2">
      <!-- Volume -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
        <input
          v-model="volumeMl"
          type="number"
          min="1"
          max="500"
          placeholder="e.g. 120"
          class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      <!-- Date/Time -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Expressed / Stored At</label>
        <input
          v-model="storedAt"
          type="datetime-local"
          class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      <!-- Storage Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Store In</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opt in storageOptions"
            :key="opt.value"
            @click="storageType = opt.value"
            :class="[
              'flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition text-center',
              storageType === opt.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <span class="text-xl">{{ opt.icon }}</span>
            <span class="text-xs font-medium text-gray-700">{{ opt.label }}</span>
            <span class="text-[10px] text-gray-400">{{ opt.expiry }}</span>
          </button>
        </div>
      </div>

      <!-- Label -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
        <input
          v-model="label"
          type="text"
          :placeholder="`e.g. ${dayjs().format('MMM D')} morning pump`"
          class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <input
          v-model="notes"
          type="text"
          placeholder="Any notes..."
          class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      <!-- Submit -->
      <BaseButton
        variant="primary"
        block
        :loading="loading"
        :disabled="!volumeMl || volumeMl <= 0"
        @click="submit"
      >
        Store Milk
      </BaseButton>
    </div>
  </BaseModal>
</template>
