<template>
  <Login />
</template>

<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../components/Login.vue'

const router = useRouter()
const auth = useAuthStore()

// Redirige automáticamente cuando se autentica
watch(
  () => auth.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      router.push('/calendario')
    }
  }
)
</script>