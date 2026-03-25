import client from './client'

export function getMilkStashes(params = {}) {
  return client.get('/milk_stashes', { params })
}

export function getMilkStash(id) {
  return client.get(`/milk_stashes/${id}`)
}

export function createMilkStash(data) {
  return client.post('/milk_stashes', { milk_stash: data })
}

export function consumeMilkStash(id, data) {
  return client.post(`/milk_stashes/${id}/consume`, data)
}

export function discardMilkStash(id, data) {
  return client.post(`/milk_stashes/${id}/discard`, data)
}

export function transferMilkStash(id, data) {
  return client.post(`/milk_stashes/${id}/transfer`, data)
}

export function getMilkInventory() {
  return client.get('/milk_stashes/inventory')
}

export function getMilkHistory(params = {}) {
  return client.get('/milk_stashes/history', { params })
}
