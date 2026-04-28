<template>
  <nav class="navbar">
    <div class="nav-container">

      <div class="nav-brand">
        <h1>🏥 FisioCom</h1>
      </div>

      <div class="nav-menu">
        <button
          class="nav-button"
          :class="{ active: route.path === '/citas' }"
          @click="go('/citas')"
        >
          📅 Citas
        </button>

        <button
          class="nav-button"
          :class="{ active: route.path === '/fisios' }"
          @click="go('/fisios')"
        >
          👨‍⚕️ Fisios
        </button>
      </div>

      <div class="nav-user">
        <span class="user-name">
          {{ user?.username || 'Usuario' }}
        </span>

        <button class="btn btn-logout" @click="handleLogout">
          Salir
        </button>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUser, logout } from '../api/appointments.js'

const router = useRouter()
const route = useRoute()

const user = ref(null)

const go = (path) => {
  router.push(path)
}

const handleLogout = () => {
  logout()
  router.push('/login')
}

onMounted(() => {
  user.value = getUser()
})
</script>