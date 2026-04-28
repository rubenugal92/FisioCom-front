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
        <label>Fisioterapeuta</label>
        <select 
          v-model="form.fisio_id"
          required
          :disabled="loading || fisios.length === 0"
          @change="updateAvailableSlots"
        >
          <option value="">Selecciona un fisio</option>
          <option v-for="fisio in fisios" :key="fisio.id" :value="fisio.id">
            {{ fisio.name }}{{ fisio.specialties ? ` (${fisio.specialties})` : '' }}
          </option>
        </select>
        <small v-if="fisios.length === 0" class="text-danger">
          No hay fisioterapeutas disponibles
        </small>
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
        <small v-if="availableSlots.length === 0 && form.date && form.fisio_id" class="text-danger">
          No hay horarios disponibles para esta fecha con este fisio
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
        <button type="submit" class="btn btn-primary" :disabled="loading">
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
import { ref, computed, watch, onMounted } from 'vue'
import { createAppointment, updateAppointment as updateAppointmentAPI, deleteAppointment as deleteAppointmentAPI, getAvailableSlots, getAllFisios } from '../api/appointments.js'

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
      fisio_id: '',
      service: 'physio',
      status: 'confirmed',
      notes: ''
    })

    const availableSlots = ref([])
    const fisios = ref([])

    const isEditing = computed(() => !!props.appointment?.id)

    const loadFisios = async () => {
      try {
        fisios.value = await getAllFisios()
      } catch (e) {
        console.error('Error loading fisios:', e)
        fisios.value = []
      }
    }

    const resetForm = () => {
      form.value = {
        phone: '',
        date: props.selectedDate || '',
        time: '',
        fisio_id: '',
        service: 'physio',
        status: 'confirmed',
        notes: ''
      }
      availableSlots.value = []
      emit('clear')
    }

    const updateAvailableSlots = async () => {
      if (!form.value.date || !form.value.fisio_id) {
        availableSlots.value = []
        return
      }
      try {
        availableSlots.value = await getAvailableSlots(form.value.date, form.value.fisio_id)
        form.value.time = ''
      } catch (e) {
        console.error('Error fetching slots:', e)
        availableSlots.value = []
      }
    }

    const submitForm = async () => {

      // 🔥 FIX: Convertir hora local España (UTC+2 CEST) a UTC
      // Si usuario selecciona 15:00, guardamos como 13:00 UTC
      const [hours, minutes] = form.value.time.split(':').map(Number)
      const utcHours = String((hours - 2 + 24) % 24).padStart(2, '0')
      const datetime = `${form.value.date}T${utcHours}:${minutes}:00`

      const appointmentData = {
        phone: form.value.phone,
        datetime,
        service: form.value.service,
        status: form.value.status,
        notes: form.value.notes,
        fisio_id: parseInt(form.value.fisio_id)
      }

      try {
        if (isEditing.value) {
          await updateAppointmentAPI(props.appointment.id, appointmentData)
        } else {
          await createAppointment(appointmentData)
        }

        emit('save', appointmentData)
        resetForm()

      } catch (e) {
        console.error(e)
        alert('Error: ' + (e.response?.data?.error || e.message))
      }
    }

    const handleDelete = async () => {
      if (!props.appointment) return
      await deleteAppointmentAPI(props.appointment.id)
      emit('delete', props.appointment.id)
      resetForm()
    }

    watch(() => props.appointment, (a) => {
      if (!a) return

      form.value.phone = a.phone
      form.value.date = a.datetime.split('T')[0]
      form.value.fisio_id = a.fisio_id || ''
      
      // 🔥 FIX: Convertir UTC a zona horaria local España (UTC+2 CEST)
      const timePart = a.datetime.split('T')[1].slice(0,5)
      const [hours, minutes] = timePart.split(':').map(Number)
      const localHours = String((hours + 2) % 24).padStart(2, '0')
      form.value.time = `${localHours}:${minutes}`
      
      form.value.service = a.service
      form.value.status = a.status
      form.value.notes = a.notes || ''

      updateAvailableSlots()
    }, { deep: true })

    watch(() => props.selectedDate, (d) => {
      if (d && !props.appointment) {
        form.value.date = d
        updateAvailableSlots()
      }
    })

    onMounted(() => {
      loadFisios()
    })

    return {
      form,
      availableSlots,
      fisios,
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

.appointment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}
</style>