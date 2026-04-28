<template>
  <div class="app-container">
    <Calendar
      :appointments="store.items"
      @appointment-selected="store.select"
    />

    <AppointmentForm
      :appointment="store.selected"
      @save="store.save"
      @delete="store.remove"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppointmentsStore } from '../stores/appointments'
import Calendar from '../components/Calendar.vue'
import AppointmentForm from '../components/AppointmentForm.vue'

const store = useAppointmentsStore()

onMounted(() => {
  store.fetch()
})
</script>