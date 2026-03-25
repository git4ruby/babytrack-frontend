import client from './client'

export function getAppointments(params = {}) {
  return client.get('/appointments', { params })
}

export function createAppointment(data) {
  return client.post('/appointments', { appointment: data })
}

export function updateAppointment(id, data) {
  return client.patch(`/appointments/${id}`, { appointment: data })
}

export function deleteAppointment(id) {
  return client.delete(`/appointments/${id}`)
}

export function getNextAppointment() {
  return client.get('/appointments/next_upcoming')
}
