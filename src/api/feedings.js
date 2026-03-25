import client from './client'

export function getFeedings(params = {}) {
  return client.get('/feedings', { params })
}

export function getFeeding(id) {
  return client.get(`/feedings/${id}`)
}

export function createFeeding(data) {
  return client.post('/feedings', { feeding: data })
}

export function updateFeeding(id, data) {
  return client.patch(`/feedings/${id}`, { feeding: data })
}

export function deleteFeeding(id) {
  return client.delete(`/feedings/${id}`)
}

export function getFeedingSummary(params = {}) {
  return client.get('/feedings/summary', { params })
}

export function getLastFeeding() {
  return client.get('/feedings/last')
}
