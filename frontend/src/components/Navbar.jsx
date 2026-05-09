import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar({ cartCount, darkMode, toggleDark }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isActive = (path) => pathname === path

  const navLink = (to, label) => (
    <Link to={to} style={{
      fontSize: 14, fontWeight: 500,
      color: isActive(to) ? 'var(--text-1)' : 'var(--text-2)',
      transition: 'color 0.2s', paddingBottom: 2,
      borderBottom: isActive(to) ? '1.5px solid var(--text-1)' : '1.5px solid transparent',
    }}
    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
    onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = 'var(--text-2)' }}>
      {label}
    </Link>
  )

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: darkMode ? 'rgba(28,28,30,0.85)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-light)',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-1)', letterSpacing: '-0.3px', flexShrink: 0 }}>
          Store
        </Link>
        <nav style={{ display: 'flex', gap: 28, flex: 1 }}>
          {navLink('/', 'Shop')}
          {user && navLink('/orders', 'Orders')}
          {user && ['admin','cashier'].includes(user.role) && navLink('/pos', 'POS')}
          {user?.role === 'admin' && navLink('/admin', 'Admin')}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={toggleDark} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, padding: 4, display: 'flex', alignItems: 'center',
          }} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                background: 'var(--accent)', color: '#fff', borderRadius: 999,
                minWidth: 18, height: 18, display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 600, padding: '0 5px',
              }}>{cartCount}</span>
            )}
          </Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user.picture
                ? <img src={user.picture} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-light)' }} />
                : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{user.name?.[0]}</div>
              }
              <button onClick={() => { logout(); navigate('/login') }}
                className="btn btn-ghost btn-sm" style={{ fontSize: 13, color: 'var(--text-2)' }}>
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}
