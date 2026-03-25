<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useMilkStore } from '@/stores/milk'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const milkStore = useMilkStore()
const ui = useUiStore()

const activeFilter = ref('')
const actionModal = ref({ open: false, stash: null, action: '' })
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
      <h1 class="text-2xl font-bold text-gray-900">Milk Storage</h1>
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
            ? `border-${config.color}-500 bg-${config.color}-50`
            : 'border-transparent bg-white shadow-sm'
        ]"
      >
        <span class="text-2xl">{{ config.icon }}</span>
        <p class="text-xl font-bold text-gray-900 mt-1">
          {{ inventory.by_storage_type?.[type]?.total_ml || 0 }}<span class="text-xs font-normal text-gray-400">ml</span>
        </p>
        <p class="text-xs text-gray-500">{{ config.label }}</p>
        <p class="text-xs text-gray-400">{{ inventory.by_storage_type?.[type]?.count || 0 }} bags</p>
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="inventory?.expiring_soon?.count > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
      <span class="text-lg">⚠️</span>
      <p class="text-sm text-amber-800">
        <strong>{{ inventory.expiring_soon.count }}</strong> container(s) expiring within 6 hours
        ({{ inventory.expiring_soon.total_ml }}ml)
      </p>
    </div>

    <div v-if="inventory?.expired_count > 0" class="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
      <span class="text-lg">🚫</span>
      <p class="text-sm text-red-800">
        <strong>{{ inventory.expired_count }}</strong> container(s) have expired and should be discarded
      </p>
    </div>

    <!-- Stash list -->
    <div v-if="filteredStashes.length > 0" class="space-y-3">
      <div
        v-for="stash in filteredStashes"
        :key="stash.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ storageConfig[stash.storage_type]?.icon }}</span>
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium text-gray-900">{{ stash.label || `${stash.storage_type} stash` }}</p>
                <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', expiryBadge(stash).class]">
                  {{ expiryBadge(stash).text }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ stash.remaining_ml }}<span class="text-gray-400">/{{ stash.volume_ml }}ml remaining</span>
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                Stored {{ dayjs(stash.stored_at).format('MMM D, h:mm A') }}
                <span v-if="stash.thawed_at"> · Thawed {{ dayjs(stash.thawed_at).format('MMM D, h:mm A') }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Volume bar -->
        <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-blue-500 rounded-full transition-all"
            :style="{ width: (stash.remaining_ml / stash.volume_ml * 100) + '%' }"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-3">
          <button
            @click="openAction(stash, 'consume')"
            class="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            Use
          </button>
          <button
            v-if="stash.storage_type !== 'room_temp'"
            @click="openAction(stash, 'transfer')"
            class="flex-1 py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
          >
            Transfer
          </button>
          <button
            @click="openAction(stash, 'discard')"
            class="flex-1 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
          >
            Discard
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
        <p class="text-sm text-gray-500">
          {{ actionModal.stash?.label || 'Stash' }} — {{ actionModal.stash?.remaining_ml }}ml remaining
        </p>

        <!-- Volume (for consume/discard) -->
        <div v-if="actionModal.action !== 'transfer'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
          <input
            v-model="actionVolume"
            type="number"
            :max="actionModal.stash?.remaining_ml"
            min="1"
            class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
          <div class="flex gap-2 mt-2">
            <button
              @click="actionVolume = actionModal.stash?.remaining_ml"
              class="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
            >
              All ({{ actionModal.stash?.remaining_ml }}ml)
            </button>
            <button
              @click="actionVolume = Math.round(actionModal.stash?.remaining_ml / 2)"
              class="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
            >
              Half
            </button>
          </div>
        </div>

        <!-- Reason (for discard) -->
        <div v-if="actionModal.action === 'discard'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="r in ['expired', 'spilled', 'contaminated', 'other']"
              :key="r"
              @click="actionReason = r"
              :class="[
                'px-3 py-1.5 text-sm rounded-lg border-2 capitalize transition',
                actionReason === r ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'
              ]"
            >
              {{ r }}
            </button>
          </div>
        </div>

        <!-- Destination (for transfer) -->
        <div v-if="actionModal.action === 'transfer'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Move to</label>
          <div class="flex gap-2">
            <button
              v-for="dest in ['fridge', 'freezer'].filter(d => d !== actionModal.stash?.storage_type)"
              :key="dest"
              @click="actionDestination = dest"
              :class="[
                'flex-1 py-3 text-sm font-medium rounded-lg border-2 transition capitalize',
                actionDestination === dest ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
              ]"
            >
              {{ storageConfig[dest]?.icon }} {{ dest }}
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <input
            v-model="actionNotes"
            type="text"
            class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
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
  </div>
</template>
