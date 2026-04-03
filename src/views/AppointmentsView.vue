<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '@/api/appointments'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon, CheckIcon, XMarkIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'

const ui = useUiStore()
const { confirm } = useConfirm()

const appointments = ref([])
const loading = ref(false)
const showForm = ref(false)
const formLoading = ref(false)
const editingId = ref(null)

const form = ref(defaultForm())

function defaultForm() {
  return {
    title: '',
    appointment_type: 'well_visit',
    scheduled_at: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
    location: '',
    provider_name: '',
    notes: '',
  }
}

const typeConfig = {
  well_visit: { label: 'Well Visit', color: 'blue' },
  specialist: { label: 'Specialist', color: 'purple' },
  followup: { label: 'Follow-up', color: 'amber' },
  other: { label: 'Other', color: 'gray' },
}

const statusConfig = {
  upcoming: { label: 'Upcoming', class: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', class: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', class: 'bg-gray-100 text-gray-500' },
}

const upcomingAppts = computed(() =>
  appointments.value
    .filter(a => a.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
)

const pastAppts = computed(() =>
  appointments.value
    .filter(a => a.status !== 'upcoming')
    .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
)

function openCreate() {
  editingId.value = null
  form.value = defaultForm()
  showForm.value = true
}

function openEdit(appt) {
  editingId.value = appt.id
  form.value = {
    title: appt.title,
    appointment_type: appt.appointment_type,
    scheduled_at: dayjs(appt.scheduled_at).format('YYYY-MM-DDTHH:mm'),
    location: appt.location || '',
    provider_name: appt.provider_name || '',
    notes: appt.notes || '',
  }
  showForm.value = true
}

async function submitForm() {
  if (!form.value.title) return
  formLoading.value = true
  try {
    const payload = {
      ...form.value,
      scheduled_at: new Date(form.value.scheduled_at).toISOString(),
    }
    if (editingId.value) {
      await updateAppointment(editingId.value, payload)
      ui.showToast('Appointment updated')
    } else {
      await createAppointment(payload)
      ui.showToast('Appointment created')
    }
    showForm.value = false
    fetchAppointments()
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally {
    formLoading.value = false
  }
}

async function markCompleted(id) {
  await updateAppointment(id, { status: 'completed' })
  ui.showToast('Marked as completed')
  fetchAppointments()
}

async function cancelAppt(id) {
  const ok = await confirm({ title: 'Cancel Appointment', message: 'Are you sure you want to cancel this appointment?', confirmLabel: 'Cancel Appointment' })
  if (!ok) return
  await deleteAppointment(id)
  ui.showToast('Appointment cancelled')
  fetchAppointments()
}

async function fetchAppointments() {
  loading.value = true
  try {
    const { data } = await getAppointments()
    appointments.value = data.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchAppointments)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
      <BaseButton @click="openCreate">
        <PlusIcon class="w-4 h-4" /> New Appointment
      </BaseButton>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <template v-else>
      <!-- Upcoming -->
      <div v-if="upcomingAppts.length">
        <h2 class="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Upcoming</h2>
        <div class="space-y-3">
          <div v-for="appt in upcomingAppts" :key="appt.id" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ appt.title }}</h3>
                  <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', statusConfig[appt.status]?.class]">
                    {{ typeConfig[appt.appointment_type]?.label }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-slate-300 mt-1">
                  {{ dayjs(appt.scheduled_at).format('ddd, MMM D YYYY · h:mm A') }}
                </p>
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-slate-400">
                  <span v-if="appt.provider_name">Dr. {{ appt.provider_name }}</span>
                  <span v-if="appt.location" class="flex items-center gap-1">
                    <MapPinIcon class="w-3 h-3" /> {{ appt.location }}
                  </span>
                </div>
                <p v-if="appt.notes" class="text-xs text-gray-400 dark:text-slate-500 mt-1 italic">{{ appt.notes }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button @click="markCompleted(appt.id)" class="flex-1 py-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition flex items-center justify-center gap-1">
                <CheckIcon class="w-3.5 h-3.5" /> Complete
              </button>
              <button @click="openEdit(appt)" class="flex-1 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition">
                Edit
              </button>
              <button @click="cancelAppt(appt.id)" class="flex-1 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition flex items-center justify-center gap-1">
                <XMarkIcon class="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Past -->
      <div v-if="pastAppts.length">
        <h2 class="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Past</h2>
        <div class="space-y-2">
          <div v-for="appt in pastAppts" :key="appt.id" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 opacity-75">
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-gray-700 dark:text-slate-200 text-sm">{{ appt.title }}</h3>
              <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', statusConfig[appt.status]?.class]">
                {{ statusConfig[appt.status]?.label }}
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">{{ dayjs(appt.scheduled_at).format('MMM D, YYYY · h:mm A') }}</p>
          </div>
        </div>
      </div>

      <EmptyState v-if="!upcomingAppts.length && !pastAppts.length" icon="📅" title="No appointments" description="Schedule your baby's next checkup.">
        <BaseButton @click="openCreate"><PlusIcon class="w-4 h-4" /> New Appointment</BaseButton>
      </EmptyState>
    </template>

    <!-- Create/Edit Modal -->
    <BaseModal :open="showForm" :title="editingId ? 'Edit Appointment' : 'New Appointment'" @close="showForm = false">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Title</label>
          <input v-model="form.title" type="text" placeholder="e.g. 2-month well visit" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Type</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="(cfg, type) in typeConfig"
              :key="type"
              @click="form.appointment_type = type"
              :class="['px-3 py-1.5 text-sm rounded-lg border-2 transition', form.appointment_type === type ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300']"
            >
              {{ cfg.label }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Date & Time</label>
          <input v-model="form.scheduled_at" type="datetime-local" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Provider</label>
          <input v-model="form.provider_name" type="text" placeholder="e.g. Dr. Smith" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Location</label>
          <input v-model="form.location" type="text" placeholder="e.g. Children's Hospital" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Notes</label>
          <input v-model="form.notes" type="text" placeholder="Any notes..." class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white" />
        </div>
        <BaseButton variant="primary" block :loading="formLoading" :disabled="!form.title" @click="submitForm">
          {{ editingId ? 'Update' : 'Create' }} Appointment
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
