import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('token')
  }),

  actions: {
    login(token) {
      localStorage.setItem('token', token)
      this.isAuthenticated = true
    },

    logout() {
      localStorage.removeItem('token')
      this.isAuthenticated = false
    }
  }
})