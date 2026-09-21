import axios from 'axios'

let baseURL = import.meta.env.VITE_API_URL || '/api'
if (baseURL.startsWith('http') && !baseURL.endsWith('/api')) {
  baseURL = `${baseURL}/api`
}

const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true // Passes secure HttpOnly session cookies automatically
})

export default api
