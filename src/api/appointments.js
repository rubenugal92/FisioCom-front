import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

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

export const getAvailableSlots = async (date) => {
  try {
    const response = await api.get(`/slots/${date}`)
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

export default api
