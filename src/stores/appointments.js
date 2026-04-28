import { defineStore } from 'pinia'
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../api/appointments.js'

export const useAppointmentsStore = defineStore('appointments', {
  state: () => ({
    items: [],
    selected: null
  }),

  actions: {
    async load() {
      this.items = await getAppointments()
    },

    select(appointment) {
      this.selected = appointment
    },

    async save(data) {
      if (this.selected?.id) {
        await updateAppointment(this.selected.id, data)
      } else {
        await createAppointment(data)
      }

      await this.load()
      this.selected = null
    },

    async remove(id) {
      await deleteAppointment(id)
      await this.load()
      this.selected = null
    }
  }
})