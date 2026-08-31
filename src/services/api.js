import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default axios.create({
  baseURL,
  timeout: 30000
})
