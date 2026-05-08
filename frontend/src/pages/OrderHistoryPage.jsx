import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

export default function OrderHistoryPage() {
  const { user }              = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/orders').then(setOrders).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><p style={{ color: 'var(--text-2)' }}>Loading…</p></div>

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 4 }}>
          {user.role === 'admin' ? 'All Orders' : 'Your Orders'}
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p className="t-headline" style={{ marginBottom: 8 }}>No orders yet</p>
          <p className="t-caption">Your orders will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((o, i) => (
            <div key={o.id} className="card" style={{ animation: `fadeUp 0.35s ${i*0.05}s var(--ease) both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>Order #{o.id}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    {new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="badge badge-success">{o.status}</span>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>${o.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="divider" style={{ margin: '0 0 16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {o.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-2)' }}>{item.product} <span style={{ color: 'var(--text-3)' }}>×{item.quantity}</span></span>
                    <span style={{ fontWeight: 500 }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
