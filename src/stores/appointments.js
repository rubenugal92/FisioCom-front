import { defineStore } from 'pinia'
import {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../api/appointments'

export const useAppointmentsStore = defineStore('appointments', {
  state: () => ({
    items: [],
    loading: false,
    selected: null
  }),

  actions: {
    async fetch() {
      this.loading = true
      try {
        this.items = await getAllAppointments()
      } finally {
        this.loading = false
      }
    },

    async save(data) {
      if (data.id) {
        await updateAppointment(data.id, data)
      } else {
        await createAppointment(data)
      }
      await this.fetch()
    },

    async remove(id) {
      await deleteAppointment(id)
      await this.fetch()
    },

    select(appointment) {
      this.selected = appointment
    }
  }
})