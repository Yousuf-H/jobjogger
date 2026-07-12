import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
const API_ROOT_URL = API_BASE_URL.replace('/api/v1', '')

const googleOAuthUrl = `${API_ROOT_URL}/auth/google_oauth2`

// OmniAuth 2 requires POST for the request phase to prevent cross-site initiation.
// Params go on the query string (not the body) because OmniAuth stores request.GET
// as omniauth.params for the callback phase to read.
export function submitGoogleOAuthForm(params?: Record<string, string>) {
  const url = new URL(googleOAuthUrl)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url.toString()

  document.body.appendChild(form)
  form.submit()
}

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
