<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-btn">&lt;</button>
      <h2>{{ monthYear }}</h2>
      <button @click="nextMonth" class="nav-btn">&gt;</button>
    </div>

    <div class="weekdays">
      <div v-for="day in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <div class="days-grid">
      <div 
        v-for="day in daysInMonth" 
        :key="day"
        @click="selectDay(day)"
        :class="['day', {
          'today': isToday(day),
          'selected': isSelected(day),
          'has-appointments': hasAppointments(day)
        }]"
      >
        <div class="day-number">{{ day }}</div>
        <div v-if="hasAppointments(day)" class="appointment-count">
          {{ getAppointmentCount(day) }}
        </div>
      </div>
    </div>

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
          @click="$emit('appointment-selected', appointment)"
          class="appointment-card"
        >
          <div class="appointment-time">
            {{ formatTime(appointment.datetime) }}
          </div>
          <div class="appointment-phone">
            {{ appointment.phone }}
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
    appointments: {
      type: Array,
      default: () => []
    },
    loading: Boolean
  },
  emits: ['appointment-selected', 'date-selected'],
  setup(props, { emit }) {
    const currentDate = ref(new Date())
    const selectedDay = ref(null)

    const monthYear = computed(() => {
      return currentDate.value.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      }).replace(/^\w/, c => c.toUpperCase())
    })

    const daysInMonth = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      return new Date(year, month + 1, 0).getDate()
    })

    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
      selectedDay.value = null
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
      selectedDay.value = null
    }

    const getDateString = (day) => {
      const year = currentDate.value.getFullYear()
      const month = String(currentDate.value.getMonth() + 1).padStart(2, '0')
      const date = String(day).padStart(2, '0')
      return `${year}-${month}-${date}`
    }

    const isToday = (day) => {
      const today = new Date()
      return (
        day === today.getDate() &&
        currentDate.value.getMonth() === today.getMonth() &&
        currentDate.value.getFullYear() === today.getFullYear()
      )
    }

    const isSelected = (day) => {
      return selectedDay.value === day
    }

    const selectDay = (day) => {
      selectedDay.value = day
      const dateStr = getDateString(day)
      emit('date-selected', dateStr)
    }

    const hasAppointments = (day) => {
      const dateStr = getDateString(day)
      return props.appointments.some(apt => 
        apt.datetime.startsWith(dateStr)
      )
    }

    const getAppointmentCount = (day) => {
      const dateStr = getDateString(day)
      return props.appointments.filter(apt => 
        apt.datetime.startsWith(dateStr)
      ).length
    }

    const selectedDayData = computed(() => {
      if (!selectedDay.value) return null
      const dateStr = getDateString(selectedDay.value)
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).replace(/^\w/, c => c.toUpperCase())
    })

    const appointmentsForSelectedDay = computed(() => {
      if (!selectedDay.value) return []
      const dateStr = getDateString(selectedDay.value)
      return props.appointments
        .filter(apt => apt.datetime.startsWith(dateStr))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    })

  const formatTime = (datetime) => {
  return new Date(datetime).toLocaleTimeString('es-ES', {
    timeZone: 'Europe/Madrid', // 🔥 clave
    hour: '2-digit',
    minute: '2-digit'
  })
}

    return {
      currentDate,
      monthYear,
      daysInMonth,
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

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.calendar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  flex: 1;
  text-align: center;
  text-transform: capitalize;
}

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
  transition: background 0.3s ease;
}

.nav-btn:hover {
  background: #764ba2;
  transform: scale(1.1);
}

.weekdays,
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  width: 100%;
  box-sizing: border-box;
}

.weekday {
  text-align: center;
  font-weight: bold;
  color: #667eea;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 2rem;
}

.day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem;
  min-height: 70px;
}

.day:hover {
  border-color: #667eea;
  background: #f5f7ff;
}

.day.today {
  background: #667eea;
  color: white;
  border-color: #667eea;
  font-weight: bold;
}

.day.selected {
  border-color: #764ba2;
  background: #f0e6ff;
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
}

.day.has-appointments {
  font-weight: bold;
}

.day-number {
  font-size: 1rem;
}

.appointment-count {
  font-size: 0.75rem;
  background: #ff6b6b;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin-top: 0.25rem;
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
  margin: 0.25rem 0;
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

.no-appointments {
  text-align: center;
  color: #999;
  padding: 2rem 1rem;
  font-size: 0.95rem;
}
/* === TABLET === */
@media (max-width: 1024px) {
  .days-grid {
    gap: 6px;
  }

  .day {
    min-height: 60px;
  }
}

/* === MOBILE === */
@media (max-width: 600px) {
  .days-grid {
    gap: 4px;
  }

  .day {
    min-height: unset;
    aspect-ratio: 1;
    padding: 0.25rem;
    font-size: 0.75rem;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    overflow: hidden; /* 🔥 clave */
  }

  .day-number {
    font-size: 0.85rem;
    line-height: 1;
  }

  .appointment-count {
    font-size: 0.6rem;
    padding: 0.1rem 0.25rem;
  }
}

</style>
