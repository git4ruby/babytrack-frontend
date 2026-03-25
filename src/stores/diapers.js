import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as diapersApi from '@/api/diapers'

export const useDiapersStore = defineStore('diapers', () => {
  const changes = ref([])
  const todaySummary = ref(null)
  const stats = ref(null)
  const meta = ref({})
  const loading = ref(false)

  async function fetchChanges(params = {}) {
    loading.value = true
    try {
      const { data } = await diapersApi.getDiaperChanges(params)
      changes.value = data.data
      meta.value = data.meta
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary(date) {
    const { data } = await diapersApi.getDiaperSummary({ date })
    todaySummary.value = data.data
  }

  async function fetchStats(params = {}) {
    const { data } = await diapersApi.getDiaperStats(params)
    stats.value = data.data
  }

  async function logChange(changeData) {
    const { data } = await diapersApi.createDiaperChange(changeData)
    changes.value.unshift(data.data)
    return data.data
  }

  async function removeChange(id) {
    await diapersApi.deleteDiaperChange(id)
    changes.value = changes.value.filter(c => c.id !== id)
  }

  return {
    changes, todaySummary, stats, meta, loading,
    fetchChanges, fetchSummary, fetchStats, logChange, removeChange,
  }
})
