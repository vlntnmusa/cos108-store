import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function POSPage() {
  const [products, setProducts] = useState([])
  const [cart, setCart]         = useState([])
  const [receipt, setReceipt]   = useState(null)
  const [loading, setLoading]   = useState(false)

  useEffect(() => { api.get('/api/products').then(setProducts) }, [])

  const addItem = (p) => setCart(prev => {
    const ex = prev.find(i => i.id === p.id)
    return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]
  })
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id))
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const completeSale = async () => {
    if (!cart.length) return
    setLoading(true)
    try {
      const res = await api.post('/api/pos/sale', { items: cart.map(i => ({ product_id: i.id, quantity: i.qty })) })
      setReceipt({ ...res, items: cart, total })
      setCart([])
    } catch (e) { alert('Sale failed: ' + e.message) }
    finally { setLoading(false) }
  }

  if (receipt) return (
    <div className="page" style={{ maxWidth: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card fade-up" style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✓</div>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Sale complete</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 24 }}>Order #{receipt.order_id}</p>
        <div style={{ textAlign: 'left', marginBottom: 20 }}>
          {receipt.items.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 14 }}>
              <span>{i.name} <span style={{ color: 'var(--text-2)' }}>×{i.qty}</span></span>
              <span style={{ fontWeight: 500 }}>${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700, fontSize: 17 }}>
            <span>Total</span><span>${receipt.total.toFixed(2)}</span>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: 10 }}
          onClick={() => setReceipt(null)}>New Sale</button>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.3px' }}>Point of Sale</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 12 }}>
          {products.filter(p => p.stock > 0).map((p, i) => (
            <button key={p.id} onClick={() => addItem(p)}
              className="card card-hover"
              style={{ border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0, overflow: 'hidden',
                       animation: `fadeUp 0.3s ${i*0.03}s var(--ease) both` }}>
              {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 90, objectFit: 'cover' }} />}
              <div style={{ padding: '10px 12px' }}>
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, letterSpacing: '-0.1px' }}>{p.name}</p>
                <p style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>${p.price.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="card fade-up-2" style={{ position: 'sticky', top: 72 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Current sale</h3>
          {cart.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-3)', padding: '24px 0', textAlign: 'center' }}>Tap a product to add</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {cart.map(i => (
                  <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>{i.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-2)' }}>×{i.qty} · ${i.price.toFixed(2)}</p>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>${(i.price*i.qty).toFixed(2)}</span>
                    <button onClick={() => removeItem(i.id)} className="btn btn-ghost btn-sm"
                      style={{ padding: 0, width: 28, height: 28, borderRadius: 6, color: 'var(--text-3)' }}>✕</button>
                  </div>
                ))}
              </div>
              <div className="divider" style={{ margin: '0 0 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: 10 }}
                onClick={completeSale} disabled={loading}>
                {loading ? 'Processing…' : 'Complete sale'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
