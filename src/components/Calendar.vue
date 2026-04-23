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

/* HEADER */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header h2 {
  font-size: 1.2rem;
  text-align: center;
  flex: 1;
}

/* GRID DÍAS */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day {
  aspect-ratio: 1;
  min-height: 45px;
  border-radius: 6px;
  font-size: 0.8rem;
}

/* APPOINTMENTS */
.appointments {
  max-height: 200px;
  overflow-y: auto;
}

/* 📱 MOBILE */
@media (max-width: 768px) {
  .weekday {
    font-size: 0.7rem;
    padding: 0.25rem;
  }

  .day {
    min-height: 40px;
    font-size: 0.75rem;
  }

  .appointment-card {
    padding: 0.75rem;
  }

  .appointment-time {
    font-size: 0.9rem;
  }
}

/* 📱 VERY SMALL */
@media (max-width: 400px) {
  .days-grid {
    gap: 4px;
  }

  .day {
    min-height: 35px;
  }
}
</style>