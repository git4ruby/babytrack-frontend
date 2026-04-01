<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p class="text-xs text-gray-400 mb-6">Last updated: March 2026</p>

      <div class="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 class="text-base font-bold text-gray-900 mb-2">What We Collect</h2>
          <p>BabyTrack collects the following data that you provide:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Account information (name, email, phone number)</li>
            <li>Baby profile (name, date of birth, gender)</li>
            <li>Feeding logs, diaper changes, weight measurements</li>
            <li>Milk storage records, vaccination records, appointments</li>
            <li>Milestones and notes</li>
            <li>Inbound SMS and email messages sent to log data</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-gray-900 mb-2">How We Use Your Data</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>To provide the baby tracking service</li>
            <li>To process inbound SMS/email messages and create records</li>
            <li>To send confirmation emails when data is logged via SMS/email</li>
            <li>To send appointment and vaccination reminders (if enabled)</li>
          </ul>
          <p class="mt-2">We do <strong>not</strong> sell, share, or monetize your data in any way.</p>
        </section>

        <section>
          <h2 class="text-base font-bold text-gray-900 mb-2">Third-Party Services</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Twilio</strong> — receives and routes inbound SMS messages</li>
            <li><strong>Google Gemini AI</strong> — parses natural language messages into structured data (message content is sent to Google's API)</li>
            <li><strong>Gmail</strong> — used to receive inbound email messages and send confirmations</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-gray-900 mb-2">Data Security</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>Passwords are encrypted using bcrypt</li>
            <li>API access requires JWT authentication</li>
            <li>Inbound emails are deleted from the inbox after processing</li>
            <li>HTTPS is enforced in production</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-gray-900 mb-2">Data Retention & Deletion</h2>
          <p>Your data is stored as long as your account is active. You can:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Delete individual records (feedings, diapers, etc.) at any time</li>
            <li>Delete a baby profile and all associated data from Settings</li>
            <li>Request full account deletion by contacting us</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-gray-900 mb-2">Your Rights</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>Access all your data via the app or CSV export</li>
            <li>Correct or update any data at any time</li>
            <li>Delete your data and account</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-gray-900 mb-2">Contact</h2>
          <p>For privacy-related questions, contact the app administrator.</p>
        </section>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-100 text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Back to Login</router-link>
        <span class="mx-3 text-gray-300">|</span>
        <router-link to="/" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Back to App</router-link>
      </div>
    </div>
  </div>
</template>
