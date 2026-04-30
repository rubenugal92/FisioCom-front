import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  }),

  actions: {
    login(token, user) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      this.token = token
      this.user = user
      this.isAuthenticated = true
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.token = null
      this.user = null
      this.isAuthenticated = false
    }
  }
})