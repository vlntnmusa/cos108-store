import { createContext, useContext, useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore session
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/api/auth/me')
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async ({ code }) => {
      // Exchange code for our JWT via backend
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: code }),
        })
        const data = await res.json()
        localStorage.setItem('token', data.token)
        setUser(data.user)
      } catch (e) {
        console.error('Login failed', e)
      }
    },
    flow: 'auth-code',
  })

  // Simpler: use credential response (ID token)
  const handleGoogleCredential = async (credentialResponse) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
      }
    } catch (e) {
      console.error('Login failed', e)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, handleGoogleCredential, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
