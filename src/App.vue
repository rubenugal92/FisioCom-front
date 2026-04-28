<template>
  <div v-if="!isAuthenticated" class="app">
    <Login @login-success="handleLoginSuccess" />
  </div>

  <div v-else class="app">
    <Navbar @logout="handleLogout" @tab-change="handleTabChange" />

    <!-- CITAS TAB -->
    <div v-if="currentTab === 'appointments'" class="app-container">
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
            <strong>Fisioterapeuta:</strong> {{ getFisioName(selectedAppointment.fisio_id) }}
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

    <!-- FISIOS TAB -->
    <div v-if="currentTab === 'fisios'" class="fisios-page">
      <div class="fisios-container">
        <h2>Gestión de Fisioterapeutas</h2>

        <!-- FORM PARA CREAR/EDITAR FISIO -->
        <div class="fisio-form-container">
          <h3>{{ editingFisio ? 'Editar Fisio' : 'Nuevo Fisio' }}</h3>
          <form @submit.prevent="saveFisio" class="fisio-form">
            <div class="form-group">
              <label>Nombre</label>
              <input 
                v-model="fisioForm.name"
                type="text"
                placeholder="Nombre completo"
                required
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input 
                v-model="fisioForm.email"
                type="email"
                placeholder="email@example.com"
                required
              />
            </div>

            <div class="form-group">
              <label>Teléfono</label>
              <input 
                v-model="fisioForm.phone"
                type="tel"
                placeholder="+34 XXX XXX XXX"
              />
            </div>

            <div class="form-group">
              <label>Especialidades</label>
              <input 
                v-model="fisioForm.specialties"
                type="text"
                placeholder="Deportiva, Rehabilitación, etc."
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Guardando...' : 'Guardar' }}
              </button>
              <button 
                v-if="editingFisio"
                type="button"
                class="btn btn-secondary"
                @click="resetFisioForm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <!-- LISTA DE FISIOS -->
        <div class="fisios-list">
          <h3>Fisioterapeutas ({{ fisios.length }})</h3>
          
          <div v-if="fisios.length === 0" class="empty-state">
            <p>No hay fisioterapeutas registrados</p>
          </div>

          <div v-else class="fisios-grid">
            <div v-for="fisio in fisios" :key="fisio.id" class="fisio-card">
              <div class="fisio-header">
                <h4>{{ fisio.name }}</h4>
                <div class="fisio-actions">
                  <button 
                    class="btn-icon"
                    @click="editFisio(fisio)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    class="btn-icon btn-danger"
                    @click="deleteFisioHandler(fisio.id)"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div class="fisio-info">
                <p><strong>Email:</strong> {{ fisio.email }}</p>
                <p v-if="fisio.phone"><strong>Teléfono:</strong> {{ fisio.phone }}</p>
                <p v-if="fisio.specialties"><strong>Especialidades:</strong> {{ fisio.specialties }}</p>
              </div>
            </div>
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
import { ref, onMounted, computed } from 'vue'
import Calendar from './components/Calendar.vue'
import AppointmentForm from './components/AppointmentForm.vue'
import Login from './components/Login.vue'
import Navbar from './components/Navbar.vue'
import { getAllAppointments, isAuthenticated, getAllFisios, createFisio, updateFisio, deleteFisio } from './api/appointments.js'

export default {
  name: 'App',
  components: {
    Calendar,
    AppointmentForm,
    Login,
    Navbar
  },
  setup() {
    const appointments = ref([])
    const selectedAppointment = ref(null)
    const selectedDate = ref(null)
    const loading = ref(false)
    const notification = ref({ show: false, message: '', type: 'success' })
    const fisios = ref([])
    const currentTab = ref('appointments')
    const editingFisio = ref(null)

    const fisioForm = ref({
      name: '',
      email: '',
      phone: '',
      specialties: ''
    })

    const isAuthenticatedComputed = computed(() => isAuthenticated())

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

    const loadFisios = async () => {
      try {
        fisios.value = await getAllFisios()
      } catch (error) {
        console.error('Error loading fisios:', error)
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

    const getFisioName = (fisioId) => {
      if (!fisioId) return 'No asignado'
      const fisio = fisios.value.find(f => f.id === fisioId)
      return fisio ? fisio.name : 'Desconocido'
    }

    const formatDateTime = (datetime) => {
      if (!datetime) return ''

      const date = new Date(datetime)

      return date.toLocaleString('es-ES', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const saveFisio = async () => {
      try {
        loading.value = true

        if (editingFisio.value) {
          await updateFisio(editingFisio.value.id, {
            name: fisioForm.value.name,
            email: fisioForm.value.email,
            phone: fisioForm.value.phone,
            specialties: fisioForm.value.specialties
          })
        } else {
          await createFisio({
            name: fisioForm.value.name,
            email: fisioForm.value.email,
            phone: fisioForm.value.phone,
            specialties: fisioForm.value.specialties
          })
        }

        resetFisioForm()
        await loadFisios()
        showNotification('Fisio guardado correctamente', 'success')
      } catch (error) {
        showNotification('Error al guardar fisio: ' + (error.response?.data?.error || error.message), 'error')
      } finally {
        loading.value = false
      }
    }

    const editFisio = (fisio) => {
      editingFisio.value = fisio
      fisioForm.value = {
        name: fisio.name,
        email: fisio.email,
        phone: fisio.phone || '',
        specialties: fisio.specialties || ''
      }
    }

    const deleteFisioHandler = async (id) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este fisio?')) return

      try {
        loading.value = true
        await deleteFisio(id)
        await loadFisios()
        showNotification('Fisio eliminado correctamente', 'success')
      } catch (error) {
        showNotification('Error al eliminar fisio: ' + (error.response?.data?.error || error.message), 'error')
      } finally {
        loading.value = false
      }
    }

    const resetFisioForm = () => {
      editingFisio.value = null
      fisioForm.value = {
        name: '',
        email: '',
        phone: '',
        specialties: ''
      }
    }

    const handleTabChange = (tab) => {
      currentTab.value = tab
    }

    const handleLoginSuccess = () => {
      loadAppointments()
      loadFisios()
      // Auto-refresh every 30 seconds
      setInterval(() => {
        loadAppointments()
        loadFisios()
      }, 30000)
    }

    const handleLogout = () => {
      appointments.value = []
      selectedAppointment.value = null
      selectedDate.value = null
      fisios.value = []
      currentTab.value = 'appointments'
    }

    onMounted(() => {
      if (isAuthenticatedComputed.value) {
        handleLoginSuccess()
      }
    })

    return {
      appointments,
      selectedAppointment,
      selectedDate,
      loading,
      notification,
      isAuthenticated: isAuthenticatedComputed,
      currentTab,
      fisios,
      editingFisio,
      fisioForm,
      saveAppointment,
      deleteAppointment,
      selectAppointment,
      formatDateTime,
      getFisioName,
      handleTabChange,
      handleLoginSuccess,
      handleLogout,
      saveFisio,
      editFisio,
      deleteFisioHandler,
      resetFisioForm
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
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
  width: 120px;
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

/* FISIOS PAGE */
.fisios-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
}

.fisios-container h2 {
  color: white;
  margin-top: 0;
  margin-bottom: 2rem;
}

.fisio-form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fisio-form-container h3 {
  margin-top: 0;
  color: #333;
}

.fisio-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.fisios-list {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fisios-list h3 {
  margin-top: 0;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.fisios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.fisio-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.fisio-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.fisio-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.fisio-header h4 {
  margin: 0;
  color: #333;
}

.fisio-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.btn-icon.btn-danger:hover {
  color: red;
}

.fisio-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fisio-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.fisio-info strong {
  color: #333;
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
}

/* === MOBILE === */
@media (max-width: 600px) {
  .app-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .fisios-grid {
    grid-template-columns: 1fr;
  }
}
</style>
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
