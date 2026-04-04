<script setup>
import { ref } from 'vue'
import client from '@/api/client'

const props = defineProps({
  open: Boolean,
})

const emit = defineEmits(['accepted'])

const loading = ref(false)

async function acceptTerms() {
  loading.value = true
  try {
    await client.post('/profile/accept_terms')
    emit('accepted')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4">
      <div class="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white">
          <h2 class="text-lg font-bold">Welcome to LullaTrack</h2>
          <p class="text-sm text-blue-100 mt-1">Please review and accept our terms to continue</p>
        </div>

        <!-- Content -->
        <div class="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-gray-700 dark:text-slate-300">
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-1">Terms of Service</h3>
            <p>By using LullaTrack, you agree to the following:</p>
          </div>

          <div class="space-y-3">
            <div class="flex gap-3">
              <span class="text-blue-500 font-bold mt-0.5">1.</span>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Personal Use Only</p>
                <p class="text-gray-500 dark:text-slate-400 text-xs mt-0.5">LullaTrack is a personal baby tracking tool for families. It is not a medical device and should not replace professional medical advice.</p>
              </div>
            </div>

            <div class="flex gap-3">
              <span class="text-blue-500 font-bold mt-0.5">2.</span>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Your Data</p>
                <p class="text-gray-500 dark:text-slate-400 text-xs mt-0.5">Your baby's data is private and belongs to you. We do not sell, share, or monetize your personal data or your baby's information with any third parties.</p>
              </div>
            </div>

            <div class="flex gap-3">
              <span class="text-blue-500 font-bold mt-0.5">3.</span>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Shared Access</p>
                <p class="text-gray-500 dark:text-slate-400 text-xs mt-0.5">You are responsible for managing who has access to your baby's data through the sharing feature. Only share with trusted family members and caregivers.</p>
              </div>
            </div>

            <div class="flex gap-3">
              <span class="text-blue-500 font-bold mt-0.5">4.</span>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Messaging Services</p>
                <p class="text-gray-500 dark:text-slate-400 text-xs mt-0.5">If you use SMS, email, or Telegram to log data, your messages are processed to extract baby care information and are not stored after processing. Standard messaging rates may apply for SMS.</p>
              </div>
            </div>

            <div class="flex gap-3">
              <span class="text-blue-500 font-bold mt-0.5">5.</span>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Account Deletion</p>
                <p class="text-gray-500 dark:text-slate-400 text-xs mt-0.5">You may request deletion of your account and all associated data at any time by contacting us. We will remove your data within 30 days of the request.</p>
              </div>
            </div>

            <div class="flex gap-3">
              <span class="text-blue-500 font-bold mt-0.5">6.</span>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Service Availability</p>
                <p class="text-gray-500 dark:text-slate-400 text-xs mt-0.5">LullaTrack is provided as-is. We strive to keep the service running but do not guarantee uninterrupted availability. We may update or modify features at any time.</p>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-gray-100 dark:border-slate-700">
            <p class="text-xs text-gray-400 dark:text-slate-500">
              For full details, see our <a href="/privacy" target="_blank" class="text-blue-500 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <button
            @click="acceptTerms"
            :disabled="loading"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition shadow-md shadow-blue-500/25 disabled:opacity-50"
          >
            {{ loading ? 'Accepting...' : 'I Accept the Terms of Service' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
