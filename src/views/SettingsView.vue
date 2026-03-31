<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useBabyStore } from '@/stores/baby'
import { useUiStore } from '@/stores/ui'
import { updateBabyById, deleteBaby } from '@/api/baby'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'

const { confirm: confirmDialog } = useConfirm()

const auth = useAuthStore()
const babyStore = useBabyStore()
const ui = useUiStore()

const phoneNumber = ref('')
const phoneLoading = ref(false)

const smsNumber = '+1 571 570 3445'
const emailAddress = import.meta.env.VITE_INBOUND_EMAIL || 'babyfeedtracking@gmail.com'

// Baby edit
const editBabyModal = ref(false)
const editBabyForm = ref({ id: null, name: '', date_of_birth: '', gender: '', birth_weight_grams: '', notes: '' })
const editBabyLoading = ref(false)

onMounted(async () => {
  phoneNumber.value = auth.user?.phone_number || ''
  await babyStore.fetchBabies()
})

async function savePhone() {
  phoneLoading.value = true
  try {
    await client.patch('/auth/sign_up', { user: { phone_number: phoneNumber.value || null } })
    ui.showToast('Phone number saved')
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally {
    phoneLoading.value = false
  }
}

function openEditBaby(baby) {
  editBabyForm.value = {
    id: baby.id,
    name: baby.name,
    date_of_birth: baby.date_of_birth,
    gender: baby.gender || '',
    birth_weight_grams: baby.birth_weight_grams || '',
    notes: baby.notes || '',
  }
  editBabyModal.value = true
}

async function saveEditBaby() {
  editBabyLoading.value = true
  try {
    await updateBabyById(editBabyForm.value.id, {
      name: editBabyForm.value.name,
      date_of_birth: editBabyForm.value.date_of_birth,
      gender: editBabyForm.value.gender || null,
      birth_weight_grams: editBabyForm.value.birth_weight_grams ? parseInt(editBabyForm.value.birth_weight_grams) : null,
      notes: editBabyForm.value.notes || null,
    })
    ui.showToast('Baby profile updated')
    editBabyModal.value = false
    babyStore.fetchBabies()
    babyStore.fetchBaby()
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to update', 'error')
  } finally {
    editBabyLoading.value = false
  }
}

async function handleDeleteBaby(baby) {
  const ok = await confirmDialog({
    title: `Delete ${baby.name}?`,
    message: 'This will permanently delete ALL data (feedings, diapers, milestones, weight, vaccinations, appointments) for this baby. This cannot be undone.',
    confirmLabel: 'Delete Forever',
  })
  if (!ok) return
  try {
    await deleteBaby(baby.id)
    ui.showToast(`${baby.name} deleted`)
    babyStore.fetchBabies()
    babyStore.fetchBaby()
  } catch (e) {
    ui.showToast(e.response?.data?.error || 'Cannot delete', 'error')
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Settings</h1>

    <!-- Baby Profiles -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">Baby Profiles</h2>
        <router-link to="/setup" class="text-sm text-blue-600 font-semibold hover:text-blue-700">+ Add Baby</router-link>
      </div>

      <div class="space-y-3">
        <div v-for="baby in babyStore.babies" :key="baby.id" class="flex items-center gap-4 p-4 rounded-xl border border-gray-100 group hover:border-blue-200 transition">
          <span class="text-3xl">{{ baby.gender === 'female' ? '👧' : '👶' }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-900">{{ baby.name }}</p>
            <p class="text-sm text-gray-500">Born {{ dayjs(baby.date_of_birth).format('MMMM D, YYYY') }} · {{ baby.age_in_weeks }}w {{ baby.age_in_days % 7 }}d old</p>
            <p v-if="baby.birth_weight_grams" class="text-xs text-gray-400">Birth weight: {{ baby.birth_weight_grams }}g</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button @click="openEditBaby(baby)" class="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit">
              <PencilIcon class="w-4 h-4" />
            </button>
            <button @click="handleDeleteBaby(baby)" class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SMS / Email Logging -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-1">Log via SMS or Email</h2>
      <p class="text-sm text-gray-500 mb-6">Skip the app — just send a text or email to log feeds, diapers, milestones and more.</p>

      <div class="bg-slate-50 rounded-xl p-5 mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3">How it works</h3>
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            <p>Send a text or email with what you want to log</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
            <p>Our AI reads your message and creates the record</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
            <p>You get a confirmation email with what was logged</p>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 rounded-xl p-5 mb-6">
        <h3 class="text-sm font-bold text-blue-900 mb-3">Example messages</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">bottle 90ml 2:30pm</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">breastfeed left 20min</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">diaper wet</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">diaper poop yellow seedy</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">pump 120ml stored in fridge</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">weight 3.8kg</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">milestone: first smile today</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">bottle 60ml formula + diaper wet</div>
        </div>
      </div>

      <!-- SMS -->
      <div class="border-t border-gray-100 pt-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">📱</span>
          <div>
            <h3 class="text-sm font-bold text-gray-900">SMS</h3>
            <p class="text-xs text-gray-500">Text this number to log</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-4">
          <span class="font-mono text-lg font-bold text-gray-900">{{ smsNumber }}</span>
          <span class="text-xs text-gray-400">Save as "BabyTrack"</span>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Family Phone Numbers</label>
          <p class="text-xs text-gray-400 mb-2">Add phone numbers for anyone who can log via SMS (Mom, Dad, etc). Separate with commas.</p>
          <div class="flex gap-2">
            <input v-model="phoneNumber" type="text" placeholder="+12345678900, +19876543210" class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
            <BaseButton :loading="phoneLoading" @click="savePhone">Save</BaseButton>
          </div>
        </div>
      </div>

      <!-- Email -->
      <div class="border-t border-gray-100 pt-6 mt-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">📧</span>
          <div>
            <h3 class="text-sm font-bold text-gray-900">Email</h3>
            <p class="text-xs text-gray-500">Email this address to log (matched by your account email)</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <span class="font-mono text-sm font-bold text-gray-900">{{ emailAddress }}</span>
          <span class="text-xs text-gray-400">No setup needed</span>
        </div>
        <p class="text-xs text-gray-400 mt-2">Just send from the same email you signed up with: <strong>{{ auth.user?.email }}</strong></p>
      </div>
    </div>

    <!-- Edit Baby Modal -->
    <BaseModal :open="editBabyModal" title="Edit Baby Profile" @close="editBabyModal = false">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input v-model="editBabyForm.name" type="text" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input v-model="editBabyForm.date_of_birth" type="date" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div class="flex gap-3">
            <button v-for="g in [{v:'male',l:'Boy',e:'👦'},{v:'female',l:'Girl',e:'👧'}]" :key="g.v"
              @click="editBabyForm.gender = editBabyForm.gender === g.v ? '' : g.v"
              :class="['flex-1 py-3 text-sm font-medium rounded-xl border-2 transition', editBabyForm.gender === g.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600']">
              {{ g.e }} {{ g.l }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Birth Weight (grams)</label>
          <input v-model="editBabyForm.birth_weight_grams" type="number" placeholder="e.g. 3300" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input v-model="editBabyForm.notes" type="text" placeholder="Any notes..." class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
        </div>
        <BaseButton variant="primary" block :loading="editBabyLoading" :disabled="!editBabyForm.name" @click="saveEditBaby">
          Save Changes
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
