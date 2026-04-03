<script setup>
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import BaseButton from '@/components/ui/BaseButton.vue'
import { TrashIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()
const { confirm } = useConfirm()

const users = ref([])
const stats = ref(null)
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const [usersRes, statsRes] = await Promise.all([
      client.get('/admin/users'),
      client.get('/admin/stats'),
    ])
    users.value = usersRes.data.data
    stats.value = statsRes.data.data
  } catch (e) {
    if (e.response?.status === 403) {
      ui.showToast('Admin access only', 'error')
    }
  } finally {
    loading.value = false
  }
}

async function toggleSms(user) {
  try {
    await client.patch(`/admin/users/${user.id}`, { user: { sms_enabled: !user.sms_enabled } })
    user.sms_enabled = !user.sms_enabled
    ui.showToast(`SMS ${user.sms_enabled ? 'enabled' : 'disabled'} for ${user.name}`)
  } catch {
    ui.showToast('Failed', 'error')
  }
}

async function deleteUser(user) {
  const ok = await confirm({ title: `Delete ${user.name}?`, message: `This will permanently delete ${user.name} (${user.email}) and all their data.`, confirmLabel: 'Delete' })
  if (!ok) return
  try {
    await client.delete(`/admin/users/${user.id}`)
    users.value = users.value.filter(u => u.id !== user.id)
    ui.showToast('User deleted')
  } catch (e) {
    ui.showToast(e.response?.data?.error || 'Failed', 'error')
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin</h1>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
        <p class="text-3xl font-black text-slate-800 dark:text-white">{{ stats.total_users }}</p>
        <p class="text-xs font-medium text-slate-400 uppercase">Users</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
        <p class="text-3xl font-black text-blue-600">{{ stats.total_babies }}</p>
        <p class="text-xs font-medium text-slate-400 uppercase">Babies</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
        <p class="text-3xl font-black text-green-600">{{ stats.total_feedings }}</p>
        <p class="text-xs font-medium text-slate-400 uppercase">Feedings</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
        <p class="text-3xl font-black text-purple-600">{{ stats.telegram_users }}</p>
        <p class="text-xs font-medium text-slate-400 uppercase">Telegram Users</p>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
        <h2 class="text-sm font-bold text-gray-700 dark:text-slate-200">All Users</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-slate-900 border-b dark:border-slate-700">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">User</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Babies</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">SMS</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400 hidden sm:table-cell">Telegram</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400 hidden md:table-cell">Joined</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-slate-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-slate-700">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                <p class="text-xs text-gray-400 dark:text-slate-500">{{ user.email }}</p>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-slate-300">{{ user.babies_count }}</td>
              <td class="px-4 py-3">
                <button @click="toggleSms(user)"
                  :class="['text-xs font-bold px-2 py-1 rounded-full', user.sms_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400']">
                  {{ user.sms_enabled ? 'ON' : 'OFF' }}
                </button>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span :class="['text-xs font-bold px-2 py-1 rounded-full', user.telegram_linked ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400']">
                  {{ user.telegram_linked ? 'Linked' : 'No' }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-400 dark:text-slate-500 hidden md:table-cell">{{ new Date(user.created_at).toLocaleDateString() }}</td>
              <td class="px-4 py-3 text-right">
                <button v-if="user.id !== 1" @click="deleteUser(user)" class="p-1 text-gray-300 hover:text-red-500"><TrashIcon class="w-4 h-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
