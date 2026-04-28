import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const http = axios.create({
  baseURL: API_BASE,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

/**
 * Request Interceptor: Automatically attaches the Sanctum bearer token from localStorage.
 */
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('instaclone.token') || localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response Interceptor: Handles data extraction, 401 redirects, and error formatting.
 */
http.interceptors.response.use(
  (response) => {
    // Axios response.data is the actual JSON response from our API
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('instaclone.token')
      localStorage.removeItem('auth_token')
      
      // Use dynamic import for router to avoid circular dependencies
      import('../router').then(m => {
        m.default.push('/login')
      })
      
      return Promise.reject(new Error('Unauthorized'))
    }

    const data = error.response?.data || {}
    const formattedError = new Error(data.message || 'Request failed')
    formattedError.status = error.response?.status
    formattedError.data = data
    formattedError.errors = data.errors || null
    
    return Promise.reject(formattedError)
  }
)

export default http
