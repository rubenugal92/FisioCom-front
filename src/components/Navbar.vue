<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <h1>🏥 FisioCom</h1>
      </div>

      <div class="nav-menu">
        <button 
          class="nav-button"
          :class="{ active: activeTab === 'appointments' }"
          @click="emitTabChange('appointments')"
        >
          📅 Citas
        </button>
        <button 
          class="nav-button"
          :class="{ active: activeTab === 'fisios' }"
          @click="emitTabChange('fisios')"
        >
          👨‍⚕️ Fisios
        </button>
      </div>

      <div class="nav-user">
        <span class="user-name">{{ user?.username }}</span>
        <button class="btn btn-logout" @click="handleLogout">Salir</button>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getUser, logout } from '../api/appointments.js'

export default {
  name: 'Navbar',
  emits: ['logout', 'tab-change'],
  setup(_, { emit }) {
    const activeTab = ref('appointments')
    const user = ref(null)

    const emitTabChange = (tab) => {
      activeTab.value = tab
      emit('tab-change', tab)
    }

    const handleLogout = () => {
      logout()
      emit('logout')
    }

    onMounted(() => {
      user.value = getUser()
    })

    return {
      activeTab,
      user,
      emitTabChange,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding-bottom: 0;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8rem;
}

.nav-menu {
  display: flex;
  gap: 1rem;
  flex: 1;
  margin-left: 2rem;
}

.nav-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid transparent;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.nav-button.active {
  background: white;
  color: #667eea;
  border-color: white;
  font-weight: 600;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: white;
  color: #667eea;
}

@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .nav-menu {
    flex: 1 0 100%;
    margin-left: 0;
  }
}
</style>
