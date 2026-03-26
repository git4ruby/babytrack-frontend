<script setup>
import { ref, onMounted } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const ui = useUiStore()

const phoneNumber = ref('')
const loading = ref(false)

const smsNumber = '+1 571 570 3445'
const emailAddress = import.meta.env.VITE_INBOUND_EMAIL || 'babytrack.log@gmail.com'

onMounted(async () => {
  try {
    const { data } = await client.get('/auth/sign_up') // get current user
  } catch {}
  phoneNumber.value = auth.user?.phone_number || ''
})

async function savePhone() {
  loading.value = true
  try {
    await client.patch('/auth/sign_up', {
      user: { phone_number: phoneNumber.value || null }
    })
    ui.showToast('Phone number saved')
  } catch (e) {
    ui.showToast(e.response?.data?.errors?.[0] || 'Failed to save', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Settings</h1>

    <!-- SMS / Email Logging -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-1">Log via SMS or Email</h2>
      <p class="text-sm text-gray-500 mb-6">Skip the app — just send a text or email to log feeds, diapers, milestones and more.</p>

      <!-- How it works -->
      <div class="bg-slate-50 rounded-xl p-5 mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3">How it works</h3>
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            <p>Send a text or email with what you want to log</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
            <p>Our AI reads your message and creates the record</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
            <p>You get a confirmation email with what was logged</p>
          </div>
        </div>
      </div>

      <!-- Example messages -->
      <div class="bg-blue-50 rounded-xl p-5 mb-6">
        <h3 class="text-sm font-bold text-blue-900 mb-3">Example messages</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">bottle 90ml 2:30pm</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">breastfeed left 20min</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">diaper wet</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">diaper poop yellow seedy</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">pump 120ml stored in fridge</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">weight 3.8kg</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">milestone: first smile today</div>
          <div class="bg-white rounded-lg px-3 py-2 text-gray-700 font-mono text-xs">bottle 60ml formula + diaper wet</div>
        </div>
      </div>

      <!-- SMS Setup -->
      <div class="border-t border-gray-100 pt-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">📱</span>
          <div>
            <h3 class="text-sm font-bold text-gray-900">SMS</h3>
            <p class="text-xs text-gray-500">Text this number to log</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-4">
          <span class="font-mono text-lg font-bold text-gray-900">{{ smsNumber }}</span>
          <span class="text-xs text-gray-400">Save as "BabyTrack"</span>
        </div>

        <!-- Link phone number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Your Phone Number</label>
          <p class="text-xs text-gray-400 mb-2">We match incoming texts to your account by phone number</p>
          <div class="flex gap-2">
            <input
              v-model="phoneNumber"
              type="tel"
              placeholder="+1 234 567 8900"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white"
            />
            <BaseButton :loading="loading" @click="savePhone">Save</BaseButton>
          </div>
        </div>
      </div>

      <!-- Email Setup -->
      <div class="border-t border-gray-100 pt-6 mt-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">📧</span>
          <div>
            <h3 class="text-sm font-bold text-gray-900">Email</h3>
            <p class="text-xs text-gray-500">Email this address to log (matched by your account email)</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <span class="font-mono text-sm font-bold text-gray-900">{{ emailAddress }}</span>
          <span class="text-xs text-gray-400">No setup needed</span>
        </div>
        <p class="text-xs text-gray-400 mt-2">Just send from the same email you signed up with: <strong>{{ auth.user?.email }}</strong></p>
      </div>
    </div>
  </div>
</template>
