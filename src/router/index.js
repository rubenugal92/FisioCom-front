import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import AppointmentsPage from '../pages/AppointmentsPage.vue'
import FisiosPage from '../pages/FisiosPage.vue'
import PlanningPage from '../pages/PlanningPage.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: LoginPage },

  { path: '/', redirect: '/citas' },

  {
    path: '/citas',
    component: AppointmentsPage,
    meta: { requiresAuth: true }
  },

  {
    path: '/fisios',
    component: FisiosPage,
    meta: { requiresAuth: true }
  },

  {
    path: '/planning',
    component: PlanningPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  if (to.path === '/login' && auth.isAuthenticated) {
    return '/citas'
  }

  return true
})

export default router