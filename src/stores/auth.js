import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('bt_user') || 'null'))
  const token = ref(localStorage.getItem('bt_token'))

  const isAuthenticated = computed(() => !!token.value)

  async function signIn(email, password) {
    const result = await authApi.signIn(email, password)
    token.value = result.token
    user.value = result.user
    localStorage.setItem('bt_token', result.token)
    localStorage.setItem('bt_user', JSON.stringify(result.user))
  }

  async function signOut() {
    try {
      await authApi.signOut()
    } catch {
      // Token may already be expired
    }
    token.value = null
    user.value = null
    localStorage.removeItem('bt_token')
    localStorage.removeItem('bt_user')
  }

  return { user, token, isAuthenticated, signIn, signOut }
})
