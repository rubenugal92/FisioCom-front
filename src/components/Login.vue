<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🏥 FisioCom</h1>
      <p class="subtitle">Sistema de Gestión de Citas</p>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="isRegister" class="form-group">
          <label>Nombre de Usuario</label>
          <input 
            v-model="form.username"
            type="text"
            placeholder="Tu nombre de usuario"
            required
          />
        </div>

        <div class="form-group">
          <label>Correo Electrónico</label>
          <input 
            v-model="form.email"
            type="email"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input 
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          ❌ {{ error }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Cargando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión') }}
        </button>

        <button type="button" class="btn btn-link" @click="toggleMode" :disabled="loading">
          {{ isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { login, register } from '../api/appointments.js'

export default {
  name: 'Login',
  emits: ['login-success'],
  setup(_, { emit }) {
    const auth = useAuthStore()
    const form = ref({
      email: '',
      password: '',
      username: ''
    })

    const isRegister = ref(false)
    const loading = ref(false)
    const error = ref('')

    const toggleMode = () => {
      isRegister.value = !isRegister.value
      error.value = ''
      form.value = { email: '', password: '', username: '' }
    }

    const handleSubmit = async () => {
      try {
        error.value = ''
        loading.value = true

        if (isRegister.value) {
          if (!form.value.username) {
            error.value = 'Por favor ingresa un nombre de usuario'
            return
          }
          await register(form.value.username, form.value.email, form.value.password)
          error.value = ''
          isRegister.value = false
          form.value = { email: form.value.email, password: '', username: '' }
          error.value = ''
        } else {
          const data = await login(form.value.email, form.value.password)
          auth.login(data.token)
          emit('login-success')
        }
      } catch (err) {
        error.value = err.response?.data?.error || 'Error en la solicitud. Intenta de nuevo.'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      isRegister,
      loading,
      error,
      toggleMode,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  text-align: center;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 2rem 0;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-link {
  background: none;
  color: #667eea;
  padding: 0.5rem;
  margin-top: 1rem;
  text-decoration: none;
}

.btn-link:hover:not(:disabled) {
  text-decoration: underline;
}

.btn-link:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
