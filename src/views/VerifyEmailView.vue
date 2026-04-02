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

onMounted(async () => {
  try {
    const { data } = await client.get('/email/verify', { params: { token: route.query.token } })
    message.value = data.message
  } catch (e) {
    error.value = e.response?.data?.error || 'Invalid verification link'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
      <div v-if="loading" class="py-8">
        <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
      <div v-else-if="message" class="space-y-4">
        <span class="text-4xl">✅</span>
        <h2 class="text-lg font-bold text-gray-900">{{ message }}</h2>
        <BaseButton variant="primary" block @click="router.push('/')">Go to Dashboard</BaseButton>
      </div>
      <div v-else class="space-y-4">
        <span class="text-4xl">😕</span>
        <h2 class="text-lg font-bold text-gray-900">{{ error }}</h2>
        <BaseButton variant="secondary" block @click="router.push('/')">Go to Dashboard</BaseButton>
      </div>
    </div>
  </div>
</template>
