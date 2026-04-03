<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useMilkStore } from '@/stores/milk'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'
import { updateMilkStash, deleteMilkStash } from '@/api/milkStashes'

const milkStore = useMilkStore()
const ui = useUiStore()
const { confirm } = useConfirm()

const activeFilter = ref('')
const actionModal = ref({ open: false, stash: null, action: '' })

// Edit modal
const editModal = ref(false)
const editForm = ref({ id: null, label: '', volume_ml: '', remaining_ml: '', storage_type: '', stored_at: '', notes: '' })
const editLoading = ref(false)
const actionVolume = ref('')
const actionReason = ref('')
const actionDestination = ref('fridge')
const actionNotes = ref('')
const actionLoading = ref(false)

const storageConfig = {
  room_temp: { icon: '🌡️', label: 'Room Temp', color: 'orange' },
  fridge: { icon: '❄️', label: 'Fridge', color: 'blue' },
  freezer: { icon: '🧊', label: 'Freezer', color: 'indigo' },
}

const inventory = computed(() => milkStore.inventory)

const filteredStashes = computed(() => {
  if (!activeFilter.value) return milkStore.stashes
  return milkStore.stashes.filter(s => s.storage_type === activeFilter.value)
})

function openAction(stash, action) {
  actionModal.value = { open: true, stash, action }
  actionVolume.value = action === 'transfer' ? '' : stash.remaining_ml
  actionReason.value = ''
  actionDestination.value = stash.storage_type === 'freezer' ? 'fridge' : 'freezer'
  actionNotes.value = ''
}

function closeAction() {
  actionModal.value = { open: false, stash: null, action: '' }
}

async function submitAction() {
  const { stash, action } = actionModal.value
  actionLoading.value = true
  try {
    if (action === 'consume') {
      await milkStore.consumeStash(stash.id, {
        volume_ml: parseInt(actionVolume.value),
        notes: actionNotes.value || null,
      })
      ui.showToast(`Used ${actionVolume.value}ml`)
    } else if (action === 'discard') {
      await milkStore.discardStash(stash.id, {
        volume_ml: parseInt(actionVolume.value),
        reason: actionReason.value || null,
        notes: actionNotes.value || null,
      })
      ui.showToast(`Discarded ${actionVolume.value}ml`)
    } else if (action === 'transfer') {
      await milkStore.transferStash(stash.id, {
        destination: actionDestination.value,
        notes: actionNotes.value || null,
      })
      ui.showToast(`Transferred to ${actionDestination.value.replace('_', ' ')}`)
    }
    closeAction()
    milkStore.fetchStashes()
    milkStore.fetchInventory()
  } catch (e) {
    ui.showToast(e.response?.data?.error || 'Action failed', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openEdit(stash) {
  editForm.value = {
    id: stash.id,
    label: stash.label || '',
    volume_ml: stash.volume_ml,
    remaining_ml: stash.remaining_ml,
    storage_type: stash.storage_type,
    stored_at: dayjs(stash.stored_at).format('YYYY-MM-DDTHH:mm'),
    notes: stash.notes || '',
  }
  editModal.value = true
}

async function saveEdit() {
  editLoading.value = true
  try {
    await updateMilkStash(editForm.value.id, {
      label: editForm.value.label || null,
      volume_ml: parseInt(editForm.value.volume_ml),
      remaining_ml: parseInt(editForm.value.remaining_ml),
      storage_type: editForm.value.storage_type,
      stored_at: new Date(editForm.value.stored_at).toISOString(),
      notes: editForm.value.notes || null,
    })
    ui.showToast('Milk stash updated')
    editModal.value = false
    milkStore.fetchStashes()
    milkStore.fetchInventory()
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to update', 'error')
  } finally {
    editLoading.value = false
  }
}

async function handleDelete(stash) {
  const ok = await confirm({ title: 'Delete Milk Stash', message: `Delete "${stash.label || 'this stash'}" (${stash.remaining_ml}ml remaining)?`, confirmLabel: 'Delete' })
  if (!ok) return
  try {
    await deleteMilkStash(stash.id)
    ui.showToast('Stash deleted')
    milkStore.fetchStashes()
    milkStore.fetchInventory()
  } catch (e) {
    ui.showToast('Failed to delete', 'error')
  }
}

function expiryBadge(stash) {
  if (stash.expired) return { text: 'Expired', class: 'bg-red-100 text-red-700' }
  if (stash.hours_until_expiry < 6) return { text: `${stash.hours_until_expiry}h left`, class: 'bg-amber-100 text-amber-700' }
  if (stash.hours_until_expiry < 24) return { text: `${stash.hours_until_expiry}h left`, class: 'bg-yellow-100 text-yellow-700' }
  return { text: dayjs(stash.expires_at).format('MMM D'), class: 'bg-gray-100 text-gray-600' }
}

onMounted(() => {
  milkStore.fetchStashes()
  milkStore.fetchInventory()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Milk Storage</h1>
      <BaseButton @click="ui.milkModalOpen = true">
        <PlusIcon class="w-4 h-4" />
        Store Milk
      </BaseButton>
    </div>

    <!-- Inventory summary -->
    <div v-if="inventory" class="grid grid-cols-3 gap-3">
      <button
        v-for="(config, type) in storageConfig"
        :key="type"
        @click="activeFilter = activeFilter === type ? '' : type"
        :class="[
          'rounded-xl p-4 text-center transition border-2',
          activeFilter === type
            ? `border-${config.color}-500 bg-${config.color}-50 dark:bg-${config.color}-900/30`
            : 'border-transparent bg-white dark:bg-slate-800 shadow-sm'
        ]"
      >
        <span class="text-2xl">{{ config.icon }}</span>
        <p class="text-xl font-bold text-gray-900 dark:text-white mt-1">
          {{ inventory.by_storage_type?.[type]?.total_ml || 0 }}<span class="text-xs font-normal text-gray-400 dark:text-slate-500">ml</span>
        </p>
        <p class="text-xs text-gray-500 dark:text-slate-400">{{ config.label }}</p>
        <p class="text-xs text-gray-400 dark:text-slate-500">{{ inventory.by_storage_type?.[type]?.count || 0 }} bags</p>
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="inventory?.expiring_soon?.count > 0" class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-3 flex items-center gap-2">
      <span class="text-lg">⚠️</span>
      <p class="text-sm text-amber-800 dark:text-amber-300">
        <strong>{{ inventory.expiring_soon.count }}</strong> container(s) expiring within 6 hours
        ({{ inventory.expiring_soon.total_ml }}ml)
      </p>
    </div>

    <div v-if="inventory?.expired_count > 0" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-3 flex items-center gap-2">
      <span class="text-lg">🚫</span>
      <p class="text-sm text-red-800 dark:text-red-300">
        <strong>{{ inventory.expired_count }}</strong> container(s) have expired and should be discarded
      </p>
    </div>

    <!-- Stash list -->
    <div v-if="filteredStashes.length > 0" class="space-y-3">
      <div
        v-for="stash in filteredStashes"
        :key="stash.id"
        class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ storageConfig[stash.storage_type]?.icon }}</span>
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium text-gray-900 dark:text-white">{{ stash.label || `${stash.storage_type} stash` }}</p>
                <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', expiryBadge(stash).class]">
                  {{ expiryBadge(stash).text }}
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {{ stash.remaining_ml }}<span class="text-gray-400 dark:text-slate-500">/{{ stash.volume_ml }}ml remaining</span>
              </p>
              <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Stored {{ dayjs(stash.stored_at).format('MMM D, h:mm A') }}
                <span v-if="stash.thawed_at"> · Thawed {{ dayjs(stash.thawed_at).format('MMM D, h:mm A') }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Volume bar -->
        <div class="mt-3 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-blue-500 rounded-full transition-all"
            :style="{ width: (stash.remaining_ml / stash.volume_ml * 100) + '%' }"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-3">
          <button
            @click="openAction(stash, 'consume')"
            class="flex-1 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition"
          >
            Use
          </button>
          <button
            v-if="stash.storage_type !== 'room_temp'"
            @click="openAction(stash, 'transfer')"
            class="flex-1 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition"
          >
            Transfer
          </button>
          <button
            @click="openAction(stash, 'discard')"
            class="flex-1 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition"
          >
            Discard
          </button>
          <button
            @click="openEdit(stash)"
            class="py-2 px-3 text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
          >
            <PencilIcon class="w-3.5 h-3.5 inline" /> Edit
          </button>
          <button
            @click="handleDelete(stash)"
            class="py-2 px-3 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <TrashIcon class="w-3.5 h-3.5 inline" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <EmptyState v-else-if="!milkStore.loading" icon="🧊" title="No stored milk" description="Store expressed milk to track your inventory.">
      <BaseButton @click="ui.milkModalOpen = true">
        <PlusIcon class="w-4 h-4" />
        Store Milk
      </BaseButton>
    </EmptyState>

    <!-- Action Modal -->
    <BaseModal
      :open="actionModal.open"
      :title="actionModal.action === 'consume' ? 'Use Milk' : actionModal.action === 'discard' ? 'Discard Milk' : 'Transfer Milk'"
      @close="closeAction"
    >
      <div class="space-y-4 mt-2">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ actionModal.stash?.label || 'Stash' }} — {{ actionModal.stash?.remaining_ml }}ml remaining
        </p>

        <!-- Volume (for consume/discard) -->
        <div v-if="actionModal.action !== 'transfer'">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Volume (ml)</label>
          <input
            v-model="actionVolume"
            type="number"
            :max="actionModal.stash?.remaining_ml"
            min="1"
            class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white"
          />
          <div class="flex gap-2 mt-2">
            <button
              @click="actionVolume = actionModal.stash?.remaining_ml"
              class="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              All ({{ actionModal.stash?.remaining_ml }}ml)
            </button>
            <button
              @click="actionVolume = Math.round(actionModal.stash?.remaining_ml / 2)"
              class="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              Half
            </button>
          </div>
        </div>

        <!-- Reason (for discard) -->
        <div v-if="actionModal.action === 'discard'">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Reason</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="r in ['expired', 'spilled', 'contaminated', 'other']"
              :key="r"
              @click="actionReason = r"
              :class="[
                'px-3 py-1.5 text-sm rounded-lg border-2 capitalize transition',
                actionReason === r ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300'
              ]"
            >
              {{ r }}
            </button>
          </div>
        </div>

        <!-- Destination (for transfer) -->
        <div v-if="actionModal.action === 'transfer'">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Move to</label>
          <div class="flex gap-2">
            <button
              v-for="dest in ['fridge', 'freezer'].filter(d => d !== actionModal.stash?.storage_type)"
              :key="dest"
              @click="actionDestination = dest"
              :class="[
                'flex-1 py-3 text-sm font-medium rounded-lg border-2 transition capitalize',
                actionDestination === dest ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300'
              ]"
            >
              {{ storageConfig[dest]?.icon }} {{ dest }}
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Notes (optional)</label>
          <input
            v-model="actionNotes"
            type="text"
            class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white"
          />
        </div>

        <BaseButton
          :variant="actionModal.action === 'discard' ? 'danger' : 'primary'"
          block
          :loading="actionLoading"
          @click="submitAction"
        >
          {{ actionModal.action === 'consume' ? 'Use Milk' : actionModal.action === 'discard' ? 'Discard' : 'Transfer' }}
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Edit Stash Modal -->
    <BaseModal :open="editModal" title="Edit Milk Stash" @close="editModal = false">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Label</label>
          <input v-model="editForm.label" type="text" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Volume (ml)</label>
            <input v-model="editForm.volume_ml" type="number" min="1" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Remaining (ml)</label>
            <input v-model="editForm.remaining_ml" type="number" min="0" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Storage Type</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="opt in storageConfig" :key="opt" @click="editForm.storage_type = Object.entries(storageConfig).find(([k,v]) => v === opt)?.[0]"
              :class="['flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition text-center text-xs',
                editForm.storage_type === Object.entries(storageConfig).find(([k,v]) => v === opt)?.[0]
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-slate-600']">
              <span>{{ opt.icon }}</span>
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Stored At</label>
          <input v-model="editForm.stored_at" type="datetime-local" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Notes</label>
          <input v-model="editForm.notes" type="text" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <BaseButton variant="primary" block :loading="editLoading" @click="saveEdit">Save Changes</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
