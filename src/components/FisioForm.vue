<template>
  <div class="form-container">
    <h3>{{ isEditing ? 'Editar Fisioterapeuta' : 'Nuevo Fisioterapeuta' }}</h3>

    <form @submit.prevent="submitForm" class="fisio-form">
      <div class="form-group">
        <label>Nombre Completo</label>
        <input 
          v-model="form.name"
          type="text"
          placeholder="Ej: Juan García"
          required
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input 
          v-model="form.email"
          type="email"
          placeholder="correo@ejemplo.com"
          required
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Teléfono</label>
        <input 
          v-model="form.phone"
          type="tel"
          placeholder="+34 xxx xxx xxx"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Especialidades</label>
        <input 
          v-model="form.specialties"
          type="text"
          placeholder="Ej: Traumatología, Deportiva"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Licencia Profesional</label>
        <input 
          v-model="form.license"
          type="text"
          placeholder="Número de licencia"
          :disabled="loading"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
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
import { createFisio, updateFisio } from '../api/appointments.js'

export default {
  name: 'FisioForm',
  props: {
    editing: Object,
    loading: Boolean
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const form = ref({
      name: '',
      email: '',
      phone: '',
      specialties: '',
      license: ''
    })

    const loading = ref(false)
    const isEditing = computed(() => !!props.editing?.id)

    const submitForm = async () => {
      try {
        loading.value = true

        if (isEditing.value) {
          await updateFisio(props.editing.id, form.value)
        } else {
          await createFisio(form.value)
        }

        emit('save')
        resetForm()
      } catch (error) {
        console.error('Error saving fisio:', error)
        alert('Error al guardar. Por favor intenta de nuevo.')
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      form.value = {
        name: '',
        email: '',
        phone: '',
        specialties: '',
        license: ''
      }
      emit('cancel')
    }

    watch(() => props.editing, (newVal) => {
      if (newVal) {
        form.value = { ...newVal }
      } else {
        form.value = {
          name: '',
          email: '',
          phone: '',
          specialties: '',
          license: ''
        }
      }
    }, { immediate: true })

    return {
      form,
      loading,
      isEditing,
      submitForm,
      resetForm
    }
  }
}
</script>

<style scoped>
.form-container {
  background: white;
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.form-container h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.fisio-form {
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
  color: #374151;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4338ca;
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: #4338ca;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3730a3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 56, 202, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #d1d5db;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
