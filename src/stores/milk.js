import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as milkApi from '@/api/milkStashes'

export const useMilkStore = defineStore('milk', () => {
  const stashes = ref([])
  const inventory = ref(null)
  const history = ref([])
  const loading = ref(false)

  async function fetchStashes(params = {}) {
    loading.value = true
    try {
      const { data } = await milkApi.getMilkStashes(params)
      stashes.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchInventory() {
    const { data } = await milkApi.getMilkInventory()
    inventory.value = data.data
  }

  async function fetchHistory(params = {}) {
    const { data } = await milkApi.getMilkHistory(params)
    history.value = data.data
  }

  async function storeMilk(stashData) {
    const { data } = await milkApi.createMilkStash(stashData)
    stashes.value.unshift(data.data)
    return data.data
  }

  async function consumeStash(id, consumeData) {
    const { data } = await milkApi.consumeMilkStash(id, consumeData)
    const idx = stashes.value.findIndex((s) => s.id === id)
    if (idx !== -1) stashes.value[idx] = data.data
    return data.data
  }

  async function discardStash(id, discardData) {
    const { data } = await milkApi.discardMilkStash(id, discardData)
    const idx = stashes.value.findIndex((s) => s.id === id)
    if (idx !== -1) stashes.value[idx] = data.data
    return data.data
  }

  async function transferStash(id, transferData) {
    const { data } = await milkApi.transferMilkStash(id, transferData)
    const idx = stashes.value.findIndex((s) => s.id === id)
    if (idx !== -1) stashes.value[idx] = data.data
    return data.data
  }

  return {
    stashes, inventory, history, loading,
    fetchStashes, fetchInventory, fetchHistory,
    storeMilk, consumeStash, discardStash, transferStash,
  }
})
