import client from './client'
export { uploadPhoto } from './milestones'

export function getDiaryEntries(params = {}) {
  return client.get('/diary_entries', { params })
}

export function createDiaryEntry(data) {
  return client.post('/diary_entries', { diary_entry: data })
}

export function updateDiaryEntry(id, data) {
  return client.patch(`/diary_entries/${id}`, { diary_entry: data })
}

export function deleteDiaryEntry(id) {
  return client.delete(`/diary_entries/${id}`)
}
