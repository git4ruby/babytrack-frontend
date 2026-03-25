import client from './client'

export function getWeightLogs(params = {}) {
  return client.get('/weight_logs', { params })
}

export function createWeightLog(data) {
  return client.post('/weight_logs', { weight_log: data })
}

export function updateWeightLog(id, data) {
  return client.patch(`/weight_logs/${id}`, { weight_log: data })
}

export function deleteWeightLog(id) {
  return client.delete(`/weight_logs/${id}`)
}

export function getPercentiles() {
  return client.get('/weight_logs/percentiles')
}
