<template>
  <div id="app" class="app-shell">
    <Navbar v-if="showNavbar" />

    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'

const route = useRoute()
const showNavbar = computed(() => route.path !== '/login')
</script>