<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBabyStore } from '@/stores/baby'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const babyStore = useBabyStore()

const name = ref('')
const dateOfBirth = ref('')
const gender = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!name.value || !dateOfBirth.value) {
    error.value = 'Name and date of birth are required'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await babyStore.addBaby({
      name: name.value,
      date_of_birth: dateOfBirth.value,
      gender: gender.value || null,
    })
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.errors?.[0] || 'Failed to create. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-5xl">👶</span>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white mt-4">Welcome to BabyTrack!</h1>
        <p class="text-gray-500 dark:text-slate-400 mt-1">Let's set up your baby's profile to get started</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none p-5 sm:p-8">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Baby's Name</label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="e.g. Emma"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Date of Birth</label>
            <input
              v-model="dateOfBirth"
              type="date"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Gender (optional)</label>
            <div class="flex gap-3">
              <button
                v-for="g in [{v: 'male', l: 'Boy', e: '👦'}, {v: 'female', l: 'Girl', e: '👧'}]"
                :key="g.v"
                @click="gender = gender === g.v ? '' : g.v"
                :class="[
                  'flex-1 py-3 text-sm font-medium rounded-xl border-2 transition',
                  gender === g.v ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-gray-300'
                ]"
              >
                {{ g.e }} {{ g.l }}
              </button>
            </div>
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 font-medium">
            {{ error }}
          </div>

          <BaseButton variant="primary" block :loading="loading" :disabled="!name || !dateOfBirth" @click="submit">
            Get Started
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
