import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem('proshare_token', token)
  } else {
    delete api.defaults.headers.common.Authorization
    localStorage.removeItem('proshare_token')
  }
}

export function initAuthTokenFromStorage() {
  const token = localStorage.getItem('proshare_token')
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  }
}

