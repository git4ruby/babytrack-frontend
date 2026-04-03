<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const message = ref('')
const error = ref('')
const inviteData = ref(null)

onMounted(async () => {
  try {
    const { data } = await client.post('/baby_shares/accept', { token: route.query.token })
    if (data.message) {
      message.value = data.message
    } else if (data.data) {
      inviteData.value = data.data
    }
  } catch (e) {
    error.value = e.response?.data?.error || 'Invalid invite link'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-none p-8 text-center">
      <div v-if="loading" class="py-8">
        <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-sm text-gray-400 dark:text-slate-500 mt-3">Processing invite...</p>
      </div>

      <div v-else-if="message" class="space-y-4">
        <span class="text-4xl">🎉</span>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ message }}</h2>
        <BaseButton variant="primary" block @click="router.push('/')">Go to Dashboard</BaseButton>
      </div>

      <div v-else-if="inviteData" class="space-y-4">
        <span class="text-4xl">👶</span>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">You're invited to track {{ inviteData.baby_name }}!</h2>
        <p class="text-sm text-gray-500 dark:text-slate-400">Sign up or sign in to accept the invite.</p>
        <BaseButton variant="primary" block @click="router.push(`/login?invite=${route.query.token}`)">Sign In / Sign Up</BaseButton>
      </div>

      <div v-else-if="error" class="space-y-4">
        <span class="text-4xl">😕</span>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ error }}</h2>
        <BaseButton variant="secondary" block @click="router.push('/login')">Go to Login</BaseButton>
      </div>
    </div>
  </div>
</template>
