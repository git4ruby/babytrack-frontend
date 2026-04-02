<script setup>
import { ref } from 'vue'
import client from '@/api/client'
import BaseButton from '@/components/ui/BaseButton.vue'

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await client.post('/password/forgot', { email: email.value })
    sent.value = true
  } catch {
    error.value = 'Something went wrong. Please try again.'
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
        <h1 class="text-2xl font-black text-gray-900">Reset Password</h1>
      </div>

      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
        <div v-if="sent" class="text-center space-y-4">
          <span class="text-4xl">📧</span>
          <h2 class="text-lg font-bold text-gray-900">Check your email</h2>
          <p class="text-sm text-gray-500">If an account exists with <strong>{{ email }}</strong>, you'll receive a password reset link.</p>
          <router-link to="/login" class="inline-block text-sm text-blue-600 font-semibold hover:text-blue-700">Back to Sign In</router-link>
        </div>

        <form v-else @submit.prevent="submit" class="space-y-4">
          <p class="text-sm text-gray-500 mb-4">Enter your email and we'll send you a link to reset your password.</p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="email" type="email" required placeholder="you@example.com"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white" />
          </div>
          <div v-if="error" class="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 font-medium">{{ error }}</div>
          <BaseButton variant="primary" block :loading="loading" :disabled="!email">Send Reset Link</BaseButton>
          <div class="text-center">
            <router-link to="/login" class="text-sm text-blue-600 font-semibold hover:text-blue-700">Back to Sign In</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
