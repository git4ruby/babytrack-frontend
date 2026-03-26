import client from './client'

export function getMilestones(params = {}) {
  return client.get('/milestones', { params })
}

export function createMilestone(data) {
  return client.post('/milestones', { milestone: data })
}

export function updateMilestone(id, data) {
  return client.patch(`/milestones/${id}`, { milestone: data })
}

export function deleteMilestone(id) {
  return client.delete(`/milestones/${id}`)
}
