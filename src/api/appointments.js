import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a todas las requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ===================== AUTH =====================
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password })
    return response.data
  } catch (error) {
    console.error('Error registering:', error)
    throw error
  }
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
export const getAllAppointments = async () => {
  try {
    const response = await api.get('/appointments')
    return response.data
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw error
  }
}

export const getAppointmentById = async (id) => {
  try {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching appointment:', error)
    throw error
  }
}

export const getAppointmentsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/appointments/range/${startDate}/${endDate}`)
    return response.data
  } catch (error) {
    console.error('Error fetching appointments by date range:', error)
    throw error
  }
}

export const getAvailableSlots = async (date, fisioId = null) => {
  try {
    let url = `/slots/${date}`
    if (fisioId) {
      url += `?fisio_id=${fisioId}`
    }
    const response = await api.get(url)
    return response.data.slots
  } catch (error) {
    console.error('Error fetching available slots:', error)
    throw error
  }
}

export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post('/appointments', appointmentData)
    return response.data
  } catch (error) {
    console.error('Error creating appointment:', error)
    throw error
  }
}

export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await api.put(`/appointments/${id}`, appointmentData)
    return response.data
  } catch (error) {
    console.error('Error updating appointment:', error)
    throw error
  }
}

export const deleteAppointment = async (id) => {
  try {
    const response = await api.delete(`/appointments/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting appointment:', error)
    throw error
  }
}

// ===================== FISIOS =====================
export const getAllFisios = async () => {
  try {
    const response = await api.get('/fisios')
    return response.data
  } catch (error) {
    console.error('Error fetching fisios:', error)
    throw error
  }
}

export const getFisioById = async (id) => {
  try {
    const response = await api.get(`/fisios/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching fisio:', error)
    throw error
  }
}

export const createFisio = async (fisioData) => {
  try {
    const response = await api.post('/fisios', fisioData)
    return response.data
  } catch (error) {
    console.error('Error creating fisio:', error)
    throw error
  }
}

export const updateFisio = async (id, fisioData) => {
  try {
    const response = await api.put(`/fisios/${id}`, fisioData)
    return response.data
  } catch (error) {
    console.error('Error updating fisio:', error)
    throw error
  }
}

export const deleteFisio = async (id) => {
  try {
    const response = await api.delete(`/fisios/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting fisio:', error)
    throw error
  }
}

export default api
