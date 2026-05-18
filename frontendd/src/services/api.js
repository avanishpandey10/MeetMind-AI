import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for large files
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      console.error('Network Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export const meetingService = {
  // Process meeting transcript
  processMeeting: async (data) => {
    const response = await api.post('/meetings/process', data)
    return response.data
  },

  // Upload transcript file
  uploadFile: async (file, title) => {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    
    const response = await api.post('/meetings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes for file upload
    })
    return response.data
  },

  // Get all meetings with optional search
  getMeetings: async (params = {}) => {
    const response = await api.get('/meetings', { params })
    return response.data
  },

  // Get single meeting by ID
  getMeeting: async (id) => {
    const response = await api.get(`/meetings/${id}`)
    return response.data
  },

  // Generate follow-up email
  generateFollowUpEmail: async (id) => {
    const response = await api.post(`/meetings/${id}/followup-email`)
    return response.data
  },

  // Chat with meeting
  chatWithMeeting: async (id, question) => {
    const response = await api.post(`/meetings/${id}/chat`, { question })
    return response.data
  },

  // Update action item status
  updateActionItem: async (meetingId, itemId, status) => {
    const response = await api.patch(
      `/meetings/${meetingId}/action-items/${itemId}`, 
      { status }
    )
    return response.data
  },

  // Export meeting as Markdown
  exportMarkdown: async (id) => {
    const response = await api.get(`/meetings/${id}/export`, {
      responseType: 'blob',
    })
    
    // Create and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `meeting-${id}.md`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Delete meeting (optional)
  deleteMeeting: async (id) => {
    const response = await api.delete(`/meetings/${id}`)
    return response.data
  }
}

export default api