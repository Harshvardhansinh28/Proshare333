import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, initAuthTokenFromStorage, setAuthToken } from '@/lib/api'

type User = {
  id: string
  email: string
  username: string
  bio: string | null
  avatarUrl: string | null
  role: 'ADMIN' | 'USER'
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, category: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    initAuthTokenFromStorage()
    refreshUser().finally(() => setLoading(false))
  }, [])

  async function refreshUser() {
    try {
      const { data } = await api.get<User>('/users/me')
      setUser(data)
    } catch {
      setAuthToken(null)
      setUser(null)
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<{ token: string }>('/auth/login', { email, password })
    setAuthToken(data.token)
    await refreshUser()
    navigate('/projects')
  }

  async function register(email: string, username: string, password: string, category: string) {
    await api.post('/auth/register', { email, username, password, category })
    await login(email, password)
  }

  function logout() {
    setAuthToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

