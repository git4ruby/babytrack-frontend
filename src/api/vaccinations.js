import client from './client'

export function getVaccinations(params = {}) {
  return client.get('/vaccinations', { params })
}

export function administerVaccination(id, data) {
  return client.post(`/vaccinations/${id}/administer`, data)
}

export function updateVaccination(id, data) {
  return client.patch(`/vaccinations/${id}`, { vaccination: data })
}

export function getUpcomingVaccinations() {
  return client.get('/vaccinations/upcoming')
}
