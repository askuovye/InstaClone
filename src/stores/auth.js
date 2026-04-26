import { defineStore } from 'pinia'
import { auth as authApi } from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('instaclone.user') || 'null'),
    token: localStorage.getItem('instaclone.token') || localStorage.getItem('auth_token') || null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    setAuth(accessToken, userData) {
      this.token = accessToken
      this.user = userData
      localStorage.setItem('instaclone.token', accessToken)
      localStorage.setItem('instaclone.user', JSON.stringify(userData))
      // cleanup old keys
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    },

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('instaclone.token')
      localStorage.removeItem('instaclone.user')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    },

    async login(email, password) {
      this.loading = true
      try {
        const data = await authApi.login({ email, password })
        this.setAuth(data.access_token, data.user)
        return data.user
      } finally {
        this.loading = false
      }
    },

    async register(payload) {
      this.loading = true
      try {
        const data = await authApi.register(payload)
        this.setAuth(data.access_token, data.user)
        return data.user
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await authApi.logout()
      } catch {
        // Even if the server call fails, clear local state
      }
      this.clearAuth()
    },

    async hydrateAuthState() {
      if (!this.token) return null
      
      try {
        const data = await authApi.me()
        this.user = data
        localStorage.setItem('instaclone.user', JSON.stringify(data))
        return data
      } catch {
        this.clearAuth()
        return null
      }
    }
  }
})
