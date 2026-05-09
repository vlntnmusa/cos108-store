import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

const LOW_STOCK = 5

function AddToCartModal({ product, onClose, onConfirm }) {
  const [qty, setQty] = useState(1)
  const total = (product.price * qty).toFixed(2)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, width: 360, overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,.18)',
        animation: 'slideUp .2s cubic-bezier(.25,.46,.45,.94)',
      }}>
        {product.image_url && (
          <div style={{ height: 200, overflow: 'hidden', background: '#F5F5F7' }}>
            <img src={product.image_url} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.2px', marginBottom: 4 }}>{product.name}</h3>
            <p style={{ fontSize: 13, color: '#6E6E73', lineHeight: 1.4 }}>{product.description}</p>
            {/* Low stock warning in modal */}
            {product.stock <= LOW_STOCK && product.stock > 0 && (
              <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#FFF3E0', color: '#E65100', padding: '4px 10px',
                borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
                ⚠ Only {product.stock} left
              </div>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#F5F5F7', borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#6E6E73' }}>Quantity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: qty === 1 ? '#E5E5EA' : '#1D1D1F',
                color: qty === 1 ? '#AEAEB2' : '#fff',
                fontSize: 18, cursor: qty === 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>−</button>
              <span style={{ fontWeight: 700, fontSize: 18, minWidth: 24, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none',
                  background: qty >= product.stock ? '#E5E5EA' : '#1D1D1F',
                  color: qty >= product.stock ? '#AEAEB2' : '#fff',
                  fontSize: 18, cursor: qty >= product.stock ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: '#6E6E73' }}>${product.price.toFixed(2)} × {qty}</span>
            <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.3px' }}>${total}</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '12px', borderRadius: 12,
              border: '1px solid #E5E5EA', background: 'transparent',
              fontSize: 15, fontWeight: 500, cursor: 'pointer', color: '#1D1D1F',
            }}>Cancel</button>
            <button onClick={() => { onConfirm(product, qty); onClose() }} style={{
              flex: 2, padding: '12px', borderRadius: 12, border: 'none',
              background: '#0071E3', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', color: '#fff',
            }}>Add to Cart</button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  )
}

function ProductCard({ product, onAddClick }) {
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-hover" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg)' }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s var(--ease)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: .3 }}>📦</div>
          }
          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(255,255,255,.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ background: '#1D1D1F', color: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
                Out of Stock
              </span>
            </div>
          )}
          {/* Low stock badge */}
          {isLowStock && (
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: '#FF9500', color: '#fff',
              padding: '3px 10px', borderRadius: 999,
              fontSize: 11, fontWeight: 600,
            }}>
              Only {product.stock} left
            </div>
          )}
        </div>

        <div style={{ padding: '16px 20px 20px' }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)', marginBottom: 4, letterSpacing: '-0.1px' }}>
            {product.name}
          </p>
          <p style={{
            fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.2px' }}>
              ${product.price.toFixed(2)}
            </span>
            <button className="btn btn-sm btn-primary" disabled={product.stock === 0}
              onClick={e => { e.preventDefault(); onAddClick(product) }}>
              Add
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function StorefrontPage({ addToCart }) {
  const [products, setProducts]   = useState([])
  const [query, setQuery]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [addedId, setAddedId]     = useState(null)

  const fetchProducts = useCallback(async (q) => {
    setLoading(true)
    try {
      const data = await api.get(`/api/products${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      setProducts(data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProducts('') }, [fetchProducts])
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(query), 400)
    return () => clearTimeout(t)
  }, [query, fetchProducts])

  const handleConfirm = (product, qty) => {
    for (let i = 0; i < qty; i++) addToCart(product)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1800)
  }

  return (
    <div className="page">
      {selected && <AddToCartModal product={selected} onClose={() => setSelected(null)} onConfirm={handleConfirm} />}

      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>Shop</h1>
        {!loading && <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{products.length} products</p>}
      </div>

      <div className="search-wrap fade-up-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input className="input" type="text" placeholder="Search products…"
          value={query} onChange={e => setQuery(e.target.value)} style={{ maxWidth: 400 }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'var(--border-light)', borderRadius: 'var(--radius)', height: 340,
              animation: `fadeUp 0.3s ${i*0.05}s both` }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty fade-up">
          <div className="empty-icon">🔍</div>
          <p className="t-headline" style={{ marginBottom: 8 }}>No products found</p>
          <p className="t-caption">Try a different search term</p>
        </div>
      ) : (
        <div className="product-grid fade-up-3">
          {products.map((p, i) => (
            <div key={p.id} style={{ position: 'relative', animation: `fadeUp 0.4s ${i * 0.04}s var(--ease) both` }}>
              <ProductCard product={p} onAddClick={setSelected} />
              {addedId === p.id && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#34C759', color: '#fff',
                  borderRadius: 999, padding: '4px 12px',
                  fontSize: 12, fontWeight: 600, pointerEvents: 'none',
                }}>✓ Added!</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
