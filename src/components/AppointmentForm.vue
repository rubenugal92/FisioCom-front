<template>
  <div class="form-container">
    <h3>{{ isEditing ? 'Editar Cita' : 'Nueva Cita' }}</h3>

    <form @submit.prevent="submitForm" class="appointment-form">
      <div class="form-group">
        <label>Teléfono del Cliente</label>
        <input 
          v-model="form.phone" 
          type="tel"
          placeholder="+34 xxx xxx xxx"
          required
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Fecha</label>
        <input 
          v-model="form.date"
          type="date"
          required
          :disabled="loading"
          @change="updateAvailableSlots"
        />
      </div>

      <div class="form-group">
        <label>Hora</label>
        <select 
          v-model="form.time"
          required
          :disabled="loading || availableSlots.length === 0"
        >
          <option value="">Selecciona una hora</option>
          <option v-for="slot in availableSlots" :key="slot" :value="slot">
            {{ slot }}
          </option>
        </select>
        <small v-if="availableSlots.length === 0" class="text-danger">
          No hay horarios disponibles para esta fecha
        </small>
      </div>

      <div class="form-group">
        <label>Servicio</label>
        <select v-model="form.service" :disabled="loading">
          <option value="physio">Fisioterapia General</option>
          <option value="sports">Fisioterapia Deportiva</option>
          <option value="rehab">Rehabilitación</option>
          <option value="massage">Masaje Terapéutico</option>
        </select>
      </div>

      <div class="form-group">
        <label>Notas</label>
        <textarea 
          v-model="form.notes"
          placeholder="Notas adicionales..."
          rows="3"
          :disabled="loading"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Estado</label>
        <select v-model="form.status" :disabled="loading">
          <option value="confirmed">Confirmada</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Cita') }}
        </button>
        
        <button 
          v-if="isEditing"
          type="button" 
          class="btn btn-danger"
          @click="handleDelete"
          :disabled="loading"
        >
          {{ loading ? 'Eliminando...' : 'Eliminar' }}
        </button>

        <button 
          type="button" 
          class="btn btn-secondary"
          @click="resetForm"
          :disabled="loading"
        >
          Limpiar
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { 
  createAppointment, 
  updateAppointment as updateAppointmentAPI,
  deleteAppointment as deleteAppointmentAPI,
  getAvailableSlots
} from '../api/appointments.js'

export default {
  name: 'AppointmentForm',
  props: {
    appointment: Object,
    selectedDate: String,
    loading: Boolean
  },
  emits: ['save', 'delete', 'clear'],
  setup(props, { emit }) {
    const form = ref({
      phone: '',
      date: '',
      time: '',
      service: 'physio',
      status: 'confirmed',
      notes: ''
    })

    const availableSlots = ref([])

    const isEditing = computed(() => !!props.appointment?.id)

    const resetForm = () => {
      form.value = {
        phone: '',
        date: props.selectedDate || '',
        time: '',
        service: 'physio',
        status: 'confirmed',
        notes: ''
      }
      availableSlots.value = []
      emit('clear')
    }

    const updateAvailableSlots = async () => {
      if (!form.value.date) return
      
      try {
        const slots = await getAvailableSlots(form.value.date)
        availableSlots.value = slots
        form.value.time = '' // Reset time when date changes
      } catch (error) {
        console.error('Error fetching available slots:', error)
        availableSlots.value = []
      }
    }

    const submitForm = async () => {
      const appointmentData = {
        phone: form.value.phone,
        datetime: `${form.value.date}T${form.value.time}:00`,
        service: form.value.service,
        status: form.value.status,
        notes: form.value.notes
      }

      try {
        if (isEditing.value) {
          await updateAppointmentAPI(props.appointment.id, appointmentData)
        } else {
          await createAppointment(appointmentData)
        }
        emit('save', appointmentData)
        resetForm()
      } catch (error) {
        console.error('Error saving appointment:', error)
        throw error
      }
    }

    const handleDelete = async () => {
      if (!props.appointment) return
      
      if (!confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
        return
      }

      try {
        await deleteAppointmentAPI(props.appointment.id)
        emit('delete', props.appointment.id)
        resetForm()
      } catch (error) {
        console.error('Error deleting appointment:', error)
        throw error
      }
    }

    // Watch for appointment changes to populate the form
    watch(() => props.appointment, (newAppointment) => {
      if (newAppointment) {
        const datetime = new Date(newAppointment.datetime)
        form.value.phone = newAppointment.phone
        form.value.date = datetime.toISOString().split('T')[0]
        form.value.time = datetime.toTimeString().slice(0, 5)
        form.value.service = newAppointment.service
        form.value.status = newAppointment.status
        form.value.notes = newAppointment.notes || ''
        updateAvailableSlots()
      }
    }, { deep: true })

    // Set initial date when selectedDate changes
    watch(() => props.selectedDate, (newDate) => {
      if (newDate && !props.appointment) {
        form.value.date = newDate
        updateAvailableSlots()
      }
    })

    return {
      form,
      availableSlots,
      isEditing,
      resetForm,
      updateAvailableSlots,
      submitForm,
      handleDelete
    }
  }
}
</script>

<style scoped>
.form-container {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-container h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 1.5rem;
}

.appointment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  background: #e9ecef;
  cursor: not-allowed;
  color: #999;
}

.form-group small {
  margin-top: 0.25rem;
  font-size: 0.8rem;
}

.text-danger {
  color: #dc3545;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  font-size: 0.95rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-danger {
  background: #dc3545;
  color: white;
  flex: 0.5;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  flex: 0.5;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}
@media (max-width: 600px) {
  .form-container {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .btn-danger,
  .btn-secondary {
    flex: 1;
  }
}
</style>
