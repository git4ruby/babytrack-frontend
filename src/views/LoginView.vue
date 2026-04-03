<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import client from '@/api/client'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('login') // login or signup
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const name = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.signIn(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.status === 401
      ? 'Invalid email or password'
      : 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleSignup() {
  error.value = ''
  if (password.value !== passwordConfirmation.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  loading.value = true
  try {
    await client.post('/auth/sign_up', {
      user: {
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
      }
    })
    // Auto-login after signup
    await auth.signIn(email.value, password.value)
    router.push('/')
  } catch (e) {
    const errors = e.response?.data?.errors
    error.value = Array.isArray(errors) ? errors.join('. ') : 'Signup failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'signup' : 'login'
  error.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo / Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl mb-4 shadow-lg shadow-blue-500/30">
          B
        </div>
        <h1 class="text-3xl font-black text-gray-900 dark:text-white">BabyTrack</h1>
        <p class="text-gray-500 dark:text-slate-400 mt-1">Simple tracking for your little one</p>
      </div>

      <!-- Login / Signup Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none p-5 sm:p-8">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-5">
          {{ mode === 'login' ? 'Welcome back' : 'Create your account' }}
        </h2>

        <!-- Login Form -->
        <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="Enter your password"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600"
            />
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 font-medium">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
          <div class="text-center mt-2">
            <router-link to="/forgot-password" class="text-xs text-gray-400 hover:text-blue-600">Forgot password?</router-link>
          </div>
        </form>

        <!-- Signup Form -->
        <form v-else @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Full Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              autocomplete="name"
              placeholder="Your name"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600"
            />
          </div>
          <div>
            <label for="signup-email" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Email</label>
            <input
              id="signup-email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600"
            />
          </div>
          <div>
            <label for="signup-password" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Password</label>
            <input
              id="signup-password"
              v-model="password"
              type="password"
              required
              autocomplete="new-password"
              placeholder="At least 6 characters"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600"
            />
          </div>
          <div>
            <label for="signup-password-confirm" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Confirm Password</label>
            <input
              id="signup-password-confirm"
              v-model="passwordConfirmation"
              type="password"
              required
              autocomplete="new-password"
              placeholder="Repeat your password"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600"
            />
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 font-medium">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <!-- Toggle -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500 dark:text-slate-400">
            {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
            <button @click="switchMode" class="text-blue-600 hover:text-blue-700 font-semibold ml-1">
              {{ mode === 'login' ? 'Sign Up' : 'Sign In' }}
            </button>
          </p>
        <p class="text-xs text-gray-400 dark:text-slate-500 mt-3">
          <router-link to="/privacy" class="hover:text-gray-600">Privacy Policy</router-link>
        </p>
        </div>
      </div>
    </div>
  </div>
</template>
