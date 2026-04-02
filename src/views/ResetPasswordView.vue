<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import client from '@/api/client'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function submit() {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = "Passwords don't match"
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  loading.value = true
  try {
    await client.post('/password/reset', {
      token: route.query.token,
      password: password.value,
    })
    success.value = true
  } catch (e) {
    error.value = e.response?.data?.errors?.[0] || 'Failed to reset password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold shadow-lg shadow-blue-500/30 mb-3">B</div>
        <h1 class="text-2xl font-black text-gray-900">Set New Password</h1>
      </div>

      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
        <div v-if="success" class="text-center space-y-4">
          <span class="text-4xl">✅</span>
          <h2 class="text-lg font-bold text-gray-900">Password reset!</h2>
          <p class="text-sm text-gray-500">You can now sign in with your new password.</p>
          <BaseButton variant="primary" block @click="router.push('/login')">Sign In</BaseButton>
        </div>

        <form v-else @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input v-model="password" type="password" required placeholder="At least 6 characters"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input v-model="confirm" type="password" required placeholder="Repeat password"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
          </div>
          <div v-if="error" class="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 font-medium">{{ error }}</div>
          <BaseButton variant="primary" block :loading="loading" :disabled="!password || !confirm">Reset Password</BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>
