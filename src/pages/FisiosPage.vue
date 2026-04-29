<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2>Fisioterapeutas</h2>
        <p>Lista y gestión de fisioterapeutas</p>
      </div>

      <button 
        v-if="!showForm"
        class="btn btn-primary"
        @click="showForm = true"
      >
        ➕ Nuevo Fisioterapeuta
      </button>
    </div>

    <!-- FORMULARIO -->
    <FisioForm
      v-if="showForm"
      :editing="editingFisio"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <!-- LISTA -->
    <div v-if="store.items.length === 0 && !showForm" class="empty-state">
      No hay fisioterapeutas registrados todavía.
    </div>

    <div v-else-if="!showForm" class="fisios-grid">
      <div v-for="fisio in store.items" :key="fisio.id" class="fisio-card">
        <div class="fisio-details">
          <h3>{{ fisio.name }}</h3>
          <p class="fisio-specialty">
            {{ fisio.specialties || 'Especialidad no disponible' }}
          </p>
          <p class="fisio-info">
            <strong>Email:</strong> {{ fisio.email }}
          </p>
          <p v-if="fisio.phone" class="fisio-info">
            <strong>Teléfono:</strong> {{ fisio.phone }}
          </p>
          <p v-if="fisio.license" class="fisio-info">
            <strong>Licencia:</strong> {{ fisio.license }}
          </p>
        </div>

        <div class="fisio-actions">
          <button 
            class="btn btn-secondary"
            @click="editFisio(fisio)"
          >
            ✏️ Editar
          </button>
          <button 
            class="btn btn-danger"
            @click="store.remove(fisio.id)"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFisiosStore } from '../stores/fisios'
import FisioForm from '../components/FisioForm.vue'

const store = useFisiosStore()
const showForm = ref(false)
const editingFisio = ref(null)

onMounted(() => {
  store.fetch()
})

const editFisio = (fisio) => {
  editingFisio.value = fisio
  showForm.value = true
}

const handleSave = async () => {
  await store.fetch()
  showForm.value = false
  editingFisio.value = null
}

const handleCancel = () => {
  showForm.value = false
  editingFisio.value = null
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.page-header div h2 {
  margin: 0 0 0.25rem 0;
}

.page-header div p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.fisios-grid {
  display: grid;
  gap: 1rem;
}

.fisio-card {
  background: white;
  border-radius: 14px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.3s, border-color 0.3s;
}

.fisio-card:hover {
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  border-color: #d1d5db;
}

.fisio-details {
  flex: 1;
}

.fisio-details h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.fisio-specialty {
  color: #4338ca;
  font-weight: 600;
  margin: 0.25rem 0;
  font-size: 0.95rem;
}

.fisio-info {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.fisio-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
}

.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: #4338ca;
  color: white;
}

.btn-primary:hover {
  background: #3730a3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 56, 202, 0.3);
}

.btn-secondary {
  background: #eef2ff;
  color: #4338ca;
}

.btn-secondary:hover {
  background: #ddd6fe;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.empty-state {
  padding: 3rem 2rem;
  background: #f0f9ff;
  border-radius: 14px;
  color: #0c4a6e;
  text-align: center;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .fisio-card {
    flex-direction: column;
  }

  .fisio-actions {
    justify-content: flex-start;
    width: 100%;
  }
}
</style>