<template>
  <div class="planning-container">
    <div class="planning-header">
      <button @click="previousMonth" class="nav-btn">⬅️</button>
      <h2>{{ monthYear }}</h2>
      <button @click="nextMonth" class="nav-btn">➡️</button>
    </div>

    <div class="calendar-grid">
      <div class="day-header" v-for="day in weekDays" :key="day">
        {{ day }}
      </div>
      
      <div 
        v-for="date in calendarDays" 
        :key="date.iso"
        class="calendar-day"
        :class="date.classes"
      >
        <span class="date-number">{{ date.day }}</span>
        <div v-if="date.planning" class="planning-badge" :class="date.planning.type">
          {{ planningLabel[date.planning.type] }}
        </div>
      </div>
    </div>

    <div class="planning-legend">
      <div class="legend-item">
        <span class="badge work">W</span> Trabaja
      </div>
      <div class="legend-item">
        <span class="badge vacation">V</span> Vacaciones
      </div>
      <div class="legend-item">
        <span class="badge sick">B</span> Baja
      </div>
    </div>

    <!-- Admin view - botones de edición -->
    <div v-if="isAdmin" class="admin-controls">
      <div class="edit-section">
        <input v-model="selectedDate" type="date" class="date-input">
        <select v-model="selectedType" class="type-select">
          <option value="">Selecciona tipo...</option>
          <option value="work">Trabaja</option>
          <option value="vacation">Vacaciones</option>
          <option value="sick">Baja</option>
        </select>
        <textarea v-model="selectedNotes" placeholder="Notas (opcional)" class="notes-input"></textarea>
        <button @click="savePlanning" class="btn btn-primary">Guardar</button>
        <button v-if="existingPlanning" @click="deletePlanningEntry" class="btn btn-danger">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  fisioId: {
    type: [Number, String],
    required: true
  }
})

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'adminMid')

const currentDate = ref(new Date())
const planning = ref([])
const selectedDate = ref('')
const selectedType = ref('')
const selectedNotes = ref('')
const existingPlanning = ref(null)

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
    
    days.push({
      day: current.getDate(),
      iso: iso,
      planning: dayPlanning,
      classes: {
        'other-month': !isCurrentMonth,
        'has-planning': !!dayPlanning
      }
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  return days
})

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
      `http://localhost:3000/api/planning/fisio/${props.fisioId}?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      }
    )
    
    if (response.ok) {
      planning.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching planning:', error)
  }
}

const savePlanning = async () => {
  if (!selectedDate.value || !selectedType.value) {
    alert('Selecciona fecha y tipo')
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/planning', {
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
      selectedDate.value = ''
      selectedType.value = ''
      selectedNotes.value = ''
      existingPlanning.value = null
      await fetchPlanning()
    } else {
      alert('Error guardando planning')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

const deletePlanningEntry = async () => {
  if (!existingPlanning.value) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/planning/${existingPlanning.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (response.ok) {
      selectedDate.value = ''
      selectedType.value = ''
      selectedNotes.value = ''
      existingPlanning.value = null
      await fetchPlanning()
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

onMounted(() => {
  fetchPlanning()
})
</script>

<style scoped>
.planning-container {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.planning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.planning-header h2 {
  margin: 0;
  min-width: 200px;
  text-align: center;
}

.nav-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.nav-btn:hover {
  background: #0056b3;
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
  padding: 8px;
  background: #f0f0f0;
  border-radius: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  background: white;
  min-height: 60px;
}

.calendar-day.other-month {
  background: #f9f9f9;
  color: #999;
}

.calendar-day.has-planning {
  border-color: #007bff;
}

.date-number {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 14px;
}

.planning-badge {
  font-size: 20px;
  font-weight: bold;
}

.planning-badge.work {
  color: #28a745;
}

.planning-badge.vacation {
  color: #ffc107;
}

.planning-badge.sick {
  color: #dc3545;
}

.planning-legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 20px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
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

.admin-controls {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.edit-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.date-input,
.type-select,
.notes-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.notes-input {
  min-height: 60px;
  resize: vertical;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}
</style>
