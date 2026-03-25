import client from './client'

export function getBaby() {
  return client.get('/baby')
}

export function getBabies() {
  return client.get('/babies')
}

export function createBaby(data) {
  return client.post('/babies', { baby: data })
}

export function updateBaby(data) {
  return client.patch('/baby', { baby: data })
}
