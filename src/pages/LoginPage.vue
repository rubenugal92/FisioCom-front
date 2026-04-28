<template>
  <Login @login-success="go" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import Login from '../components/Login.vue'

const router = useRouter()

const go = () => {
  router.push('/citas')
}
</script>