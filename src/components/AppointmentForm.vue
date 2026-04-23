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
  padding: 1rem;
}

/* FORM */
.appointment-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* INPUTS */
.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.65rem;
  font-size: 1rem; /* importante en móvil */
}

/* BOTONES */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* 📱 MOBILE */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    padding: 0.85rem;
  }
}
</style>