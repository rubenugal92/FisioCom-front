<template>
  <div class="app-container">

    <div class="left-panel">
      <Calendar
        :appointments="store.items"
        @appointment-selected="store.select"
        @date-selected="onDateSelected"
      />
    </div>

    <div class="right-panel">
      <AppointmentForm
        :appointment="store.selected"
        :selected-date="selectedDate"
        @save="store.save"
        @delete="store.remove"
        @clear="store.select(null)"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppointmentsStore } from '../stores/appointments'

import Calendar from '../components/Calendar.vue'
import AppointmentForm from '../components/AppointmentForm.vue'

const store = useAppointmentsStore()
const selectedDate = ref(null)

onMounted(() => {
  store.load()
})

const onDateSelected = (date) => {
  selectedDate.value = date
}
</script>