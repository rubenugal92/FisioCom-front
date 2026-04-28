import { defineStore } from 'pinia'
import {
  getAllFisios,
  createFisio,
  updateFisio,
  deleteFisio
} from '../api/appointments'

export const useFisiosStore = defineStore('fisios', {
  state: () => ({
    items: [],
    loading: false,
    editing: null
  }),

  actions: {
    async fetch() {
      this.items = await getAllFisios()
    },

    async save(data) {
      if (this.editing) {
        await updateFisio(this.editing.id, data)
      } else {
        await createFisio(data)
      }
      this.editing = null
      await this.fetch()
    },

    async remove(id) {
      await deleteFisio(id)
      await this.fetch()
    },

    edit(fisio) {
      this.editing = fisio
    }
  }
})