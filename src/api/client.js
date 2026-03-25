import axios from 'axios'
import router from '@/router'

const client = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT + baby_id
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('bt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Attach current baby_id to all requests
  const babyId = localStorage.getItem('bt_baby_id')
  if (babyId) {
    config.params = config.params || {}
    if (!config.params.baby_id) {
      config.params.baby_id = babyId
    }
  }

  return config
})

// Response interceptor: handle 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bt_token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default client
