import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getBaby, getBabies, createBaby } from '@/api/baby'

export const useBabyStore = defineStore('baby', () => {
  const baby = ref(null)
  const babies = ref([])
  const loading = ref(false)

  const hasBaby = computed(() => !!baby.value)
  const hasManyBabies = computed(() => babies.value.length > 1)

  // Persist selected baby_id
  watch(baby, (b) => {
    if (b?.id) {
      localStorage.setItem('bt_baby_id', b.id)
    }
  })

  async function fetchBaby() {
    loading.value = true
    try {
      const { data } = await getBaby()
      baby.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchBabies() {
    const { data } = await getBabies()
    babies.value = data.data
  }

  async function addBaby(babyData) {
    const { data } = await createBaby(babyData)
    babies.value.push(data.data)
    baby.value = data.data
    return data.data
  }

  function switchBaby(babyId) {
    const found = babies.value.find(b => b.id === babyId)
    if (found) {
      baby.value = found
      // Force reload page data for new baby
      window.location.reload()
    }
  }

  return { baby, babies, loading, hasBaby, hasManyBabies, fetchBaby, fetchBabies, addBaby, switchBaby }
})
