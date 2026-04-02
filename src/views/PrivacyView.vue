<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold shadow-lg shadow-blue-500/30 mb-3">B</div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white">Privacy Policy</h1>
        <p class="text-sm text-gray-400 mt-1">BabyTrack — Last updated March 2026</p>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 space-y-8">
        <!-- Intro -->
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          BabyTrack is a private baby tracking application. We take your family's privacy seriously. This policy explains what data we collect, how we use it, and your rights.
        </p>

        <section>
          <h2 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-3">
            <span class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
            What We Collect
          </h2>
          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400 pl-9">
            <li class="flex items-start gap-2"><span class="text-blue-400 mt-1">•</span>Account information (name, email, phone number)</li>
            <li class="flex items-start gap-2"><span class="text-blue-400 mt-1">•</span>Baby profiles (name, date of birth, gender)</li>
            <li class="flex items-start gap-2"><span class="text-blue-400 mt-1">•</span>Feeding logs, diaper changes, weight measurements</li>
            <li class="flex items-start gap-2"><span class="text-blue-400 mt-1">•</span>Milk storage, vaccinations, appointments, milestones</li>
            <li class="flex items-start gap-2"><span class="text-blue-400 mt-1">•</span>Inbound SMS, email, and Telegram messages for logging</li>
          </ul>
        </section>

        <section>
          <h2 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-3">
            <span class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">2</span>
            How We Use Your Data
          </h2>
          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400 pl-9">
            <li class="flex items-start gap-2"><span class="text-emerald-400 mt-1">•</span>To provide the baby tracking service</li>
            <li class="flex items-start gap-2"><span class="text-emerald-400 mt-1">•</span>To process SMS, email, and Telegram messages and create records</li>
            <li class="flex items-start gap-2"><span class="text-emerald-400 mt-1">•</span>To send confirmation emails and reminders</li>
          </ul>
          <div class="mt-3 ml-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
            <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">We do NOT sell, share, or monetize your data in any way.</p>
          </div>
        </section>

        <section>
          <h2 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-3">
            <span class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-bold">3</span>
            Third-Party Services
          </h2>
          <div class="space-y-2 pl-9">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-start gap-3">
              <span class="text-lg">📱</span>
              <div><p class="text-sm font-semibold text-gray-800 dark:text-gray-200">Twilio</p><p class="text-xs text-gray-500 dark:text-gray-400">Receives and routes inbound SMS messages (premium feature, not enabled by default)</p></div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-start gap-3">
              <span class="text-lg">🤖</span>
              <div><p class="text-sm font-semibold text-gray-800 dark:text-gray-200">Google Gemini AI</p><p class="text-xs text-gray-500 dark:text-gray-400">Parses natural language messages into structured data</p></div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-start gap-3">
              <span class="text-lg">📧</span>
              <div><p class="text-sm font-semibold text-gray-800 dark:text-gray-200">Gmail</p><p class="text-xs text-gray-500 dark:text-gray-400">Receives inbound emails and sends confirmations</p></div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-start gap-3">
              <span class="text-lg">✈️</span>
              <div><p class="text-sm font-semibold text-gray-800 dark:text-gray-200">Telegram</p><p class="text-xs text-gray-500 dark:text-gray-400">Receives messages via Telegram Bot for logging baby data (free, opt-in)</p></div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-3">
            <span class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">4</span>
            Data Security
          </h2>
          <div class="grid grid-cols-2 gap-2 pl-9">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <span class="text-lg">🔒</span>
              <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">bcrypt encrypted passwords</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <span class="text-lg">🔑</span>
              <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">JWT authentication</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <span class="text-lg">🗑️</span>
              <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">Emails deleted after processing</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <span class="text-lg">🌐</span>
              <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">HTTPS enforced</p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-3">
            <span class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-bold">5</span>
            Data Retention & Deletion
          </h2>
          <div class="text-sm text-gray-600 dark:text-gray-400 pl-9 space-y-2">
            <p>Your data is stored as long as your account is active. You can:</p>
            <ul class="space-y-1">
              <li class="flex items-start gap-2"><span class="text-red-400 mt-1">•</span>Delete individual records at any time</li>
              <li class="flex items-start gap-2"><span class="text-red-400 mt-1">•</span>Delete a baby profile and all associated data</li>
              <li class="flex items-start gap-2"><span class="text-red-400 mt-1">•</span>Export all your data as CSV</li>
              <li class="flex items-start gap-2"><span class="text-red-400 mt-1">•</span>Request full account deletion</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-3">
            <span class="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 text-xs font-bold">6</span>
            Your Rights
          </h2>
          <div class="pl-9 grid grid-cols-3 gap-2">
            <div class="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3 text-center">
              <p class="text-lg mb-1">👁️</p>
              <p class="text-xs font-semibold text-sky-800 dark:text-sky-300">Access</p>
              <p class="text-[10px] text-sky-600 dark:text-sky-400">View & export all data</p>
            </div>
            <div class="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3 text-center">
              <p class="text-lg mb-1">✏️</p>
              <p class="text-xs font-semibold text-sky-800 dark:text-sky-300">Correct</p>
              <p class="text-[10px] text-sky-600 dark:text-sky-400">Edit any record</p>
            </div>
            <div class="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3 text-center">
              <p class="text-lg mb-1">🗑️</p>
              <p class="text-xs font-semibold text-sky-800 dark:text-sky-300">Delete</p>
              <p class="text-[10px] text-sky-600 dark:text-sky-400">Remove your data</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center space-x-4">
        <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Back to Login</router-link>
        <router-link to="/" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Back to App</router-link>
      </div>
    </div>
  </div>
</template>
