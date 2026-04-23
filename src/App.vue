<template>
  <div class="app">
    <header class="app-header">
      <h1>🏥 FisioCom</h1>

    </header>

    <div class="app-container">
      <div class="left-panel">
        <Calendar 
          :appointments="appointments"
          :loading="loading"
          @appointment-selected="selectAppointment"
          @date-selected="selectedDate = $event"
        />
      </div>

      <div class="right-panel">
        <AppointmentForm 
          :appointment="selectedAppointment"
          :selected-date="selectedDate"
          :loading="loading"
          @save="saveAppointment"
          @delete="deleteAppointment"
          @clear="selectedAppointment = null"
        />

        <div v-if="selectedAppointment" class="appointment-details">
          <h3>Detalles de la Cita</h3>
          <div class="detail-item">
            <strong>Teléfono:</strong> {{ selectedAppointment.phone }}
          </div>
          <div class="detail-item">
            <strong>Fecha/Hora:</strong> {{ formatDateTime(selectedAppointment.datetime) }}
          </div>
          <div class="detail-item">
            <strong>Servicio:</strong> {{ selectedAppointment.service }}
          </div>
          <div class="detail-item">
            <strong>Estado:</strong> 
            <span :class="'status-' + selectedAppointment.status">
              {{ selectedAppointment.status }}
            </span>
          </div>
          <div v-if="selectedAppointment.notes" class="detail-item">
            <strong>Notas:</strong> {{ selectedAppointment.notes }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="notification.show" :class="['notification', 'notification-' + notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Calendar from './components/Calendar.vue'
import AppointmentForm from './components/AppointmentForm.vue'
import { getAllAppointments } from './api/appointments.js'

export default {
  name: 'App',
  components: {
    Calendar,
    AppointmentForm
  },
  setup() {
    const appointments = ref([])
    const selectedAppointment = ref(null)
    const selectedDate = ref(null)
    const loading = ref(false)
    const notification = ref({ show: false, message: '', type: 'success' })

    const loadAppointments = async () => {
      try {
        loading.value = true
        const response = await getAllAppointments()
        appointments.value = response
      } catch (error) {
        showNotification('Error al cargar citas', 'error')
        console.error('Error loading appointments:', error)
      } finally {
        loading.value = false
      }
    }

    const saveAppointment = async (appointmentData) => {
      try {
        loading.value = true
        await loadAppointments()
        showNotification('Cita guardada correctamente', 'success')
        selectedAppointment.value = null
      } catch (error) {
        showNotification('Error al guardar la cita', 'error')
        console.error('Error saving appointment:', error)
      } finally {
        loading.value = false
      }
    }

    const deleteAppointment = async (id) => {
      if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
        return
      }
      try {
        loading.value = true
        await loadAppointments()
        showNotification('Cita eliminada correctamente', 'success')
        selectedAppointment.value = null
      } catch (error) {
        showNotification('Error al eliminar la cita', 'error')
        console.error('Error deleting appointment:', error)
      } finally {
        loading.value = false
      }
    }

    const selectAppointment = (appointment) => {
      selectedAppointment.value = appointment
    }

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type }
      setTimeout(() => {
        notification.value.show = false
      }, 3000)
    }

const formatDateTime = (datetime) => {
  if (!datetime) return ''

  const date = new Date(datetime)

  return date.toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid', // 🔥 clave
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

    onMounted(() => {
      loadAppointments()
      // Auto-refresh every 30 seconds
      setInterval(() => {
        loadAppointments()
      }, 30000)
    })

    return {
      appointments,
      selectedAppointment,
      selectedDate,
      loading,
      notification,
      saveAppointment,
      deleteAppointment,
      selectAppointment,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 2rem;
  text-align: center;
  border-bottom: 3px solid rgba(255, 255, 255, 0.2);
}

.app-header h1 {
  margin: 0;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.app-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 160px);
}

.left-panel, .right-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.appointment-details {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.appointment-details h3 {
  margin-top: 0;
  color: #333;
}

.detail-item {
  margin: 1rem 0;
  font-size: 0.95rem;
}

.detail-item strong {
  color: #667eea;
  display: inline-block;
  width: 80px;
}

.status-confirmed {
  color: #28a745;
  font-weight: bold;
}

.status-cancelled {
  color: #dc3545;
  font-weight: bold;
}

.status-pending {
  color: #ffc107;
  font-weight: bold;
}

.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-success {
  background: #28a745;
}

.notification-error {
  background: #dc3545;
}

/* === TABLET === */
@media (max-width: 1024px) {
  .app-container {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  .app-header h1 {
    font-size: 2rem;
  }
}

/* === MOBILE === */
@media (max-width: 600px) {
  .app-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 1rem;
    gap: 1rem;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
  }
}

</style>
