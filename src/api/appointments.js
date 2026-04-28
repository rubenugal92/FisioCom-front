import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ===================== INTERCEPTOR =====================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ===================== AUTH =====================
export const login = async (email, password) => {
  const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  })

  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  return data
}

export const register = async (username, email, password) => {
  const { data } = await axios.post(`${API_BASE_URL}/auth/register`, {
    username,
    email,
    password
  })

  return data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getToken = () => localStorage.getItem('token')

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => !!getToken()

// ===================== APPOINTMENTS =====================

// 🔥 FIX IMPORT ERROR (ESTO ES LO QUE TE FALTABA)
export const getAppointments = getAllAppointments

export const getAllAppointments = async () => {
  const { data } = await api.get('/appointments')
  return data
}

export const getAppointmentById = async (id) => {
  const { data } = await api.get(`/appointments/${id}`)
  return data
}

export const getAppointmentsByDateRange = async (startDate, endDate) => {
  const { data } = await api.get(
    `/appointments/range/${startDate}/${endDate}`
  )
  return data
}

export const getAvailableSlots = async (date, fisioId = null) => {
  let url = `/slots/${date}`
  if (fisioId) url += `?fisio_id=${fisioId}`

  const { data } = await api.get(url)
  return data.slots
}

export const createAppointment = async (appointmentData) => {
  const { data } = await api.post('/appointments', appointmentData)
  return data
}

export const updateAppointment = async (id, appointmentData) => {
  const { data } = await api.put(`/appointments/${id}`, appointmentData)
  return data
}

export const deleteAppointment = async (id) => {
  const { data } = await api.delete(`/appointments/${id}`)
  return data
}

// ===================== FISIOS =====================
export const getAllFisios = async () => {
  const { data } = await api.get('/fisios')
  return data
}

export const getFisioById = async (id) => {
  const { data } = await api.get(`/fisios/${id}`)
  return data
}

export const createFisio = async (fisioData) => {
  const { data } = await api.post('/fisios', fisioData)
  return data
}

export const updateFisio = async (id, fisioData) => {
  const { data } = await api.put(`/fisios/${id}`, fisioData)
  return data
}

export const deleteFisio = async (id) => {
  const { data } = await api.delete(`/fisios/${id}`)
  return data
}

export default api