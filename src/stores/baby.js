import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBaby } from '@/api/baby'

export const useBabyStore = defineStore('baby', () => {
  const baby = ref(null)
  const loading = ref(false)

  async function fetchBaby() {
    loading.value = true
    try {
      const { data } = await getBaby()
      baby.value = data.data
    } finally {
      loading.value = false
    }
  }

  return { baby, loading, fetchBaby }
})
