import { Link, useNavigate } from 'react-router-dom'

export default function CartPage({ cart, removeFromCart, updateQty, clearCart }) {
  const navigate = useNavigate()
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  if (cart.length === 0) return (
    <div className="page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty fade-up">
        <div className="empty-icon">🛒</div>
        <p className="t-headline" style={{ marginBottom: 8 }}>Your cart is empty</p>
        <p className="t-caption" style={{ marginBottom: 24 }}>Add something to get started</p>
        <Link to="/" className="btn btn-primary">Browse products</Link>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 4 }}>Cart</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          {count} item{count !== 1 ? 's' : ''} · Saved automatically
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Items */}
        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cart.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', gap: 16, padding: '20px 0',
              borderBottom: '1px solid var(--border-light)',
              animation: `fadeUp 0.3s ${i*0.05}s var(--ease) both`,
            }}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={{
                  width: 72, height: 72, objectFit: 'cover',
                  borderRadius: 10, flexShrink: 0,
                  border: '1px solid var(--border-light)',
                }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, letterSpacing: '-0.1px' }}>{item.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>${item.price.toFixed(2)} each</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => item.qty > 1 ? updateQty(item.id, item.qty - 1) : removeFromCart(item.id)}
                  style={{ width: 32, height: 32, padding: 0, borderRadius: 8, fontSize: 16 }}>−</button>
                <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{item.qty}</span>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  disabled={item.qty >= item.stock}
                  style={{ width: 32, height: 32, padding: 0, borderRadius: 8, fontSize: 16,
                    opacity: item.qty >= item.stock ? 0.3 : 1 }}>+</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 15, minWidth: 64, textAlign: 'right' }}>
                  ${(item.price * item.qty).toFixed(2)}
                </span>
                <button onClick={() => removeFromCart(item.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ width: 32, height: 32, padding: 0, color: 'var(--text-3)', borderRadius: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card fade-up-3" style={{ position: 'sticky', top: 72 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 20, letterSpacing: '-0.2px' }}>Order summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-2)' }}>
            <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-2)' }}>
            <span>Shipping</span><span style={{ color: 'var(--success)' }}>Free</span>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15, borderRadius: 10, marginBottom: 10 }}
            onClick={() => navigate('/checkout')}>
            Checkout
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', fontSize: 13, color: 'var(--text-2)' }}
            onClick={clearCart}>Clear cart</button>
        </div>
      </div>
    </div>
  )
}
