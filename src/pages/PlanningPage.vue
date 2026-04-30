<template>
  <div class="planning-page">
    <div class="page-header">
      <h1>📅 Planning de Fisioterapeutas</h1>
      <p class="subtitle">Gestiona el calendario de trabajos, vacaciones y bajas</p>
    </div>

    <!-- Vista para fisios (solo su propio planning) -->
    <div v-if="!isAdmin" class="content">
      <div class="fisio-planning">
        <h2>Tu Planning</h2>
        <PlanningCalendar :fisio-id="auth.user?.id" />
      </div>
    </div>

    <!-- Vista para admin (todos los fisios) -->
    <div v-else-if="isAdmin" class="content">
      <div class="admin-view">
        <div class="controls-section">
          <div class="selector-wrapper">
            <h2>Selecciona un Fisioterapeuta</h2>
            <select v-model="selectedFisioId" class="fisio-select">
              <option value="">📊 Ver todos los fisioterapeutas</option>
              <option v-for="fisio in fisios" :key="fisio.id" :value="String(fisio.id)">
                {{ fisio.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Vista individual de un fisio -->
        <div v-if="selectedFisioId" class="selected-planning-wrapper">
          <div class="fisio-header">
            <h3>{{ getSelectedFisioName() }}</h3>
            <button @click="selectedFisioId = ''" class="btn btn-secondary">Volver a ver todos</button>
          </div>
          <PlanningCalendar :fisio-id="selectedFisioId" :key="selectedFisioId" />
        </div>

        <!-- Vista grid de todos los fisios -->
        <div v-else class="all-planning-grid">
          <div v-for="fisio in fisios" :key="fisio.id" class="fisio-planning-card">
            <h3>{{ fisio.name }}</h3>
            <PlanningCalendar :fisio-id="fisio.id" :key="`all-${fisio.id}`" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-access">
      <p>⚠️ No tienes acceso a esta sección</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import PlanningCalendar from '../components/PlanningCalendar.vue'

const auth = useAuthStore()
const selectedFisioId = ref('')
const fisios = ref([])

const isAdmin = computed(() => auth.user?.role === 'adminMid')

const getSelectedFisioName = () => {
  const fisio = fisios.value.find(f => String(f.id) === selectedFisioId.value)
  return fisio?.name || 'Desconocido'
}

const fetchFisios = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/fisios', {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (response.ok) {
      fisios.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching fisios:', error)
  }
}

onMounted(() => {
  if (isAdmin.value) {
    fetchFisios()
  }
})
</script>

<style scoped>
.planning-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 15px;
}

.content {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.fisio-planning {
  max-width: 900px;
  margin: 0 auto;
}

.fisio-planning h2 {
  margin-top: 0;
  color: #333;
}

.admin-view {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.controls-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.selector-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-wrapper h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.fisio-select {
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.fisio-select:hover {
  border-color: #007bff;
}

.fisio-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.selected-planning-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #ddd;
}

.fisio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #007bff;
}

.fisio-header h3 {
  margin: 0;
  color: #333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background: #5a6268;
}

.all-planning-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
}

.fisio-planning-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.fisio-planning-card h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.no-access {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
}
</style>
