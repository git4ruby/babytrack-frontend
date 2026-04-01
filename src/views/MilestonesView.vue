<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '@/api/milestones'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'
import ExportButton from '@/components/ui/ExportButton.vue'

const { confirm } = useConfirm()

const ui = useUiStore()

const milestones = ref([])
const loading = ref(false)
const activeCategory = ref('')
const showForm = ref(false)
const formLoading = ref(false)
const editingId = ref(null)

const form = ref(defaultForm())

function defaultForm() {
  return { title: '', description: '', achieved_on: dayjs().format('YYYY-MM-DD'), category: '', notes: '' }
}

const categories = [
  { value: 'motor', label: 'Motor', icon: '🏃', color: 'blue' },
  { value: 'cognitive', label: 'Cognitive', icon: '🧠', color: 'purple' },
  { value: 'social', label: 'Social', icon: '😊', color: 'pink' },
  { value: 'language', label: 'Language', icon: '🗣️', color: 'amber' },
  { value: 'feeding', label: 'Feeding', icon: '🍼', color: 'emerald' },
  { value: 'sleep', label: 'Sleep', icon: '😴', color: 'indigo' },
  { value: 'other', label: 'Other', icon: '⭐', color: 'gray' },
]

const categoryMap = Object.fromEntries(categories.map(c => [c.value, c]))

const filteredMilestones = computed(() => {
  if (!activeCategory.value) return milestones.value
  return milestones.value.filter(m => m.category === activeCategory.value)
})

// Group milestones by month
const groupedMilestones = computed(() => {
  const groups = {}
  for (const m of filteredMilestones.value) {
    const key = dayjs(m.achieved_on).format('MMMM YYYY')
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  }
  return Object.entries(groups)
})

function openCreate() {
  editingId.value = null
  form.value = defaultForm()
  showForm.value = true
}

function openEdit(m) {
  editingId.value = m.id
  form.value = {
    title: m.title,
    description: m.description || '',
    achieved_on: m.achieved_on,
    category: m.category || '',
    notes: m.notes || '',
  }
  showForm.value = true
}

async function submitForm() {
  if (!form.value.title || !form.value.achieved_on) return
  formLoading.value = true
  try {
    const payload = { ...form.value, category: form.value.category || null }
    if (editingId.value) {
      await updateMilestone(editingId.value, payload)
      ui.showToast('Milestone updated')
    } else {
      await createMilestone(payload)
      ui.showToast('Milestone added!')
    }
    showForm.value = false
    fetchMilestones()
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(id) {
  const ok = await confirm({ title: 'Delete Milestone', message: 'Are you sure you want to delete this milestone?', confirmLabel: 'Delete' })
  if (!ok) return
  await deleteMilestone(id)
  milestones.value = milestones.value.filter(m => m.id !== id)
  ui.showToast('Milestone deleted')
}

async function fetchMilestones() {
  loading.value = true
  try {
    const { data } = await getMilestones()
    milestones.value = data.data
  } finally {
    loading.value = false
  }
}

function ageBadge(days) {
  if (days == null) return ''
  if (days < 7) return `${days}d`
  if (days < 30) return `${Math.floor(days / 7)}w`
  return `${Math.floor(days / 30)}mo`
}

onMounted(fetchMilestones)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Milestones</h1>
      <div class="flex items-center gap-2">
        <ExportButton type="milestones" />
        <BaseButton @click="openCreate">
          <PlusIcon class="w-4 h-4" /> Add Milestone
        </BaseButton>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="milestones.length" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ milestones.length }} Milestones Recorded</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          @click="activeCategory = ''"
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-full transition-all',
            !activeCategory ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          ]"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="activeCategory = activeCategory === cat.value ? '' : cat.value"
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-full transition-all',
            activeCategory === cat.value
              ? 'bg-slate-900 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          ]"
        >
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16">
      <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <!-- Timeline -->
    <template v-else-if="groupedMilestones.length">
      <div v-for="[month, items] in groupedMilestones" :key="month">
        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{{ month }}</h3>
        <div class="space-y-3">
          <div
            v-for="m in items"
            :key="m.id"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group relative"
          >
            <div class="flex items-start gap-4">
              <div :class="[
                'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl border',
                m.category && categoryMap[m.category]
                  ? `bg-${categoryMap[m.category].color}-50 border-${categoryMap[m.category].color}-100`
                  : 'bg-gray-50 border-gray-100'
              ]">
                {{ categoryMap[m.category]?.icon || '⭐' }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-bold text-gray-900">{{ m.title }}</h3>
                  <span v-if="m.category" class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-bold uppercase">{{ m.category }}</span>
                  <span v-if="m.age_days != null" class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">{{ ageBadge(m.age_days) }} old</span>
                </div>
                <p v-if="m.description" class="text-sm text-gray-600 mt-1">{{ m.description }}</p>
                <p class="text-xs text-gray-400 mt-2">{{ dayjs(m.achieved_on).format('MMMM D, YYYY') }}</p>
                <p v-if="m.notes" class="text-xs text-gray-400 italic mt-1">{{ m.notes }}</p>
              </div>

              <!-- Actions -->
              <div class="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button @click="openEdit(m)" class="p-1.5 text-gray-300 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="handleDelete(m.id)" class="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <EmptyState v-else icon="🌟" title="No milestones yet" description="Record your baby's first smile, first steps, first words and more.">
      <BaseButton @click="openCreate"><PlusIcon class="w-4 h-4" /> Add Milestone</BaseButton>
    </EmptyState>

    <!-- Create/Edit Modal -->
    <BaseModal :open="showForm" :title="editingId ? 'Edit Milestone' : 'Add Milestone'" @close="showForm = false" size="lg">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input v-model="form.title" type="text" required placeholder="e.g. First smile, First roll over"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Achieved</label>
          <input v-model="form.achieved_on" type="date" required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="form.category = form.category === cat.value ? '' : cat.value"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition',
                form.category === cat.value
                  ? `border-${cat.color}-500 bg-${cat.color}-50 text-${cat.color}-700`
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              ]"
            >
              {{ cat.icon }} {{ cat.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea v-model="form.description" rows="2" placeholder="What happened? How did it go?"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white resize-none" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <input v-model="form.notes" type="text" placeholder="Any additional notes"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
        </div>

        <BaseButton variant="primary" block :loading="formLoading" :disabled="!form.title || !form.achieved_on" @click="submitForm">
          {{ editingId ? 'Update' : 'Add' }} Milestone
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
