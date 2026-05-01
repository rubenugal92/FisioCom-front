import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import AppointmentsPage from '../pages/AppointmentsPage.vue'
import UsersPage from '../pages/UsersPage.vue'
import PlanningPage from '../pages/PlanningPage.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: LoginPage },

  { path: '/', redirect: '/calendario' },

  {
    path: '/calendario',
    component: AppointmentsPage,
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },

  {
    path: '/usuarios',
    component: UsersPage,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  {
    path: '/planning',
    component: PlanningPage,
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
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
    return '/calendario'
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    return '/calendario'
  }

  return true
})

export default router