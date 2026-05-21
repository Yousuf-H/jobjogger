import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
const API_ROOT_URL = API_BASE_URL.replace('/api/v1', '')

export const googleOAuthUrl = `${API_ROOT_URL}/auth/google_oauth2`

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
})

// Response interceptor - handle 401 (unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const isAuthEndpoint = url.includes('/sign_in') || url.includes('/sign_up')
      // On /auth/callback we handle the redirect ourselves so the error banner shows
      const isOAuthCallback = window.location.pathname === '/auth/callback'
      if (isAuthEndpoint || isOAuthCallback) {
        return Promise.reject(error)
      }
      localStorage.removeItem('user')
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)
