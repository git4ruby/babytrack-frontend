import client from './client'

export function getDiaperChanges(params = {}) {
  return client.get('/diaper_changes', { params })
}

export function createDiaperChange(data) {
  return client.post('/diaper_changes', { diaper_change: data })
}

export function updateDiaperChange(id, data) {
  return client.patch(`/diaper_changes/${id}`, { diaper_change: data })
}

export function deleteDiaperChange(id) {
  return client.delete(`/diaper_changes/${id}`)
}

export function getDiaperSummary(params = {}) {
  return client.get('/diaper_changes/summary', { params })
}

export function getDiaperStats(params = {}) {
  return client.get('/diaper_changes/stats', { params })
}
