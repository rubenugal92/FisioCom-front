<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2>Usuarios</h2>
        <p>Lista y gestión de usuarios (fisioterapeutas)</p>
      </div>

      <button 
        v-if="!showForm"
        class="btn btn-primary"
        @click="showForm = true"
      >
        ➕ Nuevo Usuario
      </button>
    </div>

    <!-- FORMULARIO -->
    <FisioForm
      v-if="showForm"
      :editing="editingUser"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <!-- LISTA -->
    <div v-if="store.items.length === 0 && !showForm" class="empty-state">
      No hay usuarios registrados todavía.
    </div>

    <div v-else-if="!showForm" class="users-grid">
      <div v-for="user in store.items" :key="user.id" class="user-card">
        <div class="user-details">
          <h3>{{ user.name }}</h3>
          <p class="user-specialty">
            {{ user.specialties || 'Especialidad no disponible' }}
          </p>
          <p class="user-info">
            <strong>Email:</strong> {{ user.email }}
          </p>
          <p v-if="user.phone" class="user-info">
            <strong>Teléfono:</strong> {{ user.phone }}
          </p>
          <p v-if="user.license" class="user-info">
            <strong>Licencia:</strong> {{ user.license }}
          </p>
          <p class="user-role">
            <strong>Rol:</strong> {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
          </p>
        </div>

        <div class="user-actions">
          <button 
            class="btn btn-secondary"
            @click="editUser(user)"
          >
            ✏️ Editar
          </button>
          <button 
            class="btn btn-danger"
            @click="handleDelete(user.id)"
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
import { useUsersStore } from '../stores/users'
import FisioForm from '../components/FisioForm.vue'

const store = useUsersStore()
const showForm = ref(false)
const editingUser = ref(null)

onMounted(() => {
  store.fetch()
})

const editUser = (user) => {
  editingUser.value = user
  showForm.value = true
}

const handleSave = async () => {
  await store.fetch()
  showForm.value = false
  editingUser.value = null
}

const handleDelete = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    await store.remove(id)
    await store.fetch()
  }
}

const handleCancel = () => {
  showForm.value = false
  editingUser.value = null
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

.users-grid {
  display: grid;
  gap: 1rem;
}

.user-card {
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

.user-card:hover {
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  border-color: #d1d5db;
}

.user-details {
  flex: 1;
}

.user-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: #1f2937;
}

.user-specialty {
  margin: 0 0 0.75rem 0;
  color: #0066cc;
  font-weight: 500;
  font-size: 0.95rem;
}

.user-info {
  margin: 0.25rem 0;
  color: #374151;
  font-size: 0.9rem;
}

.user-role {
  margin: 0.5rem 0 0 0;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
}

.btn {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover {
  background: #0052a3;
}

.btn-secondary {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
}

.btn-danger:hover {
  background: #fecaca;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header button {
    width: 100%;
  }

  .user-card {
    flex-direction: column;
  }

  .user-actions {
    justify-content: flex-start;
  }
}
</style>
