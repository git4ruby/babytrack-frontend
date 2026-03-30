import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as feedingsApi from '@/api/feedings'

export const useFeedingsStore = defineStore('feedings', () => {
  const feedings = ref([])
  const todaySummary = ref(null)
  const lastFeeding = ref(null)
  const meta = ref({})
  const loading = ref(false)

  async function fetchFeedings(params = {}) {
    loading.value = true
    try {
      const { data } = await feedingsApi.getFeedings(params)
      feedings.value = data.data
      meta.value = data.meta
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary(date) {
    const { data } = await feedingsApi.getFeedingSummary({ date })
    todaySummary.value = data.data
  }

  async function fetchLastFeeding() {
    const { data } = await feedingsApi.getLastFeeding()
    lastFeeding.value = data.data
  }

  async function logFeed(feedData) {
    const { data } = await feedingsApi.createFeeding(feedData)
    feedings.value.unshift(data.data)
    return data.data
  }

  async function updateFeed(id, feedData) {
    const { data } = await feedingsApi.updateFeeding(id, feedData)
    const idx = feedings.value.findIndex(f => f.id === id)
    if (idx !== -1) feedings.value[idx] = data.data
    return data.data
  }

  async function removeFeed(id) {
    await feedingsApi.deleteFeeding(id)
    feedings.value = feedings.value.filter((f) => f.id !== id)
  }

  return {
    feedings, todaySummary, lastFeeding, meta, loading,
    fetchFeedings, fetchSummary, fetchLastFeeding, logFeed, updateFeed, removeFeed,
  }
})
