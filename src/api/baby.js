import client from './client'

export function getBaby() {
  return client.get('/baby')
}

export function updateBaby(data) {
  return client.patch('/baby', { baby: data })
}
