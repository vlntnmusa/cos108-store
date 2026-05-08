import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, handleGoogleCredential } = useAuth()
  const navigate = useNavigate()
  useEffect(() => { if (user) navigate('/') }, [user])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div className="fade-up" style={{ textAlign: 'center', maxWidth: 380, width: '100%', padding: '0 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--text-1)', borderRadius: 14,
            margin: '0 auto 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 8 }}>Welcome to Store</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Sign in to start shopping</p>
        </div>

        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)', padding: '32px',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleCredential}
              onError={() => console.error('Login failed')}
              theme="outline" size="large" shape="rectangular"
              text="signin_with" width="280"
            />
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
            By signing in, you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  )
}
