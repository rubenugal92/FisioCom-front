<template>
  <MainLayout>
    <div class="planning-page">
      <h1>📅 Planning</h1>

      <!-- Vista para fisios (solo su propio planning) -->
      <div v-if="!isAdmin" class="content">
        <p class="subtitle">Tu planning</p>
        <PlanningCalendar :fisio-id="auth.user?.id" />
      </div>

      <!-- Vista para admin (todos los fisios) -->
      <div v-else-if="isAdmin" class="content">
        <div class="admin-view">
          <div class="fisio-selector">
            <label>Selecciona un fisio:</label>
            <select v-model="selectedFisioId" class="select">
              <option value="">Ver todos los fisios</option>
              <option v-for="fisio in fisios" :key="fisio.id" :value="fisio.id">
                {{ fisio.name }}
              </option>
            </select>
          </div>

          <div v-if="selectedFisioId" class="selected-planning">
            <PlanningCalendar :fisio-id="selectedFisioId" :key="selectedFisioId" />
          </div>

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
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../layouts/MainLayout.vue'
import PlanningCalendar from '../components/PlanningCalendar.vue'

const auth = useAuthStore()
const selectedFisioId = ref('')
const fisios = ref([])

const isAdmin = computed(() => auth.user?.role === 'adminMid')

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
}

.planning-page h1 {
  margin-bottom: 20px;
  color: #333;
}

.content {
  max-width: 900px;
  margin: 0 auto;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.admin-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fisio-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.fisio-selector label {
  font-weight: bold;
}

.select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 250px;
}

.selected-planning {
  background: white;
  border-radius: 8px;
  padding: 20px;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.fisio-planning-card h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.no-access {
  text-align: center;
  padding: 40px;
  background: #fff3cd;
  border-radius: 8px;
  color: #856404;
}
</style>
