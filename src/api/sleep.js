import client from './client'

export function getSleepLogs(params = {}) {
  return client.get('/sleep_logs', { params })
}

export function createSleepLog(data) {
  return client.post('/sleep_logs', { sleep_log: data })
}

export function updateSleepLog(id, data) {
  return client.patch(`/sleep_logs/${id}`, { sleep_log: data })
}

export function deleteSleepLog(id) {
  return client.delete(`/sleep_logs/${id}`)
}

export function getSleepSummary(params = {}) {
  return client.get('/sleep_logs/summary', { params })
}
