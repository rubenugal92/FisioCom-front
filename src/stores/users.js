import { defineStore } from 'pinia'
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../api/appointments'

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [],
    loading: false,
    editing: null
  }),

  actions: {
    async fetch() {
      this.items = await getAllUsers()
    },

    async save(data) {
      if (this.editing) {
        await updateUser(this.editing.id, data)
      } else {
        await createUser(data)
      }
      this.editing = null
      await this.fetch()
    },

    async remove(id) {
      await deleteUser(id)
      await this.fetch()
    },

    edit(user) {
      this.editing = user
    }
  }
})
