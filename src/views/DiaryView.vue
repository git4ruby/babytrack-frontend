<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getDiaryEntries, createDiaryEntry, updateDiaryEntry, deleteDiaryEntry, uploadPhoto } from '@/api/diary'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'

const { confirm } = useConfirm()

const ui = useUiStore()

const entries = ref([])
const loading = ref(false)
const activeMood = ref('')
const showForm = ref(false)
const formLoading = ref(false)
const editingId = ref(null)

const form = ref(defaultForm())

const photoFile = ref(null)
const photoPreview = ref(null)
const uploadingPhoto = ref(false)

function defaultForm() {
  return { content: '', entry_date: dayjs().format('YYYY-MM-DD'), mood: '', photo_url: '' }
}

const moods = [
  { value: 'happy', label: 'Happy', icon: '😊', bg: 'bg-amber-50', border: 'border-amber-200', activeBg: 'bg-amber-100', activeBorder: 'border-amber-400', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/30', darkActiveBg: 'dark:bg-amber-900/50', darkBorder: 'dark:border-amber-700', darkActiveBorder: 'dark:border-amber-500', darkText: 'dark:text-amber-300' },
  { value: 'funny', label: 'Funny', icon: '😂', bg: 'bg-yellow-50', border: 'border-yellow-200', activeBg: 'bg-yellow-100', activeBorder: 'border-yellow-400', text: 'text-yellow-700', darkBg: 'dark:bg-yellow-900/30', darkActiveBg: 'dark:bg-yellow-900/50', darkBorder: 'dark:border-yellow-700', darkActiveBorder: 'dark:border-yellow-500', darkText: 'dark:text-yellow-300' },
  { value: 'sweet', label: 'Sweet', icon: '🥰', bg: 'bg-pink-50', border: 'border-pink-200', activeBg: 'bg-pink-100', activeBorder: 'border-pink-400', text: 'text-pink-700', darkBg: 'dark:bg-pink-900/30', darkActiveBg: 'dark:bg-pink-900/50', darkBorder: 'dark:border-pink-700', darkActiveBorder: 'dark:border-pink-500', darkText: 'dark:text-pink-300' },
  { value: 'proud', label: 'Proud', icon: '💪', bg: 'bg-blue-50', border: 'border-blue-200', activeBg: 'bg-blue-100', activeBorder: 'border-blue-400', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/30', darkActiveBg: 'dark:bg-blue-900/50', darkBorder: 'dark:border-blue-700', darkActiveBorder: 'dark:border-blue-500', darkText: 'dark:text-blue-300' },
  { value: 'sad', label: 'Sad', icon: '😢', bg: 'bg-slate-50', border: 'border-slate-200', activeBg: 'bg-slate-100', activeBorder: 'border-slate-400', text: 'text-slate-700', darkBg: 'dark:bg-slate-700/50', darkActiveBg: 'dark:bg-slate-700', darkBorder: 'dark:border-slate-600', darkActiveBorder: 'dark:border-slate-400', darkText: 'dark:text-slate-300' },
  { value: 'neutral', label: 'Note', icon: '📝', bg: 'bg-gray-50', border: 'border-gray-200', activeBg: 'bg-gray-100', activeBorder: 'border-gray-400', text: 'text-gray-700', darkBg: 'dark:bg-gray-700/50', darkActiveBg: 'dark:bg-gray-700', darkBorder: 'dark:border-gray-600', darkActiveBorder: 'dark:border-gray-400', darkText: 'dark:text-gray-300' },
]

const moodMap = Object.fromEntries(moods.map(m => [m.value, m]))

const filteredEntries = computed(() => {
  if (!activeMood.value) return entries.value
  return entries.value.filter(e => e.mood === activeMood.value)
})

// Group entries by date
const groupedEntries = computed(() => {
  const groups = {}
  for (const e of filteredEntries.value) {
    const key = dayjs(e.entry_date).format('MMMM D, YYYY')
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  return Object.entries(groups)
})

function openEdit(entry) {
  editingId.value = entry.id
  form.value = {
    content: entry.content || '',
    entry_date: entry.entry_date,
    mood: entry.mood || '',
    photo_url: entry.photo_url || '',
  }
  photoPreview.value = entry.photo_url || null
  photoFile.value = null
  showForm.value = true
}

function openCreate() {
  editingId.value = null
  form.value = defaultForm()
  photoFile.value = null
  photoPreview.value = null
  showForm.value = true
}

function onPhotoSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    ui.showToast('Photo must be under 5MB', 'error')
    return
  }
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function removePhoto() {
  photoFile.value = null
  photoPreview.value = null
  form.value.photo_url = ''
}

async function submitForm() {
  if (!form.value.content || !form.value.entry_date) return
  formLoading.value = true
  try {
    // Upload photo first if selected
    if (photoFile.value) {
      uploadingPhoto.value = true
      const { data } = await uploadPhoto(photoFile.value)
      form.value.photo_url = data.url
      uploadingPhoto.value = false
    }
    const payload = { ...form.value, mood: form.value.mood || null, photo_url: form.value.photo_url || null }
    if (editingId.value) {
      await updateDiaryEntry(editingId.value, payload)
      ui.showToast('Entry updated')
    } else {
      await createDiaryEntry(payload)
      ui.showToast('Diary entry saved!')
    }
    showForm.value = false
    fetchEntries()
  } catch (e) {
    uploadingPhoto.value = false
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(id) {
  const ok = await confirm({ title: 'Delete Entry', message: 'Are you sure you want to delete this diary entry? This memory will be gone forever.', confirmLabel: 'Delete' })
  if (!ok) return
  await deleteDiaryEntry(id)
  entries.value = entries.value.filter(e => e.id !== id)
  ui.showToast('Entry deleted')
}

async function fetchEntries() {
  loading.value = true
  try {
    const { data } = await getDiaryEntries()
    entries.value = data.data
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

onMounted(fetchEntries)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Diary</h1>
      <BaseButton @click="openCreate">
        <PlusIcon class="w-4 h-4" /> New Entry
      </BaseButton>
    </div>

    <!-- Mood filter chips -->
    <div v-if="entries.length" class="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{{ entries.length }} {{ entries.length === 1 ? 'Memory' : 'Memories' }} Captured</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          @click="activeMood = ''"
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-full transition-all',
            !activeMood ? 'bg-slate-900 dark:bg-slate-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
          ]"
        >
          All
        </button>
        <button
          v-for="mood in moods"
          :key="mood.value"
          @click="activeMood = activeMood === mood.value ? '' : mood.value"
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-full transition-all',
            activeMood === mood.value
              ? 'bg-slate-900 dark:bg-slate-600 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
          ]"
        >
          {{ mood.icon }} {{ mood.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16">
      <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <!-- Timeline -->
    <template v-else-if="groupedEntries.length">
      <div v-for="[date, items] in groupedEntries" :key="date">
        <h3 class="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">{{ date }}</h3>
        <div class="space-y-3">
          <div
            v-for="entry in items"
            :key="entry.id"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 group relative"
          >
            <div class="flex items-start gap-3 sm:gap-4">
              <!-- Mood icon -->
              <div :class="[
                'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl border',
                entry.mood && moodMap[entry.mood]
                  ? `${moodMap[entry.mood].bg} ${moodMap[entry.mood].border} ${moodMap[entry.mood].darkBg} ${moodMap[entry.mood].darkBorder}`
                  : 'bg-gray-50 border-gray-100 dark:bg-slate-700 dark:border-slate-600'
              ]">
                {{ moodMap[entry.mood]?.icon || '📝' }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span v-if="entry.mood" :class="[
                    'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                    moodMap[entry.mood]
                      ? `${moodMap[entry.mood].bg} ${moodMap[entry.mood].text} ${moodMap[entry.mood].darkBg} ${moodMap[entry.mood].darkText}`
                      : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                  ]">{{ moodMap[entry.mood]?.label || entry.mood }}</span>
                  <span v-if="entry.age_days != null" class="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold">{{ ageBadge(entry.age_days) }} old</span>
                </div>
                <p class="text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">{{ entry.content }}</p>
                <p class="text-xs text-gray-400 dark:text-slate-500 mt-2">{{ dayjs(entry.entry_date).format('MMMM D, YYYY') }}</p>
                <img v-if="entry.photo_url" :src="entry.photo_url" alt="Diary photo" class="mt-3 rounded-xl max-h-48 object-cover border border-gray-100 dark:border-slate-700" />
              </div>

              <!-- Actions -->
              <div class="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button @click="openEdit(entry)" class="p-1.5 text-gray-300 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="handleDelete(entry.id)" class="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <EmptyState v-else icon="📖" title="No diary entries yet" description="Capture the little moments, funny stories, and precious memories of your baby's journey.">
      <BaseButton @click="openCreate"><PlusIcon class="w-4 h-4" /> Write First Entry</BaseButton>
    </EmptyState>

    <!-- Create/Edit Modal -->
    <BaseModal :open="showForm" :title="editingId ? 'Edit Entry' : 'New Diary Entry'" @close="showForm = false" size="lg">
      <div class="space-y-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">What happened today?</label>
          <textarea v-model="form.content" rows="4" required placeholder="Write about a sweet moment, a funny thing they did, or anything you want to remember..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600 resize-none" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Date</label>
          <input v-model="form.entry_date" type="date" required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">How are you feeling?</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="mood in moods"
              :key="mood.value"
              type="button"
              @click="form.mood = form.mood === mood.value ? '' : mood.value"
              :class="[
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border-2 transition-all',
                form.mood === mood.value
                  ? `${mood.activeBorder} ${mood.activeBg} ${mood.text} ${mood.darkActiveBg} ${mood.darkActiveBorder} ${mood.darkText}`
                  : `border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500`
              ]"
            >
              <span class="text-base">{{ mood.icon }}</span> {{ mood.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Photo (optional)</label>
          <div v-if="photoPreview" class="relative inline-block mb-2">
            <img :src="photoPreview" class="rounded-xl max-h-36 object-cover border border-gray-200 dark:border-slate-600" />
            <button @click="removePhoto" type="button" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition">&times;</button>
          </div>
          <label v-else class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition bg-gray-50 dark:bg-slate-700">
            <PhotoIcon class="w-5 h-5 text-gray-400 dark:text-slate-500" />
            <span class="text-sm text-gray-500 dark:text-slate-400">Add a photo to this memory</span>
            <input type="file" accept="image/*" class="hidden" @change="onPhotoSelected" />
          </label>
        </div>

      </div>
      <template #footer>
        <BaseButton variant="primary" block :loading="formLoading" :disabled="!form.content || !form.entry_date" @click="submitForm">
          {{ editingId ? 'Update' : 'Save' }} Entry
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
