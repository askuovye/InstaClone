import { ref, computed } from 'vue'
import { auth as authApi } from '../services/api'

/**
 * Reactive auth state — shared across all components that call useAuth().
 * State lives in module scope so it's a singleton.
 */
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const token = ref(localStorage.getItem('auth_token') || null)
const loading = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  /**
   * Persist auth credentials to localStorage and reactive state.
   */
  function setAuth(accessToken, userData) {
    token.value = accessToken
    user.value = userData
    localStorage.setItem('auth_token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  /**
   * Clear auth credentials from localStorage and reactive state.
   */
  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  /**
   * Login with email + password. Returns the user on success.
   * Throws on failure (caller should catch and display errors).
   */
  async function login(email, password) {
    loading.value = true
    try {
      const data = await authApi.login({ email, password })
      setAuth(data.access_token, data.user)
      return data.user
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a new account. Returns the user on success.
   */
  async function register(payload) {
    loading.value = true
    try {
      const data = await authApi.register(payload)
      setAuth(data.access_token, data.user)
      return data.user
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout — revokes the token on the server, then clears local state.
   */
  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Even if the server call fails, clear local state
    }
    clearAuth()
  }

  /**
   * Fetch the current user from the server and update local state.
   * Useful for refreshing user data (e.g. after profile edit).
   */
  async function fetchUser() {
    try {
      const data = await authApi.me()
      user.value = data
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch {
      clearAuth()
      return null
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    setAuth,
    clearAuth,
  }
}
