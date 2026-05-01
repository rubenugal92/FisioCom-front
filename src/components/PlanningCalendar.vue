<template>
  <div class="planning-container">
    <!-- PANEL DE EDICIÓN PARA ADMINS (arriba) -->
    <div v-if="isAdmin" class="admin-panel">
      <h3>✏️ Editar Planning</h3>
      <div class="edit-form">
        <div class="form-group">
          <label>Fecha:</label>
          <input v-model="selectedDate" type="date" class="date-input">
        </div>
        <div class="form-group">
          <label>Estado:</label>
          <select v-model="selectedType" class="type-select">
            <option value="">-- Selecciona estado --</option>
            <option value="work">✓ Trabaja</option>
            <option value="vacation">🏖️ Vacaciones</option>
            <option value="sick">🏥 Baja médica</option>
          </select>
        </div>
        <div class="form-group">
          <label>Notas:</label>
          <textarea v-model="selectedNotes" placeholder="Ej: Operación, curso de capacitación..." class="notes-input"></textarea>
        </div>
        <div class="form-actions">
          <button @click="savePlanning" class="btn btn-primary" :disabled="!selectedDate || !selectedType">
            💾 Guardar
          </button>
          <button v-if="existingPlanning" @click="deletePlanningEntry" class="btn btn-danger">
            🗑️ Eliminar
          </button>
        </div>
        <p v-if="selectedDate" class="form-hint">
          Fecha seleccionada: {{ formatDate(selectedDate) }}
        </p>
      </div>
    </div>

    <!-- CALENDARIO -->
    <div class="calendar-wrapper">
      <div class="calendar-controls">
        <button @click="previousMonth" class="nav-btn">⬅️ Anterior</button>
        <h2 class="calendar-title">{{ monthYear }}</h2>
        <button @click="nextMonth" class="nav-btn">Siguiente ➡️</button>
      </div>

      <div class="calendar-grid">
        <div class="day-header" v-for="day in weekDays" :key="day">
          {{ day }}
        </div>
        
        <div 
          v-for="date in calendarDays" 
          :key="date.iso"
          class="calendar-day"
          :class="[date.classes, isAdmin ? 'clickable' : '']"
          @click="selectDate(date)"
        >
          <span class="date-number">{{ date.day }}</span>
          <div v-if="date.planning" class="planning-badge" :class="date.planning.type">
            {{ planningLabel[date.planning.type] }}
          </div>
          <span v-else class="date-empty">-</span>
        </div>
      </div>
    </div>

    <!-- LEYENDA -->
    <div class="legend-section">
      <div class="legend-title">Leyenda:</div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="badge work">✓</span>
          <span>Trabaja</span>
        </div>
        <div class="legend-item">
          <span class="badge vacation">🏖️</span>
          <span>Vacaciones</span>
        </div>
        <div class="legend-item">
          <span class="badge sick">🏥</span>
          <span>Baja médica</span>
        </div>
      </div>
    </div>

    <!-- HINT PARA ADMINS -->
    <div v-if="isAdmin && !selectedDate" class="admin-hint">
      <strong>💡 Cómo usar:</strong> Completa los campos arriba (fecha y estado) o haz clic en una fecha del calendario para editarla.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  fisioId: {
    type: [Number, String],
    required: true
  }
})

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')

const currentDate = ref(new Date())
const planning = ref([])
const selectedDate = ref('')
const selectedType = ref('')
const selectedNotes = ref('')
const existingPlanning = ref(null)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const planningLabel = {
  work: '✓',
  vacation: '🏖️',
  sick: '🏥'
}

const monthYear = computed(() => {
  const month = monthNames[currentDate.value.getMonth()]
  const year = currentDate.value.getFullYear()
  return `${month} ${year}`
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const current = new Date(startDate)
  
  while (current <= lastDay || days.length % 7 !== 0) {
    const iso = current.toISOString().split('T')[0]
    const dayPlanning = planning.value.find(p => p.date === iso)
    const isCurrentMonth = current.getMonth() === month
    const isToday = iso === new Date().toISOString().split('T')[0]
    
    days.push({
      day: current.getDate(),
      iso: iso,
      planning: dayPlanning,
      classes: {
        'other-month': !isCurrentMonth,
        'has-planning': !!dayPlanning,
        'is-today': isToday
      }
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  return days
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const date = new Date(year, parseInt(month) - 1, day)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const previousMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1)
  currentDate.value = new Date(currentDate.value)
}

const nextMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1)
  currentDate.value = new Date(currentDate.value)
}

const fetchPlanning = async () => {
  try {
    const params = new URLSearchParams()
    const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
    const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
    
    params.append('start_date', firstDay.toISOString().split('T')[0])
    params.append('end_date', lastDay.toISOString().split('T')[0])

    const response = await fetch(
      `${API_BASE_URL}/api/planning/fisio/${props.fisioId}?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      }
    )
    
    if (response.ok) {
      planning.value = await response.json()
    } else {
      console.error('Error fetching planning:', response.status)
    }
  } catch (error) {
    console.error('Error fetching planning:', error)
  }
}

const selectDate = (date) => {
  if (!isAdmin.value || date.classes['other-month']) return
  
  selectedDate.value = date.iso
  if (date.planning) {
    selectedType.value = date.planning.type
    selectedNotes.value = date.planning.notes || ''
    existingPlanning.value = date.planning
  } else {
    selectedType.value = ''
    selectedNotes.value = ''
    existingPlanning.value = null
  }
}

const savePlanning = async () => {
  if (!selectedDate.value || !selectedType.value) {
    alert('Selecciona fecha y tipo')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/planning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        fisio_id: props.fisioId,
        date: selectedDate.value,
        type: selectedType.value,
        notes: selectedNotes.value || null
      })
    })

    if (response.ok) {
      const saved = await response.json()
      existingPlanning.value = saved
      alert('✅ Planning guardado correctamente')
      selectedDate.value = ''
      selectedType.value = ''
      selectedNotes.value = ''
      await fetchPlanning()
    } else {
      const error = await response.json()
      alert('❌ Error: ' + (error.error || 'No se pudo guardar el planning'))
    }
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error guardando planning')
  }
}

const deletePlanningEntry = async () => {
  if (!existingPlanning.value) return
  
  if (!confirm('¿Seguro que quieres eliminar este planning?')) return

  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/${existingPlanning.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (response.ok) {
      alert('✅ Planning eliminado correctamente')
      selectedDate.value = ''
      selectedType.value = ''
      selectedNotes.value = ''
      existingPlanning.value = null
      await fetchPlanning()
    } else {
      alert('❌ Error eliminando planning')
    }
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error eliminando planning')
  }
}

watch(() => props.fisioId, () => {
  fetchPlanning()
})

watch(currentDate, () => {
  fetchPlanning()
}, { deep: true })

onMounted(() => {
  console.log('PlanningCalendar mounted')
  console.log('Auth user:', auth.user)
  console.log('Is Admin:', isAdmin.value)
  fetchPlanning()
})
</script>

<style scoped>
.planning-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ADMIN PANEL */
.admin-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.admin-panel h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.edit-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.date-input,
.type-select,
.notes-input {
  padding: 10px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.notes-input {
  min-height: 60px;
  resize: vertical;
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  gap: 10px;
  grid-column: 1 / -1;
  margin-top: 10px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  flex: 1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #fff;
  color: #667eea;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-danger {
  background: #ff4757;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #ff3838;
  transform: translateY(-2px);
}

.form-hint {
  grid-column: 1 / -1;
  margin: 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 13px;
  border-left: 3px solid white;
}

/* CALENDAR */
.calendar-wrapper {
  margin-bottom: 20px;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.nav-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.calendar-title {
  margin: 0;
  font-size: 20px;
  color: #333;
  min-width: 200px;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.day-header {
  font-weight: bold;
  text-align: center;
  padding: 12px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 13px;
  color: #555;
}

.calendar-day {
  aspect-ratio: 1;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  background: white;
  min-height: 70px;
  transition: all 0.2s ease;
  font-size: 12px;
}

.calendar-day.clickable:not(.other-month) {
  cursor: pointer;
}

.calendar-day.clickable:not(.other-month):hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  background: #f0f7ff;
  transform: translateY(-2px);
}

.calendar-day.other-month {
  background: #fafafa;
  color: #ccc;
  cursor: default;
  opacity: 0.5;
}

.calendar-day.has-planning {
  border-color: #28a745;
  background: #f0fdf4;
}

.calendar-day.is-today {
  border-color: #ffc107;
  background: #fffbf0;
  box-shadow: 0 0 0 1px #ffc107;
}

.date-number {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.planning-badge {
  font-size: 24px;
  margin-top: 4px;
}

.date-empty {
  color: #ccc;
  font-size: 14px;
}

/* LEGEND */
.legend-section {
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.legend-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  font-size: 14px;
}

.legend-items {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.badge {
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.badge.work {
  background: #28a745;
}

.badge.vacation {
  background: #ffc107;
  color: #333;
}

.badge.sick {
  background: #dc3545;
}

/* HINT */
.admin-hint {
  background: #d4edff;
  border: 1px solid #b3d9ff;
  color: #0056b3;
  padding: 12px 15px;
  border-radius: 4px;
  font-size: 14px;
  border-left: 4px solid #0056b3;
}
</style>
