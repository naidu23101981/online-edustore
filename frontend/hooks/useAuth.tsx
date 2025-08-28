"use client"
import { useState, useEffect, createContext, useContext } from 'react'
import { AuthAPI } from '@/lib/api'

type User = {
  id: string
  email?: string
  phone?: string
  role: 'USER' | 'ADMIN' | 'SUPERADMIN'
  firstName: string
  lastName: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const login = (token: string, userData: User) => {
    setUser(userData)
    localStorage.setItem('auth_token', token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
    window.location.href = '/'
  }

  const refreshUser = async () => {
    try {
      const { user: userData } = await AuthAPI.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      logout()
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token')
      
      if (token && AuthAPI.isAuthenticated()) {
        try {
          await refreshUser()
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          logout()
        }
      }
      
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
