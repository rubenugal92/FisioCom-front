import { defineStore } from 'pinia'
import { login, register, logout, getUser } from '../api/appointments'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getUser(),
    isAuthenticated: !!getUser(),
    loading: false,
    error: null
  }),

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        await login(email, password)
        this.user = getUser()
        this.isAuthenticated = true
      } finally {
        this.loading = false
      }
    },

    async register(username, email, password) {
      await register(username, email, password)
    },

    logout() {
      logout()
      this.user = null
      this.isAuthenticated = false
    }
  }
})