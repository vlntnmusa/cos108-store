import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'

const STEPS = ['Contact', 'Shipping', 'Payment']

function Field({ label, id, ...props }) {
  return (
    <div className="form-group">
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} name={id} className="input" {...props} />
    </div>
  )
}

export default function CheckoutPage({ cart, clearCart }) {
  const navigate  = useNavigate()
  const [step, setStep]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [order, setOrder]   = useState(null)

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    address: '', apt: '', city: '', state: '', zip: '', country: 'United States',
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const formatCard   = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const formatExpiry = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d }

  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0)
  const total    = subtotal

  const placeOrder = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/checkout', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
        contact: { email: form.email, name: `${form.firstName} ${form.lastName}` },
        shipping: { address: form.address, city: form.city, state: form.state, zip: form.zip },
      })
      setOrder(res)
      clearCart()
    } catch (e) {
      setError(e.message || 'Order failed. Please try again.')
    } finally { setLoading(false) }
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (order) return (
    <div className="page" style={{ maxWidth: 520, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="card fade-up" style={{ width: '100%', textAlign: 'center', padding: '48px 40px' }}>
        <div style={{
          width: 64, height: 64, background: '#E8F5E9', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 28,
        }}>✓</div>
        <h2 style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-0.3px', marginBottom: 8 }}>Order placed!</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 4 }}>Order #{order.order_id}</p>
        <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 32 }}>
          A confirmation will be sent to {form.email}
        </p>
        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
            <span>Total charged</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
        <Link to="/" className="btn btn-primary" style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 15 }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  )

  // ── Checkout layout ──────────────────────────────────────────────────────
  return (
    <div className="page">
      <Link to="/cart" style={{ fontSize: 13, color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 32 }}
        onMouseEnter={e => e.currentTarget.style.color='var(--text-1)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--text-2)'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to cart
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }}>

        {/* Left — form */}
        <div className="fade-up">
          {/* Step indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', border: '1.5px solid',
                  borderColor: i <= step ? 'var(--accent)' : 'var(--border)',
                  background: i < step ? 'var(--accent)' : i === step ? '#EBF4FF' : 'transparent',
                  color: i < step ? '#fff' : i === step ? 'var(--accent)' : 'var(--text-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, transition: 'all .2s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: i === step ? 600 : 400,
                  color: i === step ? 'var(--text-1)' : 'var(--text-2)' }}>{s}</span>
                {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: 'var(--border-light)', margin: '0 4px' }} />}
              </div>
            ))}
          </div>

          {/* Step 0 — Contact */}
          {step === 0 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.2px', marginBottom: 24 }}>Contact information</h2>
              <Field label="Email address" id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="First name" id="firstName" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Jane" required />
                <Field label="Last name"  id="lastName"  value={form.lastName}  onChange={e => set('lastName',  e.target.value)} placeholder="Doe"  required />
              </div>
              <Field label="Phone number" id="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
              <button className="btn btn-primary" style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 15, marginTop: 8 }}
                onClick={() => setStep(1)} disabled={!form.email || !form.firstName || !form.lastName}>
                Continue to Shipping
              </button>
            </div>
          )}

          {/* Step 1 — Shipping */}
          {step === 1 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.2px', marginBottom: 24 }}>Shipping address</h2>
              <Field label="Address" id="address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main Street" required />
              <Field label="Apt, suite, etc. (optional)" id="apt" value={form.apt} onChange={e => set('apt', e.target.value)} placeholder="Apt 4B" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="City"  id="city"  value={form.city}  onChange={e => set('city',  e.target.value)} placeholder="New York" required />
                <Field label="State" id="state" value={form.state} onChange={e => set('state', e.target.value)} placeholder="NY" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="ZIP code" id="zip"     value={form.zip}     onChange={e => set('zip',     e.target.value)} placeholder="10001" required />
                <Field label="Country"  id="country" value={form.country} onChange={e => set('country', e.target.value)} placeholder="United States" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-outline" style={{ flex: 1, padding: 14, borderRadius: 12 }} onClick={() => setStep(0)}>Back</button>
                <button className="btn btn-primary" style={{ flex: 2, padding: 14, borderRadius: 12, fontSize: 15 }}
                  onClick={() => setStep(2)} disabled={!form.address || !form.city || !form.zip}>
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.2px', marginBottom: 24 }}>Payment</h2>

              {/* Card visual */}
              <div style={{
                background: 'linear-gradient(135deg, #1D1D1F 0%, #3a3a3c 100%)',
                borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
                boxShadow: '0 8px 24px rgba(0,0,0,.2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
                  <span style={{ fontSize: 13, opacity: .7 }}>Credit Card</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 24, height: 16, borderRadius: 3, background: '#FFD700', opacity: .9 }} />
                    <div style={{ width: 24, height: 16, borderRadius: 3, background: '#FF6B00', opacity: .7, marginLeft: -12 }} />
                  </div>
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 4, marginBottom: 20 }}>
                  {form.cardNumber || '•••• •••• •••• ••••'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: .7 }}>
                  <div>
                    <p style={{ marginBottom: 2 }}>CARDHOLDER</p>
                    <p style={{ color: '#fff', opacity: 1, fontWeight: 500, fontSize: 13 }}>
                      {form.cardName || 'YOUR NAME'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ marginBottom: 2 }}>EXPIRES</p>
                    <p style={{ color: '#fff', opacity: 1, fontWeight: 500, fontSize: 13 }}>
                      {form.expiry || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>

              <Field label="Cardholder name" id="cardName" value={form.cardName} onChange={e => set('cardName', e.target.value.toUpperCase())} placeholder="JANE DOE" required />
              <Field label="Card number" id="cardNumber" value={form.cardNumber}
                onChange={e => set('cardNumber', formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456" maxLength={19} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Expiry date" id="expiry" value={form.expiry}
                  onChange={e => set('expiry', formatExpiry(e.target.value))}
                  placeholder="MM/YY" maxLength={5} required />
                <Field label="CVV" id="cvv" value={form.cvv}
                  onChange={e => set('cvv', e.target.value.replace(/\D/g,'').slice(0,4))}
                  placeholder="•••" maxLength={4} required />
              </div>

              {error && (
                <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 12 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-outline" style={{ flex: 1, padding: 14, borderRadius: 12 }} onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" style={{ flex: 2, padding: 14, borderRadius: 12, fontSize: 15 }}
                  onClick={placeOrder}
                  disabled={loading || !form.cardName || !form.cardNumber || !form.expiry || !form.cvv}>
                  {loading ? 'Placing order…' : `Pay $${total.toFixed(2)}`}
                </button>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 16 }}>
                🔒 Your payment info is encrypted and secure
              </p>
            </div>
          )}
        </div>

        {/* Right — Order summary */}
        <div className="card fade-up-2" style={{ position: 'sticky', top: 72 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Order summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {item.image_url && (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={item.image_url} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-light)' }} />
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      background: '#6E6E73', color: '#fff', borderRadius: '50%',
                      width: 18, height: 18, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 600,
                    }}>{item.qty}</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-2)' }}>${item.price.toFixed(2)} each</p>
                </div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>
            <span>Shipping</span><span style={{ color: 'var(--success)' }}>Free</span>
          </div>
          <div className="divider" style={{ margin: '0 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
