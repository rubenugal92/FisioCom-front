<template>
  <div class="calendar">

    <!-- HEADER -->
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-btn">&lt;</button>

      <h2>{{ monthYear }}</h2>

      <button @click="nextMonth" class="nav-btn">&gt;</button>
    </div>

    <!-- WEEKDAYS -->
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <!-- GRID -->
    <div class="days-grid">
      <div
        v-for="(cell, index) in calendarDays"
        :key="index"
        :class="['day', {
          empty: !cell,
          today: isToday(cell),
          selected: isSelected(cell),
          'has-appointments': hasAppointments(cell)
        }]"
        @click="cell && selectDay(cell)"
      >
        <template v-if="cell">
          <div class="day-number">{{ cell }}</div>
          <div v-if="hasAppointments(cell)" class="appointment-count">
            {{ getAppointmentCount(cell) }}
          </div>
        </template>
      </div>
    </div>

    <!-- APPOINTMENTS -->
    <div class="appointments-list">
      <h3>
        <span v-if="selectedDayData">
          Citas para {{ selectedDayData }}
        </span>
        <span v-else>
          Selecciona un día para ver las citas
        </span>
      </h3>

      <div v-if="appointmentsForSelectedDay.length > 0" class="appointments">
        <div
          v-for="appointment in appointmentsForSelectedDay"
          :key="appointment.id"
          class="appointment-card"
          @click="$emit('appointment-selected', appointment)"
        >
          <div class="appointment-time">
            {{ formatTime(appointment.datetime) }}
          </div>
          <div class="appointment-phone">
            {{ appointment.phone }}
          </div>
          <div v-if="appointment.notes" class="appointment-notes">
            <strong>Dolencia:</strong> {{ appointment.notes }}
          </div>
          <div :class="'appointment-status appointment-status-' + appointment.status">
            {{ appointment.status }}
          </div>
        </div>
      </div>

      <div v-else class="no-appointments">
        No hay citas este día
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Calendar',
  props: {
    appointments: { type: Array, default: () => [] },
    loading: Boolean
  },
  emits: ['appointment-selected', 'date-selected'],

  setup(props, { emit }) {

    const currentDate = ref(new Date())
    const selectedDay = ref(null)

    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    const monthYear = computed(() =>
      currentDate.value.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      }).replace(/^\w/, c => c.toUpperCase())
    )

    const year = computed(() => currentDate.value.getFullYear())
    const month = computed(() => currentDate.value.getMonth())

    // 🔥 CALENDARIO REAL
    const calendarDays = computed(() => {
      const firstDay = new Date(year.value, month.value, 1)

      let startDay = firstDay.getDay() - 1
      if (startDay < 0) startDay = 6

      const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()

      const cells = []

      for (let i = 0; i < startDay; i++) {
        cells.push(null)
      }

      for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d)
      }

      return cells
    })

    const getDateString = (day) => {
      const m = String(month.value + 1).padStart(2, '0')
      const d = String(day).padStart(2, '0')
      return `${year.value}-${m}-${d}`
    }

    const isToday = (day) => {
      if (!day) return false
      const t = new Date()
      return (
        day === t.getDate() &&
        month.value === t.getMonth() &&
        year.value === t.getFullYear()
      )
    }

    const isSelected = (day) => selectedDay.value === day

    const selectDay = (day) => {
      selectedDay.value = day
      emit('date-selected', getDateString(day))
    }

    const hasAppointments = (day) => {
      if (!day) return false
      const ds = getDateString(day)
      return props.appointments.some(a => a.datetime.startsWith(ds))
    }

    const getAppointmentCount = (day) => {
      const ds = getDateString(day)
      return props.appointments.filter(a => a.datetime.startsWith(ds)).length
    }

    const selectedDayData = computed(() => {
      if (!selectedDay.value) return null

      const date = new Date(getDateString(selectedDay.value))

      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).replace(/^\w/, c => c.toUpperCase())
    })

    const appointmentsForSelectedDay = computed(() => {
      if (!selectedDay.value) return []

      const ds = getDateString(selectedDay.value)

      return props.appointments
        .filter(a => a.datetime.startsWith(ds))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    })

    const formatTime = (datetime) =>
      new Date(datetime).toLocaleTimeString('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit'
      })

    const previousMonth = () => {
      currentDate.value = new Date(year.value, month.value - 1)
      selectedDay.value = null
    }

    const nextMonth = () => {
      currentDate.value = new Date(year.value, month.value + 1)
      selectedDay.value = null
    }

    return {
      currentDate,
      monthYear,
      weekDays,
      calendarDays,
      previousMonth,
      nextMonth,
      isToday,
      isSelected,
      selectDay,
      hasAppointments,
      getAppointmentCount,
      selectedDayData,
      appointmentsForSelectedDay,
      formatTime
    }
  }
}
</script>

<style scoped>
.calendar {
  display: flex;
  flex-direction: column;
}

/* 🔥 HEADER BIEN ALINEADO */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.calendar-header h2 {
  flex: 1;
  text-align: center;
  margin: 0;
  text-transform: capitalize;
}

/* 🔥 BOTONES NO TOCADOS */
.nav-btn {
  background: #667eea;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
}

.nav-btn:hover {
  background: #764ba2;
  transform: scale(1.1);
}

.weekdays,
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.weekday {
  text-align: center;
  font-weight: bold;
  padding: 0.5rem;
  color: #667eea;
}

/* GRID */
.days-grid {
  gap: 8px;
  margin-bottom: 2rem;
}

.day {
  aspect-ratio: 1;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  min-width: 0;
  padding: 0.5rem;
  box-sizing: border-box;
}

.day.empty {
  border: none;
  background: transparent;
  cursor: default;
}

.day.today {
  background: #667eea;
  color: white;
}

.day.selected {
  background: #f0e6ff;
  border-color: #764ba2;
}

.appointment-count {
  font-size: 0.75rem;
  background: #ff6b6b;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin-top: 0.25rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
 .appointment-status {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
}
.appointment-card {
  background: #f8f9fa;
  padding: 1rem;
  border-left: 4px solid #667eea;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.appointment-card:hover {
  background: #e9ecef;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.appointment-time {
  font-weight: bold;
  color: #667eea;
  font-size: 1rem;
}

.appointment-phone {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.appointment-notes {
  color: #555;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fff9e6;
  border-radius: 4px;
  border-left: 3px solid #faad14;
  font-style: italic;
}
.appointment-time {
  font-weight: bold;
  color: #667eea;
  font-size: 1rem;
}
.appointment-phone {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

appointment-status {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
}

.appointment-status-confirmed {
  background: #d4edda;
  color: #155724;
}

.appointment-status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.appointment-status-pending {
  background: #fff3cd;
  color: #856404;
}

.appointments-list {
  margin-top: 1rem;
}

.appointments-list h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  text-transform: capitalize;
}

.appointments {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.no-appointments {
  text-align: center;
  color: #999;
  padding: 2rem 1rem;
  font-size: 0.95rem;
}
</style>