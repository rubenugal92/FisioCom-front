<template>
  <div class="planning-container">

    <!-- 🔍 USER SELECTOR (solo admin) -->
    <div v-if="isAdmin" class="user-selector">
      <input
        v-model="userSearch"
        placeholder="Buscar usuario..."
        class="search-input"
      />

      <select v-model="selectedUserId" class="user-select">
        <option v-for="u in filteredUsers" :key="u.id" :value="u.id">
          {{ u.name }}
        </option>
      </select>
    </div>

    <!-- ✏️ ADMIN PANEL -->
    <div v-if="isAdmin" class="admin-panel">
      <h3>✏️ Editar Planning</h3>

      <div class="edit-form">
        <div class="form-group">
          <label>Fecha:</label>
          <input v-model="selectedDate" type="date" class="date-input" />
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
          <textarea v-model="selectedNotes" class="notes-input" />
        </div>

        <div class="form-actions">
          <button @click="savePlanning" class="btn btn-primary" :disabled="!selectedDate || !selectedType">
            💾 Guardar
          </button>

          <button v-if="existingPlanning" @click="deletePlanningEntry" class="btn btn-danger">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- 📅 CALENDARIO -->
    <div class="calendar-wrapper">
      <div class="calendar-controls">
        <button @click="previousMonth" class="nav-btn">⬅️</button>
        <h2>{{ monthYear }}</h2>
        <button @click="nextMonth" class="nav-btn">➡️</button>
      </div>

      <div class="calendar-grid">
        <div v-for="d in weekDays" :key="d" class="day-header">
          {{ d }}
        </div>

        <div
          v-for="date in calendarDays"
          :key="date.iso"
          class="calendar-day"
          :class="date.classes"
          @click="selectDate(date)"
        >
          <span class="date-number">{{ date.day }}</span>

          <!-- 👇 MULTI PLANNING -->
          <div v-if="date.plannings.length" class="planning-list">
            <div
              v-for="p in date.plannings"
              :key="p.id"
              class="planning-item"
              :class="p.type"
            >
              <span class="user-name">{{ p.user?.name || 'Usuario' }}</span>
              <span class="icon">{{ planningLabel[p.type] }}</span>
            </div>
          </div>

          <span v-else class="date-empty">-</span>
        </div>
      </div>
    </div>

    <!-- LEGEND -->
    <div class="legend-section">
      <div class="legend-item">✓ Trabajo</div>
      <div class="legend-item">🏖️ Vacaciones</div>
      <div class="legend-item">🏥 Baja</div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  userId: [Number, String]
})

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')

/* ---------------- USERS ---------------- */
const users = ref([])
const userSearch = ref('')
const selectedUserId = ref(props.userId)

const filteredUsers = computed(() =>
  users.value.filter(u =>
    u.name.toLowerCase().includes(userSearch.value.toLowerCase())
  )
)

/* ---------------- STATE ---------------- */
const currentDate = ref(new Date())
const planning = ref([])

const selectedDate = ref('')
const selectedType = ref('')
const selectedNotes = ref('')
const existingPlanning = ref(null)

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const weekDays = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const planningLabel = {
  work: '✓',
  vacation: '🏖️',
  sick: '🏥'
}

/* ---------------- CALENDAR ---------------- */
const monthYear = computed(() => {
  const m = currentDate.value.toLocaleString('es', { month: 'long' })
  return `${m} ${currentDate.value.getFullYear()}`
})

const calendarDays = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth()

  const first = new Date(y, m, 1)
  const start = new Date(first)
  start.setDate(start.getDate() - first.getDay())

  const days = []
  const current = new Date(start)

  const end = new Date(y, m + 1, 0)
  end.setDate(end.getDate() + (6 - end.getDay()))

  while (current <= end) {
    const iso = current.toLocaleDateString('en-CA')

    const plannings = planning.value.filter(
      p => p.date.split('T')[0] === iso
    )

    days.push({
      day: current.getDate(),
      iso,
      plannings,
      classes: {
        'other-month': current.getMonth() !== m,
        'has-planning': plannings.length > 0
      }
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

/* ---------------- API ---------------- */
const fetchUsers = async () => {
  if (!isAdmin.value) return
  const res = await fetch(`${API}/api/users`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  })
  users.value = await res.json()
}

const fetchPlanning = async () => {
  const first = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const last = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)

  const res = await fetch(
    `${API}/api/planning/user/${selectedUserId.value}?start_date=${first.toISOString().split('T')[0]}&end_date=${last.toISOString().split('T')[0]}`,
    {
      headers: { Authorization: `Bearer ${auth.token}` }
    }
  )

  planning.value = await res.json()
}

/* ---------------- ACTIONS ---------------- */
const selectDate = (date) => {
  if (!isAdmin.value) return

  selectedDate.value = date.iso

  const found = date.plannings[0]
  if (found) {
    selectedType.value = found.type
    selectedNotes.value = found.notes
    existingPlanning.value = found
  } else {
    selectedType.value = ''
    selectedNotes.value = ''
    existingPlanning.value = null
  }
}

const savePlanning = async () => {
  await fetch(`${API}/api/planning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`
    },
    body: JSON.stringify({
      user_id: selectedUserId.value,
      date: selectedDate.value,
      type: selectedType.value,
      notes: selectedNotes.value
    })
  })

  await fetchPlanning()
}

const deletePlanningEntry = async () => {
  await fetch(`${API}/api/planning/${existingPlanning.value.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.token}` }
  })

  await fetchPlanning()
}

/* ---------------- WATCHERS ---------------- */
watch(selectedUserId, fetchPlanning)
watch(currentDate, fetchPlanning)

onMounted(() => {
  fetchUsers()
  fetchPlanning()
})
</script>

<style scoped>
.planning-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* ---------------- USER SELECTOR ---------------- */

.user-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.user-select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

/* ---------------- ADMIN PANEL ---------------- */

.admin-panel {
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.edit-form {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
}

.date-input,
.type-select,
.notes-input {
  padding: 8px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
}

.notes-input {
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 10px;
  grid-column: 1 / -1;
}

.btn {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

/* ---------------- CALENDAR ---------------- */

.calendar-wrapper {
  margin-top: 15px;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.nav-btn {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7,1fr);
  gap: 6px;
}

.day-header {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  background: #f2f2f2;
  padding: 6px;
  border-radius: 4px;
}

/* ---------------- DAY CELL ---------------- */

.calendar-day {
  min-height: 80px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 4px;
  background: white;
  display: flex;
  flex-direction: column;
}

.calendar-day.other-month {
  opacity: 0.4;
}

.calendar-day.has-planning {
  border-color: #28a745;
  background: #f6fff8;
}

.date-number {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 2px;
}

/* ---------------- MULTI PLANNING ---------------- */

.planning-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 3px;
}

.planning-item {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
}

/* colores por tipo */
.planning-item.work {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.planning-item.vacation {
  background: #fff7e6;
  border-left: 3px solid #faad14;
}

.planning-item.sick {
  background: #fff1f0;
  border-left: 3px solid #ff4d4f;
}

.user-name {
  font-size: 9px;
  opacity: 0.7;
}

/* ---------------- LEGEND ---------------- */

.legend-section {
  margin-top: 15px;
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #555;
}
</style>